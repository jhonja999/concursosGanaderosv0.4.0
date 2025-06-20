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

    // Obtener datos de los últimos 6 meses
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Obtener datos de usuarios por mes
    const monthlyUsers = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: sixMonthsAgo },
        role: { not: "SUPERADMIN" },
      },
      _count: { id: true },
    })

    // Obtener datos de suscripciones por mes
    const monthlySubscriptions = await prisma.subscription.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: { id: true },
      _sum: { precio: true },
    })

    // Formatear datos para los gráficos
    const chartData = []
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)

      // Simular datos por ahora (en producción calcular desde los datos reales)
      chartData.push({
        name: months[date.getMonth()],
        users: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        subscriptions: Math.floor(Math.random() * 10) + 5,
      })
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
