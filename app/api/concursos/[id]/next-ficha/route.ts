import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Obtener el último número de ficha usado en este concurso
    const lastParticipante = await prisma.participante.findFirst({
      where: {
        concursoId: params.id,
      },
      orderBy: {
        numeroFicha: "desc",
      },
      select: {
        numeroFicha: true,
      },
    })

    let nextFicha = "001"
    if (lastParticipante) {
      const lastNumber = Number.parseInt(lastParticipante.numeroFicha) || 0
      nextFicha = (lastNumber + 1).toString().padStart(3, "0")
    }

    return NextResponse.json({ nextFicha })
  } catch (error) {
    console.error("Error getting next ficha:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
