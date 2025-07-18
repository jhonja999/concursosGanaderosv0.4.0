import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

// GET single ganado
export async function GET(request: NextRequest, context: { params: Promise<{ id: string; ganadoId: string }> }) {
  try {
    const params = await context.params
    const { id: contestId, ganadoId } = params

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const ganado = await prisma.ganado.findFirst({
      where: {
        id: ganadoId,
        contestId: contestId,
      },
      include: {
        propietario: true,
        expositor: true,
        establo: true,
        contestCategory: true,
        contest: {
          select: {
            id: true,
            nombre: true,
            companyId: true,
          },
        },
        company: {
          select: { nombre: true },
        },
        createdBy: {
          select: { nombre: true, apellido: true },
        },
      },
    })

    if (!ganado) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 })
    }

    // Transform the data to match what the form expects
    const transformedGanado = {
      ...ganado,
      imagenes: ganado.imagenUrl ? [ganado.imagenUrl] : [],
      documentos: [],
      // Add propietario fields for the form
      propietarioNombre: ganado.propietario?.nombreCompleto || "",
      propietarioDocumento: ganado.propietario?.documentoLegal || "",
      propietarioTelefono: ganado.propietario?.telefono || "",
      propietarioEmail: ganado.propietario?.email || "",
      propietarioDireccion: ganado.propietario?.direccion || "",
      // Add expositor fields for the form
      expositorNombre: ganado.expositor?.nombreCompleto || "",
      expositorDocumento: ganado.expositor?.documentoIdentidad || "",
      expositorTelefono: ganado.expositor?.telefono || "",
      expositorEmail: ganado.expositor?.email || "",
      expositorEmpresa: ganado.expositor?.empresa || "",
      expositorExperiencia: ganado.expositor?.experiencia || "",
      // Format dates and numbers
      fechaNacimientoFormatted: ganado.fechaNacimiento ? ganado.fechaNacimiento.toISOString().split("T")[0] : "",
      peso: ganado.pesoKg?.toString() || "",
      puntaje: ganado.puntaje?.toString() || "",
    }

    return NextResponse.json({ ganado: transformedGanado })
  } catch (error) {
    console.error("Error fetching ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT update ganado
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; ganadoId: string }> }) {
  try {
    const params = await context.params
    const { id: contestId, ganadoId } = params

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    const existingGanado = await prisma.ganado.findFirst({
      where: {
        id: ganadoId,
        contestId: contestId,
      },
      include: { contest: true },
    })

    if (!existingGanado) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 })
    }

    if (!existingGanado.contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    if (!payload.roles?.includes("SUPERADMIN") && existingGanado.contest.companyId !== (payload as any).companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (data.numeroFicha && data.numeroFicha !== existingGanado.numeroFicha) {
      const duplicateGanado = await prisma.ganado.findFirst({
        where: {
          contestId: contestId,
          numeroFicha: data.numeroFicha,
          id: { not: ganadoId },
        },
      })

      if (duplicateGanado) {
        return NextResponse.json(
          { error: `Ya existe un animal con el número de ficha "${data.numeroFicha}" en este concurso` },
          { status: 400 },
        )
      }
    }

    let propietarioId = existingGanado.propietarioId
    if (data.propietarioNombre) {
      const propietario = await prisma.propietario.upsert({
        where: {
          companyId_nombreCompleto: {
            companyId: existingGanado.contest.companyId,
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
          companyId: existingGanado.contest.companyId,
        },
      })
      propietarioId = propietario.id
    }

    let expositorId = existingGanado.expositorId
    if (data.expositorNombre && data.expositorNombre.trim() !== "") {
      const expositor = await prisma.expositor.upsert({
        where: {
          companyId_nombreCompleto: {
            companyId: existingGanado.contest.companyId,
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
          companyId: existingGanado.contest.companyId,
        },
      })
      expositorId = expositor.id
    } else if (data.expositorNombre === "") {
      expositorId = null
    }

    let establoId = data.establoId !== undefined ? data.establoId : existingGanado.establoId
    if (data.nuevoEstabloNombre && data.nuevoEstabloNombre.trim() !== "") {
      const newEstablo = await prisma.establo.create({
        data: {
          nombre: data.nuevoEstabloNombre,
          ubicacion: data.nuevoEstabloUbicacion || null,
          descripcion: data.nuevoEstabloDescripcion || null,
          companyId: existingGanado.contest.companyId,
        },
      })
      establoId = newEstablo.id
    }

    const finalTipoAnimal = data.tipoAnimal || existingGanado.tipoAnimal
    const finalRaza = data.raza || existingGanado.raza

    const updateData: any = {
      nombre: data.nombre || existingGanado.nombre,
      numeroFicha: data.numeroFicha || existingGanado.numeroFicha,
      tipoAnimal: finalTipoAnimal,
      raza: finalRaza,
      sexo: data.sexo || existingGanado.sexo,
      descripcion: data.descripcion !== undefined ? data.descripcion : existingGanado.descripcion,
      marcasDistintivas:
        data.marcasDistintivas !== undefined ? data.marcasDistintivas : existingGanado.marcasDistintivas,
      padre: data.padre !== undefined ? data.padre : existingGanado.padre,
      madre: data.madre !== undefined ? data.madre : existingGanado.madre,
      lineaGenetica: data.lineaGenetica !== undefined ? data.lineaGenetica : existingGanado.lineaGenetica,
      enRemate: data.enRemate !== undefined ? data.enRemate : existingGanado.enRemate,
      precioBaseRemate:
        data.precioBaseRemate !== undefined
          ? data.precioBaseRemate
            ? Number.parseFloat(data.precioBaseRemate)
            : null
          : existingGanado.precioBaseRemate,
      isDestacado: data.isDestacado !== undefined ? data.isDestacado : existingGanado.isDestacado,
      imagenUrl: data.imagenes?.[0] !== undefined ? data.imagenes[0] : existingGanado.imagenUrl,
      propietarioId,
      expositorId,
      establoId,
    }

    if (data.fechaNacimiento !== undefined) {
      updateData.fechaNacimiento = data.fechaNacimiento ? new Date(data.fechaNacimiento) : null
    }
    if (data.peso !== undefined) {
      updateData.pesoKg = data.peso && !isNaN(Number.parseFloat(data.peso)) ? Number.parseFloat(data.peso) : null
    }
    if (data.puntaje !== undefined) {
      updateData.puntaje =
        data.puntaje && !isNaN(Number.parseFloat(data.puntaje)) ? Number.parseFloat(data.puntaje) : null
    }
    if (data.contestCategoryId) {
      updateData.contestCategoryId = data.contestCategoryId
    }

    const updatedGanado = await prisma.ganado.update({
      where: { id: ganadoId },
      data: updateData,
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

    return NextResponse.json({ ganado: updatedGanado })
  } catch (error) {
    console.error("Error updating ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE ganado
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; ganadoId: string }> }) {
  try {
    const params = await context.params
    const { id: contestId, ganadoId } = params

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const existingGanado = await prisma.ganado.findFirst({
      where: {
        id: ganadoId,
        contestId: contestId,
      },
      include: { contest: true },
    })

    if (!existingGanado) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 })
    }

    if (!existingGanado.contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    if (!payload.roles?.includes("SUPERADMIN") && existingGanado.contest.companyId !== (payload as any).companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    await prisma.ganado.delete({
      where: { id: ganadoId },
    })

    await prisma.contest.update({
      where: { id: contestId },
      data: {
        participantCount: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json({ message: "Animal eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
