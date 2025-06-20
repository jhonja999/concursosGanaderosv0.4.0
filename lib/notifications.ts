import { prisma } from "@/lib/prisma"
import type { NotificationType, User, Company, Subscription } from "@prisma/client"

interface CreateNotificationParams {
  type: NotificationType
  title: string
  message: string
  userId?: string // null para notificaciones globales
  entityType?: string
  entityId?: string
  metadata?: any
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        userId: params.userId,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata,
      },
    })

    console.log(`Notification created: ${params.type} - ${params.title}`)
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Funciones específicas para diferentes tipos de notificaciones

export async function notifyUserCreated(user: User, createdBy: User) {
  return createNotification({
    type: "USER_CREATED",
    title: "Nuevo usuario creado",
    message: `El usuario ${user.nombre} ${user.apellido} ha sido creado por ${createdBy.nombre} ${createdBy.apellido}`,
    entityType: "user",
    entityId: user.id,
    metadata: {
      userEmail: user.email,
      userRole: user.role,
      createdByEmail: createdBy.email,
    },
  })
}

export async function notifyUserUpdated(user: User, updatedBy: User, changes: any) {
  return createNotification({
    type: "USER_UPDATED",
    title: "Usuario actualizado",
    message: `El usuario ${user.nombre} ${user.apellido} ha sido actualizado por ${updatedBy.nombre} ${updatedBy.apellido}`,
    entityType: "user",
    entityId: user.id,
    metadata: {
      userEmail: user.email,
      changes,
      updatedByEmail: updatedBy.email,
    },
  })
}

export async function notifyUserDeleted(user: User, deletedBy: User) {
  return createNotification({
    type: "USER_DELETED",
    title: "Usuario eliminado",
    message: `El usuario ${user.nombre} ${user.apellido} ha sido eliminado por ${deletedBy.nombre} ${deletedBy.apellido}`,
    entityType: "user",
    entityId: user.id,
    metadata: {
      userEmail: user.email,
      userRole: user.role,
      deletedByEmail: deletedBy.email,
    },
  })
}

export async function notifyCompanyCreated(company: Company, createdBy: User) {
  return createNotification({
    type: "COMPANY_CREATED",
    title: "Nueva compañía creada",
    message: `La compañía ${company.nombre} ha sido creada por ${createdBy.nombre} ${createdBy.apellido}`,
    entityType: "company",
    entityId: company.id,
    metadata: {
      companyEmail: company.email,
      companySlug: company.slug,
      createdByEmail: createdBy.email,
    },
  })
}

export async function notifyCompanyUpdated(company: Company, updatedBy: User, changes: any) {
  return createNotification({
    type: "COMPANY_UPDATED",
    title: "Compañía actualizada",
    message: `La compañía ${company.nombre} ha sido actualizada por ${updatedBy.nombre} ${updatedBy.apellido}`,
    entityType: "company",
    entityId: company.id,
    metadata: {
      companyEmail: company.email,
      changes,
      updatedByEmail: updatedBy.email,
    },
  })
}

export async function notifySubscriptionCreated(subscription: Subscription, company: Company, createdBy: User) {
  return createNotification({
    type: "SUBSCRIPTION_CREATED",
    title: "Nueva suscripción creada",
    message: `Se ha creado una suscripción ${subscription.plan} para ${company.nombre}`,
    entityType: "subscription",
    entityId: subscription.id,
    metadata: {
      companyName: company.nombre,
      plan: subscription.plan,
      precio: subscription.precio.toString(),
      createdByEmail: createdBy.email,
    },
  })
}

export async function notifySubscriptionExpiring(subscription: Subscription, company: Company) {
  return createNotification({
    type: "SUBSCRIPTION_EXPIRED",
    title: "Suscripción próxima a expirar",
    message: `La suscripción de ${company.nombre} expira el ${subscription.fechaExpiracion.toLocaleDateString()}`,
    entityType: "subscription",
    entityId: subscription.id,
    metadata: {
      companyName: company.nombre,
      plan: subscription.plan,
      fechaExpiracion: subscription.fechaExpiracion.toISOString(),
    },
  })
}

// Función para obtener notificaciones de un usuario
export async function getUserNotifications(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: {
      OR: [
        { userId }, // Notificaciones específicas del usuario
        { userId: null }, // Notificaciones globales
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

// Función para marcar notificación como leída
export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  })
}

// Función para obtener conteo de notificaciones no leídas
export async function getUnreadNotificationsCount(userId: string) {
  return prisma.notification.count({
    where: {
      OR: [
        { userId }, // Notificaciones específicas del usuario
        { userId: null }, // Notificaciones globales
      ],
      status: "UNREAD",
    },
  })
}
