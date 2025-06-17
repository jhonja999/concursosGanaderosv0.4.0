import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function DELETE(request: NextRequest, { params }: { params: { id: string; registradorId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.roles.includes("CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Verify the concurso belongs to the user's company
    const concurso = await prisma.concurso.findFirst({
      where: {
        id: params.id,
        companyId: payload.companyId!,
      },
    })

    if (!concurso) {
      return NextResponse.json({ error: "Concurso no encontrado" }, { status: 404 })
    }

    // Delete the registrador assignment
    await prisma.concursoRegistrador.delete({
      where: {
        id: params.registradorId,
        concursoId: params.id,
      },
    })

    return NextResponse.json({ message: "Registrador removido exitosamente" })
  } catch (error) {
    console.error("Error removing registrador:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
