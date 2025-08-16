import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("auth-token")?.value // Use "auth-token"
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) // Await the token verification
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que el usuario sea SUPERADMIN directamente desde el payload
    if (!decoded.roles || !Array.isArray(decoded.roles) || !decoded.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "No tienes permisos para esta acción" }, { status: 403 })
    }

    // Fetch user only if needed for `reviewedById` later
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const { action, notas } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
    }

    const { id } = await params

    const companyRequest = await prisma.companyRequest.findUnique({
      where: { id },
    })

    if (!companyRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    if (companyRequest.status !== "PENDIENTE") {
      return NextResponse.json({ error: "Esta solicitud ya fue procesada" }, { status: 400 })
    }

    if (action === "approve") {
      // Aprobar solicitud: crear compañía y suscripción
      const result = await prisma.$transaction(async (tx) => {
        // Crear compañía
        const company = await tx.company.create({
          data: {
            nombre: companyRequest.nombreCompania,
            slug: companyRequest.nombreCompania.toLowerCase().replace(/\s+/g, "-"),
            email: companyRequest.email,
            telefono: companyRequest.telefono,
            descripcion: companyRequest.descripcionCompania,
            website: companyRequest.website,
            ubicacion: companyRequest.ubicacion,
            tipoOrganizacion: companyRequest.tipoOrganizacion,
            isActive: true,
          },
        })

        // Crear suscripción básica
        const subscription = await tx.subscription.create({
          data: {
            companyId: company.id,
            plan: "BASICO",
            status: "ACTIVO",
            maxUsers: 5,
            maxStorage: 1000,
            maxConcursos: 10,
            fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
            precio: 0, // Gratis el primer año
          },
        })

        // Actualizar usuario: asignar compañía y cambiar rol
        const updatedUser = await tx.user.update({
          where: { email: companyRequest.email },
          data: {
            companyId: company.id,
            role: "CONCURSO_ADMIN",
            contestAccess: true,
          },
        })

        // Actualizar solicitud
        const updatedRequest = await tx.companyRequest.update({
          where: { id },
          data: {
            status: "APROBADA",
            notas,
            reviewedById: user.id,
            reviewedAt: new Date(),
            companyId: company.id,
          },
        })

        return { company, subscription, user: updatedUser, request: updatedRequest }
      })

      // Enviar email de aprobación
      try {
        const approvalTemplate = emailTemplates.companyApprovedEmail(
          `${companyRequest.nombre} ${companyRequest.apellido}`,
          companyRequest.nombreCompania,
        )
        await sendEmail(companyRequest.email, approvalTemplate)
      } catch (emailError) {
        console.error("Error enviando email de aprobación:", emailError)
      }

      return NextResponse.json({
        message: "Solicitud aprobada exitosamente",
        company: result.company,
        subscription: result.subscription,
      })
    } else {
      // Rechazar solicitud
      const updatedRequest = await prisma.companyRequest.update({
        where: { id },
        data: {
          status: "RECHAZADA",
          notas,
          reviewedById: user.id,
          reviewedAt: new Date(),
        },
      })

      // Enviar email de rechazo
      try {
        const rejectionTemplate = emailTemplates.companyRejectedEmail(
          `${companyRequest.nombre} ${companyRequest.apellido}`,
          companyRequest.nombreCompania,
          notas || "No se proporcionaron detalles adicionales.",
        )
        await sendEmail(companyRequest.email, rejectionTemplate)
      } catch (emailError) {
        console.error("Error enviando email de rechazo:", emailError)
      }

      return NextResponse.json({
        message: "Solicitud rechazada",
        request: updatedRequest,
      })
    }
  } catch (error) {
    console.error("Error processing company request:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
