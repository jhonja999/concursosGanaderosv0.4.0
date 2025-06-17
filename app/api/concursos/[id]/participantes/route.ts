import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const participantes = await prisma.participante.findMany({
      where: {
        concursoId: params.id,
      },
      include: {
        categoria: true,
        ganado: {
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
          },
        },
        product: true,
        expositor: true,
        registrador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        numeroFicha: "asc",
      },
    })

    return NextResponse.json(participantes)
  } catch (error) {
    console.error("Error fetching participantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verificar que el concurso existe y el usuario tiene permisos
    const concurso = await prisma.concurso.findFirst({
      where: {
        id: params.id,
        OR: [
          { companyId: payload.companyId! },
          {
            concursoRegistradores: {
              some: {
                userId: payload.userId,
              },
            },
          },
        ],
      },
    })

    if (!concurso) {
      return NextResponse.json({ error: "Concurso no encontrado o sin permisos" }, { status: 404 })
    }

    // Verificar que el número de ficha no esté duplicado
    const existingParticipante = await prisma.participante.findUnique({
      where: {
        concursoId_numeroFicha: {
          concursoId: params.id,
          numeroFicha: data.numeroFicha,
        },
      },
    })

    if (existingParticipante) {
      return NextResponse.json({ error: "El número de ficha ya está en uso" }, { status: 400 })
    }

    const participante = await prisma.participante.create({
      data: {
        numeroFicha: data.numeroFicha,
        propietario: data.propietario,
        telefono: data.telefono,
        email: data.email,
        concursoId: params.id,
        categoriaId: data.categoriaId,
        ganadoId: data.ganadoId || null,
        productId: data.productId || null,
        expositorId: data.expositorId || null,
        observaciones: data.observaciones,
        registradoPor: payload.userId,
      },
      include: {
        categoria: true,
        ganado: {
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
          },
        },
        product: true,
        expositor: true,
        registrador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    return NextResponse.json(participante)
  } catch (error) {
    console.error("Error creating participante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
