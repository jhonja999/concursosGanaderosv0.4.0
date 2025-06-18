import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          include: {
            subscription: true,
          },
        },
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Create JWT token
    const token = signToken({
      userId: user.id,
      companyId: user.companyId,
      roles: [user.role],
      subscriptionStatus: user.company?.subscription?.status || null,
      expiresAt: user.company?.subscription?.fechaExpiracion?.toISOString() || null,
    })

    // Set cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        company: user.company,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Error in login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
