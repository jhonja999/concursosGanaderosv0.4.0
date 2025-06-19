import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simular conteo de alertas
    // En una implementación real, esto consultaría la base de datos
    const alertCount = 5 // Ejemplo: suscripciones por vencer + solicitudes pendientes

    return NextResponse.json({ count: alertCount })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ count: 0 })
  }
}