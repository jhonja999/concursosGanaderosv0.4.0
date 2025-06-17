import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const expositores = await prisma.expositor.findMany({
      include: {
        _count: {
          select: {
            ganado: true,
            participantes: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    })

    return NextResponse.json(expositores)
  } catch (error) {
    console.error("Error fetching expositores:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    const expositor = await prisma.expositor.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        empresa: data.empresa,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion,
        documento: data.documento,
      },
    })

    return NextResponse.json(expositor)
  } catch (error) {
    console.error("Error creating expositor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
