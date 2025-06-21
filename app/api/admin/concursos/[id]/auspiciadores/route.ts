import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import type { Prisma } from "@prisma/client"

interface Auspiciador {
  id: string
  nombre: string
  imagen: string
  website?: string
}

// Helper function to safely convert JSON to Auspiciador array
function parseAuspiciadores(jsonData: Prisma.JsonValue): Auspiciador[] {
  if (!jsonData) return []
  if (!Array.isArray(jsonData)) return []

  return (jsonData as unknown as Auspiciador[]).filter(
    (item) => item && typeof item === "object" && "id" in item && "nombre" in item && "imagen" in item,
  )
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const contest = await prisma.contest.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        slug: true,
        auspiciadores: true,
      },
    })

    if (!contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    const auspiciadores = parseAuspiciadores(contest.auspiciadores)

    return NextResponse.json({
      contest,
      auspiciadores,
    })
  } catch (error) {
    console.error("Error fetching sponsors:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { nombre, imagen, website, id: auspiciadorId } = body

    if (!nombre || !imagen) {
      return NextResponse.json({ error: "Nombre e imagen son obligatorios" }, { status: 400 })
    }

    // Get current contest
    const contest = await prisma.contest.findUnique({
      where: { id },
      select: { auspiciadores: true },
    })

    if (!contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    const currentAuspiciadores = parseAuspiciadores(contest.auspiciadores)

    // Add new sponsor
    const newAuspiciador: Auspiciador = {
      id: auspiciadorId || crypto.randomUUID(),
      nombre: nombre.trim(),
      imagen,
      website: website?.trim() || undefined,
    }

    const updatedAuspiciadores = [...currentAuspiciadores, newAuspiciador]

    // Update contest
    const updatedContest = await prisma.contest.update({
      where: { id },
      data: {
        auspiciadores: updatedAuspiciadores as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      auspiciadores: parseAuspiciadores(updatedContest.auspiciadores),
      message: "Auspiciador agregado exitosamente",
    })
  } catch (error) {
    console.error("Error adding sponsor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { nombre, imagen, website, id: auspiciadorId } = body

    if (!nombre || !imagen || !auspiciadorId) {
      return NextResponse.json({ error: "Nombre, imagen e ID son obligatorios" }, { status: 400 })
    }

    // Get current contest
    const contest = await prisma.contest.findUnique({
      where: { id },
      select: { auspiciadores: true },
    })

    if (!contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    const currentAuspiciadores = parseAuspiciadores(contest.auspiciadores)

    // Find and update sponsor
    const updatedAuspiciadores = currentAuspiciadores.map((auspiciador) =>
      auspiciador.id === auspiciadorId
        ? {
            ...auspiciador,
            nombre: nombre.trim(),
            imagen,
            website: website?.trim() || undefined,
          }
        : auspiciador,
    )

    // Check if sponsor was found
    const sponsorExists = currentAuspiciadores.some((a) => a.id === auspiciadorId)
    if (!sponsorExists) {
      return NextResponse.json({ error: "Auspiciador no encontrado" }, { status: 404 })
    }

    // Update contest
    const updatedContest = await prisma.contest.update({
      where: { id },
      data: {
        auspiciadores: updatedAuspiciadores as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      auspiciadores: parseAuspiciadores(updatedContest.auspiciadores),
      message: "Auspiciador actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating sponsor:", error)
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
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { id: auspiciadorId } = body

    if (!auspiciadorId) {
      return NextResponse.json({ error: "ID del auspiciador es obligatorio" }, { status: 400 })
    }

    // Get current contest
    const contest = await prisma.contest.findUnique({
      where: { id },
      select: { auspiciadores: true },
    })

    if (!contest) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    const currentAuspiciadores = parseAuspiciadores(contest.auspiciadores)

    // Remove sponsor
    const updatedAuspiciadores = currentAuspiciadores.filter((auspiciador) => auspiciador.id !== auspiciadorId)

    // Check if sponsor was found
    if (updatedAuspiciadores.length === currentAuspiciadores.length) {
      return NextResponse.json({ error: "Auspiciador no encontrado" }, { status: 404 })
    }

    // Update contest
    const updatedContest = await prisma.contest.update({
      where: { id },
      data: {
        auspiciadores: updatedAuspiciadores as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      auspiciadores: parseAuspiciadores(updatedContest.auspiciadores),
      message: "Auspiciador eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting sponsor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
