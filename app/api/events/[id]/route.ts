import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.companyId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    // Verify event belongs to user's company
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...data,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
      },
      include: {
        concurso: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating event:", error)
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
    if (!payload || !payload.companyId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verify event belongs to user's company
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Evento eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
