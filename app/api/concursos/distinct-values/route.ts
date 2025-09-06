import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const contests = await prisma.contest.findMany({
      select: {
        ubicacion: true,
  tipoGanado: true,
  categorias: true,
      },
      where: {
        isActive: true,
      },
    })

    const distinctLocations = Array.from(new Set(contests.map((c) => c.ubicacion).filter(Boolean) as string[])).sort()

    const distinctAnimalTypes = Array.from(
      new Set(contests.flatMap((c) => c.tipoGanado).filter(Boolean) as string[]),
    ).sort()

    const distinctCategorias = Array.from(new Set(contests.flatMap((c) => c.categorias || []).filter(Boolean) as string[])).sort()

    // Build mapping of animalType -> categorias (to allow client to filter categories by selected type)
    const categoriesByTypeMap: Record<string, string[]> = {}
    contests.forEach((c) => {
      const tipos = c.tipoGanado || []
      const cats = c.categorias || []
      tipos.forEach((t: string) => {
        const key = t.toLowerCase()
        if (!categoriesByTypeMap[key]) categoriesByTypeMap[key] = []
        cats.forEach((cat: string) => {
          if (!categoriesByTypeMap[key].includes(cat)) categoriesByTypeMap[key].push(cat)
        })
      })
    })

    // sort each category list
    Object.keys(categoriesByTypeMap).forEach((k) => categoriesByTypeMap[k].sort())

    return NextResponse.json({
  success: true,
  locations: distinctLocations,
  animalTypes: distinctAnimalTypes,
  categorias: distinctCategorias,
  categoriesByType: categoriesByTypeMap,
    })
  } catch (error) {
    console.error("Error fetching distinct contest values:", error)
    return NextResponse.json(
      { success: false, message: "Error al obtener valores de filtro", locations: [], animalTypes: [] },
      { status: 500 },
    )
  }
}
