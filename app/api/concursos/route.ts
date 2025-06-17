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

    const concursos = await prisma.concurso.findMany({
      where: {
        companyId: payload.companyId,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(concursos)
  } catch (error) {
    console.error("Error fetching concursos:", error)
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
    if (!payload || !payload.companyId || !payload.roles.includes("CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const data = await request.json()

    // Verificar límite de concursos según suscripción
    const company = await prisma.company.findUnique({
      where: { id: payload.companyId },
      include: { subscription: true },
    })

    if (!company?.subscription) {
      return NextResponse.json({ error: "No hay suscripción activa" }, { status: 400 })
    }

    const concursosActuales = await prisma.concurso.count({
      where: { companyId: payload.companyId },
    })

    if (concursosActuales >= company.subscription.maxConcursos) {
      return NextResponse.json({ error: "Límite de concursos alcanzado" }, { status: 400 })
    }

    // Generar slug único
    const baseSlug = data.nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    let slug = baseSlug
    let counter = 1
    while (await prisma.concurso.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Crear concurso con categorías en una transacción
    const concurso = await prisma.$transaction(async (tx) => {
      const newConcurso = await tx.concurso.create({
        data: {
          nombre: data.nombre,
          slug,
          descripcion: data.descripcion,
          tipo: data.tipo,
          estado: "BORRADOR",
          fechaInicio: new Date(data.fechaInicio),
          fechaFin: new Date(data.fechaFin),
          fechaInscripcionInicio: data.fechaInscripcionInicio ? new Date(data.fechaInscripcionInicio) : null,
          fechaInscripcionFin: data.fechaInscripcionFin ? new Date(data.fechaInscripcionFin) : null,
          ubicacion: data.ubicacion,
          direccion: data.direccion,
          premios: data.premios,
          reglamento: data.reglamento,
          isPublished: data.isPublished,
          isFeatured: data.isFeatured,
          companyId: payload.companyId!,
          createdById: payload.userId,
        },
      })

      // Crear categorías
      if (data.categorias && data.categorias.length > 0) {
        await tx.concursoCategoria.createMany({
          data: data.categorias.map((categoria: any) => ({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            orden: categoria.orden,
            sexo: categoria.sexo,
            edadMinima: categoria.edadMinima,
            edadMaxima: categoria.edadMaxima,
            tipoProducto: categoria.tipoProducto,
            criterios: categoria.criterios,
            concursoId: newConcurso.id,
          })),
        })
      }

      // Actualizar contador de concursos usados
      await tx.subscription.update({
        where: { companyId: payload.companyId! },
        data: {
          concursosUsados: {
            increment: 1,
          },
        },
      })

      return newConcurso
    })

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("Error creating concurso:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
