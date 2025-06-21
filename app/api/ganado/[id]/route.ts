import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const ganado = await prisma.ganado.findUnique({
      where: { id: params.id },
      include: {
        criador: true,
        establoRel: true,
        company: {
          select: { nombre: true }
        },
        createdBy: {
          select: { nombre: true, apellido: true }
        }
      }
    })

    if (!ganado) {
      return NextResponse.json({ error: "Ganado no encontrado" }, { status: 404 })
    }

    // Verificar permisos
    if (!payload.roles.includes("SUPERADMIN") && ganado.companyId !== payload.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("Error fetching ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    // Verificar que el ganado existe y permisos
    const existingGanado = await prisma.ganado.findUnique({
      where: { id: params.id }
    })

    if (!existingGanado) {
      return NextResponse.json({ error: "Ganado no encontrado" }, { status: 404 })
    }

    if (!payload.roles.includes("SUPERADMIN") && existingGanado.companyId !== payload.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Actualizar criador si cambió
    let criadorId = existingGanado.criadorId
    if (data.propietario && data.propietario !== existingGanado.propietario) {
      const criador = await prisma.criador.upsert({
        where: {
          companyId_nombreCompleto: {
            companyId: existingGanado.companyId,
            nombreCompleto: data.propietario
          }
        },
        update: {},
        create: {
          nombre: data.propietario.split(' ')[0] || data.propietario,
          apellido: data.propietario.split(' ').slice(1).join(' ') || '',
          nombreCompleto: data.propietario,
          companyId: existingGanado.companyId,
        }
      })
      criadorId = criador.id
    }

    // Actualizar establo si cambió
    let establoId = existingGanado.establoId
    if (data.establo && data.establo !== existingGanado.establo) {
      const establo = await prisma.establo.upsert({
        where: {
          companyId_nombre: {
            companyId: existingGanado.companyId,
            nombre: data.establo
          }
        },
        update: {},
        create: {
          nombre: data.establo,
          companyId: existingGanado.companyId,
        }
      })
      establoId = establo.id
    }

    const ganado = await prisma.ganado.update({
      where: { id: params.id },
      data: {
        nombre: data.nombre,
        fecha_nacimiento: data.fecha_nacimiento || null,
        dias_nacida: data.dias_nacida || null,
        categoria: data.categoria,
        establo: data.establo || null,
        en_remate: data.en_remate || false,
        propietario: data.propietario || null,
        descripcion: data.descripcion || null,
        raza: data.raza,
        peso: data.peso ? parseFloat(data.peso) : null,
        sexo: data.sexo || null,
        imagen_url: data.imagen_url || null,
        puntaje: data.puntaje ? parseFloat(data.puntaje) : null,
        criadorId,
        establoId,
      },
      include: {
        criador: true,
        establoRel: true,
        company: {
          select: { nombre: true }
        },
        createdBy: {
          select: { nombre: true, apellido: true }
        }
      }
    })

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("Error updating ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verificar que el ganado existe y permisos
    const existingGanado = await prisma.ganado.findUnique({
      where: { id: params.id }
    })

    if (!existingGanado) {
      return NextResponse.json({ error: "Ganado no encontrado" }, { status: 404 })
    }

    if (!payload.roles.includes("SUPERADMIN") && existingGanado.companyId !== payload.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    await prisma.ganado.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Ganado eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}