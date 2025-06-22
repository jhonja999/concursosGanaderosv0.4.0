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
    const categoria = searchParams.get("categoria")
    const raza = searchParams.get("raza")
    const sexo = searchParams.get("sexo")
    const estado = searchParams.get("estado")
    const enRemate = searchParams.get("enRemate")
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
        { raza: { contains: search, mode: "insensitive" } },
        { propietario: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { expositor: { nombreCompleto: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (categoria) where.contestCategory = { nombre: categoria }
    if (raza) where.raza = raza
    if (sexo) where.sexo = sexo
    if (estado) where.estado = estado
    if (enRemate !== null) where.enRemate = enRemate === "true"

    const [ganado, total] = await Promise.all([
      prisma.ganado.findMany({
        where,
        include: {
          propietario: true,
          expositor: true,
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
        orderBy: [{ puntaje: "desc" }, { createdAt: "desc" }], // Ordenar por puntaje primero
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
    console.log("Received data in API:", data)

    // Validar campos requeridos (solo los que realmente son obligatorios)
    const requiredFields = [
      { field: "nombre", message: "El nombre del animal es requerido" },
      { field: "tipoAnimal", message: "El tipo de animal es requerido" },
      { field: "raza", message: "La raza es requerida" },
      { field: "sexo", message: "El sexo es requerido" },
      { field: "propietarioNombre", message: "El nombre del propietario es requerido" },
      { field: "contestCategoryId", message: "La categoría es requerida" },
      { field: "numeroFicha", message: "El número de ficha es requerido" },
    ]

    const missingFields = requiredFields.filter(({ field }) => !data[field] || data[field].trim() === "")

    if (missingFields.length > 0) {
      const errorMessage = missingFields.map(({ message }) => message).join(", ")
      console.log("Missing fields:", missingFields)
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    // Verificar que el concurso existe y permisos
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

    // Verificar que la categoría existe
    const category = await prisma.contestCategory.findUnique({
      where: { id: data.contestCategoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    // Verificar que el número de ficha no esté duplicado en este concurso
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

    // Crear o encontrar propietario
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

    // Crear expositor si se proporciona
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

    // Preparar datos para crear el ganado
    const ganadoData: any = {
      nombre: data.nombre,
      numeroFicha: data.numeroFicha,
      raza: data.raza,
      sexo: data.sexo,
      descripcion: data.descripcion || null,
      marcasDistintivas: data.marcasDistintivas || null,
      padre: data.padre || null,
      madre: data.madre || null,
      lineaGenetica: data.lineaGenetica || null,
      enRemate: data.enRemate || false,
      precioBaseRemate: data.precioBaseRemate ? Number.parseFloat(data.precioBaseRemate) : null,
      isDestacado: data.isDestacado || false,
      imagenUrl: data.imagenes?.[0] || null, // Primera imagen como principal
      contestId: contestId,
      contestCategoryId: data.contestCategoryId,
      propietarioId: propietario.id,
      expositorId: expositor?.id || null,
      companyId: contest.companyId,
      createdById: (payload as any).userId,
    }

    // Agregar campos opcionales solo si están presentes
    if (data.fechaNacimiento) {
      ganadoData.fechaNacimiento = new Date(data.fechaNacimiento)
    }

    if (data.peso && !isNaN(Number.parseFloat(data.peso))) {
      ganadoData.pesoKg = Number.parseFloat(data.peso)
    }

    // Agregar puntaje si está presente
    if (data.puntaje !== undefined && data.puntaje !== null && !isNaN(Number.parseFloat(data.puntaje))) {
      ganadoData.puntaje = Number.parseFloat(data.puntaje)
    }

    console.log("Creating ganado with data:", ganadoData)

    // Crear el ganado
    const ganado = await prisma.ganado.create({
      data: ganadoData,
      include: {
        propietario: true,
        expositor: true,
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
    })

    // Actualizar contador de participantes del concurso
    await prisma.contest.update({
      where: { id: contestId },
      data: {
        participantCount: {
          increment: 1,
        },
      },
    })

    console.log("Ganado created successfully:", ganado.id)
    return NextResponse.json(ganado, { status: 201 })
  } catch (error: any) {
    console.error("Error creating ganado:", error)

    // Manejar errores específicos de Prisma
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un animal con este número de ficha en el concurso" },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
