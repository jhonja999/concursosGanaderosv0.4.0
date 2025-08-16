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
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const ganado = await prisma.ganado.findUnique({
      where: { id },
      include: {
        establo: true,
        company: {
          select: { nombre: true },
        },
        createdBy: {
          select: { nombre: true, apellido: true },
        },
      },
    })

    if (!ganado) {
      return NextResponse.json({ error: "Ganado no encontrado" }, { status: 404 })
    }

    // Verificar permisos
    if (!payload.roles?.includes("SUPERADMIN") && ganado.companyId !== payload.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("Error fetching ganado:", error)
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
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    // Verificar que el ganado existe y permisos
    const existingGanado = await prisma.ganado.findUnique({
      where: { id },
    })

    if (!existingGanado) {
      return NextResponse.json({ error: "Ganado no encontrado" }, { status: 404 })
    }

    if (!payload.roles?.includes("SUPERADMIN") && existingGanado.companyId !== payload.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    let criadorId = existingGanado.propietarioId
    if (data.propietario && data.propietario !== existingGanado.propietarioId) {
      const criador = await prisma.propietario.upsert({
        where: {
          companyId_nombreCompleto: {
            companyId: existingGanado.companyId || "",
            nombreCompleto: data.propietario,
          },
        },
        update: {},
        create: {
          nombreCompleto: data.propietario,
          companyId: existingGanado.companyId || "",
        },
      })
      criadorId = criador.id
    }

    let establoId = existingGanado.establoId
    if (data.establo && data.establo !== existingGanado.establoId) {
      const establo = await prisma.establo.upsert({
        where: {
          companyId_nombre: {
            companyId: existingGanado.companyId || "",
            nombre: data.establo,
          },
        },
        update: {},
        create: {
          nombre: data.establo,
          companyId: existingGanado.companyId || "",
        },
      })
      establoId = establo.id
    }

    const ganado = await prisma.ganado.update({
      where: { id },
      data: {
        nombre: data.nombre,
        fechaNacimiento: data.fecha_nacimiento || null,
        enRemate: data.en_remate || false,
        descripcion: data.descripcion || null,
        raza: data.raza,
  pesoKg: data.peso ? Number.parseFloat(data.peso) : null,
  sexo: data.sexo || null,
  imagenUrl: data.imagen_url || null,
  puntaje: data.puntaje ? Number.parseFloat(data.puntaje) : null,
  propietarioId: criadorId,
  establoId,
      },
      include: {
        establo: true,
        company: {
          select: { nombre: true },
        },
        createdBy: {
          select: { nombre: true, apellido: true },
        },
      },
    })

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("Error updating ganado:", error)
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
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que el ganado existe y permisos
    const existingGanado = await prisma.ganado.findUnique({
      where: { id },
    })

    if (!existingGanado) {
      return NextResponse.json({ error: "Ganado no encontrado" }, { status: 404 })
    }

    if (!payload.roles?.includes("SUPERADMIN") && existingGanado.companyId !== payload.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    await prisma.ganado.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Ganado eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
