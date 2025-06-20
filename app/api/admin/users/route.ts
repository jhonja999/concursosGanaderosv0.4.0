import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    // Verificar que sea SUPERADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que roles existe y es un array
    if (!payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const companyId = searchParams.get("companyId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { apellido: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        {
          company: {
            nombre: { contains: search, mode: "insensitive" },
          },
        },
      ]
    }

    if (role && role !== "all") {
      if (role === "SUPERADMIN") {
        where.OR = [{ role: "SUPERADMIN" }, { isSuperAdmin: true }]
      } else {
        where.role = role
      }
    }

    if (status && status !== "all") {
      where.isActive = status === "active"
    }

    if (companyId && companyId !== "all") {
      where.companyId = companyId
    }

    // Obtener usuarios con paginación
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Formatear usuarios para incluir campos calculados
    const formattedUsers = users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
