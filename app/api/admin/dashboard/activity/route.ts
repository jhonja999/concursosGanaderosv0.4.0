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
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Obtener actividad reciente (ej. últimos 10 logs de auditoría)
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    })

    // Obtener notificaciones recientes (ej. últimas 10 notificaciones)
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    })

    // Combinar y formatear actividad
    const activity: any[] = []

    auditLogs.forEach((log) => {
      activity.push({
        id: log.id,
        type: "audit",
        description: `${log.action} en ${log.entityType}`,
        user: log.user ? `${log.user.nombre} ${log.user.apellido}` : "Sistema",
        date: log.createdAt.toISOString(),
        status: "info",
      })
    })

    notifications.forEach((notification) => {
      activity.push({
        id: notification.id,
        type: "notification",
        description: notification.message,
        user: notification.user ? `${notification.user.nombre} ${notification.user.apellido}` : "Sistema",
        date: notification.createdAt.toISOString(),
        status: notification.status === "READ" ? "success" : "info",
      })
    })

    // Ordenar por fecha y limitar
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(activity.slice(0, limit))
  } catch (error) {
    console.error("Error fetching dashboard activity:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
