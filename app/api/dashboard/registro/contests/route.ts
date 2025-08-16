import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

// GET - Fetch assigned contests for registrador dashboard
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Only REGISTRADOR can access this endpoint
    if (!payload.roles.includes("REGISTRADOR")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Fetch assigned contests for the registrador
    const assignments = await prisma.userContestAssignment.findMany({
      where: {
        userId: payload.userId,
        isActive: true,
      },
      include: {
        contest: {
          include: {
            company: {
              select: {
                id: true,
                nombre: true,
              },
            },
            _count: {
              select: {
                ganadoParticipante: true,
                userAssignments: true,
              },
            },
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    })

    // Transform contests data
    const contestsData = assignments
      .filter((assignment) => assignment.contest.isActive)
      .map((assignment) => {
        const contest = assignment.contest
        const status = contest.status

        const canRegister = ["INSCRIPCIONES_ABIERTAS", "EN_CURSO"].includes(status)
        const canUpdate = ["INSCRIPCIONES_ABIERTAS", "EN_CURSO", "INSCRIPCIONES_CERRADAS", "FINALIZADO"].includes(
          status,
        )

        return {
          id: contest.id,
          nombre: contest.nombre,
          slug: contest.slug,
          descripcion: contest.descripcion,
          fechaInicio: contest.fechaInicio.toISOString(),
          fechaFin: contest.fechaFin?.toISOString(),
          ubicacion: contest.ubicacion,
          status: contest.status,
          participantCount: contest._count.ganadoParticipante,
          registrationCount: contest._count.userAssignments,
          isActive: contest.isActive,
          company: contest.company,
          assignedAt: assignment.assignedAt.toISOString(),
          canRegister,
          canUpdate,
        }
      })

    return NextResponse.json({ contests: contestsData })
  } catch (error) {
    console.error("Error fetching assigned contests:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
