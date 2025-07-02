import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contestId = searchParams.get("contestId")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    // Si hay un contestId, obtener la compañía del concurso
    if (contestId) {
      const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        select: { companyId: true },
      })

      if (contest) {
        where.companyId = contest.companyId
      }
    } else if (!payload.roles?.includes("SUPERADMIN")) {
      // Si no es superadmin, solo mostrar establos de su compañía
      where.companyId = (payload as any).companyId
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { ubicacion: { contains: search, mode: "insensitive" } },
        { propietario: { contains: search, mode: "insensitive" } },
      ]
    }

    const [establos, total] = await Promise.all([
      prisma.establo.findMany({
        where,
        include: {
          company: {
            select: { nombre: true },
          },
          _count: {
            select: { ganado: true },
          },
        },
        orderBy: { nombre: "asc" },
        skip,
        take: limit,
      }),
      prisma.establo.count({ where }),
    ])

    return NextResponse.json({
      establos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching establos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()
    const {
      nombre,
      descripcion,
      ubicacion,
      direccion,
      telefono,
      email,
      propietario,
      capacidad,
      tipoGanado,
      certificaciones,
      companyId,
    } = data

    // Validar campos requeridos
    if (!nombre) {
      return NextResponse.json({ error: "El nombre del establo es requerido" }, { status: 400 })
    }

    // Determinar companyId
    let finalCompanyId = companyId
    if (!payload.roles?.includes("SUPERADMIN")) {
      finalCompanyId = (payload as any).companyId
    }

    if (!finalCompanyId) {
      return NextResponse.json({ error: "ID de compañía requerido" }, { status: 400 })
    }

    // Verificar que la compañía existe
    const company = await prisma.company.findUnique({
      where: { id: finalCompanyId },
    })

    if (!company) {
      return NextResponse.json({ error: "Compañía no encontrada" }, { status: 404 })
    }

    // Verificar que no existe un establo con el mismo nombre en la compañía
    const existingEstablo = await prisma.establo.findFirst({
      where: {
        companyId: finalCompanyId,
        nombre: nombre,
      },
    })

    if (existingEstablo) {
      return NextResponse.json({ error: "Ya existe un establo con este nombre en la compañía" }, { status: 400 })
    }

    // Crear establo
    const establo = await prisma.establo.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        ubicacion: ubicacion || null,
        direccion: direccion || null,
        telefono: telefono || null,
        email: email || null,
        propietario: propietario || null,
        capacidad: capacidad ? Number.parseInt(capacidad) : null,
        tipoGanado: tipoGanado || [],
        certificaciones: certificaciones || [],
        companyId: finalCompanyId,
      },
      include: {
        company: {
          select: { nombre: true },
        },
        _count: {
          select: { ganado: true },
        },
      },
    })

    return NextResponse.json(establo, { status: 201 })
  } catch (error) {
    console.error("Error creating establo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
