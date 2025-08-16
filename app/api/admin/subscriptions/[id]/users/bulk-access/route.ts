import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar que sea SUPERADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token) // Await the token verification
    if (!payload || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { userIds, contestAccess } = body

    // Verificar que la suscripción tenga acceso habilitado
    const { id } = await params

    const subscription = await prisma.subscription.findUnique({
      where: { id },
    })

    // Add null check for subscription
    if (!subscription || (!subscription.contestAccessEnabled && contestAccess)) {
      return NextResponse.json(
        {
          error: "El acceso global debe estar habilitado primero",
        },
        { status: 400 },
      )
    }

    // Actualizar usuarios
    await prisma.user.updateMany({
      where: {
        id: { in: userIds },
        companyId: subscription.companyId,
        isActive: true,
      },
      data: { contestAccess },
    })

    return NextResponse.json({ message: "Acceso actualizado exitosamente" })
  } catch (error) {
    console.error("Error updating bulk user access:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
