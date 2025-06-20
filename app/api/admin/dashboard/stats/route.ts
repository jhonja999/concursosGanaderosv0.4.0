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

    if (!payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener estadísticas del dashboard
    const [
      totalUsers,
      activeUsers,
      totalCompanies,
      activeSubscriptions,
      expiringSubscriptions,
      pendingRequests,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.company.count(),
      prisma.subscription.count({ where: { status: "ACTIVO" } }),
      prisma.subscription.count({
        where: {
          status: "ACTIVO",
          fechaExpiracion: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          },
        },
      }),
      prisma.companyRequest.count({ where: { status: "PENDIENTE" } }),
      prisma.subscription
        .aggregate({
          where: { status: "ACTIVO" },
          _sum: { precio: true },
        })
        .then((result) => Number(result._sum.precio) || 0),
      prisma.subscription
        .aggregate({
          where: {
            status: "ACTIVO",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { precio: true },
        })
        .then((result) => Number(result._sum.precio) || 0),
    ])

    // Calcular crecimiento (simulado por ahora)
    const userGrowth = 12.5
    const revenueGrowth = 8.3

    const stats = {
      totalUsers,
      activeUsers,
      totalCompanies,
      activeSubscriptions,
      totalRevenue,
      monthlyRevenue,
      expiringSubscriptions,
      pendingRequests,
      userGrowth,
      revenueGrowth,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
