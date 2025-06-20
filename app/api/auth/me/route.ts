import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token) // Added await here
    if (!payload || !payload.userId) {
      // Added check for payload.userId
      return NextResponse.json({ error: "Token inválido o usuario no encontrado en el token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        company: {
          include: {
            subscription: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      isActive: user.isActive,
      company: user.company,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
