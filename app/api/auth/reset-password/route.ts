import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimitResult = rateLimit(ip, 5, 15 * 60 * 1000)

    if (!rateLimitResult.success) {
      const remainingTime = Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          error: `Demasiados intentos. Intenta nuevamente en ${remainingTime} minutos.`,
          remainingTime,
        },
        { status: 429 },
      )
    }

    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            isActive: true,
          },
        },
      },
    })

    if (!resetToken) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    if (resetToken.used) {
      return NextResponse.json({ error: "Este enlace ya ha sido utilizado" }, { status: 400 })
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ error: "El enlace ha expirado" }, { status: 400 })
    }

    if (!resetToken.user.isActive) {
      return NextResponse.json({ error: "Cuenta inactiva" }, { status: 400 })
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Actualizar contraseña y marcar token como usado en una transacción
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Invalidar todos los otros tokens del usuario
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          used: false,
          id: { not: resetToken.id },
        },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente",
      remaining: rateLimitResult.remaining,
    })
  } catch (error) {
    console.error("Error en reset-password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
