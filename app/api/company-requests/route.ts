import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar que el usuario no tenga ya una compañía
    if (user.companyId) {
      return NextResponse.json({ error: "Ya tienes una compañía asignada" }, { status: 400 })
    }

    // Verificar que no tenga una solicitud pendiente
    const existingRequest = await prisma.companyRequest.findUnique({
      where: { email: user.email },
    })

    if (existingRequest && existingRequest.status === "PENDIENTE") {
      return NextResponse.json({ error: "Ya tienes una solicitud pendiente" }, { status: 400 })
    }

    const {
      nombreCompania,
      descripcionCompania,
      tipoOrganizacion,
      ubicacion,
      website,
      motivacion,
      experiencia,
      documentos = [],
    } = await request.json()

    // Crear solicitud de compañía
    const companyRequest = await prisma.companyRequest.create({
      data: {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        nombreCompania,
        descripcionCompania,
        tipoOrganizacion,
        ubicacion,
        website,
        motivacion,
        experiencia,
        documentos,
        status: "PENDIENTE",
      },
    })

    // Notificar a todos los SUPERADMIN
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPERADMIN" },
    })

    for (const admin of superAdmins) {
      try {
        const notificationTemplate = emailTemplates.newCompanyRequestNotification(
          `${admin.nombre} ${admin.apellido}`,
          `${user.nombre} ${user.apellido}`,
          nombreCompania,
          companyRequest.id,
        )
        await sendEmail(admin.email, notificationTemplate)
      } catch (emailError) {
        console.error("Error enviando notificación:", emailError)
      }
    }

    return NextResponse.json({
      message: "Solicitud enviada exitosamente",
      requestId: companyRequest.id,
    })
  } catch (error) {
    console.error("Error creando solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Obtener solicitud del usuario actual
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const companyRequest = await prisma.companyRequest.findUnique({
      where: { email: user.email },
      include: {
        reviewedBy: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    return NextResponse.json({ companyRequest })
  } catch (error) {
    console.error("Error obteniendo solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
