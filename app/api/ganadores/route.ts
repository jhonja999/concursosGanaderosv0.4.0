import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contestId = searchParams.get("contestId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const category = searchParams.get("category")
    const tipoGanado = searchParams.get("tipoGanado")
    const raza = searchParams.get("raza")
    const tipoPremio = searchParams.get("tipoPremio")

    console.log("Fetching winners with params:", { contestId, limit, category, tipoGanado, raza, tipoPremio })

    // Build where clause - Solo ganado con premios, marcado como ganador, o con posición
    const where: any = {
      AND: [
        {
          OR: [
            {
              premiosObtenidos: {
                isEmpty: false,
              },
            },
            { isGanador: true },
            { posicion: { not: null, lte: 10 } },
            { puntaje: { not: null, gte: 70 } },
          ],
        },
      ],
    }

    if (contestId) {
      where.AND.push({ contestId })
    }

    if (category) {
      where.AND.push({
        contestCategory: {
          nombre: {
            contains: category,
            mode: "insensitive",
          },
        },
      })
    }

    if (tipoGanado) {
      where.AND.push({
        tipoAnimal: {
          equals: tipoGanado,
          mode: "insensitive",
        },
      })
    }

    if (raza) {
      where.AND.push({
        raza: {
          contains: raza,
          mode: "insensitive",
        },
      })
    }

    if (tipoPremio) {
      where.AND.push({
        premiosObtenidos: {
          hasSome: [tipoPremio],
        },
      })
    }

    console.log("Prisma where clause:", JSON.stringify(where, null, 2))

    const ganadores = await prisma.ganado.findMany({
      where,
      orderBy: [{ isGanador: "desc" }, { posicion: "asc" }, { puntaje: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        contest: {
          select: {
            id: true,
            nombre: true,
            fechaInicio: true,
            fechaFin: true,
            status: true,
            tipoPuntaje: true,
            tipoGanado: true,
            // NUEVO: incluir imagen y descripción del concurso
            imagenPrincipal: true,
            descripcion: true,
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

    console.log(`Found ${ganadores.length} ganadores`)

    // Transform data to match the expected format
    const winners = ganadores.map((ganado) => {
      let championType = "winner"
      let championTitle = "Ganador"

      const premios = Array.isArray(ganado.premiosObtenidos) ? ganado.premiosObtenidos : []

      if (premios.length > 0) {
        const premiosLower = premios.map((p) => String(p).toLowerCase())

        if (premiosLower.some((p) => p.includes("gran campeón") || p.includes("gran campeon"))) {
          championType = "grand_champion"
          championTitle = "Gran Campeón"
        } else if (premiosLower.some((p) => p.includes("campeón junior") || p.includes("campeon junior"))) {
          championType = "junior_champion"
          championTitle = "Campeón Junior"
        } else if (premiosLower.some((p) => p.includes("campeón senior") || p.includes("campeon senior"))) {
          championType = "senior_champion"
          championTitle = "Campeón Senior"
        } else if (premiosLower.some((p) => p.includes("campeón") || p.includes("campeon"))) {
          championType = "category_champion"
          championTitle = "Campeón de Categoría"
        }
      } else if (ganado.posicion === 1) {
        championType = "category_champion"
        championTitle = "Campeón de Categoría"
      }

      return {
        id: ganado.id || "",
        position: ganado.posicion || 0,
        animalName: ganado.nombre || "Sin nombre",
        ownerName: ganado.propietario?.nombreCompleto || "Sin propietario",
        expositorName: ganado.expositor?.nombreCompleto || null,
        district: ganado.establo?.ubicacion || "No especificado",
        breed: ganado.raza || "No especificada",
        score: ganado.puntaje || 0,
        prizes: premios,
        contestName: ganado.contest?.nombre || "Concurso sin nombre",
        contestId: ganado.contest?.id || "",
        contestDate: ganado.contest?.fechaInicio ? ganado.contest.fechaInicio.toISOString() : new Date().toISOString(),
        contestStatus: ganado.contest?.status || "BORRADOR",
        // NUEVO: incluir imagen y descripción del concurso
        contestImage: ganado.contest?.imagenPrincipal || null,
        contestDescription: ganado.contest?.descripcion || null,
        category: ganado.contestCategory?.nombre || "Sin categoría",
        imageUrl: ganado.imagenUrl || null,
        isChampion: ganado.posicion === 1 || ganado.isGanador || false,
        championType,
        championTitle,
        calificacion: ganado.calificacion || null,
        tipoPuntaje: ganado.contest?.tipoPuntaje || "NUMERICO",
        tipoAnimal: ganado.tipoAnimal || "No especificado",
        sexo: ganado.sexo || null,
        numeroFicha: ganado.numeroFicha || "",
        isGanador: ganado.isGanador || false,
      }
    })

    // Agrupar ganadores por concurso y ordenar dentro de cada grupo
    const winnersByContest = winners.reduce(
      (acc, winner) => {
        const contestId = winner.contestId
        if (!acc[contestId]) {
          acc[contestId] = {
            contestInfo: {
              id: contestId,
              name: winner.contestName,
              date: winner.contestDate,
              status: winner.contestStatus,
              // NUEVO: incluir imagen y descripción del concurso
              imagenPrincipal: winner.contestImage,
              descripcion: winner.contestDescription,
            },
            winners: [],
          }
        }
        acc[contestId].winners.push(winner)
        return acc
      },
      {} as Record<string, { contestInfo: any; winners: any[] }>,
    )

    // Ordenar ganadores dentro de cada concurso
    Object.values(winnersByContest).forEach((contest) => {
      contest.winners.sort((a, b) => {
        // Primero por isGanador
        if (a.isGanador !== b.isGanador) {
          return b.isGanador ? 1 : -1
        }
        // Luego por posición (menor es mejor, 0 al final)
        if (a.position !== b.position) {
          if (a.position === 0) return 1
          if (b.position === 0) return -1
          return a.position - b.position
        }
        // Finalmente por puntaje (mayor es mejor)
        return b.score - a.score
      })
    })

    // Obtener valores únicos para filtros
    const uniqueContests = Array.from(
      new Map(
        ganadores
          .filter((g) => g.contest && g.contest.id && g.contest.nombre)
          .map((g) => [
            g.contest.id,
            {
              id: g.contest.id,
              nombre: g.contest.nombre,
              status: g.contest.status,
              fechaInicio: g.contest.fechaInicio,
              // NUEVO: incluir imagen y descripción del concurso
              imagenPrincipal: g.contest.imagenPrincipal,
              descripcion: g.contest.descripcion,
            },
          ]),
      ).values(),
    ).sort((a, b) => {
      // Ordenar por fecha más reciente primero
      const dateA = new Date(a.fechaInicio || 0)
      const dateB = new Date(b.fechaInicio || 0)
      return dateB.getTime() - dateA.getTime()
    })

    const uniqueCategories = [...new Set(ganadores.map((g) => g.contestCategory?.nombre).filter(Boolean))].sort()

    const uniqueRazas = [...new Set(ganadores.map((g) => g.raza).filter(Boolean))].sort()

    const uniqueTiposGanado = [...new Set(ganadores.flatMap((g) => g.contest?.tipoGanado || []).filter(Boolean))].sort()

    const uniqueTiposPremio = [
      ...new Set(
        ganadores
          .flatMap((g) => (Array.isArray(g.premiosObtenidos) ? g.premiosObtenidos : []))
          .filter(Boolean)
          .map((p) => String(p)),
      ),
    ].sort()

    console.log(`Returning ${winners.length} winners grouped in ${Object.keys(winnersByContest).length} contests`)

    return NextResponse.json({
      winners,
      winnersByContest,
      total: winners.length,
      filters: {
        contests: uniqueContests,
        categories: uniqueCategories,
        razas: uniqueRazas,
        tiposGanado: uniqueTiposGanado,
        tiposPremio: uniqueTiposPremio,
      },
      metadata: {
        requestTime: new Date().toISOString(),
        limit,
        appliedFilters: {
          contestId,
          category,
          tipoGanado,
          raza,
          tipoPremio,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching winners:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "Unknown stack")

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        winners: [],
        winnersByContest: {},
        filters: {
          contests: [],
          categories: [],
          razas: [],
          tiposGanado: [],
          tiposPremio: [],
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.premiosObtenidos && !Array.isArray(body.premiosObtenidos)) {
      body.premiosObtenidos = []
    }

    return NextResponse.json({
      success: true,
      message: "Operación exitosa",
      data: body,
    })
  } catch (error) {
    console.error("Error in POST /api/ganadores:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}