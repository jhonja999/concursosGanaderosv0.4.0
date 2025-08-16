import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/jwt"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Accept token from Authorization header (Bearer) OR from auth-token cookie
    const tokenHeader = request.headers.get("authorization")?.replace("Bearer ", "")
    const tokenCookie = request.cookies.get("auth-token")?.value
    const token = tokenHeader || tokenCookie

    if (!token) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { imagenUrl } = await request.json()

    if (!imagenUrl) {
      return NextResponse.json({ error: "URL de imagen requerida" }, { status: 400 })
    }

    // Update the ganado image
    const updatedGanado = await prisma.ganado.update({
      where: { id },
      data: { imagenUrl },
    })

    return NextResponse.json({ success: true, ganado: updatedGanado })
  } catch (error) {
    console.error("Error updating ganado image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Accept token from Authorization header (Bearer) OR from auth-token cookie
    const tokenHeader = request.headers.get("authorization")?.replace("Bearer ", "")
    const tokenCookie = request.cookies.get("auth-token")?.value
    const token = tokenHeader || tokenCookie

    if (!token) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Set the imagenUrl to null
    const updatedGanado = await prisma.ganado.update({
      where: { id },
      data: { imagenUrl: null },
    })

    return NextResponse.json({ success: true, ganado: updatedGanado })
  } catch (error) {
    console.error("Error deleting ganado image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
