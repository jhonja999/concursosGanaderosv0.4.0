import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    // Verificar que sea SUPERADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    if (!payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener todas las compañías con sus suscripciones y conteo de usuarios
    const companies = await prisma.company.findMany({
      include: {
        subscription: true,
        _count: {
          select: {
            users: true,
            contests: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ companies: companies || [] })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ companies: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que sea SUPERADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    if (!payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const {
      nombre,
      slug,
      email,
      telefono,
      direccion,
      descripcion,
      logo,
      website,
      ubicacion,
      tipoOrganizacion,
      isFeatured,
      isPublished,
    } = body

    // Validar campos requeridos
    if (!nombre || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Verificar que el email sea único usando findFirst
    const existingCompanyByEmail = await prisma.company.findFirst({
      where: { email },
    })

    if (existingCompanyByEmail) {
      return NextResponse.json({ error: "El email ya está en uso" }, { status: 400 })
    }

    // Generar slug único si no se proporciona
    let finalSlug =
      slug ||
      nombre
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

    // Verificar que el slug sea único usando findFirst
    const existingCompanyBySlug = await prisma.company.findFirst({
      where: { slug: finalSlug },
    })

    if (existingCompanyBySlug) {
      // Agregar timestamp para hacer único el slug
      finalSlug = `${finalSlug}-${Date.now()}`
    }

    // Crear la compañía
    const company = await prisma.company.create({
      data: {
        nombre,
        slug: finalSlug,
        email,
        telefono,
        direccion,
        descripcion,
        logo,
        website,
        ubicacion,
        tipoOrganizacion,
        isFeatured: isFeatured || false,
        isPublished: isPublished || false,
        isActive: true,
      },
      include: {
        subscription: true,
        _count: {
          select: {
            users: true,
            contests: true,
          },
        },
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
