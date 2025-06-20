import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { markNotificationAsRead } from "@/lib/notifications"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const notificationId = params.id

    // Marcar como leída
    const notification = await markNotificationAsRead(notificationId)

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
