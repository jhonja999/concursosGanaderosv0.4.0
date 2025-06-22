import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

interface RouteContext {
  params: {
    id: string // contestId
    categoryId: string
  }
}

// GET a single category
export async function GET(request: NextRequest, context: RouteContext) {
  const categoryId = context.params.categoryId
  if (!categoryId) {
    return NextResponse.json({ message: "ID de categoría no proporcionado" }, { status: 400 })
  }

  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const category = await prisma.contestCategory.findUnique({
      where: { id: categoryId },
    })
    if (!category) {
      return NextResponse.json({ message: "Categoría no encontrada" }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { message: "Error al obtener la categoría", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// PUT update a category
export async function PUT(request: NextRequest, context: RouteContext) {
  const categoryId = context.params.categoryId
  const contestId = context.params.id

  if (!categoryId || !contestId) {
    return NextResponse.json({ message: "ID de categoría o concurso no proporcionado" }, { status: 400 })
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

    // Ensure the category belongs to the contest
    const existingCategory = await prisma.contestCategory.findFirst({
      where: { id: categoryId, contestId: contestId },
    })

    if (!existingCategory) {
      return NextResponse.json({ message: "Categoría no encontrada o no pertenece a este concurso." }, { status: 404 })
    }

    const updatedCategory = await prisma.contestCategory.update({
      where: { id: categoryId },
      data: {
        nombre,
        descripcion,
        orden: orden ? Number.parseInt(orden, 10) : existingCategory.orden,
        criteriosEdadMinMeses:
          criteriosEdadMinMeses !== undefined
            ? criteriosEdadMinMeses === ""
              ? null
              : Number.parseInt(criteriosEdadMinMeses, 10)
            : existingCategory.criteriosEdadMinMeses,
        criteriosEdadMaxMeses:
          criteriosEdadMaxMeses !== undefined
            ? criteriosEdadMaxMeses === ""
              ? null
              : Number.parseInt(criteriosEdadMaxMeses, 10)
            : existingCategory.criteriosEdadMaxMeses,
        criteriosPesoMinKg:
          criteriosPesoMinKg !== undefined
            ? criteriosPesoMinKg === ""
              ? null
              : Number.parseFloat(criteriosPesoMinKg)
            : existingCategory.criteriosPesoMinKg,
        criteriosPesoMaxKg:
          criteriosPesoMaxKg !== undefined
            ? criteriosPesoMaxKg === ""
              ? null
              : Number.parseFloat(criteriosPesoMaxKg)
            : existingCategory.criteriosPesoMaxKg,
        criteriosSexo:
          criteriosSexo !== undefined ? (criteriosSexo === "" ? null : criteriosSexo) : existingCategory.criteriosSexo,
      },
    })
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { message: "Error al actualizar la categoría", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// DELETE a category
export async function DELETE(request: NextRequest, context: RouteContext) {
  const categoryId = context.params.categoryId
  const contestId = context.params.id

  if (!categoryId || !contestId) {
    return NextResponse.json({ message: "ID de categoría o concurso no proporcionado" }, { status: 400 })
  }

  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Ensure the category belongs to the contest before deleting
    const existingCategory = await prisma.contestCategory.findFirst({
      where: { id: categoryId, contestId: contestId },
    })

    if (!existingCategory) {
      return NextResponse.json({ message: "Categoría no encontrada o no pertenece a este concurso." }, { status: 404 })
    }

    // Check if category has participants before deleting (optional, but good practice)
    // const participantsInCategory = await prisma.ganado.count({ where: { contestCategoryId: categoryId } });
    // if (participantsInCategory > 0) {
    //   return NextResponse.json({ message: "No se puede eliminar la categoría porque tiene participantes asociados." }, { status: 400 });
    // }

    await prisma.contestCategory.delete({
      where: { id: categoryId },
    })
    return NextResponse.json({ message: "Categoría eliminada exitosamente" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { message: "Error al eliminar la categoría", error: (error as Error).message },
      { status: 500 },
    )
  }
}
