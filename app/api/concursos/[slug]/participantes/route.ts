//... imports
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const search = searchParams.get("search")
    const categoriaId = searchParams.get("categoriaId")
    const raza = searchParams.get("raza")
    const sexo = searchParams.get("sexo")
    const enRemate = searchParams.get("enRemate")
    const sortBy = searchParams.get("sortBy")
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const tipoAnimal = searchParams.get("tipoAnimal")

    const contest = await prisma.contest.findUnique({
      where: { slug },
    })

    if (!contest) {
      return new Response(JSON.stringify({ error: "Concurso no encontrado" }), { status: 404 })
    }

    const where: any = {
      contestId: contest.id,
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { raza: { contains: search, mode: "insensitive" } },
        { numeroFicha: { contains: search, mode: "insensitive" } },
        { propietario: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { establo: { nombre: { contains: search, mode: "insensitive" } } },
        { tipoAnimal: { contains: search, mode: "insensitive" } },
      ]
    }

    if (categoriaId) where.contestCategoryId = categoriaId
    if (raza) where.raza = raza
    if (sexo) where.sexo = sexo
    if (enRemate) where.enRemate = enRemate === "true"
    if (tipoAnimal) where.tipoAnimal = tipoAnimal

    const orderBy: any = {}
    if (sortBy && ["nombre", "raza", "puntaje", "fechaNacimiento", "pesoKg", "createdAt"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.createdAt = "desc"
    }

    const [ganado, total, categories, distinctBreeds, distinctAnimalTypes] = await Promise.all([
      prisma.ganado.findMany({
        where,
        include: {
          propietario: true,
          expositor: true,
          establo: true,
          contestCategory: true,
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
      prisma.contestCategory.findMany({
        where: { contestId: contest.id },
        select: { id: true, nombre: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.ganado.findMany({
        where: { contestId: contest.id },
        select: { raza: true },
        distinct: ["raza"],
      }),
      prisma.ganado.findMany({
        where: { contestId: contest.id },
        select: { tipoAnimal: true },
        distinct: ["tipoAnimal"],
      }),
    ])

    return new Response(
      JSON.stringify({
        ganado,
        contest,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          categories,
          breeds: distinctBreeds.map((g) => g.raza).filter(Boolean),
          animalTypes: distinctAnimalTypes.map((g) => g.tipoAnimal).filter(Boolean),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error fetching public contest participants:", error)
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 })
  }
}
