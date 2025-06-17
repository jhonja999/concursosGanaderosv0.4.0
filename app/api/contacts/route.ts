import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.companyId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const contacts = await prisma.contact.findMany({
      where: {
        companyId: payload.companyId,
      },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.companyId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const data = await request.json()

    // If setting as primary, remove primary from other contacts
    if (data.isPrimary) {
      await prisma.contact.updateMany({
        where: {
          companyId: payload.companyId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      })
    }

    const contact = await prisma.contact.create({
      data: {
        ...data,
        companyId: payload.companyId,
        createdById: payload.userId,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
