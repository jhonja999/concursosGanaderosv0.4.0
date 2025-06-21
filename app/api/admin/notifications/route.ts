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

    const notifications: any[] = []

    // Obtener notificaciones reales del sistema
    const systemNotifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      include: {
        user: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    systemNotifications.forEach((notif) => {
      notifications.push({
        id: notif.id,
        type: "system",
        title: "Notificación del sistema",
        message: notif.message,
        isRead: notif.status === "READ",
        createdAt: notif.createdAt.toISOString(),
        priority: "medium",
      })
    })

    // Agregar alertas como notificaciones
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        fechaExpiracion: {
          gte: new Date(),
          lte: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
        status: "ACTIVO",
      },
      include: {
        company: {
          select: {
            nombre: true,
          },
        },
      },
      take: 5,
    })

    expiringSubscriptions.forEach((sub) => {
      const daysUntilExpiry = Math.ceil((sub.fechaExpiracion.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `alert-${sub.id}`,
        type: "alert",
        title: "Suscripción próxima a expirar",
        message: `La suscripción de ${sub.company.nombre} expira en ${daysUntilExpiry} días`,
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: daysUntilExpiry <= 5 ? "high" : "medium",
      })
    })

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return NextResponse.json({
      notifications: notifications.slice(0, 25),
      unreadCount,
      total: notifications.length,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
      total: 0,
    })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { notificationId, action } = body

    if (action === "mark_read" && notificationId) {
      // Marcar notificación específica como leída
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
        },
        data: {
          status: "READ",
        },
      })
    } else if (action === "mark_all_read") {
      // Marcar todas las notificaciones como leídas
      await prisma.notification.updateMany({
        where: {
          status: "UNREAD",
        },
        data: {
          status: "READ",
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
