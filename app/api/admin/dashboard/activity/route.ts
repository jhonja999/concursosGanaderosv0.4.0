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
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    const activity: any[] = []

    // 1. Logs de auditoría recientes
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      include: {
        user: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    auditLogs.forEach((log) => {
      let status = "info"
      if (log.action.includes("DELETE")) status = "error"
      else if (log.action.includes("CREATE")) status = "success"
      else if (log.action.includes("UPDATE")) status = "warning"

      activity.push({
        id: `audit-${log.id}`,
        type: "audit",
        description: `${log.action} en ${log.entityType}`,
        user: log.user ? `${log.user.nombre} ${log.user.apellido}` : "Sistema",
        date: log.createdAt.toISOString(),
        status,
      })
    })

    // 2. Nuevos usuarios (últimos 5 días)
    const newUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    })

    newUsers.forEach((user) => {
      activity.push({
        id: `user-${user.id}`,
        type: "system",
        description: "Nuevo usuario registrado",
        user: `${user.nombre} ${user.apellido}`,
        date: user.createdAt.toISOString(),
        status: "success",
      })
    })

    // 3. Nuevas suscripciones (últimos 7 días)
    const newSubscriptions = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      include: {
        company: {
          select: {
            nombre: true,
          },
        },
      },
    })

    newSubscriptions.forEach((sub) => {
      activity.push({
        id: `subscription-${sub.id}`,
        type: "system",
        description: `Nueva suscripción ${sub.plan}`,
        user: sub.company.nombre,
        date: sub.createdAt.toISOString(),
        status: "success",
      })
    })

    // Ordenar por fecha y limitar
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(activity.slice(0, limit))
  } catch (error) {
    console.error("Error fetching dashboard activity:", error)
    return NextResponse.json([], { status: 200 })
  }
}
