import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const contests = await prisma.contest.findMany({
      select: {
        ubicacion: true,
        tipoGanado: true,
      },
      where: {
        isActive: true,
      },
    })

    const distinctLocations = Array.from(new Set(contests.map((c) => c.ubicacion).filter(Boolean) as string[])).sort()

    const distinctAnimalTypes = Array.from(
      new Set(contests.flatMap((c) => c.tipoGanado).filter(Boolean) as string[]),
    ).sort()

    return NextResponse.json({
      success: true,
      locations: distinctLocations,
      animalTypes: distinctAnimalTypes,
    })
  } catch (error) {
    console.error("Error fetching distinct contest values:", error)
    return NextResponse.json(
      { success: false, message: "Error al obtener valores de filtro", locations: [], animalTypes: [] },
      { status: 500 },
    )
  }
}
