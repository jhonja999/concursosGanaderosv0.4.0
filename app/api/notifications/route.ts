import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { getUserNotifications, getUnreadNotificationsCount } from "@/lib/notifications"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    // Obtener notificaciones del usuario
    let notifications = await getUserNotifications(payload.userId, limit)

    if (unreadOnly) {
      notifications = notifications.filter((n) => n.status === "UNREAD")
    }

    // Obtener conteo de no leídas
    const unreadCount = await getUnreadNotificationsCount(payload.userId)

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
