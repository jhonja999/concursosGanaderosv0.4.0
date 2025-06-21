import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
            logo: true,
          },
        },
      },
    })

    if (!contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    // Transform the data to include tipoConcurso for backward compatibility
    const transformedContest = {
      ...contest,
      tipoConcurso: contest.tipoGanado?.[0] || "",
    }

    return NextResponse.json({ contest: transformedContest })
  } catch (error) {
    console.error("Error fetching contest:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Check if contest exists
    const existingContest = await prisma.contest.findUnique({
      where: { id },
    })

    if (!existingContest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

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

    // Check if slug already exists (excluding current contest)
    if (finalSlug !== existingContest.slug) {
      const contestWithSlug = await prisma.contest.findFirst({
        where: { slug: finalSlug },
      })

      if (contestWithSlug) {
        return NextResponse.json({ error: "Ya existe un concurso con este slug" }, { status: 400 })
      }
    }

    // Validate company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      return NextResponse.json({ error: "La compañía especificada no existe" }, { status: 400 })
    }

    // Prepare JSON data for Prisma
    const premiacionData = premiacion !== undefined ? (premiacion ? { descripcion: premiacion } : null) : undefined

    // Update contest using the unchecked input to allow companyId
    const contest = await prisma.contest.update({
      where: { id },
      data: {
        nombre,
        slug: finalSlug,
        descripcion,
        imagenPrincipal: imagenPrincipal !== undefined ? imagenPrincipal : undefined,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin !== undefined ? (fechaFin ? new Date(fechaFin) : null) : undefined,
        fechaInicioRegistro:
          fechaInicioRegistro !== undefined ? (fechaInicioRegistro ? new Date(fechaInicioRegistro) : null) : undefined,
        fechaFinRegistro:
          fechaFinRegistro !== undefined ? (fechaFinRegistro ? new Date(fechaFinRegistro) : null) : undefined,
        ubicacion: ubicacion !== undefined ? ubicacion : undefined,
        direccion: direccion !== undefined ? direccion : undefined,
        capacidadMaxima: capacidadMaxima !== undefined ? capacidadMaxima : undefined,
        cuotaInscripcion:
          cuotaInscripcion !== undefined
            ? cuotaInscripcion
              ? Number.parseFloat(cuotaInscripcion.toString())
              : null
            : undefined,
        tipoGanado: tipoConcurso !== undefined ? (tipoConcurso ? [tipoConcurso] : []) : undefined,
        categorias: categorias !== undefined ? categorias : undefined,
        premiacion: premiacionData as any,
        reglamento: reglamento !== undefined ? reglamento : undefined,
        contactoOrganizador: contactoOrganizador !== undefined ? contactoOrganizador : undefined,
        telefonoContacto: telefonoContacto !== undefined ? telefonoContacto : undefined,
        emailContacto: emailContacto !== undefined ? emailContacto : undefined,
        requisitoEspeciales: requisitoEspeciales !== undefined ? requisitoEspeciales : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
        permitirRegistroTardio: permitirRegistroTardio !== undefined ? permitirRegistroTardio : undefined,
        companyId: companyId,
        updatedAt: new Date(),
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

    return NextResponse.json({ contest })
  } catch (error) {
    console.error("Error updating contest:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Delete contest
    await prisma.contest.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Concurso eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting contest:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
