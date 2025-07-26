import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

// GET all ganado for a contest
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const contestId = params.id

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const categoriaId = searchParams.get("categoriaId")
    const raza = searchParams.get("raza")
    const sexo = searchParams.get("sexo")
    const establoId = searchParams.get("establoId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      contestId: contestId,
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { numeroFicha: { contains: search, mode: "insensitive" } },
        { raza: { contains: search, mode: "insensitive" } },
        { propietario: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { expositor: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { establo: { nombre: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (categoriaId) where.contestCategoryId = categoriaId
    if (raza) where.raza = raza
    if (sexo) where.sexo = sexo
    if (establoId) where.establoId = establoId

    const [ganado, total] = await Promise.all([
      prisma.ganado.findMany({
        where,
        include: {
          propietario: true,
          expositor: true,
          establo: true,
          contestCategory: true,
          contest: {
            select: { nombre: true },
          },
          company: {
            select: { nombre: true },
          },
          createdBy: {
            select: { nombre: true, apellido: true },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.ganado.count({ where }),
    ])

    return NextResponse.json({
      ganado,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST new ganado for contest
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const contestId = params.id

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()
    console.log("Received data in API:", JSON.stringify(data, null, 2))

    const requiredFields = [
      { field: "nombre", message: "El nombre del animal es requerido" },
      { field: "tipoAnimal", message: "El tipo de animal es requerido" },
      { field: "raza", message: "La raza es requerida" },
      { field: "sexo", message: "El sexo es requerido" },
      { field: "propietarioNombre", message: "El nombre del propietario es requerido" },
      { field: "contestCategoryId", message: "La categoría es requerida" },
      { field: "numeroFicha", message: "El número de ficha es requerido" },
    ]

    const missingFields = requiredFields.filter(
      ({ field }) => !data[field] || (typeof data[field] === "string" && data[field].trim() === ""),
    )

    if (missingFields.length > 0) {
      const errorMessage = missingFields.map(({ message }) => message).join(", ")
      console.log("Missing fields:", missingFields)
      console.log("Error message:", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    // Validar valores específicos
    if (!["MACHO", "HEMBRA"].includes(data.sexo)) {
      console.log("Invalid sexo value:", data.sexo)
      return NextResponse.json({ error: "El sexo debe ser MACHO o HEMBRA" }, { status: 400 })
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: { company: true },
    })

    if (!contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    if (!payload.roles?.includes("SUPERADMIN") && contest.companyId !== (payload as any).companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const category = await prisma.contestCategory.findUnique({
      where: { id: data.contestCategoryId },
    })

    if (!category) {
      console.log("Category not found:", data.contestCategoryId)
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    console.log("Category found:", category.nombre)

    const existingGanado = await prisma.ganado.findFirst({
      where: {
        contestId: contestId,
        numeroFicha: data.numeroFicha,
      },
    })

    if (existingGanado) {
      return NextResponse.json(
        { error: `Ya existe un animal con el número de ficha "${data.numeroFicha}" en este concurso` },
        { status: 400 },
      )
    }

    // Upsert propietario
    const propietario = await prisma.propietario.upsert({
      where: {
        companyId_nombreCompleto: {
          companyId: contest.companyId,
          nombreCompleto: data.propietarioNombre,
        },
      },
      update: {
        documentoLegal: data.propietarioDocumento || undefined,
        telefono: data.propietarioTelefono || undefined,
        email: data.propietarioEmail || undefined,
        direccion: data.propietarioDireccion || undefined,
      },
      create: {
        nombreCompleto: data.propietarioNombre,
        documentoLegal: data.propietarioDocumento || null,
        telefono: data.propietarioTelefono || null,
        email: data.propietarioEmail || null,
        direccion: data.propietarioDireccion || null,
        companyId: contest.companyId,
      },
    })

    // Upsert expositor (opcional)
    let expositor = null
    if (data.expositorNombre && data.expositorNombre.trim() !== "") {
      expositor = await prisma.expositor.upsert({
        where: {
          companyId_nombreCompleto: {
            companyId: contest.companyId,
            nombreCompleto: data.expositorNombre,
          },
        },
        update: {
          documentoIdentidad: data.expositorDocumento || undefined,
          telefono: data.expositorTelefono || undefined,
          email: data.expositorEmail || undefined,
          empresa: data.expositorEmpresa || undefined,
          experiencia: data.expositorExperiencia || undefined,
        },
        create: {
          nombreCompleto: data.expositorNombre,
          documentoIdentidad: data.expositorDocumento || null,
          telefono: data.expositorTelefono || null,
          email: data.expositorEmail || null,
          empresa: data.expositorEmpresa || null,
          experiencia: data.expositorExperiencia || null,
          companyId: contest.companyId,
        },
      })
    }

    // Crear nuevo establo si se especifica
    let establoId = data.establoId || null
    if (data.nuevoEstabloNombre && data.nuevoEstabloNombre.trim() !== "") {
      const newEstablo = await prisma.establo.create({
        data: {
          nombre: data.nuevoEstabloNombre,
          ubicacion: data.nuevoEstabloUbicacion || null,
          descripcion: data.nuevoEstabloDescripcion || null,
          companyId: contest.companyId,
        },
      })
      establoId = newEstablo.id
    }

    // Preparar datos del ganado
    const ganadoData: any = {
      nombre: data.nombre,
      numeroFicha: data.numeroFicha,
      tipoAnimal: data.tipoAnimal,
      raza: data.raza,
      sexo: data.sexo,
      descripcion: data.descripcion || null,
      marcasDistintivas: data.marcasDistintivas || null,
      padre: data.padre || null,
      madre: data.madre || null,
      lineaGenetica: data.lineaGenetica || null,
      enRemate: Boolean(data.enRemate || false),
      isDestacado: Boolean(data.isDestacado || false),
      isGanador: Boolean(data.isGanador || false),
      contestId: contestId,
      contestCategoryId: data.contestCategoryId,
      propietarioId: propietario.id,
      expositorId: expositor?.id || null,
      companyId: contest.companyId,
      createdById: (payload as any).userId,
      establoId: establoId,
    }

    // Manejar campos opcionales numéricos
    if (data.fechaNacimiento) {
      ganadoData.fechaNacimiento = new Date(data.fechaNacimiento)
    }

    if (data.peso !== undefined && data.peso !== null && data.peso !== "") {
      const peso = Number(data.peso)
      if (!isNaN(peso) && peso > 0) {
        ganadoData.pesoKg = peso
      }
    }

    if (data.puntaje !== undefined && data.puntaje !== null && data.puntaje !== "") {
      const puntaje = Number(data.puntaje)
      if (!isNaN(puntaje)) {
        ganadoData.puntaje = puntaje
      }
    }

    if (data.posicion !== undefined && data.posicion !== null && data.posicion !== "") {
      const posicion = Number(data.posicion)
      if (!isNaN(posicion) && posicion > 0) {
        ganadoData.posicion = posicion
      }
    }

    if (data.calificacion && data.calificacion.trim() !== "") {
      ganadoData.calificacion = data.calificacion
    }

    if (data.precioBaseRemate !== undefined && data.precioBaseRemate !== null && data.precioBaseRemate !== "") {
      const precio = Number(data.precioBaseRemate)
      if (!isNaN(precio) && precio > 0) {
        ganadoData.precioBaseRemate = precio
      }
    }

    // Manejar premios obtenidos
    if (data.premiosObtenidos && Array.isArray(data.premiosObtenidos)) {
      ganadoData.premiosObtenidos = data.premiosObtenidos.filter((premio: string) => 
        typeof premio === 'string' && premio.trim() !== ''
      )
    } else {
      ganadoData.premiosObtenidos = []
    }

    // Manejar imágenes
    if (data.imagenes && Array.isArray(data.imagenes) && data.imagenes.length > 0) {
      ganadoData.imagenUrl = data.imagenes[0]
    }

    console.log("Final ganado data before creation:", JSON.stringify(ganadoData, null, 2))

    const ganado = await prisma.ganado.create({
      data: ganadoData,
      include: {
        propietario: true,
        expositor: true,
        establo: true,
        contestCategory: true,
        contest: { select: { nombre: true } },
        company: { select: { nombre: true } },
        createdBy: { select: { nombre: true, apellido: true } },
      },
    })

    console.log("Ganado created successfully:", ganado.id)

    // Actualizar contador de participantes
    await prisma.contest.update({
      where: { id: contestId },
      data: { participantCount: { increment: 1 } },
    })

    return NextResponse.json(ganado, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating ganado:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code || 'Unknown code',
    })

    if ((error as any)?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un animal con este número de ficha en el concurso" },
        { status: 400 },
      )
    }

    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 })
  }
}

// Add this new endpoint for distinct values
export async function OPTIONS(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const contestId = params.id

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Get distinct razas for this contest
    const distinctRazas = await prisma.ganado.findMany({
      where: { contestId },
      select: { raza: true },
      distinct: ["raza"],
    })

    return NextResponse.json({
      razas: distinctRazas.map((g) => g.raza).filter(Boolean),
    })
  } catch (error) {
    console.error("Error fetching distinct values:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}