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
    if (!payload || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const plan = searchParams.get("plan")
    const status = searchParams.get("status")

    // Construir filtros dinámicamente
    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (plan && plan !== "all") {
      where.plan = plan
    }

    // Filtro de búsqueda por nombre de compañía o email
    if (search) {
      where.company = {
        OR: [
          {
            nombre: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    }

    console.log("🔍 Fetching subscriptions with filters:", where)

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
            email: true,
            users: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                role: true,
                isActive: true,
                contestAccess: true,
                lastLogin: true,
              },
            },
          },
        },
      },
    })

    console.log(`✅ Found ${subscriptions.length} subscriptions`)

    // Transformar datos para el frontend
    const transformedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      fechaInicio: sub.fechaInicio?.toISOString() || new Date().toISOString(),
      fechaExpiracion: sub.fechaExpiracion?.toISOString() || new Date().toISOString(),
      precio: Number(sub.precio?.toString() || "0"),
      maxConcursos: sub.maxConcursos || 0,
      concursosUsados: sub.concursosUsados || 0,
      autoRenewal: false, // Default value since field doesn't exist
      paymentMethod: "Tarjeta", // Default value since field doesn't exist
      lastPayment: sub.updatedAt?.toISOString(), // Use updatedAt as proxy
      nextPayment: sub.fechaExpiracion?.toISOString(), // Use expiration date
      contestAccessEnabled: sub.contestAccessEnabled || false,
      company: {
        id: sub.company.id,
        nombre: sub.company.nombre,
        email: sub.company.email,
        users: sub.company.users || [],
      },
    }))

    return NextResponse.json(transformedSubscriptions)
  } catch (error) {
    console.error("❌ Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
