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

    // Obtener distribución de suscripciones por plan
    const distribution = await prisma.subscription.groupBy({
      by: ["plan"],
      _count: {
        id: true,
      },
      where: {
        status: "ACTIVO",
      },
    })

    // Formatear datos para el gráfico
    const formattedData = distribution.map((item) => ({
      name:
        item.plan === "BASICO"
          ? "Básico"
          : item.plan === "PROFESIONAL"
            ? "Profesional"
            : item.plan === "EMPRESARIAL"
              ? "Empresarial"
              : item.plan,
      value: typeof item._count === "number" ? item._count : item._count.id || 0,
      color:
        item.plan === "BASICO"
          ? "#0088FE"
          : item.plan === "PROFESIONAL"
            ? "#00C49F"
            : item.plan === "EMPRESARIAL"
              ? "#FFBB28"
              : "#FF8042",
    }))

    // Si no hay datos, devolver datos por defecto
    if (formattedData.length === 0) {
      return NextResponse.json([{ name: "Sin suscripciones", value: 1, color: "#E5E7EB" }])
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching distribution data:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
