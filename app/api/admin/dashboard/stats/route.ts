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

    // Obtener estadísticas actuales
    const [totalUsers, activeUsers, totalCompanies, activeSubscriptions, pendingCompanyRequests] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.company.count(),
      prisma.subscription.count({ where: { status: "ACTIVO" } }),
      prisma.companyRequest.count({ where: { status: "PENDIENTE" } }),
    ])

    // Obtener suscripciones activas con sus fechas
    const subscriptions = await prisma.subscription.findMany({
      where: { status: "ACTIVO" },
      select: {
        plan: true,
        createdAt: true,
        fechaInicio: true,
        precio: true,
      },
    })

    // Definir precios por plan (ajusta estos valores según tu negocio)
    const planPrices = {
      BASICO: 50000,
      PROFESIONAL: 100000,
      EMPRESARIAL: 200000,
    }

    let totalRevenue = 0
    let monthlyRevenue = 0
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    subscriptions.forEach((sub) => {
      // Convertir Decimal a number si existe, sino usar el precio por defecto del plan
      const planRevenue = sub.precio
        ? Number(sub.precio.toString())
        : planPrices[sub.plan as keyof typeof planPrices] || 0

      // Solo contar como ingreso si la suscripción se creó (se pagó)
      if (sub.createdAt) {
        totalRevenue += planRevenue

        // Contar como ingreso mensual si se creó este mes
        if (sub.createdAt.getMonth() === currentMonth && sub.createdAt.getFullYear() === currentYear) {
          monthlyRevenue += planRevenue
        }
      }
    })

    // Calcular crecimiento de usuarios (comparar con mes anterior)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1),
        },
      },
    })

    const thisMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    })

    const userGrowth = lastMonthUsers > 0 ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0

    // Calcular ingresos del mes anterior
    const lastMonthSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVO",
        createdAt: {
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1),
        },
      },
      select: {
        plan: true,
        precio: true,
      },
    })

    // Calcular ingresos reales del mes anterior
    let lastMonthRevenue = 0
    lastMonthSubscriptions.forEach((sub) => {
      const planRevenue = sub.precio
        ? Number(sub.precio.toString())
        : planPrices[sub.plan as keyof typeof planPrices] || 0
      lastMonthRevenue += planRevenue
    })

    const revenueGrowth =
      lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0

    // Calcular suscripciones por vencer (próximos 30 días)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringSubscriptions = await prisma.subscription.count({
      where: {
        status: "ACTIVO",
        fechaExpiracion: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    })

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalCompanies,
      activeSubscriptions,
      totalRevenue,
      monthlyRevenue,
      expiringSubscriptions,
      pendingRequests: pendingCompanyRequests,
      userGrowth,
      revenueGrowth,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
