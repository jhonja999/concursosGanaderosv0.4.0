import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/audit"

// GET - Get company by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Check if user has admin privileges (SUPERADMIN or CONCURSO_ADMIN)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user || (user.role !== "SUPERADMIN" && user.role !== "CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
        contests: {
          // Add this block to include contests
          select: {
            id: true,
            nombre: true,
            status: true,
            fechaInicio: true,
          },
          orderBy: {
            fechaInicio: "desc",
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Compañía no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - Update company
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Check if user has admin privileges (SUPERADMIN or CONCURSO_ADMIN)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user || (user.role !== "SUPERADMIN" && user.role !== "CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
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

    // Validate required fields
    if (!nombre || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
    })

    if (!existingCompany) {
      return NextResponse.json({ error: "Compañía no encontrada" }, { status: 404 })
    }

    // Check if slug is unique (excluding current company)
    if (slug && slug !== existingCompany.slug) {
      const slugExists = await prisma.company.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      })

      if (slugExists) {
        return NextResponse.json({ error: "El slug ya está en uso" }, { status: 400 })
      }
    }

    // Check if email is unique (excluding current company)
    if (email !== existingCompany.email) {
      const emailExists = await prisma.company.findFirst({
        where: {
          email,
          id: { not: params.id },
        },
      })

      if (emailExists) {
        return NextResponse.json({ error: "El email ya está en uso" }, { status: 400 })
      }
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        nombre,
        slug: slug || existingCompany.slug,
        email,
        telefono,
        direccion,
        descripcion,
        logo,
        website,
        ubicacion,
        tipoOrganizacion,
        isFeatured: Boolean(isFeatured),
        isPublished: Boolean(isPublished),
      },
    })

    // Log activity
    await logActivity({
      userId: payload.userId,
      action: "UPDATE",
      entityType: "COMPANY",
      entityId: updatedCompany.id,
      details: `Compañía actualizada: ${updatedCompany.nombre}`,
    })

    return NextResponse.json({
      message: "Compañía actualizada exitosamente",
      company: updatedCompany,
    })
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Delete company
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Check if user has admin privileges (only SUPERADMIN can delete companies)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Solo los superadministradores pueden eliminar compañías" }, { status: 403 })
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Compañía no encontrada" }, { status: 404 })
    }

    // Check if company has associated users
    if (company._count.users > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la compañía porque tiene ${company._count.users} usuario(s) asociado(s)`,
        },
        { status: 400 },
      )
    }

    // Delete company
    await prisma.company.delete({
      where: { id: params.id },
    })

    // Log activity
    await logActivity({
      userId: payload.userId,
      action: "DELETE",
      entityType: "COMPANY",
      entityId: company.id,
      details: `Compañía eliminada: ${company.nombre}`,
    })

    return NextResponse.json({
      message: "Compañía eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
