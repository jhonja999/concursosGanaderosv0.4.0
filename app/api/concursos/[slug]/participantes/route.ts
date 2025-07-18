import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const raza = searchParams.get("raza")
    const categoriaId = searchParams.get("categoriaId")
    const tipoAnimal = searchParams.get("tipoAnimal")
    const sexo = searchParams.get("sexo")
    const enRemate = searchParams.get("enRemate")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Buscar el concurso por slug
    const contest = await prisma.contest.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        nombre: true,
        slug: true,
      },
    })

    if (!contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    // Construir filtros
    const where: any = {
      contestId: contest.id,
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { raza: { contains: search, mode: "insensitive" } },
        { numeroFicha: { contains: search, mode: "insensitive" } },
        { propietario: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { expositor: { nombreCompleto: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (raza && raza !== "all") {
      where.raza = raza
    }

    if (categoriaId && categoriaId !== "all") {
      where.contestCategoryId = categoriaId
    }

    if (tipoAnimal && tipoAnimal !== "all") {
      where.tipoAnimal = tipoAnimal
    }

    if (sexo && sexo !== "all") {
      where.sexo = sexo
    }

    if (enRemate && enRemate !== "all") {
      where.enRemate = enRemate === "true"
    }

    // Construir ordenamiento
    const orderBy: any = {}
    if (sortBy && sortBy !== "none") {
      if (sortBy === "createdAt") {
        orderBy.createdAt = sortOrder
      } else if (sortBy === "nombre") {
        orderBy.nombre = sortOrder
      } else if (sortBy === "raza") {
        orderBy.raza = sortOrder
      } else if (sortBy === "fechaNacimiento") {
        orderBy.fechaNacimiento = sortOrder
      } else if (sortBy === "pesoKg") {
        orderBy.pesoKg = sortOrder
      } else if (sortBy === "puntaje") {
        orderBy.puntaje = sortOrder
      }
    } else {
      orderBy.createdAt = "desc"
    }

    // Obtener ganado con paginación
    const [ganado, total] = await Promise.all([
      prisma.ganado.findMany({
        where,
        include: {
          propietario: {
            select: {
              nombreCompleto: true,
              telefono: true,
              email: true,
            },
          },
          expositor: {
            select: {
              nombreCompleto: true,
              empresa: true,
            },
          },
          contestCategory: {
            select: {
              id: true,
              nombre: true,
            },
          },
          contest: {
            select: {
              nombre: true,
              tipoPuntaje: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.ganado.count({ where }),
    ])

    // Obtener datos para filtros
    const [categories, distinctBreeds, distinctAnimalTypes] = await Promise.all([
      // Categorías del concurso
      prisma.contestCategory.findMany({
        where: { contestId: contest.id },
        select: {
          id: true,
          nombre: true,
        },
        orderBy: { nombre: "asc" },
      }),
      // Razas distintas en este concurso
      prisma.ganado.findMany({
        where: { contestId: contest.id },
        select: { raza: true },
        distinct: ["raza"],
        orderBy: { raza: "asc" },
      }),
      // Tipos de animal distintos en este concurso
      prisma.ganado.findMany({
        where: {
          contestId: contest.id,
          tipoAnimal: { not: null },
        },
        select: { tipoAnimal: true },
        distinct: ["tipoAnimal"],
        orderBy: { tipoAnimal: "asc" },
      }),
    ])

    const breeds = distinctBreeds
      .map((item) => item.raza)
      .filter(Boolean)
      .sort()

    const animalTypes = distinctAnimalTypes
      .map((item) => item.tipoAnimal)
      .filter(Boolean)
      .sort()

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      ganado,
      contest,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      filters: {
        categories,
        breeds,
        animalTypes,
      },
    })
  } catch (error) {
    console.error("Error fetching participantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
