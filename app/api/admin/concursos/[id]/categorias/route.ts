import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt" // Assuming you have a token verification utility

// GET all categories for a contest
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const contestId = context.params.id
  if (!contestId) {
    return NextResponse.json({ message: "ID del concurso no proporcionado" }, { status: 400 })
  }

  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    // Add role check if necessary: const { roles } = await verifyToken(token); if (!roles.includes('SUPERADMIN') && !roles.includes('CONCURSO_ADMIN')) ...

    const categories = await prisma.contestCategory.findMany({
      where: { contestId: contestId },
      orderBy: { orden: "asc" },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { message: "Error al obtener las categorías", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST a new category for a contest
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const contestId = context.params.id
  if (!contestId) {
    return NextResponse.json({ message: "ID del concurso no proporcionado" }, { status: 400 })
  }

  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      nombre,
      descripcion,
      orden,
      criteriosEdadMinMeses,
      criteriosEdadMaxMeses,
      criteriosPesoMinKg,
      criteriosPesoMaxKg,
      criteriosSexo,
    } = body

    if (!nombre) {
      return NextResponse.json({ message: "El nombre de la categoría es requerido" }, { status: 400 })
    }

    const newCategory = await prisma.contestCategory.create({
      data: {
        nombre,
        descripcion,
        orden: orden ? Number.parseInt(orden, 10) : 0,
        criteriosEdadMinMeses: criteriosEdadMinMeses ? Number.parseInt(criteriosEdadMinMeses, 10) : null,
        criteriosEdadMaxMeses: criteriosEdadMaxMeses ? Number.parseInt(criteriosEdadMaxMeses, 10) : null,
        criteriosPesoMinKg: criteriosPesoMinKg ? Number.parseFloat(criteriosPesoMinKg) : null,
        criteriosPesoMaxKg: criteriosPesoMaxKg ? Number.parseFloat(criteriosPesoMaxKg) : null,
        criteriosSexo: criteriosSexo || null,
        contest: {
          connect: { id: contestId },
        },
      },
    })
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { message: "Error al crear la categoría", error: (error as Error).message },
      { status: 500 },
    )
  }
}
