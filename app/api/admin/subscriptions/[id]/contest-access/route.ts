import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar que sea SUPERADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { contestAccessEnabled } = body

    // Actualizar la suscripción
    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: { contestAccessEnabled },
      include: {
        company: {
          include: {
            users: true,
          },
        },
      },
    })

    // Si se deshabilita el acceso global, deshabilitar para todos los usuarios
    if (!contestAccessEnabled) {
      await prisma.user.updateMany({
        where: { companyId: subscription.companyId },
        data: { contestAccess: false },
      })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("Error updating contest access:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
