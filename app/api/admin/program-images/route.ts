import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import { FetchOptimizer } from "@/lib/fetch-optimization"

export async function GET(request: NextRequest) {
  try {
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

    // Use optimized query with proper indexing
    const images = await prisma.programImage.findMany({
      orderBy: { order: "asc" },
      include: {
        uploadedBy: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    // Set cache headers for better performance
    const response = NextResponse.json({ images })
    response.headers.set("Cache-Control", "private, max-age=300") // 5 minutes cache

    return response
  } catch (error) {
    console.error("Error fetching program images:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { title, description, imageUrl, publicId, eventDate, eventTime, location, order } = body

    if (!title || !imageUrl || !publicId) {
      return NextResponse.json({ error: "Título, imagen y publicId son obligatorios" }, { status: 400 })
    }

    // Get the next order if not provided - optimized query
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
        description,
        imageUrl,
        publicId,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTime,
        location,
        order: finalOrder,
        uploadedById: payload.userId,
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

    // Clear related caches
    FetchOptimizer.clearCache("/api/admin/program-images")
    FetchOptimizer.clearCache("/api/program-images")

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error creating program image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
