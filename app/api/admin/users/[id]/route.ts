import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import { notifyUserUpdated, notifyUserDeleted } from "@/lib/notifications"
import { auditUserUpdate, auditUserDelete } from "@/lib/audit"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar que sea SUPERADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()

    // Obtener usuario actual para auditoría
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    // Obtener información del usuario que realiza la acción
    const actionUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (actionUser) {
      // Crear notificación
      await notifyUserUpdated(updatedUser, actionUser, body)

      // Crear log de auditoría
      await auditUserUpdate(currentUser, updatedUser, payload.userId, request)
    }

    return NextResponse.json({
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: updatedUser.lastLogin?.toISOString(),
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar que sea SUPERADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles) || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const userId = params.id

    // Obtener usuario antes de eliminar
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userToDelete) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir eliminar SUPERADMIN
    if (userToDelete.role === "SUPERADMIN" || userToDelete.isSuperAdmin) {
      return NextResponse.json({ error: "No se puede eliminar un SUPERADMIN" }, { status: 403 })
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id: userId },
    })

    // Obtener información del usuario que realiza la acción
    const actionUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (actionUser) {
      // Crear notificación
      await notifyUserDeleted(userToDelete, actionUser)

      // Crear log de auditoría
      await auditUserDelete(userToDelete, payload.userId, request)
    }

    return NextResponse.json({ message: "Usuario eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
