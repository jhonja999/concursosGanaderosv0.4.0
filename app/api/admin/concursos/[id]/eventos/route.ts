import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

// GET all events for a contest
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id // Correct way to access route parameters
  if (!id) {
    return NextResponse.json({ error: "ID del concurso no proporcionado" }, { status: 400 })
  }

  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.roles?.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const events = await prisma.event.findMany({
      where: { contestId: id },
      orderBy: { startDate: "asc" },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error(`Error fetching events for contest ${id}:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST a new event for a contest
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id // Correct way to access route parameters
  if (!id) {
    return NextResponse.json({ error: "ID del concurso no proporcionado" }, { status: 400 })
  }

  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.roles?.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, featuredImage, startDate, endDate } = body

    if (!title || !startDate) {
      return NextResponse.json({ error: "Título y fecha de inicio son obligatorios" }, { status: 400 })
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        featuredImage,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        contestId: id,
      },
    })

    return NextResponse.json({ event: newEvent }, { status: 201 })
  } catch (error) {
    console.error(`Error creating event for contest ${id}:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
