import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Sesión cerrada exitosamente" })

    // Eliminar la cookie de autenticación
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expira inmediatamente
    })

    return response
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
