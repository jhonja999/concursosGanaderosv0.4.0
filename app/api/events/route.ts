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
    if (!payload || !payload.companyId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: {
        companyId: payload.companyId,
      },
      include: {
        concurso: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        fechaInicio: "desc",
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
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
    if (!payload || !payload.companyId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    // Generate slug from title
    const slug = data.titulo
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    // Ensure unique slug
    let uniqueSlug = slug
    let counter = 1
    while (await prisma.event.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        slug: uniqueSlug,
        companyId: payload.companyId,
        createdById: payload.userId,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
      },
      include: {
        concurso: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
