import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const categoria = searchParams.get("categoria")
    const raza = searchParams.get("raza")
    const sexo = searchParams.get("sexo")
    const enRemate = searchParams.get("enRemate")
    const sortBy = searchParams.get("sortBy")
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // Buscar el concurso por slug
    const contest = await prisma.contest.findUnique({
      where: { slug },
      select: { id: true, nombre: true },
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
        { propietario: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { expositor: { nombreCompleto: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (categoria) where.contestCategory = { nombre: categoria }
    if (raza) where.raza = raza
    if (sexo) where.sexo = sexo
    if (enRemate !== null) where.enRemate = enRemate === "true"

    // Construir ordenamiento
    let orderBy: any = [{ isDestacado: "desc" }, { createdAt: "desc" }]

    if (sortBy) {
      const sortDirection = sortOrder === "desc" ? "desc" : "asc"

      switch (sortBy) {
        case "nombre":
          orderBy = [{ nombre: sortDirection }, ...orderBy]
          break
        case "raza":
          orderBy = [{ raza: sortDirection }, ...orderBy]
          break
        case "puntaje":
          orderBy = [{ puntaje: sortDirection }, ...orderBy]
          break
        case "fechaNacimiento":
          orderBy = [{ fechaNacimiento: sortDirection }, ...orderBy]
          break
        case "pesoKg":
          orderBy = [{ pesoKg: sortDirection }, ...orderBy]
          break
        case "createdAt":
          orderBy = [{ createdAt: sortDirection }]
          break
        default:
          // Mantener ordenamiento por defecto
          break
      }
    }

    const [ganado, total, categorias, razas] = await Promise.all([
      prisma.ganado.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          raza: true,
          sexo: true,
          fechaNacimiento: true,
          pesoKg: true,
          imagenUrl: true,
          enRemate: true,
          precioBaseRemate: true,
          isDestacado: true,
          isGanador: true,
          premiosObtenidos: true,
          puntaje: true,
          numeroFicha: true,
          createdAt: true,
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
              telefono: true,
              email: true,
            },
          },
          contestCategory: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
            },
          },
          contest: {
            select: { nombre: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.ganado.count({ where }),
      // Obtener categorías disponibles
      prisma.contestCategory.findMany({
        where: {
          contestId: contest.id,
        },
        select: { id: true, nombre: true },
      }),
      // Obtener razas disponibles
      prisma.ganado.findMany({
        where: { contestId: contest.id },
        select: { raza: true },
        distinct: ["raza"],
      }),
    ])

    return NextResponse.json({
      ganado,
      contest,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories: categorias,
        breeds: razas.map((r) => r.raza).filter(Boolean),
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    })
  } catch (error) {
    console.error("Error fetching participantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
