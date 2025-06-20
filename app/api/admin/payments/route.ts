import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    // Verificar que sea SUPERADMIN
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || !payload.roles.includes("SUPERADMIN")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener historial de pagos (simulado por ahora)
    // En una implementación real, esto vendría de una tabla de pagos
    const payments = [
      {
        id: "1",
        subscriptionId: "sub1",
        amount: 99000,
        status: "COMPLETADO",
        date: new Date("2024-01-01").toISOString(),
        method: "Tarjeta de Crédito",
        transactionId: "TXN-001",
      },
      {
        id: "2",
        subscriptionId: "sub2",
        amount: 199000,
        status: "COMPLETADO",
        date: new Date("2024-01-10").toISOString(),
        method: "Tarjeta de Crédito",
        transactionId: "TXN-002",
      },
      {
        id: "3",
        subscriptionId: "sub3",
        amount: 49000,
        status: "FALLIDO",
        date: new Date("2024-01-15").toISOString(),
        method: "Transferencia",
        transactionId: "TXN-003",
      },
    ]

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
