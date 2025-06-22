import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

interface Params {
  params: {
    id: string
    eventId: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.roles?.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.roles?.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    // Use the correct English field names from your Prisma model
    const { title, description, startDate, endDate, featuredImage } = body

    if (!title || !startDate) {
      return NextResponse.json({ error: "Título y fecha de inicio son obligatorios" }, { status: 400 })
    }

    const updatedEvent = await prisma.event.update({
      where: { id: params.eventId },
      // Pass the correct English field names to the data object
      data: {
        title,
        description,
        startDate,
        endDate,
        featuredImage,
      },
    })

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.roles?.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    await prisma.event.delete({
      where: { id: params.eventId },
    })

    return NextResponse.json({ message: "Evento eliminado exitosamente" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
