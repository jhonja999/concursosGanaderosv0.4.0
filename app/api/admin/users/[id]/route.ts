import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import { notifyUserUpdated, notifyUserDeleted } from "@/lib/notifications"
import { auditUserUpdate, auditUserDelete } from "@/lib/audit"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar que sea SUPERADMIN o CONCURSO_ADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles)) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const hasPermission = payload.roles.some((role) => ["SUPERADMIN", "CONCURSO_ADMIN"].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const userId = params.id

    // Obtener usuario con información de compañía
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Si no es SUPERADMIN, solo puede ver usuarios de su misma compañía
    if (!payload.roles.includes("SUPERADMIN")) {
      if (user.companyId !== payload.companyId) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
      }
    }

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar que sea SUPERADMIN o CONCURSO_ADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.roles || !Array.isArray(payload.roles)) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const hasPermission = payload.roles.some((role) => ["SUPERADMIN", "CONCURSO_ADMIN"].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()

    // Validar datos de entrada
    const { nombre, apellido, email, telefono, role, isActive, contestAccess, companyId } = body

    if (!nombre || !apellido || !email || !role) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Obtener usuario actual para validaciones
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Si no es SUPERADMIN, solo puede editar usuarios de su misma compañía
    if (!payload.roles.includes("SUPERADMIN")) {
      if (currentUser.companyId !== payload.companyId) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
      }

      // No puede cambiar roles a SUPERADMIN
      if (role === "SUPERADMIN") {
        return NextResponse.json({ error: "No puedes asignar rol de SUPERADMIN" }, { status: 403 })
      }
    }

    // No permitir editar SUPERADMIN si no eres SUPERADMIN
    if (currentUser.role === "SUPERADMIN" && !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "No puedes editar un SUPERADMIN" }, { status: 403 })
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ error: "Este email ya está en uso" }, { status: 409 })
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefono?.trim() || null,
      role,
      isActive: Boolean(isActive),
      contestAccess: Boolean(contestAccess),
    }

    // Solo SUPERADMIN puede cambiar compañía
    if (payload.roles.includes("SUPERADMIN")) {
      updateData.companyId = companyId || null
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    // No permitir auto-eliminación
    if (userToDelete.id === payload.userId) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 403 })
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
