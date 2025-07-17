import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function PUT(request: NextRequest) {
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
    const { imageIds } = body

    if (!Array.isArray(imageIds)) {
      return NextResponse.json({ error: "imageIds debe ser un array" }, { status: 400 })
    }

    // Update order for each image
    const updatePromises = imageIds.map((id: string, index: number) =>
      prisma.programImage.update({
        where: { id },
        data: { order: index + 1 },
      }),
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ message: "Orden actualizado exitosamente" })
  } catch (error) {
    console.error("Error reordering images:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
