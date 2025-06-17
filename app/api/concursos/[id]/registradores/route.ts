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

    // Get registradores for the concurso
    const registradores = await prisma.concursoRegistrador.findMany({
      where: {
        concursoId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(registradores)
  } catch (error) {
    console.error("Error fetching registradores:", error)
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
    if (!payload || !payload.roles.includes("CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { userId } = await request.json()

    // Verify the concurso belongs to the user's company
    const concurso = await prisma.concurso.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId!,
      },
    })

    if (!concurso) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    // Verify the user belongs to the same company
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: payload.companyId!,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Check if already assigned
    const existing = await prisma.concursoRegistrador.findUnique({
      where: {
        concursoId_userId: {
          concursoId: params.id,
          userId: userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Usuario ya asignado como registrador" }, { status: 400 })
    }

    // Create the assignment
    const registrador = await prisma.concursoRegistrador.create({
      data: {
        concursoId: params.id,
        userId: userId,
        asignedBy: payload.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            role: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json(registrador)
  } catch (error) {
    console.error("Error assigning registrador:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
