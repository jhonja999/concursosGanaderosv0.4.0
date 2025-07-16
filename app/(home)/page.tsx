import Link from "next/link";
import Image from "next/image";
import { Check, Star, Users, Trophy, BarChart3, MilkIcon as Cow, Calendar, Building, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { prisma } from "@/lib/prisma";
import AnimalSlider from "@/components/AnimalSlider";
import ClientNavbar from "@/components/shared/clientnavbar";

// Tipos simplificados según el schema real
type ContestWithCompany = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: Date;
  company: {
    nombre: string;
  } | null;
};

type GanadoSimple = {
  id: string;
  nombre: string;
  raza: string | null;
};

export default async function HomePage() {
  // Obtener concursos (usando campos que existen)
  let concursos: ContestWithCompany[] = [];
  try {
    const contestsData = await prisma.contest.findMany({
      where: {
        // Usar solo campos que existen en el schema
        isActive: true,
      },
      orderBy: {
        fechaInicio: "desc",
      },
      take: 3,
      include: {
        company: {
          select: {
            nombre: true,
          },
        },
      },
    });
    concursos = contestsData;
  } catch (error) {
    console.log("Error fetching contests:", error);
    concursos = [];
  }

  // Obtener ganado (usando campos que existen)
  let ganado: GanadoSimple[] = [];
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
      },
    });
    ganado = ganadoData;
  } catch (error) {
    console.log("Error fetching ganado:", error);
    ganado = [];
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
        <ClientNavbar/>

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
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white">
              Lo Mejor de Mi Tierra
            </h1>
            <p className="max-w-[800px] mx-auto text-xl md:text-2xl lg:text-3xl text-white/90 mb-12">
              La plataforma líder para concursos ganaderos. Reconocemos tu
              dedicación y pasión por tus animales.
            </p>
{/* 
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
              <Link href="/registro">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/concursos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 rounded-full py-4 px-8 text-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Explorar Concursos
                </Button>
              </Link>
            </div> */}
          </div>
        </div>

        {/* Componente Slider de Animales */}
        <AnimalSlider />
      </section>

      {/* Concursos Destacados */}
      <section className="w-full py-12 md:py-24 bg-neutral-900 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="space-y-2 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Concursos Destacados
              </h2>
              <p className="mx-auto text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Descubre los próximos eventos y concursos ganaderos más
                importantes.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {concursos.length > 0 ? (
              concursos.map((concurso) => (
                <Link key={concurso.id} href={`/concursos/${concurso.id}`}>
                  <div className="flex flex-col h-full rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:scale-105">
                    <div className="p-6 flex flex-col space-y-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm text-muted-foreground">
                          {formatDate(concurso.fechaInicio)}
                        </p>
                      </div>
                      <div className="space-y-2 text-left">
                        <h3 className="text-xl font-bold">{concurso.nombre}</h3>
                        <p className="text-muted-foreground line-clamp-3">
                          {concurso.descripcion || "Sin descripción"}
                        </p>
                      </div>
                      <div className="mt-auto pt-4 flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {concurso.company?.nombre || "Sin empresa"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">No hay concursos destacados disponibles</p>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/concursos">
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">
                Ver todos los concursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ganado Destacado */}
      <section className="w-full py-12 md:py-24 bg-muted text-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="space-y-2 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ganado Destacado
              </h2>
              <p className="mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Conoce los ejemplares más destacados de nuestros concursos.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {ganado.length > 0 ? (
              ganado.map((animal) => (
                <Link key={animal.id} href={`/ganado/${animal.id}`}>
                  <div className="flex flex-col h-full rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:scale-105">
                    <div className="relative aspect-square">
                      <Image
                        alt={animal.nombre}
                        className="rounded-t-xl object-cover"
                        fill
                        src="/landingImages/cow.webp"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-emerald-600 text-white">
                          Destacado
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col space-y-2 text-left">
                      <h3 className="font-bold">{animal.nombre}</h3>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Ganado
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cow className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {animal.raza || "Raza no especificada"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">No hay ganado destacado disponible</p>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/ganado">
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">
                Ver todo el ganado
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">
              Comienza con tu primera prueba gratuita
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Contáctanos por WhatsApp y organiza tu primer concurso sin costo.
              Luego elige las opciones que necesites.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Prueba Gratuita */}
            <Card className="relative border-2 border-green-400 bg-gradient-to-br from-green-50 to-white shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-semibold">
                  Prueba Gratuita
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Primer Concurso
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-green-600">
                    GRATIS
                  </span>
                </div>
                <CardDescription className="text-lg mt-2 text-gray-600">
                  Prueba completa sin compromiso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
                    1 concurso activo
                  </Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Configuración completa
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Hasta 100 participantes
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Reportes básicos
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Soporte directo por WhatsApp
                    </span>
                  </li>
                </ul>
                <div className="space-y-3 mt-8">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 hover:scale-105">
                    📱 Contactar por WhatsApp
                  </Button>
                  <p className="text-xs text-green-600 text-center font-medium">
                    ⚡ Aplican restricciones
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Premium */}
            <Card className="relative border-2 border-emerald-500 shadow-lg scale-105 bg-gradient-to-br from-white to-green-50">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-4 py-2 text-sm font-semibold">
                  <Star className="h-4 w-4 mr-1" />
                  Más Elegido
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Premium
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-emerald-600">
                    {formatCurrency(99)}
                  </span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <CardDescription className="text-lg mt-2 text-gray-600">
                  Cuando necesitas más potencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">
                    Concursos ilimitados
                  </Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Participantes ilimitados
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Analytics avanzados
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Historicidad completa
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Base de datos propia
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Personalización avanzada
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Múltiples usuarios
                    </span>
                  </li>
                </ul>
                <div className="space-y-3 mt-8">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 transition-all duration-300 hover:scale-105 shadow-lg">
                    ⭐ Elegir Premium
                  </Button>
                  <p className="text-xs text-emerald-600 text-center font-medium">
                    🎯 Recomendado para empresas activas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Personalizado */}
            <Card className="relative border-2 border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Personalizado
                </CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-emerald-600">
                    A medida
                  </span>
                </div>
                <CardDescription className="text-lg mt-2 text-gray-600">
                  Soluciones a tu medida
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-lg px-4 py-2">
                    Todo incluido
                  </Badge>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Todo lo del plan Premium
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Integraciones personalizadas
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Manager dedicado
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Historicidad extendida
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Base de datos dedicada
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700">
                      Soporte prioritario 24/7
                    </span>
                  </li>
                </ul>
                <div className="space-y-3 mt-8">
                  <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 transition-all duration-300 hover:scale-105">
                    💼 Solicitar Cotización
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    📞 Demo personalizada • Propuesta en 48h
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proceso Simple */}
          <div className="mt-16 bg-emerald-50 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              ¿Cómo funciona?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h4 className="font-bold text-gray-800 mb-2">
                  Contacta por WhatsApp
                </h4>
                <p className="text-gray-600 text-sm">
                  Te ayudamos a configurar tu primer concurso completamente
                  gratis
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h4 className="font-bold text-gray-800 mb-2">
                  Organiza tu concurso
                </h4>
                <p className="text-gray-600 text-sm">
                  Experimenta todas las funcionalidades sin restricciones
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h4 className="font-bold text-gray-800 mb-2">
                  Elige tu plan
                </h4>
                <p className="text-gray-600 text-sm">
                  Solo pagas cuando necesites más concursos o funciones
                  avanzadas
                </p>
              </div>
            </div>
          </div>

          {/* Badge de Confianza */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-lg border border-emerald-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:scale-105">
              <span className="text-emerald-600 font-medium">
                ✅ Registro en tiempo real
              </span>
              <span className="text-emerald-600 font-medium">
                ✅ Soporte en español
              </span>
              <span className="text-emerald-600 font-medium">
                ✅ Datos seguros en Perú
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas profesionales diseñadas específicamente para el
              sector ganadero
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Gestión de Equipos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Asigna roles específicos a tu equipo. Los registradores pueden
                  inscribir participantes mientras tú mantienes el control
                  total.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Concursos Profesionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Crea y gestiona concursos con categorías personalizadas,
                  reglamentos detallados y sistema de premios integrado.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Analytics Avanzados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Obtén insights detallados sobre tus concursos, participantes y
                  tendencias del sector ganadero.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-green-500 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              ¿Listo para organizar tu primer concurso?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Únete a cientos de empresas ganaderas que ya confían en nuestra
              plataforma para gestionar sus concursos profesionales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold px-8 py-4"
                >
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/iniciar-sesion">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-black hover:bg-white hover:text-emerald-600 px-8 py-4"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" className="mb-4" href="/" />
              <p className="text-gray-300">
                La plataforma líder para concursos ganaderos en Perú.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">
                Producto
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    href="/concursos"
                    className="hover:text-white transition-colors"
                  >
                    Concursos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ganado"
                    className="hover:text-white transition-colors"
                  >
                    Ganado
                  </Link>
                </li>
                <li>
                  <Link
                    href="/companias"
                    className="hover:text-white transition-colors"
                  >
                    Empresas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">
                Empresa
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    href="/nosotros"
                    className="hover:text-white transition-colors"
                  >
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="hover:text-white transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">
                Soporte
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    href="/ayuda"
                    className="hover:text-white transition-colors"
                  >
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terminos"
                    className="hover:text-white transition-colors"
                  >
                    Términos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidad"
                    className="hover:text-white transition-colors"
                  >
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 Lo Mejor de Mi Tierra. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
