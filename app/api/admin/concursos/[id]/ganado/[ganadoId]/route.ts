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
      fechaNacimiento: ganado.fechaNacimiento ? ganado.fechaNacimiento.toISOString().split("T")[0] : "",
      peso: ganado.pesoKg || undefined,
      puntaje: ganado.puntaje || undefined,
      posicion: ganado.posicion || undefined,
      // Ensure premiosObtenidos is an array
      premiosObtenidos: Array.isArray(ganado.premiosObtenidos) ? ganado.premiosObtenidos : [],
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
    console.log("Updating ganado with data:", data)

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

    // Verificar duplicado de número de ficha
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

    // Actualizar propietario
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

    // Actualizar expositor
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

    // Manejar establo
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

    // Preparar datos de actualización
    const updateData: any = {
      nombre: data.nombre || existingGanado.nombre,
      numeroFicha: data.numeroFicha || existingGanado.numeroFicha,
      tipoAnimal: data.tipoAnimal || existingGanado.tipoAnimal,
      raza: data.raza || existingGanado.raza,
      sexo: data.sexo || existingGanado.sexo,
      descripcion: data.descripcion !== undefined ? data.descripcion : existingGanado.descripcion,
      marcasDistintivas: data.marcasDistintivas !== undefined ? data.marcasDistintivas : existingGanado.marcasDistintivas,
      padre: data.padre !== undefined ? data.padre : existingGanado.padre,
      madre: data.madre !== undefined ? data.madre : existingGanado.madre,
      lineaGenetica: data.lineaGenetica !== undefined ? data.lineaGenetica : existingGanado.lineaGenetica,
      enRemate: data.enRemate !== undefined ? Boolean(data.enRemate) : existingGanado.enRemate,
      isDestacado: data.isDestacado !== undefined ? Boolean(data.isDestacado) : existingGanado.isDestacado,
      isGanador: data.isGanador !== undefined ? Boolean(data.isGanador) : existingGanado.isGanador,
      propietarioId,
      expositorId,
      establoId,
    }

    // Manejar campos opcionales
    if (data.fechaNacimiento !== undefined) {
      updateData.fechaNacimiento = data.fechaNacimiento ? new Date(data.fechaNacimiento) : null
    }

    if (data.peso !== undefined) {
      const peso = Number(data.peso)
      updateData.pesoKg = !isNaN(peso) && peso > 0 ? peso : null
    }

    if (data.puntaje !== undefined) {
      const puntaje = Number(data.puntaje)
      updateData.puntaje = !isNaN(puntaje) ? puntaje : null
    }

    if (data.posicion !== undefined) {
      const posicion = Number(data.posicion)
      updateData.posicion = !isNaN(posicion) && posicion > 0 ? posicion : null
    }

    if (data.calificacion !== undefined) {
      updateData.calificacion = data.calificacion && data.calificacion.trim() !== "" ? data.calificacion : null
    }

    if (data.precioBaseRemate !== undefined) {
      const precio = Number(data.precioBaseRemate)
      updateData.precioBaseRemate = !isNaN(precio) && precio > 0 ? precio : null
    }

    if (data.contestCategoryId) {
      updateData.contestCategoryId = data.contestCategoryId
    }

    // Manejar premios obtenidos
    if (data.premiosObtenidos !== undefined) {
      if (Array.isArray(data.premiosObtenidos)) {
        updateData.premiosObtenidos = data.premiosObtenidos.filter((premio: string) => 
          typeof premio === 'string' && premio.trim() !== ''
        )
      } else {
        updateData.premiosObtenidos = []
      }
    }

    // Manejar imágenes
    if (data.imagenes !== undefined) {
      updateData.imagenUrl = Array.isArray(data.imagenes) && data.imagenes.length > 0 ? data.imagenes[0] : null
    }

    console.log("Final update data:", updateData)

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
  } catch (error: unknown) {
    console.error("Error updating ganado:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code || 'Unknown code',
    })
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 })
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