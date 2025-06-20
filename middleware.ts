import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware running for:", pathname)

  // Rutas protegidas
  const protectedRoutes = ["/dashboard", "/admin"]
  const adminRoutes = ["/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

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

  let payload
  try {
    payload = await verifyToken(token)
    console.log("Token payload:", payload)
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
  }

  if (!payload) {
    console.log("Invalid token, redirecting to login")
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
  }

  // Verificar acceso a rutas de admin
  if (isAdminRoute && !payload.roles.includes("SUPERADMIN")) {
    console.log("Access denied for non-admin user")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Verificar suscripción (excepto para SUPERADMIN)
  if (payload.roles.includes("SUPERADMIN")) {
    console.log("SUPERADMIN access granted")
  } else if (payload.subscriptionStatus !== "ACTIVO") {
    console.log("Inactive subscription, redirecting to expired page")
    return NextResponse.redirect(new URL("/suscripcion-expirada", request.url))
  }

  // Verificar fecha de expiración
  if (payload.expiresAt && new Date(payload.expiresAt) < new Date()) {
    console.log("Subscription expired, redirecting to expired page")
    return NextResponse.redirect(new URL("/suscripcion-expirada", request.url))
  }

  // Agregar headers con información del usuario
  const response = NextResponse.next()
  response.headers.set("x-user-id", payload.userId)
  response.headers.set("x-user-roles", payload.roles.join(","))

  console.log("Access granted")
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
