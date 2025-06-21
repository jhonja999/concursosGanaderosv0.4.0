import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const contest = await prisma.contest.findUnique({
      where: {
        slug,
        isPublic: true,
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
            logo: true,
            descripcion: true,
            ubicacion: true,
            website: true,
          },
        },
      },
    })

    if (!contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ contest })
  } catch (error) {
    console.error("Error fetching contest:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
