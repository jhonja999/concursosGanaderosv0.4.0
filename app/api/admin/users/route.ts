import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"
import { notifyUserCreated } from "@/lib/notifications"
import { auditUserCreate } from "@/lib/audit"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const companyId = searchParams.get("companyId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Construir filtros
    const where: any = {}

    // Si no es SUPERADMIN, solo puede ver usuarios de su compañía
    if (!payload.roles.includes("SUPERADMIN")) {
      where.companyId = payload.companyId
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { apellido: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role && role !== "all") {
      where.role = role
    }

    if (status && status !== "all") {
      where.isActive = status === "active"
    }

    if (companyId && companyId !== "all") {
      where.companyId = companyId
    }

    // Obtener usuarios con paginación
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Formatear fechas
    const formattedUsers = users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { nombre, apellido, email, telefono, password, role, isActive, contestAccess, companyId } = body

    // Validar datos requeridos
    if (!nombre || !apellido || !email || !password || !role) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Si no es SUPERADMIN, no puede crear SUPERADMIN
    if (!payload.roles.includes("SUPERADMIN") && role === "SUPERADMIN") {
      return NextResponse.json({ error: "No puedes crear usuarios SUPERADMIN" }, { status: 403 })
    }

    // Verificar que el email no esté en uso
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Este email ya está en uso" }, { status: 409 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Preparar datos del usuario
    const userData: any = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefono?.trim() || null,
      password: hashedPassword,
      role,
      isActive: Boolean(isActive),
      contestAccess: Boolean(contestAccess),
    }

    // Solo SUPERADMIN puede asignar compañía
    if (payload.roles.includes("SUPERADMIN")) {
      userData.companyId = companyId || null
    } else {
      // Si no es SUPERADMIN, asignar a su misma compañía
      userData.companyId = payload.companyId
    }

    // Crear usuario
    const newUser = await prisma.user.create({
      data: userData,
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    // Obtener información del usuario que crea
    const actionUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (actionUser) {
      // Crear notificación
      await notifyUserCreated(newUser, actionUser)

      // Crear log de auditoría
      await auditUserCreate(newUser, payload.userId, request)
    }

    // Remover contraseña de la respuesta
    const { password: _, ...userResponse } = newUser

    return NextResponse.json(
      {
        ...userResponse,
        createdAt: userResponse.createdAt.toISOString(),
        lastLogin: userResponse.lastLogin?.toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
