import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Determinar companyId
    const companyId = payload.roles.includes("SUPERADMIN") ? 
      searchParams.get("companyId") : payload.companyId

    if (!companyId) {
      return NextResponse.json([])
    }

    const establos = await prisma.establo.findMany({
      where: {
        companyId,
        isActive: true,
        nombre: {
          contains: query,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        nombre: true,
        ubicacion: true,
      },
      take: 10,
      orderBy: {
        nombre: "asc"
      }
    })

    return NextResponse.json(establos)
  } catch (error) {
    console.error("Error fetching establo suggestions:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}