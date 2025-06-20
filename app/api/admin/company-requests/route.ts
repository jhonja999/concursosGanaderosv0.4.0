import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      prisma.companyRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.companyRequest.count({ where }),
    ])

    return NextResponse.json({
      requests: requests || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching company requests:", error)
    return NextResponse.json({
      requests: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.userId || !payload.email) {
      return NextResponse.json({ error: "Token inválido o incompleto" }, { status: 401 })
    }

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
