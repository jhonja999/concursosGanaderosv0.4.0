import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const categoria = searchParams.get("categoria")
    const raza = searchParams.get("raza")
    const sexo = searchParams.get("sexo")
    const tipoAnimal = searchParams.get("tipoAnimal")
    const estado = searchParams.get("estado")
    const ordenar = searchParams.get("ordenar") || "createdAt"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    const contestSlug = searchParams.get("contestSlug")

    // Construir filtros
    const where: any = {}

    // If a contest slug is provided, filter by that contest
    if (contestSlug) {
      where.contest = {
        slug: contestSlug,
        isActive: true, // Only show animals from active contests
      }
    } else {
      // For general listing, only show animals from active contests
      where.contest = {
        isActive: true,
      }
    }

    // Check for authentication token for admin features
    const token = request.cookies.get("auth-token")?.value
    let isAuthenticated = false
    let payload = null

    if (token) {
      payload = await verifyToken(token)
      isAuthenticated = !!payload
    }

    // If authenticated as admin, allow filtering by company
    if (isAuthenticated && payload?.roles) {
      // Filter by compañía if not SUPERADMIN and no specific contest is requested
      if (!payload.roles.includes("SUPERADMIN") && !contestSlug) {
        where.companyId = payload.companyId
      }
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { propietario: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { expositor: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { numeroFicha: { contains: search, mode: "insensitive" } },
      ]
    }

    if (categoria && categoria !== "all") {
      where.contestCategory = { nombre: categoria }
    }
    if (raza && raza !== "all") where.raza = raza
    if (sexo && sexo !== "all") where.sexo = sexo
    if (tipoAnimal && tipoAnimal !== "all") where.tipoAnimal = tipoAnimal

    if (estado) {
      switch (estado) {
        case "destacado":
          where.isDestacado = true
          break
        case "ganador":
          where.isGanador = true
          break
        case "remate":
          where.enRemate = true
          break
      }
    }

    // Configurar ordenamiento
    let orderBy: any = { createdAt: "desc" }
    switch (ordenar) {
      case "nombre":
        orderBy = { nombre: "asc" }
        break
      case "fecha":
        orderBy = { fechaNacimiento: "desc" }
        break
      case "peso":
        orderBy = { pesoKg: "desc" }
        break
      case "puntaje":
        orderBy = { puntaje: "desc" }
        break
    }

    // Obtener datos
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
          company: {
            select: { nombre: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.ganado.count({ where }),
    ])

    // Obtener filtros dinámicos
    const [categories, breeds, animalTypes] = await Promise.all([
      prisma.contestCategory.findMany({
        where: contestSlug
          ? { contest: { slug: contestSlug } }
          : isAuthenticated && !payload?.roles?.includes("SUPERADMIN") && payload?.companyId
            ? { contest: { companyId: payload.companyId } }
            : {},
        select: {
          id: true,
          nombre: true,
        },
        distinct: ["nombre"],
        orderBy: { nombre: "asc" },
      }),
      prisma.ganado.findMany({
        where: contestSlug
          ? { contest: { slug: contestSlug } }
          : isAuthenticated && !payload?.roles?.includes("SUPERADMIN") && payload?.companyId
            ? { companyId: payload.companyId }
            : {},
        select: { raza: true },
        distinct: ["raza"],
        orderBy: { raza: "asc" },
      }),
      prisma.ganado.findMany({
        where: contestSlug
          ? { contest: { slug: contestSlug } }
          : isAuthenticated && !payload?.roles?.includes("SUPERADMIN") && payload?.companyId
            ? { companyId: payload.companyId }
            : {},
        select: { tipoAnimal: true },
        distinct: ["tipoAnimal"],
        orderBy: { tipoAnimal: "asc" },
      }),
    ])

    return NextResponse.json({
      ganado,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories: categories.map((cat) => ({
          id: cat.id,
          nombre: cat.nombre,
        })),
        breeds: breeds.map((b) => b.raza).filter(Boolean),
        animalTypes: animalTypes.map((t) => t.tipoAnimal).filter(Boolean),
      },
    })
  } catch (error) {
    console.error("Error fetching ganado:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    // Validar campos requeridos
    if (!data.nombre || !data.raza) {
      return NextResponse.json({ error: "Nombre y raza son requeridos" }, { status: 400 })
    }

    // Determinar companyId
    const companyId = payload.roles?.includes("SUPERADMIN") ? data.companyId : payload.companyId
    if (!companyId) {
      return NextResponse.json({ error: "ID de compañía requerido" }, { status: 400 })
    }

    // Crear o encontrar propietario si se proporciona
    let propietarioId = null
    if (data.propietario) {
      const propietario = await prisma.propietario.upsert({
        where: {
          companyId_nombreCompleto: {
            companyId,
            nombreCompleto: data.propietario,
          },
        },
        update: {},
        create: {
          nombreCompleto: data.propietario,
          companyId,
        },
      })
      propietarioId = propietario.id
    }

    const ganado = await prisma.ganado.create({
      data: {
        nombre: data.nombre,
        fechaNacimiento: data.fechaNacimiento || null,
        tipoAnimal: data.tipoAnimal || "Bovino",
        raza: data.raza,
        sexo: data.sexo || "MACHO",
        pesoKg: data.pesoKg ? Number.parseFloat(data.pesoKg) : null,
        imagenUrl: data.imagenUrl || null,
        enRemate: data.enRemate || false,
        precioBaseRemate: data.precioBaseRemate ? Number.parseFloat(data.precioBaseRemate) : null,
        isDestacado: data.isDestacado || false,
        isGanador: data.isGanador || false,
        premiosObtenidos: data.premiosObtenidos || [],
        numeroFicha: data.numeroFicha || null,
        puntaje: data.puntaje ? Number.parseFloat(data.puntaje) : null,
        companyId,
        propietarioId,
        expositorId: data.expositorId || null,
        contestId: data.contestId || null,
        contestCategoryId: data.contestCategoryId || null,
        createdById: payload.userId,
      },
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
        company: {
          select: { nombre: true },
        },
      },
    })

    return NextResponse.json(ganado, { status: 201 })
  } catch (error) {
    console.error("Error creating ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
