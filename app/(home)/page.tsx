import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, Star, Users, Trophy, BarChart3, Calendar, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import AnimalSlider from "@/components/AnimalSlider"
import { headers } from "next/headers" // Import headers for server-side cookie access
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/scrollbar"
import GanadoSlider from "@/components/ganado/GanadoSlider"

// Componente para manejar imágenes con error handling
function ImageWithFallback({
  src,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
  fallbackContent,
}: {
  src: string
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  fallbackContent?: React.ReactNode
}) {
  return (
    <div className="relative w-full h-full">
      <Image
        alt={alt}
        className={className}
        fill={fill}
        src={src || "/placeholder.svg"}
        sizes={sizes}
        priority={priority}
        style={{
          objectFit: "cover",
        }}
      />
      {fallbackContent && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 items-center justify-center hidden [&.fallback-visible]:flex">
          {fallbackContent}
        </div>
      )}
    </div>
  )
}

// Tipos simplificados según el schema real
type ContestWithCompany = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  fechaInicio: Date
  imagenPrincipal: string | null
  company: {
    nombre: string
  } | null
}

type GanadoSimple = {
  id: string
  nombre: string
  raza: string | null
  imagenUrl: string | null // Change from imagenPrincipal to match schema
}

export default async function HomePage() {
  // Obtener concursos (usando campos que existen)
  let concursos: ContestWithCompany[] = []
  try {
    const contestsData = await prisma.contest.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        fechaInicio: "desc",
      },
      take: 3,
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        fechaInicio: true,
        imagenPrincipal: true,
        company: {
          select: {
            nombre: true,
          },
        },
      },
    })
    concursos = contestsData
  } catch (error) {
    console.log("Error fetching contests:", error)
    concursos = []
  }

  // Obtener ganado (usando campos que existen)
  let ganado: GanadoSimple[] = []
  try {
    const ganadoData = await prisma.ganado.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      select: {
        id: true,
        nombre: true,
        raza: true,
        imagenUrl: true, // Use the correct field name that exists in your schema
      },
    })
    ganado = ganadoData
  } catch (error) {
    console.log("Error fetching ganado:", error)
    ganado = []
  }

  // Fetch user session for ClientNavbar
  let user = null
  try {
    const headersList = await headers()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/me`, {
      headers: {
        Cookie: headersList.get("cookie") || "", // Use headersList instead of headers()
      },
      cache: "no-store", // Ensure fresh data
    })

    if (response.ok) {
      user = await response.json()
    }
  } catch (error) {
    console.error("Error fetching user session:", error)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      {/* <HomeNavbar user={user} /> */}

      {/* Hero Section with Background Image and Slider */}
      <section className="w-full h-screen relative overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="Paisaje ganadero"
            className="object-cover w-full h-full"
            src="/landingImages/landscape.webp"
            fill
            priority
            loading="eager"
          />
        </div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10"></div>

        {/* Contenido Hero */}
        <div className="container mx-auto relative z-20 h-3/6 flex flex-col items-center justify-center text-center px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 md:mb-6 text-white leading-tight">
              Lo Mejor de Mi Tierra
            </h1>
            <p className="max-w-[600px] md:max-w-[800px] mx-auto text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 md:mb-12 leading-relaxed">
              La plataforma líder para concursos ganaderos. Reconocemos tu dedicación y pasión por tus animales.
            </p>
          </div>
        </div>

        {/* Componente Slider de Animales */}
        <AnimalSlider />
      </section>

      {/* Concursos Destacados */}
      <section className="w-full py-12 md:py-16 lg:py-24 bg-neutral-900 dark:bg-gray-950 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 mb-8 md:mb-12">
            <div className="space-y-2 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white">
                Concursos Destacados
              </h2>
              <p className="mx-auto text-gray-300 text-base md:text-lg lg:text-xl max-w-2xl">
                Descubre los próximos eventos y concursos ganaderos más importantes.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {concursos.length > 0 ? (
              concursos.map((concurso) => (
                <Link key={concurso.id} href={`/${concurso.slug}`} className="group">
                  <Card className="flex flex-col h-full rounded-xl border bg-card dark:bg-secondary text-card-foreground shadow transition-all duration-300 hover:shadow-lg hover:scale-105 group-hover:border-emerald-500/50">
                    {concurso.imagenPrincipal ? (
                      <div className="relative aspect-video overflow-hidden rounded-t-xl">
                        <ImageWithFallback
                          src={concurso.imagenPrincipal || "/placeholder.svg?height=200&width=400"}
                          alt={concurso.nombre}
                          className="transition-transform duration-300 group-hover:scale-110"
                          fill={true}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          fallbackContent={<Trophy className="h-16 w-16 text-white opacity-80" />}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-emerald-500 to-blue-600 rounded-t-xl flex items-center justify-center">
                        <Trophy className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                    <CardContent className="p-4 md:p-6 flex flex-col space-y-3 md:space-y-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                        <p className="text-sm text-muted-foreground">{formatDate(concurso.fechaInicio)}</p>
                      </div>
                      <div className="space-y-2 text-left">
                        <h3 className="text-lg md:text-xl font-bold line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {concurso.nombre}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground line-clamp-3">
                          {concurso.descripcion || "Sin descripción"}
                        </p>
                      </div>
                      <div className="mt-auto pt-2 md:pt-4 flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground truncate">
                          {concurso.company?.nombre || "Sin empresa"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay concursos destacados</h3>
                  <p className="text-gray-500">Próximamente tendremos nuevos concursos disponibles</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-8 md:mt-12">
            <Link href="/concursos">
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent transition-all duration-300 hover:scale-105"
              >
                Ver todos los concursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ganado Destacado */}
      <GanadoSlider ganado={ganado} />

      {/* Subscription Plans Section */}
      <section className="w-full py-12 md:py-16 lg:py-24 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Comienza con tu primera prueba gratuita
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Contáctanos por WhatsApp y organiza tu primer concurso sin costo. Luego elige las opciones que necesites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {/* Plan Prueba Gratuita */}
            <Card className="relative border-2 border-green-400 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                  Prueba Gratuita
                </Badge>
              </div>
              <CardHeader className="text-center pb-6 md:pb-8 pt-8">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Primer Concurso
                </CardTitle>
                <div className="mt-4">
                  <span className="text-3xl md:text-4xl font-bold text-green-600">GRATIS</span>
                </div>
                <CardDescription className="text-base md:text-lg mt-2 text-gray-600 dark:text-gray-300">
                  Prueba completa sin compromiso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-base md:text-lg px-4 py-2">
                    1 concurso activo
                  </Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Configuración completa</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Hasta 100 participantes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Reportes básicos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Soporte directo por WhatsApp</span>
                  </li>
                </ul>
                <div className="space-y-3 mt-6 md:mt-8">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 hover:scale-105">
                    📱 Contactar por WhatsApp
                  </Button>
                  <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                    ⚡ Aplican restricciones
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Premium */}
            <Card className="relative border-2 border-emerald-500 shadow-lg scale-105 bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-950/20 hover:shadow-xl transition-all duration-300 hover:scale-110">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                  <Star className="h-4 w-4 mr-1" />
                  Más Elegido
                </Badge>
              </div>
              <CardHeader className="text-center pb-6 md:pb-8 pt-8">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Premium
                </CardTitle>
                <div className="mt-4">
                  <span className="text-3xl md:text-4xl font-bold text-emerald-600">{formatCurrency(99)}</span>
                  <span className="text-gray-500 dark:text-gray-400">/mes</span>
                </div>
                <CardDescription className="text-base md:text-lg mt-2 text-gray-600 dark:text-gray-300">
                  Cuando necesitas más potencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge className="bg-emerald-600 text-white text-base md:text-lg px-4 py-2 shadow-lg">
                    Concursos ilimitados
                  </Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Participantes ilimitados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Analytics avanzados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Historicidad completa</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Base de datos propia</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Personalización avanzada</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Múltiples usuarios</span>
                  </li>
                </ul>
                <div className="space-y-3 mt-6 md:mt-8">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 transition-all duration-300 hover:scale-105 shadow-lg">
                    ⭐ Elegir Premium
                  </Button>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
                    🎯 Recomendado para empresas activas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Personalizado */}
            <Card className="relative border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white dark:bg-background">
              <CardHeader className="text-center pb-6 md:pb-8">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Personalizado
                </CardTitle>
                <div className="mt-4">
                  <span className="text-2xl md:text-3xl font-bold text-emerald-600">A medida</span>
                </div>
                <CardDescription className="text-base md:text-lg mt-2 text-gray-600 dark:text-gray-300">
                  Soluciones a tu medida
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-base md:text-lg px-4 py-2 shadow-lg">
                    Todo incluido
                  </Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Todo lo del plan Premium</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Integraciones personalizadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Manager dedicado</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Historicidad extendida</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Base de datos dedicada</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Soporte prioritario 24/7</span>
                  </li>
                </ul>
                <div className="space-y-3 mt-6 md:mt-8">
                  <Button className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-3 transition-all duration-300 hover:scale-105">
                    💼 Solicitar Cotización
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    📞 Demo personalizada • Propuesta en 48h
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proceso Simple */}
          <div className="mt-12 md:mt-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-6 md:p-8 max-w-5xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
              ¿Cómo funciona?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Contacta por WhatsApp</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Te ayudamos a configurar tu primer concurso completamente gratis
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Organiza tu concurso</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Experimenta todas las funcionalidades sin restricciones
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Elige tu plan</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Solo pagas cuando necesites más concursos o funciones avanzadas
                </p>
              </div>
            </div>
          </div>

          {/* Badge de Confianza */}
          <div className="mt-12 md:mt-16 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-white dark:bg-background rounded-full px-6 md:px-8 py-4 shadow-lg border border-emerald-100 dark:border-emerald-800 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 hover:scale-105">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm md:text-base">
                ✅ Registro en tiempo real
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm md:text-base">
                ✅ Soporte en español
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm md:text-base">
                ✅ Datos seguros en Perú
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-16 lg:py-24 bg-white dark:bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas específicamente para el sector ganadero
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-secondary">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Gestión de Equipos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Asigna roles específicos a tu equipo. Los registradores pueden inscribir participantes mientras tú
                  mantienes el control total.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-secondary">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Concursos Profesionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Crea y gestiona concursos con categorías personalizadas, reglamentos detallados y sistema de premios
                  integrado.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-secondary">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Analytics Avanzados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Obtén insights detallados sobre tus concursos, participantes y tendencias del sector ganadero.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-16 lg:py-24 bg-gradient-to-r from-emerald-600 to-green-500 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              ¿Listo para organizar tu primer concurso?
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-white/90 max-w-3xl mx-auto">
              Únete a cientos de empresas ganaderas que ya confían en nuestra plataforma para gestionar sus concursos
              profesionales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold px-6 md:px-8 py-3 md:py-4 transition-all duration-300 hover:scale-105"
                >
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/iniciar-sesion">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-emerald-600 px-6 md:px-8 py-3 md:py-4 bg-transparent transition-all duration-300 hover:scale-105"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <SiteFooter /> */}
    </div>
  )
}
