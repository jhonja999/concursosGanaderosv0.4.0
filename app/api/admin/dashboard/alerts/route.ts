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

    const alerts: any[] = []

    // 1. Suscripciones próximas a expirar (próximos 15 días)
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        fechaExpiracion: {
          gte: new Date(),
          lte: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
        status: "ACTIVO",
      },
      take: 5,
    })

    // Obtener nombres de compañías para las suscripciones
    for (const sub of expiringSubscriptions) {
      const company = await prisma.company.findUnique({
        where: { id: sub.companyId },
        select: { nombre: true },
      })

      const daysUntilExpiry = Math.ceil((sub.fechaExpiracion.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      alerts.push({
        id: `expiring-${sub.id}`,
        type: daysUntilExpiry <= 5 ? "error" : "warning",
        title: "Suscripción próxima a expirar",
        description: `${company?.nombre || "Compañía"} expira en ${daysUntilExpiry} días`,
        date: new Date().toISOString(),
        priority: daysUntilExpiry <= 5 ? "high" : "medium",
      })
    }

    // 2. Solicitudes de compañía pendientes
    const pendingRequests = await prisma.companyRequest.findMany({
      where: {
        status: "PENDIENTE",
      },
      take: 3,
    })

    if (pendingRequests.length > 0) {
      alerts.push({
        id: "pending-requests",
        type: "info",
        title: "Solicitudes pendientes",
        description: `${pendingRequests.length} solicitudes de compañía esperando revisión`,
        date: new Date().toISOString(),
        priority: pendingRequests.length > 3 ? "high" : "medium",
      })
    }

    // 3. Usuarios recientes sin actividad (últimos 30 días)
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastLogin: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        companyId: {
          not: null,
        },
      },
      take: 3,
    })

    if (inactiveUsers.length > 0) {
      alerts.push({
        id: "inactive-users",
        type: "warning",
        title: "Usuarios inactivos",
        description: `${inactiveUsers.length} usuarios no han iniciado sesión en 30 días`,
        date: new Date().toISOString(),
        priority: "medium",
      })
    }

    // Ordenar por prioridad
    alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return (
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder]
      )
    })

    return NextResponse.json(alerts.slice(0, 8))
  } catch (error) {
    console.error("Error fetching dashboard alerts:", error)
    return NextResponse.json([], { status: 200 })
  }
}
