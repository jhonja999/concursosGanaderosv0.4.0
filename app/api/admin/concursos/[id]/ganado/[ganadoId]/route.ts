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

    if (!ganado) {
      return NextResponse.json({ error: "Animal no encontrado" }, { status: 404 })
    }

    return NextResponse.json(ganado)
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

    // Verificar que el ganado existe
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

    // Verificar permisos
    if (!payload.roles?.includes("SUPERADMIN") && existingGanado.contest.companyId !== (payload as any).companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar número de ficha único (si se está cambiando)
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

    // Actualizar propietario si se proporciona
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

    // Actualizar expositor si se proporciona
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

    // Preparar datos de actualización
    const updateData: any = {
      nombre: data.nombre || existingGanado.nombre,
      numeroFicha: data.numeroFicha || existingGanado.numeroFicha,
      raza: data.raza || existingGanado.raza,
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
    }

    // Actualizar campos opcionales
    if (data.fechaNacimiento !== undefined) {
      updateData.fechaNacimiento = data.fechaNacimiento ? new Date(data.fechaNacimiento) : null
    }

    if (data.peso !== undefined) {
      updateData.pesoKg = data.peso && !isNaN(Number.parseFloat(data.peso)) ? Number.parseFloat(data.peso) : null
    }

    // Actualizar puntaje si está presente
    if (data.puntaje !== undefined) {
      updateData.puntaje =
        data.puntaje && !isNaN(Number.parseFloat(data.puntaje)) ? Number.parseFloat(data.puntaje) : null
    }

    if (data.contestCategoryId) {
      updateData.contestCategoryId = data.contestCategoryId
    }

    // Actualizar el ganado
    const updatedGanado = await prisma.ganado.update({
      where: { id: ganadoId },
      data: updateData,
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

    return NextResponse.json(updatedGanado)
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

    // Verificar que el ganado existe
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

    // Verificar permisos
    if (!payload.roles?.includes("SUPERADMIN") && existingGanado.contest.companyId !== (payload as any).companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Eliminar el ganado
    await prisma.ganado.delete({
      where: { id: ganadoId },
    })

    // Actualizar contador de participantes del concurso
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
