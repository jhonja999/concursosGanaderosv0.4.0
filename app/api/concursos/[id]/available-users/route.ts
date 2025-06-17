import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.roles.includes("CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Get users from the same company who are not already assigned to this concurso
    const availableUsers = await prisma.user.findMany({
      where: {
        companyId: payload.companyId!,
        isActive: true,
        NOT: {
          id: payload.userId, // Exclude the current user
        },
        concursoRegistradores: {
          none: {
            concursoId: params.id,
          },
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        nombre: "asc",
      },
    })

    return NextResponse.json(availableUsers)
  } catch (error) {
    console.error("Error fetching available users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
