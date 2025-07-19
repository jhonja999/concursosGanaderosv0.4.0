import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("Middleware running for:", pathname)

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
    "/suscripcion-expirada",
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

  // NUEVA LÓGICA: Verificar si es una ruta de slug de concurso
  const contestSlugMatch = pathname.match(/^\/([a-zA-Z0-9-]+)(?:\/participantes)?$/)
  if (contestSlugMatch) {
    const slug = contestSlugMatch[1]
    console.log(`Checking if ${slug} is a valid contest slug`)
    
    try {
      // Verificar si existe un concurso con este slug
      const contest = await prisma.contest.findUnique({
        where: { 
          slug: slug,
          isActive: true,
          status: {
            in: ["PUBLICADO", "INSCRIPCIONES_ABIERTAS", "INSCRIPCIONES_CERRADAS", "EN_CURSO", "FINALIZADO"]
          }
        },
        select: { id: true, slug: true }
      })

      if (contest) {
        console.log(`Valid contest found for slug: ${slug}`)
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      } else {
        console.log(`No valid contest found for slug: ${slug}`)
        // No es un slug de concurso válido, continuar con el middleware normal
      }
    } catch (error) {
      console.error(`Error checking contest slug ${slug}:`, error)
      // En caso de error, continuar con el middleware normal
    }
  }

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminPaths.some((route) => pathname.startsWith(route))

  // Si no es una ruta protegida y no es un slug de concurso válido, devolver 404
  if (!isProtectedRoute) {
    console.log("Route not found - not protected and not a valid contest slug")
    return NextResponse.rewrite(new URL("/404", request.url))
  }

  // Obtener token de las cookies
  const token = request.cookies.get("auth-token")?.value
  console.log("Token found:", !!token)

  if (!token) {
    console.log("No token found, redirecting to login")
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url))
  }

  // Verificar token
  let payload
  try {
    payload = await verifyToken(token)
    console.log("Token payload:", payload)
  } catch (error) {
    console.error("Error verifying token:", error)
    const response = NextResponse.redirect(new URL("/iniciar-sesion", request.url))
    response.cookies.delete("auth-token")
    return response
  }

  if (!payload) {
    console.log("Invalid token, redirecting to login")
    const response = NextResponse.redirect(new URL("/iniciar-sesion", request.url))
    response.cookies.delete("auth-token")
    return response
  }

  // Verificar acceso a rutas de admin
  if (isAdminRoute && !payload.roles.includes("SUPERADMIN")) {
    console.log("Access denied for non-admin user")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirección para usuarios no SUPERADMIN
  if (!payload.roles.includes("SUPERADMIN")) {
    // Si el usuario no tiene compañía asignada, redirigir a la página de solicitud de compañía
    if (!payload.companyId) {
      if (!pathname.startsWith("/solicitar-compania")) {
        return NextResponse.redirect(new URL("/solicitar-compania", request.url))
      }
    } else {
      // Si el usuario tiene compañía pero la suscripción no está activa, redirigir a la página de suscripción
      if (payload.subscriptionStatus !== "ACTIVO" && !pathname.startsWith("/dashboard/suscripcion")) {
        return NextResponse.redirect(new URL("/dashboard/suscripcion", request.url))
      }
      // Si tiene compañía y suscripción activa, y está en la página de solicitud, redirigir al dashboard
      if (pathname.startsWith("/solicitar-compania")) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  // Agregar headers con información del usuario para rutas protegidas
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
  if (payload) {
    response.headers.set("x-user-id", payload.userId || "")
    response.headers.set("x-user-roles", payload.roles?.join(",") || "")
  }

  console.log("Access granted")
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}