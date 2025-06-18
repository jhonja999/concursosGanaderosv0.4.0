import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/nodemailer"
import { rateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Obtener IP para rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Aplicar rate limiting (máximo 3 intentos por 15 minutos)
    const rateLimitResult = rateLimit(ip, 3, 15 * 60 * 1000)

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

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        isActive: true,
      },
    })

    // Por seguridad, siempre devolvemos el mismo mensaje
    const successMessage = "Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña."

    if (!user || !user.isActive) {
      // Simular tiempo de procesamiento para evitar timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ message: successMessage })
    }

    // Invalidar tokens existentes del usuario
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        used: true,
      },
    })

    // Generar nuevo token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Guardar token en base de datos
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // Crear URL de reset
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`

    // Enviar email
    const emailTemplate = emailTemplates.passwordReset(resetUrl, `${user.nombre} ${user.apellido}`)
    const emailResult = await sendEmail(user.email, emailTemplate)

    if (!emailResult.success) {
      console.error("Error enviando email:", emailResult.error)
      return NextResponse.json({ error: "Error enviando email. Intenta nuevamente." }, { status: 500 })
    }

    return NextResponse.json({
      message: successMessage,
      remaining: rateLimitResult.remaining,
    })
  } catch (error) {
    console.error("Error en forgot-password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
