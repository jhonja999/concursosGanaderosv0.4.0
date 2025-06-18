import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token es requerido" }, { status: 400 })
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            email: true,
            nombre: true,
            apellido: true,
            isActive: true,
          },
        },
      },
    })

    if (!resetToken) {
      return NextResponse.json(
        {
          valid: false,
          error: "Token inválido",
        },
        { status: 400 },
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        {
          valid: false,
          error: "Este enlace ya ha sido utilizado",
        },
        { status: 400 },
      )
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        {
          valid: false,
          error: "El enlace ha expirado",
        },
        { status: 400 },
      )
    }

    if (!resetToken.user.isActive) {
      return NextResponse.json(
        {
          valid: false,
          error: "Cuenta inactiva",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: resetToken.user.email,
        nombre: resetToken.user.nombre,
        apellido: resetToken.user.apellido,
      },
    })
  } catch (error) {
    console.error("Error verificando token:", error)
    return NextResponse.json({ valid: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
