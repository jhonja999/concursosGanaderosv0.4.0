import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const images = await prisma.programImage.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        order: true,
        eventDate: true,
        eventTime: true,
        location: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error fetching program images:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
