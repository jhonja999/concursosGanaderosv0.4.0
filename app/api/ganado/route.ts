import { NextRequest, NextResponse } from "next/server"
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const categoria = searchParams.get("categoria")
    const raza = searchParams.get("raza")
    const sexo = searchParams.get("sexo")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    // Filtrar por compañía si no es SUPERADMIN
    if (!payload.roles.includes("SUPERADMIN")) {
      where.companyId = payload.companyId
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { propietario: { contains: search, mode: "insensitive" } },
        { descripcion: { contains: search, mode: "insensitive" } },
        { establo: { contains: search, mode: "insensitive" } },
      ]
    }

    if (categoria) where.categoria = categoria
    if (raza) where.raza = raza
    if (sexo) where.sexo = sexo

    const [ganado, total] = await Promise.all([
      prisma.ganado.findMany({
        where,
        include: {
          criador: true,
          establoRel: true,
          company: {
            select: { nombre: true }
          },
          createdBy: {
            select: { nombre: true, apellido: true }
          }
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.ganado.count({ where }),
    ])

    return NextResponse.json({
      ganado,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
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

    // Validar campos requeridos
    if (!data.nombre || !data.categoria || !data.raza) {
      return NextResponse.json({ error: "Nombre, categoría y raza son requeridos" }, { status: 400 })
    }

    // Determinar companyId
    const companyId = payload.roles.includes("SUPERADMIN") ? data.companyId : payload.companyId
    if (!companyId) {
      return NextResponse.json({ error: "ID de compañía requerido" }, { status: 400 })
    }

    // Crear o encontrar criador si se proporciona
    let criadorId = null
    if (data.propietario) {
      const criador = await prisma.criador.upsert({
        where: {
          companyId_nombreCompleto: {
            companyId,
            nombreCompleto: data.propietario
          }
        },
        update: {},
        create: {
          nombre: data.propietario.split(' ')[0] || data.propietario,
          apellido: data.propietario.split(' ').slice(1).join(' ') || '',
          nombreCompleto: data.propietario,
          companyId,
        }
      })
      criadorId = criador.id
    }

    // Crear o encontrar establo si se proporciona
    let establoId = null
    if (data.establo) {
      const establo = await prisma.establo.upsert({
        where: {
          companyId_nombre: {
            companyId,
            nombre: data.establo
          }
        },
        update: {},
        create: {
          nombre: data.establo,
          companyId,
        }
      })
      establoId = establo.id
    }

    const ganado = await prisma.ganado.create({
      data: {
        nombre: data.nombre,
        fecha_nacimiento: data.fecha_nacimiento || null,
        dias_nacida: data.dias_nacida || null,
        categoria: data.categoria,
        establo: data.establo || null,
        en_remate: data.en_remate || false,
        propietario: data.propietario || null,
        descripcion: data.descripcion || null,
        raza: data.raza,
        peso: data.peso ? parseFloat(data.peso) : null,
        sexo: data.sexo || null,
        imagen_url: data.imagen_url || null,
        puntaje: data.puntaje ? parseFloat(data.puntaje) : null,
        companyId,
        criadorId,
        establoId,
        createdById: payload.userId,
      },
      include: {
        criador: true,
        establoRel: true,
        company: {
          select: { nombre: true }
        },
        createdBy: {
          select: { nombre: true, apellido: true }
        }
      }
    })

    return NextResponse.json(ganado, { status: 201 })
  } catch (error) {
    console.error("Error creating ganado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
