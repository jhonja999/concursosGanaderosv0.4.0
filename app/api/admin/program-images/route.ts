import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
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

    // Fetch program images with proper error handling
    const images = await prisma.programImage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        uploadedBy: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    return NextResponse.json({
      images: images || [],
      total: images.length,
    })
  } catch (error) {
    console.error("Error fetching program images:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        images: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { title, description, imageUrl, publicId, eventDate, eventTime, location, order } = body

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Título e imagen son obligatorios" }, { status: 400 })
    }

    // Get the next order if not provided
    let finalOrder = order
    if (finalOrder === undefined || finalOrder === null) {
      const lastImage = await prisma.programImage.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      })
      finalOrder = (lastImage?.order || 0) + 1
    }

    const image = await prisma.programImage.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        publicId: publicId || "",
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTime: eventTime || null,
        location: location || null,
        order: finalOrder,
        uploadedById: payload.userId,
        isActive: true,
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
    console.error("Error creating program image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
