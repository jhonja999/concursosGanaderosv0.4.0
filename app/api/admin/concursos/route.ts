import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import type { Prisma } from "@prisma/client"

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
    const where: Prisma.ContestWhereInput = {}

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
    console.log("POST /api/admin/concursos - Starting request processing")

    const token = request.cookies.get("auth-token")?.value
    console.log("Token found:", !!token)

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    console.log("Token payload:", payload)

    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    console.log("Request body received:", body)

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
      tipoConcurso,
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

    if (!companyId) {
      return NextResponse.json({ error: "La compañía organizadora es obligatoria" }, { status: 400 })
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

    console.log("Generated slug:", finalSlug)

    // Check if slug already exists
    const existingContest = await prisma.contest.findFirst({
      where: { slug: finalSlug },
    })

    if (existingContest) {
      return NextResponse.json({ error: "Ya existe un concurso con este slug" }, { status: 400 })
    }

    // Validate company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      return NextResponse.json({ error: "La compañía especificada no existe" }, { status: 400 })
    }

    console.log("Creating contest with data...")

    // Prepare JSON data for Prisma - use any type to bypass strict typing
    const premiacionData = premiacion ? { descripcion: premiacion } : null

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
        cuotaInscripcion: cuotaInscripcion ? Number.parseFloat(cuotaInscripcion.toString()) : null,
        tipoGanado: tipoConcurso ? [tipoConcurso] : [],
        categorias: categorias || [],
        premiacion: premiacionData as any,
        reglamento: reglamento || null,
        contactoOrganizador: contactoOrganizador || null,
        telefonoContacto: telefonoContacto || null,
        emailContacto: emailContacto || null,
        requisitoEspeciales: requisitoEspeciales || null,
        isPublic: isPublic || false,
        isActive: isActive || false,
        isFeatured: isFeatured || false,
        permitirRegistroTardio: permitirRegistroTardio || false,
        companyId: companyId,
        createdById: payload.userId,
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

    // Synchronize ContestCategory records based on the 'categorias' string array
    if (categorias && Array.isArray(categorias) && categorias.length > 0) {
      console.log("Creating contest categories:", categorias)

      // Create categories in a transaction to ensure consistency
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < categorias.length; i++) {
          const categoryName = categorias[i]
          if (typeof categoryName === "string" && categoryName.trim() !== "") {
            await tx.contestCategory.create({
              data: {
                nombre: categoryName.trim(),
                contestId: contest.id,
                orden: i + 1,
              },
            })
          }
        }
      })

      console.log("Contest categories created successfully")
    }

    console.log("Contest created successfully:", contest.id)

    return NextResponse.json({ contest }, { status: 201 })
  } catch (error) {
    console.error("Error creating contest:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
