import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const contestId = params.id

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Get distinct razas for this contest
    const distinctRazas = await prisma.ganado.findMany({
      where: { contestId },
      select: { raza: true },
      distinct: ["raza"],
    })

    return NextResponse.json({
      razas: distinctRazas.map((g) => g.raza).filter(Boolean),
    })
  } catch (error) {
    console.error("Error fetching distinct values:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
