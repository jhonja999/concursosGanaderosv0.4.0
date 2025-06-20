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

    // Obtener datos de los últimos 6 meses para gráficos
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Usar el modelo correcto de Prisma en lugar de SQL raw
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    })

    const subscriptions = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        plan: true,
        precio: true,
      },
    })

    // Formatear datos para los gráficos
    const chartData = []
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      // Contar usuarios del mes
      const userCount = users.filter((user) => user.createdAt >= monthStart && user.createdAt <= monthEnd).length

      // Contar suscripciones del mes
      const monthSubscriptions = subscriptions.filter((sub) => sub.createdAt >= monthStart && sub.createdAt <= monthEnd)

      const subscriptionCount = monthSubscriptions.length

      // Calcular ingresos basado en el precio real o plan
      const revenue = monthSubscriptions.reduce((total, sub) => {
        if (sub.precio) {
          return total + Number(sub.precio.toString())
        }
        // Precios por defecto si no hay precio específico
        switch (sub.plan) {
          case "BASICO":
            return total + 50000
          case "PROFESIONAL":
            return total + 100000
          case "EMPRESARIAL":
            return total + 200000
          default:
            return total
        }
      }, 0)

      chartData.push({
        name: months[date.getMonth()],
        users: userCount,
        subscriptions: subscriptionCount,
        revenue: revenue,
      })
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching dashboard charts data:", error)
    // Devolver datos por defecto en caso de error
    const defaultData = [
      { name: "Ene", users: 0, subscriptions: 0, revenue: 0 },
      { name: "Feb", users: 0, subscriptions: 0, revenue: 0 },
      { name: "Mar", users: 0, subscriptions: 0, revenue: 0 },
      { name: "Abr", users: 0, subscriptions: 0, revenue: 0 },
      { name: "May", users: 0, subscriptions: 0, revenue: 0 },
      { name: "Jun", users: 0, subscriptions: 0, revenue: 0 },
    ]
    return NextResponse.json(defaultData)
  }
}
