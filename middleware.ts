import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Clone the request headers and set the pathname
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    "/",
    "/iniciar-sesion",
    "/registro",
    "/olvide-contrasena",
    "/reset-password",
    "/api/auth/iniciar-sesion",
    "/api/auth/registro",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-reset-token",
    "/api/ganado",
    "/api/concursos",
    "/ganado",
    "/concursos",
    "/ganadores",
    "/programacion",
    "/contacto",
    "/solicitar-compania",
  ]

  // Rutas de admin que requieren SUPERADMIN
  const adminPaths = ["/admin"]

  // Verificar si es una ruta pública
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Verificar si es una ruta de API pública de concursos
  if (pathname.match(/^\/api\/concursos\/[^/]+$/)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Verificar si es una ruta de slug de concurso o participantes
  // Permitir rutas como /fongal-2025, /fongal-2025/participantes
  if (
    pathname.match(/^\/[a-zA-Z0-9-]+$/) || // /slug
    pathname.match(/^\/[a-zA-Z0-9-]+\/participantes$/) // /slug/participantes
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Obtener token de las cookies
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    // Si no hay token y está intentando acceder a una ruta protegida
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Verificar token
  const decoded = await verifyToken(token)
  if (!decoded) {
    // Token inválido, redirigir a login
    const response = NextResponse.redirect(new URL("/iniciar-sesion", request.url))
    response.cookies.delete("auth-token")
    return response
  }

  // Verificar acceso a rutas de admin
  if (adminPaths.some((path) => pathname.startsWith(path))) {
    if (!decoded.roles.includes("SUPERADMIN")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Redirección para usuarios no SUPERADMIN
  if (!decoded.roles.includes("SUPERADMIN")) {
    // Si el usuario no tiene compañía asignada, redirigir a la página de solicitud de compañía
    if (!decoded.companyId) {
      if (!pathname.startsWith("/solicitar-compania")) {
        return NextResponse.redirect(new URL("/solicitar-compania", request.url))
      }
    } else {
      // Si el usuario tiene compañía pero la suscripción no está activa, redirigir a la página de suscripción
      if (decoded.subscriptionStatus !== "ACTIVO" && !pathname.startsWith("/dashboard/suscripcion")) {
        return NextResponse.redirect(new URL("/dashboard/suscripcion", request.url))
      }
      // Si tiene compañía y suscripción activa, y está en la página de solicitud, redirigir al dashboard
      if (pathname.startsWith("/solicitar-compania")) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
