import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación y rol SUPERADMIN
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { action, notas } = await request.json()
    const requestId = params.id

    // Obtener la solicitud
    const companyRequest = await prisma.companyRequest.findUnique({
      where: { id: requestId },
    })

    if (!companyRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    if (companyRequest.status !== "PENDIENTE") {
      return NextResponse.json({ error: "Esta solicitud ya fue procesada" }, { status: 400 })
    }

    if (action === "approve") {
      // Aprobar solicitud y crear compañía
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

        // Buscar usuario por email y actualizarlo
        const requestUser = await tx.user.findUnique({
          where: { email: companyRequest.email },
        })

        if (requestUser) {
          // Actualizar usuario existente
          await tx.user.update({
            where: { id: requestUser.id },
            data: {
              role: "CONCURSO_ADMIN",
              companyId: company.id,
            },
          })
        }

        // Actualizar solicitud
        const updatedRequest = await tx.companyRequest.update({
          where: { id: requestId },
          data: {
            status: "APROBADA",
            notas,
            reviewedById: user.id,
            reviewedAt: new Date(),
            companyId: company.id,
          },
        })

        return { company, subscription, updatedRequest, requestUser }
      })

      // Enviar email de aprobación
      try {
        const approvalTemplate = emailTemplates.companyRequestApproved(
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
      })
    } else if (action === "reject") {
      // Rechazar solicitud
      const updatedRequest = await prisma.companyRequest.update({
        where: { id: requestId },
        data: {
          status: "RECHAZADA",
          notas,
          reviewedById: user.id,
          reviewedAt: new Date(),
        },
      })

      // Enviar email de rechazo
      try {
        const rejectionTemplate = emailTemplates.companyRequestRejected(
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
    } else {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error procesando solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación y rol SUPERADMIN
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const companyRequest = await prisma.companyRequest.findUnique({
      where: { id: params.id },
      include: {
        reviewedBy: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        company: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
      },
    })

    if (!companyRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ companyRequest })
  } catch (error) {
    console.error("Error obteniendo solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
