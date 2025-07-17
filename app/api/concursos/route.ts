import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get all active contests with company data
    const contests = await prisma.contest.findMany({
      where: {
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
          },
        },
      },
      orderBy: [{ fechaInicio: "asc" }, { createdAt: "desc" }],
    })

    // Get participant count for each contest
    const contestsWithCounts = await Promise.all(
      contests.map(async (contest) => {
        const participantCount = await prisma.ganado.count({
          where: { contestId: contest.id },
        })

        return {
          id: contest.id,
          nombre: contest.nombre,
          slug: contest.slug,
          descripcion: contest.descripcion,
          imagenPrincipal: contest.imagenPrincipal,
          fechaInicio: contest.fechaInicio.toISOString(),
          fechaFin: contest.fechaFin?.toISOString(),
          fechaInicioRegistro: contest.fechaInicioRegistro?.toISOString(),
          fechaFinRegistro: contest.fechaFinRegistro?.toISOString(),
          ubicacion: contest.ubicacion,
          cuotaInscripcion: contest.cuotaInscripcion,
          tipoGanado: contest.tipoGanado,
          isActive: contest.isActive,
          participantCount,
          company: contest.company,
          createdAt: contest.createdAt.toISOString(),
        }
      }),
    )

    return NextResponse.json({
      success: true,
      contests: contestsWithCounts,
    })
  } catch (error) {
    console.error("Error fetching contests:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener concursos",
        contests: [],
      },
      { status: 500 },
    )
  }
}
