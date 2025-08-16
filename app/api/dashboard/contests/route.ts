import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

// GET - Fetch contests for contest admin dashboard
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

    // Only CONCURSO_ADMIN can access this endpoint
    if (!payload.roles.includes("CONCURSO_ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { company: true },
    })

    if (!user?.company) {
      return NextResponse.json({ error: "Usuario no tiene compañía asignada" }, { status: 400 })
    }

    // Fetch contests for the user's company
    const contests = await prisma.contest.findMany({
      where: {
        companyId: user.company.id,
        isActive: true,
      },
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
      orderBy: {
        fechaInicio: "desc",
      },
    })

    // Transform contests data
    const contestsData = contests.map((contest) => ({
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
      isFeatured: contest.isFeatured,
      isActive: contest.isActive,
      company: contest.company,
      createdAt: contest.createdAt.toISOString(),
    }))

    return NextResponse.json({ contests: contestsData || [] })
  } catch (error) {
    console.error("Error fetching contests:", error)
    return NextResponse.json({ contests: [] }, { status: 500 })
  }
}
