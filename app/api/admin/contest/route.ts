import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const companyId = searchParams.get("companyId")
    const status = searchParams.get("status")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { descripcion: { contains: search, mode: "insensitive" } },
        { ubicacion: { contains: search, mode: "insensitive" } },
        { company: { nombre: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (status) {
      switch (status) {
        case "active":
          where.isActive = true
          break
        case "inactive":
          where.isActive = false
          break
        case "public":
          where.isPublic = true
          break
        case "private":
          where.isPublic = false
          break
        case "featured":
          where.isFeatured = true
          break
      }
    }

    const [contests, total] = await Promise.all([
      prisma.contest.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.contest.count({ where }),
    ])

    return NextResponse.json({
      contests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching contests:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const {
      nombre,
      slug,
      descripcion,
      imagenPrincipal,
      fechaInicio,
      fechaFin,
      fechaInicioRegistro,
      fechaFinRegistro,
      ubicacion,
      direccion,
      capacidadMaxima,
      cuotaInscripcion,
      tipoGanado,
      categorias,
      premiacion,
      reglamento,
      contactoOrganizador,
      telefonoContacto,
      emailContacto,
      requisitoEspeciales,
      isPublic,
      isActive,
      isFeatured,
      permitirRegistroTardio,
      companyId,
    } = body

    // Validate required fields
    if (!nombre || !descripcion) {
      return NextResponse.json({ error: "Nombre y descripción son obligatorios" }, { status: 400 })
    }

    // Generate slug if not provided
    const finalSlug =
      slug ||
      nombre
        .toLowerCase()
        .replace(/[áàäâ]/g, "a")
        .replace(/[éèëê]/g, "e")
        .replace(/[íìïî]/g, "i")
        .replace(/[óòöô]/g, "o")
        .replace(/[úùüû]/g, "u")
        .replace(/[ñ]/g, "n")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()

    // Check if slug already exists
    const existingContest = await prisma.contest.findFirst({
      where: { slug: finalSlug },
    })

    if (existingContest) {
      return NextResponse.json({ error: "Ya existe un concurso con este slug" }, { status: 400 })
    }

    // Validate company exists if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      })

      if (!company) {
        return NextResponse.json({ error: "La compañía especificada no existe" }, { status: 400 })
      }
    }

    // Create contest
    const contest = await prisma.contest.create({
      data: {
        nombre,
        slug: finalSlug,
        descripcion,
        imagenPrincipal: imagenPrincipal || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        fechaInicioRegistro: fechaInicioRegistro ? new Date(fechaInicioRegistro) : null,
        fechaFinRegistro: fechaFinRegistro ? new Date(fechaFinRegistro) : null,
        ubicacion: ubicacion || null,
        direccion: direccion || null,
        capacidadMaxima: capacidadMaxima || null,
        cuotaInscripcion: cuotaInscripcion || 0,
        tipoGanado: tipoGanado || null,
        categorias: categorias || [],
        premiacion: premiacion || null,
        reglamento: reglamento || null,
        contactoOrganizador: contactoOrganizador || null,
        telefonoContacto: telefonoContacto || null,
        emailContacto: emailContacto || null,
        requisitoEspeciales: requisitoEspeciales || null,
        isPublic: isPublic || false,
        isActive: isActive || false,
        isFeatured: isFeatured || false,
        permitirRegistroTardio: permitirRegistroTardio || false,
        companyId: companyId || null,
      },
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json({ contest }, { status: 201 })
  } catch (error) {
    console.error("Error creating contest:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
