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

    const alerts = []

    // Suscripciones por vencer
    const expiringCount = await prisma.subscription.count({
      where: {
        status: "ACTIVO",
        fechaExpiracion: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        },
      },
    })

    if (expiringCount > 0) {
      alerts.push({
        id: "expiring-subscriptions",
        type: "warning",
        title: "Suscripciones por vencer",
        description: `${expiringCount} suscripciones vencen en los próximos 7 días`,
        date: new Date().toISOString(),
        priority: "high",
      })
    }

    // Solicitudes pendientes
    const pendingRequests = await prisma.companyRequest.count({
      where: { status: "PENDIENTE" },
    })

    if (pendingRequests > 0) {
      alerts.push({
        id: "pending-requests",
        type: "info",
        title: "Nuevas solicitudes",
        description: `${pendingRequests} solicitudes de compañías pendientes de revisión`,
        date: new Date().toISOString(),
        priority: "medium",
      })
    }

    // Suscripciones expiradas
    const expiredCount = await prisma.subscription.count({
      where: { status: "EXPIRADO" },
    })

    if (expiredCount > 0) {
      alerts.push({
        id: "expired-subscriptions",
        type: "error",
        title: "Suscripciones expiradas",
        description: `${expiredCount} suscripciones requieren renovación`,
        date: new Date().toISOString(),
        priority: "high",
      })
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
