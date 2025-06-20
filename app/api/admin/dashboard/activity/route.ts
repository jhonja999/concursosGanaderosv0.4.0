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

    // Obtener actividad reciente (últimas 24 horas)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [recentUsers, recentSubscriptions, recentRequests] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: yesterday } },
        include: { company: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.subscription.findMany({
        where: { createdAt: { gte: yesterday } },
        include: { company: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.companyRequest.findMany({
        where: { createdAt: { gte: yesterday } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    const activity = []

    // Agregar usuarios recientes
    recentUsers.forEach((user) => {
      activity.push({
        id: `user-${user.id}`,
        type: "user_created",
        description: `Nuevo usuario registrado: ${user.nombre} ${user.apellido}`,
        user: "Sistema",
        date: user.createdAt.toISOString(),
        status: "success",
      })
    })

    // Agregar suscripciones recientes
    recentSubscriptions.forEach((sub) => {
      activity.push({
        id: `subscription-${sub.id}`,
        type: "subscription_created",
        description: `Nueva suscripción: ${sub.company.nombre}`,
        user: "Sistema",
        date: sub.createdAt.toISOString(),
        status: "success",
      })
    })

    // Agregar solicitudes recientes
    recentRequests.forEach((req) => {
      activity.push({
        id: `request-${req.id}`,
        type: "company_request",
        description: `Nueva solicitud de compañía: ${req.nombreCompania}`,
        user: "Sistema",
        date: req.createdAt.toISOString(),
        status: "info",
      })
    })

    // Ordenar por fecha y tomar los 10 más recientes
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(activity.slice(0, 10))
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
