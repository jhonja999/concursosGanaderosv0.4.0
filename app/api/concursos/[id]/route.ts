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

    const concurso = await prisma.concurso.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId!,
      },
      include: {
        categorias: {
          orderBy: {
            orden: "asc",
          },
        },
        company: true,
        createdBy: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        _count: {
          select: {
            participantes: true,
          },
        },
      },
    })

    if (!concurso) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("Error fetching concurso:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.roles.includes("CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const data = await request.json()

    // Verificar que el concurso pertenece a la empresa del usuario
    const existingConcurso = await prisma.concurso.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId!,
      },
    })

    if (!existingConcurso) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    const concurso = await prisma.concurso.update({
      where: { id: params.id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        estado: data.estado,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
        fechaInscripcionInicio: data.fechaInscripcionInicio ? new Date(data.fechaInscripcionInicio) : null,
        fechaInscripcionFin: data.fechaInscripcionFin ? new Date(data.fechaInscripcionFin) : null,
        ubicacion: data.ubicacion,
        direccion: data.direccion,
        premios: data.premios,
        reglamento: data.reglamento,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
      },
      include: {
        categorias: {
          orderBy: {
            orden: "asc",
          },
        },
        _count: {
          select: {
            participantes: true,
          },
        },
      },
    })

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("Error updating concurso:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.roles.includes("CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Verificar que el concurso pertenece a la empresa del usuario
    const existingConcurso = await prisma.concurso.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId!,
      },
    })

    if (!existingConcurso) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    // Eliminar en transacción para actualizar contador
    await prisma.$transaction(async (tx) => {
      await tx.concurso.delete({
        where: { id: params.id },
      })

      // Decrementar contador de concursos usados
      await tx.subscription.update({
        where: { companyId: payload.companyId! },
        data: {
          concursosUsados: {
            decrement: 1,
          },
        },
      })
    })

    return NextResponse.json({ message: "Concurso eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting concurso:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
