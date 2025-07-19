import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params

    if (!slug) {
      return NextResponse.json({ message: "Slug no proporcionado" }, { status: 400 })
    }

    console.log(`Buscando concurso con slug: ${slug}`) // Debug log

    const contest = await prisma.contest.findUnique({
      where: { slug: slug },
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
        events: {
          orderBy: {
            startDate: "asc",
          },
        },
      },
    })

    if (!contest) {
      console.log(`Concurso no encontrado para slug: ${slug}`) // Debug log
      return NextResponse.json({ message: "Concurso no encontrado" }, { status: 404 })
    }

    // Get participant count separately
    const participantCount = await prisma.ganado.count({
      where: {
        contestId: contest.id,
      },
    })

    console.log(`Concurso encontrado: ${contest.nombre}, participantes: ${participantCount}`) // Debug log

    // Add participant count to the response
    const contestWithCount = {
      ...contest,
      participantCount,
    }

    return NextResponse.json({ contest: contestWithCount })
  } catch (error) {
    console.error(`Error fetching contest by slug:`, error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
