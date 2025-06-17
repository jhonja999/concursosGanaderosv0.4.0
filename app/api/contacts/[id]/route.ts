import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.companyId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    // Verify contact belongs to user's company
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId,
      },
    })

    if (!existingContact) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 })
    }

    // If setting as primary, remove primary from other contacts
    if (data.isPrimary) {
      await prisma.contact.updateMany({
        where: {
          companyId: payload.companyId,
          isPrimary: true,
          NOT: {
            id: params.id,
          },
        },
        data: {
          isPrimary: false,
        },
      })
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error updating contact:", error)
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
    if (!payload || !payload.companyId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Verify contact belongs to user's company
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId,
      },
    })

    if (!existingContact) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 })
    }

    await prisma.contact.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Contacto eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
