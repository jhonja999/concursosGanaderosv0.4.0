import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value // Corrected cookie name
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) // Await the token verification
    if (!decoded || !decoded.userId) {
      // Ensure userId exists in payload
      return NextResponse.json({ error: "Token inválido o incompleto" }, { status: 401 })
    }

    // Obtener solicitudes del usuario actual
    const requests = await prisma.companyRequest.findMany({
      where: {
        email: decoded.email, // Assuming email is in the JWT payload
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching company requests:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value // Corrected cookie name
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = await verifyToken(token) // Await the token verification
    if (!decoded || !decoded.userId) {
      // Ensure userId exists in payload
      return NextResponse.json({ error: "Token inválido o incompleto" }, { status: 401 })
    }

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Si el usuario ya tiene compañía, no puede solicitar otra
    if (user.companyId) {
      return NextResponse.json({ error: "Ya tienes una compañía asignada" }, { status: 400 })
    }

    const { nombreCompania, descripcionCompania, tipoOrganizacion, ubicacion, website, motivacion, experiencia } =
      await request.json()

    // Validar campos requeridos
    if (!nombreCompania || !motivacion) {
      return NextResponse.json({ error: "Nombre de compañía y motivación son requeridos" }, { status: 400 })
    }

    // Verificar si ya existe una solicitud pendiente para este usuario
    const existingRequest = await prisma.companyRequest.findFirst({
      where: {
        email: user.email,
        status: {
          in: ["PENDIENTE", "EN_REVISION"],
        },
      },
    })

    if (existingRequest) {
      return NextResponse.json({ error: "Ya tienes una solicitud pendiente" }, { status: 400 })
    }

    // Crear la solicitud
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
        status: "PENDIENTE",
      },
    })

    return NextResponse.json({
      message: "Solicitud enviada exitosamente",
      request: companyRequest,
    })
  } catch (error) {
    console.error("Error creating company request:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
