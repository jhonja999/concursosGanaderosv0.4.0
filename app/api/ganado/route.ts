import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get("public") === "true"

    if (isPublic) {
      // Endpoint público para mostrar ganado destacado
      const ganado = await prisma.ganado.findMany({
        where: {
          isPublished: true,
        },
        include: {
          GanadoImage: {
            include: {
              image: true,
            },
            where: {
              principal: true,
            },
            take: 1,
          },
          expositor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              empresa: true,
            },
          },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 20,
      })

      return NextResponse.json(ganado)
    }

    // Endpoint privado para dashboard
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const ganado = await prisma.ganado.findMany({
      include: {
        GanadoImage: {
          include: {
            image: true,
          },
          where: {
            principal: true,
          },
          take: 1,
        },
        expositor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            empresa: true,
          },
        },
        _count: {
          select: {
            participantes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("Error fetching ganado:", error)
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

    // Generar slug único
    const baseSlug = data.nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    let slug = baseSlug
    let counter = 1
    while (await prisma.ganado.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const ganado = await prisma.ganado.create({
      data: {
        nombre: data.nombre,
        slug,
        fechaNac: data.fechaNac ? new Date(data.fechaNac) : null,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        establo: data.establo,
        remate: data.remate,
        descripcion: data.descripcion,
        raza: data.raza,
        sexo: data.sexo,
        numRegistro: data.numRegistro,
        peso: data.peso ? Number.parseFloat(data.peso) : null,
        expositorId: data.expositorId,
        isFeatured: data.isFeatured || false,
        isPublished: data.isPublished || false,
      },
      include: {
        expositor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            empresa: true,
          },
        },
      },
    })

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("Error creating ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
