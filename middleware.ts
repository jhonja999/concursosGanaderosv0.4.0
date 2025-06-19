import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware running for:", pathname)

  // Rutas protegidas
  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!isProtectedRoute) {
    console.log("Route not protected, allowing access")
    return NextResponse.next()
  }

  // Verificar token
  const token = request.cookies.get("auth-token")?.value
  console.log("Token found:", !!token)

  if (!token) {
    console.log("No token found, redirecting to login")
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
  }

  const payload = await verifyToken(token)
  console.log("Token payload:", payload)

  if (!payload) {
    console.log("Invalid token, redirecting to login")
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
  }

  // Verificar suscripción (excepto para SUPERADMIN)
  if (payload.roles.includes("SUPERADMIN")) {
    console.log("SUPERADMIN access granted")
    return NextResponse.next()
  }

  if (payload.subscriptionStatus !== "ACTIVO") {
    console.log("Inactive subscription, redirecting to expired page")
    return NextResponse.redirect(new URL("/suscripcion-expirada", request.url))
  }

  // Verificar fecha de expiración
  if (payload.expiresAt && new Date(payload.expiresAt) < new Date()) {
    console.log("Subscription expired, redirecting to expired page")
    return NextResponse.redirect(new URL("/suscripcion-expirada", request.url))
  }

  console.log("Access granted")
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
