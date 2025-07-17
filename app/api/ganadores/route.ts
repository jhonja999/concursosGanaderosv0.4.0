import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contestId = searchParams.get("contestId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const category = searchParams.get("category")

    // Build where clause
    const where: any = {
      OR: [{ puntaje: { not: null } }, { posicion: { not: null } }, { calificacion: { not: null } }],
    }

    if (contestId) {
      where.contestId = contestId
    }

    if (category) {
      where.contestCategory = {
        nombre: category,
      }
    }

    const ganadores = await prisma.ganado.findMany({
      where,
      orderBy: [{ posicion: "asc" }, { puntaje: "desc" }],
      take: limit,
      include: {
        contest: {
          select: {
            id: true,
            nombre: true,
            fechaInicio: true,
            tipoPuntaje: true,
          },
        },
        contestCategory: {
          select: {
            id: true,
            nombre: true,
          },
        },
        propietario: {
          select: {
            id: true,
            nombreCompleto: true,
          },
        },
        expositor: {
          select: {
            id: true,
            nombreCompleto: true,
          },
        },
        establo: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true,
          },
        },
      },
    })

    // Transform data to match the expected format
    const winners = ganadores.map((ganado) => ({
      id: ganado.id,
      position: ganado.posicion || 0,
      animalName: ganado.nombre,
      ownerName: ganado.propietario?.nombreCompleto || "Sin propietario",
      district: ganado.establo?.ubicacion || "No especificado",
      breed: ganado.raza || "No especificada",
      score: ganado.puntaje || 0,
      prize: ganado.premiosObtenidos.join(", ") || "Sin premio especificado",
      contestName: ganado.contest.nombre,
      contestDate: ganado.contest.fechaInicio.toISOString(),
      category: ganado.contestCategory?.nombre || "Sin categoría",
      imageUrl: ganado.imagenUrl,
      isChampion: ganado.posicion === 1 || ganado.isGanador,
      calificacion: ganado.calificacion,
      tipoPuntaje: ganado.contest.tipoPuntaje,
    }))

    return NextResponse.json({ winners })
  } catch (error) {
    console.error("Error fetching winners:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
