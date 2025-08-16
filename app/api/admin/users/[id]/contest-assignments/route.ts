import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

// GET - Fetch user's contest assignments and available contests
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || (!payload.roles.includes("SUPERADMIN") && !payload.roles.includes("CONCURSO_ADMIN"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { company: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario actual no encontrado" }, { status: 404 })
    }

    // Verify user exists and is a REGISTRADOR
    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      include: { company: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (user.role !== "REGISTRADOR") {
      return NextResponse.json({ error: "Solo se pueden asignar concursos a registradores" }, { status: 400 })
    }

    if (currentUser.role === "CONCURSO_ADMIN") {
      if (!currentUser.companyId || !user.companyId || currentUser.companyId !== user.companyId) {
        return NextResponse.json({ error: "Solo puedes asignar concursos a usuarios de tu compañía" }, { status: 403 })
      }
    }

    // Get current assignments
    const assignments = await prisma.userContestAssignment.findMany({
      where: {
        userId: resolvedParams.id,
        isActive: true,
      },
      include: {
        contest: {
          include: {
            company: true,
          },
        },
      },
    })

    const contestFilter: any = {
      isActive: true,
      status: {
        in: ["PUBLICADO", "INSCRIPCIONES_ABIERTAS", "INSCRIPCIONES_CERRADAS", "EN_CURSO", "FINALIZADO"],
      },
    }

    // If CONCURSO_ADMIN, only show contests from their company
    if (currentUser.role === "CONCURSO_ADMIN" && currentUser.companyId) {
      contestFilter.companyId = currentUser.companyId
    }

    // Get all available contests including finished ones
    const contests = await prisma.contest.findMany({
      where: contestFilter,
      include: {
        company: true,
        _count: {
          select: {
            ganadoParticipante: true,
          },
        },
      },
      orderBy: {
        fechaInicio: "desc",
      },
    })

    // Mark which contests are assigned
    const contestsWithAssignments = contests.map((contest) => ({
      id: contest.id,
      nombre: contest.nombre,
      slug: contest.slug,
      descripcion: contest.descripcion,
      fechaInicio: contest.fechaInicio.toISOString(),
      fechaFin: contest.fechaFin?.toISOString(),
      ubicacion: contest.ubicacion,
      status: contest.status,
      participantCount: contest._count.ganadoParticipante,
      company: {
        id: contest.company.id,
        nombre: contest.company.nombre,
      },
      isAssigned: assignments.some((a) => a.contestId === contest.id),
    }))

    return NextResponse.json({
      contests: contestsWithAssignments,
      assignments: assignments.map((a) => ({
        contestId: a.contestId,
        isActive: a.isActive,
        assignedAt: a.assignedAt.toISOString(),
        notes: a.notes,
      })),
    })
  } catch (error) {
    console.error("Error fetching contest assignments:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Update user's contest assignments
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || (!payload.roles.includes("SUPERADMIN") && !payload.roles.includes("CONCURSO_ADMIN"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { company: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario actual no encontrado" }, { status: 404 })
    }

    const { assignments } = await request.json()

    // Verify user exists and is a REGISTRADOR
    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (user.role !== "REGISTRADOR") {
      return NextResponse.json({ error: "Solo se pueden asignar concursos a registradores" }, { status: 400 })
    }

    if (currentUser.role === "CONCURSO_ADMIN") {
      if (!currentUser.companyId || !user.companyId || currentUser.companyId !== user.companyId) {
        return NextResponse.json({ error: "Solo puedes asignar concursos a usuarios de tu compañía" }, { status: 403 })
      }

      // Verify all contests being assigned belong to the current user's company
      if (assignments && assignments.length > 0) {
        const contestIds = assignments.map((a: any) => a.contestId)
        const contestsToAssign = await prisma.contest.findMany({
          where: {
            id: { in: contestIds },
            companyId: currentUser.companyId,
          },
        })

        if (contestsToAssign.length !== contestIds.length) {
          return NextResponse.json({ error: "Solo puedes asignar concursos de tu compañía" }, { status: 403 })
        }
      }
    }

    // Use transaction to update assignments
    await prisma.$transaction(async (tx) => {
      // First, deactivate all current assignments
      await tx.userContestAssignment.updateMany({
        where: {
          userId: resolvedParams.id,
          isActive: true,
        },
        data: { isActive: false },
      })

      // Then create new assignments
      if (assignments && assignments.length > 0) {
        const assignmentData = assignments.map((assignment: any) => ({
          userId: resolvedParams.id,
          contestId: assignment.contestId,
          isActive: assignment.isActive ?? true,
          notes: assignment.notes || null,
          assignedBy: payload.userId,
        }))

        await tx.userContestAssignment.createMany({
          data: assignmentData,
          skipDuplicates: true,
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating contest assignments:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
