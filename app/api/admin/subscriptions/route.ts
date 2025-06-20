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
    if (!payload || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const plan = searchParams.get("plan")
    const status = searchParams.get("status")

    // Construir filtros
    const where: any = {}

    if (search) {
      where.company = {
        OR: [
          { nombre: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    if (plan && plan !== "all") {
      where.plan = plan
    }

    if (status && status !== "all") {
      where.status = status
    }

    // Obtener suscripciones
    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
            email: true,
            users: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                role: true,
                isActive: true,
                contestAccess: true,
                lastLogin: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Formatear suscripciones para incluir campos calculados
    const formattedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      fechaInicio: sub.fechaInicio.toISOString(),
      fechaExpiracion: sub.fechaExpiracion.toISOString(),
      fechaRenovacion: sub.fechaRenovacion?.toISOString(),
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
      precio: Number(sub.precio),
      usersUsed: sub.company.users.filter((u) => u.isActive).length,
      company: {
        ...sub.company,
        users: sub.company.users.map((user) => ({
          ...user,
          lastLogin: user.lastLogin?.toISOString(),
        })),
      },
    }))

    return NextResponse.json(formattedSubscriptions)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
