import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, apellido, nombreCompania } = await request.json()

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear compañía y usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear compañía
      const company = await tx.company.create({
        data: {
          nombre: nombreCompania,
          slug: nombreCompania.toLowerCase().replace(/\s+/g, "-"),
          email: email,
        },
      })

      // Crear suscripción básica
      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          plan: "BASICO",
          status: "ACTIVO",
          maxConcursos: 5,
          fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          precio: 500000, // $500,000 COP
        },
      })

      // Crear usuario como CONCURSO_ADMIN
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          nombre,
          apellido,
          role: "CONCURSO_ADMIN",
          companyId: company.id,
        },
      })

      return { user, company, subscription }
    })

    return NextResponse.json({
      message: "Usuario registrado exitosamente",
      user: {
        id: result.user.id,
        email: result.user.email,
        nombre: result.user.nombre,
        apellido: result.user.apellido,
        role: result.user.role,
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
