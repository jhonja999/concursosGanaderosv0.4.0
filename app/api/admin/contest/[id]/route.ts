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

    return NextResponse.json({ contest })
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

    // Validate company exists if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      })

      if (!company) {
        return NextResponse.json({ error: "La compañía especificada no existe" }, { status: 400 })
      }
    }

    // Update contest
    const contest = await prisma.contest.update({
      where: { id },
      data: {
        nombre,
        slug: finalSlug,
        descripcion,
        imagenPrincipal: imagenPrincipal || existingContest.imagenPrincipal,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : existingContest.fechaInicio,
        fechaFin: fechaFin ? new Date(fechaFin) : existingContest.fechaFin,
        fechaInicioRegistro: fechaInicioRegistro ? new Date(fechaInicioRegistro) : existingContest.fechaInicioRegistro,
        fechaFinRegistro: fechaFinRegistro ? new Date(fechaFinRegistro) : existingContest.fechaFinRegistro,
        ubicacion: ubicacion !== undefined ? ubicacion : existingContest.ubicacion,
        direccion: direccion !== undefined ? direccion : existingContest.direccion,
        capacidadMaxima: capacidadMaxima !== undefined ? capacidadMaxima : existingContest.capacidadMaxima,
        cuotaInscripcion: cuotaInscripcion !== undefined ? cuotaInscripcion : existingContest.cuotaInscripcion,
        tipoGanado: tipoGanado !== undefined ? tipoGanado : existingContest.tipoGanado,
        categorias: categorias !== undefined ? categorias : existingContest.categorias,
        premiacion: premiacion !== undefined ? premiacion : existingContest.premiacion,
        reglamento: reglamento !== undefined ? reglamento : existingContest.reglamento,
        contactoOrganizador:
          contactoOrganizador !== undefined ? contactoOrganizador : existingContest.contactoOrganizador,
        telefonoContacto: telefonoContacto !== undefined ? telefonoContacto : existingContest.telefonoContacto,
        emailContacto: emailContacto !== undefined ? emailContacto : existingContest.emailContacto,
        requisitoEspeciales:
          requisitoEspeciales !== undefined ? requisitoEspeciales : existingContest.requisitoEspeciales,
        isPublic: isPublic !== undefined ? isPublic : existingContest.isPublic,
        isActive: isActive !== undefined ? isActive : existingContest.isActive,
        isFeatured: isFeatured !== undefined ? isFeatured : existingContest.isFeatured,
        permitirRegistroTardio:
          permitirRegistroTardio !== undefined ? permitirRegistroTardio : existingContest.permitirRegistroTardio,
        companyId: companyId !== undefined ? companyId : existingContest.companyId,
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
