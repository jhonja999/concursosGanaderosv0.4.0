import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, apellido, nombreCompania } = await request.json()

    // Validar campos requeridos
    if (!email || !password || !nombre || !apellido) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Verificar si es el primer usuario (será SUPERADMIN)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    if (isFirstUser) {
      // Crear el primer usuario como SUPERADMIN con su compañía
      const result = await prisma.$transaction(async (tx) => {
        // Crear compañía para el SUPERADMIN
        const company = await tx.company.create({
          data: {
            nombre: nombreCompania || "Administración del Sistema",
            slug: (nombreCompania || "admin").toLowerCase().replace(/\s+/g, "-"),
            email: email,
            tipoOrganizacion: "Administración del Sistema",
          },
        })

        // Crear suscripción ilimitada para SUPERADMIN
        const subscription = await tx.subscription.create({
          data: {
            companyId: company.id,
            plan: "EMPRESARIAL",
            status: "ACTIVO",
            maxUsers: 999, // Ilimitado para SUPERADMIN
            maxStorage: 999999, // Ilimitado para SUPERADMIN
            fechaExpiracion: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 años
            precio: 0, // Gratis para SUPERADMIN
          },
        })

        // Crear usuario SUPERADMIN
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            nombre,
            apellido,
            role: "SUPERADMIN",
            isSuperAdmin: true,
            companyId: company.id,
          },
        })

        return { user, company, subscription }
      })

      // Enviar email de bienvenida al SUPERADMIN
      try {
        const welcomeTemplate = emailTemplates.superAdminWelcomeEmail(
          `${result.user.nombre} ${result.user.apellido}`,
          result.company.nombre,
        )
        await sendEmail(result.user.email, welcomeTemplate)
      } catch (emailError) {
        console.error("Error enviando email de bienvenida:", emailError)
      }

      return NextResponse.json({
        message: "SUPERADMIN creado exitosamente",
        user: {
          id: result.user.id,
          email: result.user.email,
          nombre: result.user.nombre,
          apellido: result.user.apellido,
          role: result.user.role,
          isSuperAdmin: true,
        },
      })
    } else {
      // Para usuarios posteriores, crear usuario básico sin compañía
      // Deberán solicitar aprobación para crear una compañía
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          nombre,
          apellido,
          role: "REGISTRADOR", // Rol básico hasta que se apruebe su compañía
          isSuperAdmin: false,
          // Sin companyId - se asignará cuando se apruebe su solicitud
        },
      })

      // Enviar email informando que debe solicitar aprobación
      try {
        const pendingApprovalTemplate = emailTemplates.pendingApprovalEmail(`${user.nombre} ${user.apellido}`)
        await sendEmail(user.email, pendingApprovalTemplate)
      } catch (emailError) {
        console.error("Error enviando email:", emailError)
      }

      return NextResponse.json({
        message: "Usuario registrado. Debe solicitar aprobación para crear una compañía.",
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          role: user.role,
          requiresCompanyApproval: true,
        },
      })
    }
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
