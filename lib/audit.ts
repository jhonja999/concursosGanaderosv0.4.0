import { prisma } from "@/lib/prisma"

interface CreateAuditLogParams {
  action: string
  entityType: string
  entityId: string
  userId: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId,
        oldValues: params.oldValues,
        newValues: params.newValues,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })

    console.log(`Audit log created: ${params.action} ${params.entityType} ${params.entityId}`)
    return auditLog
  } catch (error) {
    console.error("Error creating audit log:", error)
    throw error
  }
}

// Funciones específicas para diferentes acciones

export async function auditUserCreate(user: any, createdBy: string, request?: Request) {
  return createAuditLog({
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    userId: createdBy,
    newValues: {
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    ipAddress: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || undefined,
    userAgent: request?.headers.get("user-agent") || undefined,
  })
}

export async function auditUserUpdate(oldUser: any, newUser: any, updatedBy: string, request?: Request) {
  return createAuditLog({
    action: "UPDATE",
    entityType: "User",
    entityId: newUser.id,
    userId: updatedBy,
    oldValues: {
      nombre: oldUser.nombre,
      apellido: oldUser.apellido,
      email: oldUser.email,
      role: oldUser.role,
      isActive: oldUser.isActive,
      companyId: oldUser.companyId,
    },
    newValues: {
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      companyId: newUser.companyId,
    },
    ipAddress: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || undefined,
    userAgent: request?.headers.get("user-agent") || undefined,
  })
}

export async function auditUserDelete(user: any, deletedBy: string, request?: Request) {
  return createAuditLog({
    action: "DELETE",
    entityType: "User",
    entityId: user.id,
    userId: deletedBy,
    oldValues: {
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    ipAddress: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || undefined,
    userAgent: request?.headers.get("user-agent") || undefined,
  })
}

export async function auditCompanyCreate(company: any, createdBy: string, request?: Request) {
  return createAuditLog({
    action: "CREATE",
    entityType: "Company",
    entityId: company.id,
    userId: createdBy,
    newValues: {
      nombre: company.nombre,
      email: company.email,
      slug: company.slug,
      tipoOrganizacion: company.tipoOrganizacion,
    },
    ipAddress: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || undefined,
    userAgent: request?.headers.get("user-agent") || undefined,
  })
}

export async function auditSubscriptionCreate(subscription: any, createdBy: string, request?: Request) {
  return createAuditLog({
    action: "CREATE",
    entityType: "Subscription",
    entityId: subscription.id,
    userId: createdBy,
    newValues: {
      companyId: subscription.companyId,
      plan: subscription.plan,
      status: subscription.status,
      precio: subscription.precio.toString(),
      fechaExpiracion: subscription.fechaExpiracion.toISOString(),
    },
    ipAddress: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || undefined,
    userAgent: request?.headers.get("user-agent") || undefined,
  })
}
