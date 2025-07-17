import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (
      !payload ||
      !payload.roles ||
      !Array.isArray(payload.roles) ||
      !payload.roles.some((role) => ["SUPERADMIN", "CONCURSO_ADMIN"].includes(role))
    ) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, eventDate, eventTime, location, order, isActive } = body

    const image = await prisma.programImage.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        eventDate: eventDate !== undefined ? (eventDate ? new Date(eventDate) : null) : undefined,
        eventTime: eventTime !== undefined ? eventTime : undefined,
        location: location !== undefined ? location : undefined,
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedAt: new Date(),
      },
      include: {
        uploadedBy: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error updating program image:", error)
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
    if (
      !payload ||
      !payload.roles ||
      !Array.isArray(payload.roles) ||
      !payload.roles.some((role) => ["SUPERADMIN", "CONCURSO_ADMIN"].includes(role))
    ) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    await prisma.programImage.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Imagen eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting program image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
