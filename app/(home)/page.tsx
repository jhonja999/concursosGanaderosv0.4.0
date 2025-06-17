import Link from "next/link"
import Image from "next/image"
import { MilkIcon as Cow, Calendar, Building, Tag, Check, Star, Users, Trophy, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { formatDate, formatCurrency } from "@/lib/utils"

export default async function HomePage() {
  // Obtener concursos destacados
  const concursos = await prisma.concurso.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    orderBy: {
      fechaInicio: "desc",
    },
    take: 3,
    include: {
      company: true,
      _count: {
        select: {
          participantes: true,
        },
      },
    },
  })

  // Obtener ganado destacado
  const ganado = await prisma.ganado.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
    include: {
      GanadoImage: {
        include: {
          image: true,
        },
        where: {
          principal: true,
        },
        take: 1,
      },
      expositor: true,
    },
  })

  // Estadísticas generales
  const stats = await prisma.$transaction([
    prisma.concurso.count({ where: { isPublished: true } }),
    prisma.participante.count(),
    prisma.company.count({ where: { isActive: true } }),
  ])

  const [totalConcursos, totalParticipantes, totalEmpresas] = stats

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Cow className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Lo Mejor de Mi Tierra</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/concursos" className="text-white hover:text-green-200 transition-colors">
                Concursos
              </Link>
              <Link href="/ganado" className="text-white hover:text-green-200 transition-colors">
                Ganado
              </Link>
              <Link href="/companias" className="text-white hover:text-green-200 transition-colors">
                Empresas
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/iniciar-sesion">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button className="bg-viridian hover:bg-viridian/90 text-white">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-viridian to-pastel-green">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10"></div>

        <div className="container mx-auto relative z-20 h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white font-facundo">
              Lo Mejor de Mi Tierra
            </h1>
            <p className="max-w-[800px] mx-auto text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 font-nunito">
              La plataforma líder para concursos ganaderos. Reconocemos tu dedicación y pasión por tus animales.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{totalConcursos}+</div>
                <div className="text-white/80 text-sm md:text-base">Concursos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{totalParticipantes}+</div>
                <div className="text-white/80 text-sm md:text-base">Participantes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{totalEmpresas}+</div>
                <div className="text-white/80 text-sm md:text-base">Empresas</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
              <Link href="/registro">
                <Button
                  size="lg"
                  className="bg-white text-viridian hover:bg-white/90 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/concursos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-viridian rounded-full py-4 px-8 text-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Explorar Concursos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-mint-cream to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-facundo text-charcoal">Planes de Suscripción</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-nunito">
              Elige el plan perfecto para tu empresa ganadera y comienza a organizar concursos profesionales
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Básico */}
            <Card className="relative border-2 hover:border-viridian/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-charcoal">Básico</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-viridian">{formatCurrency(199000)}</span>
                  <span className="text-muted-foreground">/año</span>
                </div>
                <CardDescription className="text-lg mt-2">Perfecto para empezar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    1 Concurso
                  </Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Gestión básica de concursos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Registro de participantes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Reportes básicos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Soporte por email</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-viridian hover:bg-viridian/90">Comenzar</Button>
              </CardContent>
            </Card>

            {/* Plan Profesional */}
            <Card className="relative border-2 border-viridian shadow-lg scale-105 bg-gradient-to-br from-white to-mint-cream">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-viridian text-white px-4 py-2 text-sm font-semibold">
                  <Star className="h-4 w-4 mr-1" />
                  Más Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-charcoal">Profesional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-viridian">{formatCurrency(399000)}</span>
                  <span className="text-muted-foreground">/año</span>
                </div>
                <CardDescription className="text-lg mt-2">Para empresas en crecimiento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge className="bg-viridian text-white text-lg px-4 py-2">3 Concursos</Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Todo lo del plan básico</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Analytics avanzados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Soporte prioritario</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Personalización avanzada</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Múltiples registradores</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-viridian hover:bg-viridian/90">Comenzar</Button>
              </CardContent>
            </Card>

            {/* Plan Empresarial */}
            <Card className="relative border-2 hover:border-viridian/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-charcoal">Empresarial</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-viridian">{formatCurrency(799000)}</span>
                  <span className="text-muted-foreground">/año</span>
                </div>
                <CardDescription className="text-lg mt-2">Para grandes organizaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge variant="outline" className="text-lg px-4 py-2 border-viridian text-viridian">
                    Concursos Ilimitados
                  </Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Todo lo del plan profesional</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Concursos ilimitados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>API personalizada</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Soporte 24/7</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-viridian" />
                    <span>Gestor de cuenta dedicado</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-viridian hover:bg-viridian/90">Contactar Ventas</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-facundo text-charcoal">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-nunito">
              Herramientas profesionales diseñadas específicamente para el sector ganadero
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-viridian/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-viridian" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Gestión de Equipos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Asigna roles específicos a tu equipo. Los registradores pueden inscribir participantes mientras tú
                  mantienes el control total.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-viridian/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-viridian" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Concursos Profesionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Crea y gestiona concursos con categorías personalizadas, reglamentos detallados y sistema de premios
                  integrado.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-viridian/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-viridian" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Analytics Avanzados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Obtén insights detallados sobre tus concursos, participantes y tendencias del sector ganadero.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Concursos Destacados */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-charcoal to-eerie-black text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-facundo">Concursos Destacados</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-nunito">
              Descubre los próximos eventos y concursos ganaderos más importantes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {concursos.map((concurso) => (
              <Link key={concurso.id} href={`/concursos/${concurso.slug}`}>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-pastel-green" />
                      <span className="text-sm text-white/80">{formatDate(concurso.fechaInicio)}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{concurso.nombre}</h3>
                    <p className="text-white/70 mb-4 line-clamp-2">{concurso.descripcion || "Sin descripción"}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-white/60" />
                        <span className="text-sm text-white/80">{concurso.company.nombre}</span>
                      </div>
                      <Badge variant="secondary" className="bg-pastel-green/20 text-pastel-green">
                        {concurso._count.participantes} participantes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/concursos">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-charcoal"
              >
                Ver Todos los Concursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ganado Destacado */}
      <section className="w-full py-16 md:py-24 bg-mint-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-facundo text-charcoal">Ganado Destacado</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-nunito">
              Conoce los ejemplares más destacados de nuestros concursos
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {ganado.map((animal) => (
              <Link key={animal.id} href={`/ganado/${animal.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="relative aspect-square bg-gradient-to-br from-viridian/10 to-pastel-green/10 flex items-center justify-center">
                    {animal.GanadoImage[0]?.image.url ? (
                      <Image
                        alt={animal.nombre}
                        className="object-cover"
                        fill
                        src={animal.GanadoImage[0].image.url || "/placeholder.svg"}
                      />
                    ) : (
                      <div className="text-center">
                        <Cow className="h-16 w-16 text-viridian/50 mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-charcoal">{animal.nombre}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{animal.categoria || "Sin categoría"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cow className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{animal.raza || "Raza no especificada"}</span>
                      </div>
                      {animal.expositor && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{animal.expositor.nombre}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/ganado">
              <Button
                variant="outline"
                size="lg"
                className="border-viridian text-viridian hover:bg-viridian hover:text-white"
              >
                Ver Todo el Ganado
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-r from-viridian to-pastel-green text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-facundo">
              ¿Listo para organizar tu primer concurso?
            </h2>
            <p className="text-xl mb-8 text-white/90 font-nunito">
              Únete a cientos de empresas ganaderas que ya confían en nuestra plataforma para gestionar sus concursos
              profesionales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button size="lg" className="bg-white text-viridian hover:bg-white/90 font-bold px-8 py-4">
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/iniciar-sesion">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 px-8 py-4">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Cow className="h-8 w-8 text-viridian" />
                <span className="text-xl font-bold">Lo Mejor de Mi Tierra</span>
              </div>
              <p className="text-white/70">La plataforma líder para concursos ganaderos en Colombia.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/concursos" className="hover:text-white">
                    Concursos
                  </Link>
                </li>
                <li>
                  <Link href="/ganado" className="hover:text-white">
                    Ganado
                  </Link>
                </li>
                <li>
                  <Link href="/companias" className="hover:text-white">
                    Empresas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/nosotros" className="hover:text-white">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Soporte</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/ayuda" className="hover:text-white">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" className="hover:text-white">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-white">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2024 Lo Mejor de Mi Tierra. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
