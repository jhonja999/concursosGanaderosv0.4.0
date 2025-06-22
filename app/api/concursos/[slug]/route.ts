import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params // Await params before accessing properties

  if (!slug) {
    return NextResponse.json({ message: "Slug no proporcionado" }, { status: 400 })
  }

  try {
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
      return NextResponse.json({ message: "Concurso no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ contest })
  } catch (error) {
    console.error(`Error fetching contest by slug ${slug}:`, error)
    return NextResponse.json({ message: "Error al obtener el concurso" }, { status: 500 })
  }
}
