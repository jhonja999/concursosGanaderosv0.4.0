import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const image = await prisma.programImage.findUnique({
      where: { id: params.id },
      include: {
        uploadedBy: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error fetching program image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, imageUrl, publicId, eventDate, eventTime, location, isActive } = body

    // Check if image exists
    const existingImage = await prisma.programImage.findUnique({
      where: { id: params.id },
    })

    if (!existingImage) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (publicId !== undefined) updateData.publicId = publicId
    if (eventDate !== undefined) updateData.eventDate = eventDate ? new Date(eventDate) : null
    if (eventTime !== undefined) updateData.eventTime = eventTime
    if (location !== undefined) updateData.location = location
    if (isActive !== undefined) updateData.isActive = isActive

    const image = await prisma.programImage.update({
      where: { id: params.id },
      data: updateData,
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Check if image exists
    const existingImage = await prisma.programImage.findUnique({
      where: { id: params.id },
    })

    if (!existingImage) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    await prisma.programImage.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Imagen eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting program image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
