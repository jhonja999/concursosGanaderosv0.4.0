import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

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

    const { searchParams } = new URL(request.url)
    const contestId = searchParams.get("contestId")

    const where: any = {}

    // If contestId is provided, filter by company of that contest
    if (contestId) {
      const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        select: { companyId: true },
      })

      if (contest) {
        where.companyId = contest.companyId
      }
    } else if (!(payload as any).roles?.includes("SUPERADMIN")) {
      // If not superadmin and no contestId, filter by user's company
      where.companyId = (payload as any).companyId
    }

    const establos = await prisma.establo.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        ubicacion: true,
        descripcion: true,
      },
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json({ establos })
  } catch (error) {
    console.error("Error fetching establos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()
    const { nombre, ubicacion, descripcion } = data

    if (!nombre) {
      return NextResponse.json({ error: "El nombre del establo es requerido" }, { status: 400 })
    }

    const companyId = (payload as any).companyId
    if (!companyId) {
      return NextResponse.json({ error: "No se pudo determinar la compañía" }, { status: 400 })
    }

    const establo = await prisma.establo.create({
      data: {
        nombre,
        ubicacion: ubicacion || null,
        descripcion: descripcion || null,
        companyId,
      },
    })

    return NextResponse.json(establo, { status: 201 })
  } catch (error) {
    console.error("Error creating establo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
