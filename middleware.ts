import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas protegidas
  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Verificar token
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
  }

  // Verificar suscripción (excepto para SUPERADMIN)
  if (payload.roles.includes("SUPERADMIN")) {
    return NextResponse.next()
  }

  if (payload.subscriptionStatus !== "ACTIVO") {
    return NextResponse.redirect(new URL("/suscripcion-expirada", request.url))
  }

  // Verificar fecha de expiración
  if (payload.expiresAt && new Date(payload.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL("/suscripcion-expirada", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
