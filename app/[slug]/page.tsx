import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, DollarSign, Trophy, Building2, Globe, Phone, Mail } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { SponsorsSection } from "@/components/shared/sponsors-section"

interface Contest {
  id: string
  nombre: string
  slug: string
  descripcion: string
  imagenPrincipal?: string
  fechaInicio: string
  fechaFin?: string
  fechaInicioRegistro?: string
  fechaFinRegistro?: string
  ubicacion?: string
  direccion?: string
  capacidadMaxima?: number
  cuotaInscripcion?: number
  tipoGanado?: string[]
  categorias?: string[]
  premiacion?: string
  reglamento?: string
  contactoOrganizador?: string
  telefonoContacto?: string
  emailContacto?: string
  auspiciadores?: Array<{
    id: string
    nombre: string
    imagen: string
    website?: string
  }>
  company: {
    id: string
    nombre: string
    logo?: string
    descripcion?: string
    ubicacion?: string
    website?: string
  }
}

async function getContest(slug: string): Promise<Contest | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/concursos/${slug}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.contest
  } catch (error) {
    console.error("Error fetching contest:", error)
    return null
  }
}

export default async function ConcursoPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const contest = await getContest(slug)

  if (!contest) {
    notFound()
  }

  const getStatusBadge = () => {
    const now = new Date()
    const startDate = new Date(contest.fechaInicio)

    if (contest.fechaFin) {
      const endDate = new Date(contest.fechaFin)
      if (endDate < now) {
        return <Badge variant="destructive">Finalizado</Badge>
      }
    }

    if (startDate > now) {
      return <Badge variant="outline">Próximo</Badge>
    }

    return <Badge variant="default">En curso</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">{getStatusBadge()}</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{contest.nombre}</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">{contest.descripcion}</p>

            <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
              {contest.fechaInicio && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(contest.fechaInicio), "dd 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
              )}
              {contest.ubicacion && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{contest.ubicacion}</span>
                </div>
              )}
              {contest.capacidadMaxima && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Hasta {contest.capacidadMaxima} participantes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contest Image */}
            {contest.imagenPrincipal && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={contest.imagenPrincipal || "/placeholder.svg"}
                    alt={contest.nombre}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Sobre el Concurso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{contest.descripcion}</p>

                {contest.tipoGanado && contest.tipoGanado.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tipo de Ganado:</h4>
                    <div className="flex flex-wrap gap-2">
                      {contest.tipoGanado.map((tipo, index) => (
                        <Badge key={index} variant="secondary">
                          {tipo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {contest.categorias && contest.categorias.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Categorías:</h4>
                    <div className="flex flex-wrap gap-2">
                      {contest.categorias.map((categoria, index) => (
                        <Badge key={index} variant="outline">
                          {categoria}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premiación */}
            {contest.premiacion && (
              <Card>
                <CardHeader>
                  <CardTitle>Premiación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{contest.premiacion}</p>
                </CardContent>
              </Card>
            )}

            {/* Reglamento */}
            {contest.reglamento && (
              <Card>
                <CardHeader>
                  <CardTitle>Reglamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{contest.reglamento}</p>
                </CardContent>
              </Card>
            )}

            {/* Sponsors */}
            {contest.auspiciadores && contest.auspiciadores.length > 0 && (
              <SponsorsSection auspiciadores={contest.auspiciadores} title="Nuestros Auspiciadores" />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Registro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contest.fechaInicioRegistro && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Inicio de Registros</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(contest.fechaInicioRegistro), "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}

                {contest.fechaFinRegistro && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Fin de Registros</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(contest.fechaFinRegistro), "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}

                {contest.cuotaInscripcion && contest.cuotaInscripcion > 0 && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Cuota de Inscripción</p>
                      <p className="text-sm text-gray-600">${contest.cuotaInscripcion.toLocaleString()} COP</p>
                    </div>
                  </div>
                )}

                <Separator />

                <Button className="w-full" size="lg">
                  Registrarse al Concurso
                </Button>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organizador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {contest.company.logo && (
                    <img
                      src={contest.company.logo || "/placeholder.svg"}
                      alt={contest.company.nombre}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold">{contest.company.nombre}</h4>
                    {contest.company.ubicacion && <p className="text-sm text-gray-600">{contest.company.ubicacion}</p>}
                  </div>
                </div>

                {contest.company.descripcion && <p className="text-sm text-gray-700">{contest.company.descripcion}</p>}

                {contest.company.website && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={contest.company.website} target="_blank">
                      <Globe className="h-4 w-4 mr-2" />
                      Visitar Sitio Web
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contest.contactoOrganizador && (
                  <div>
                    <p className="font-medium">{contest.contactoOrganizador}</p>
                  </div>
                )}

                {contest.telefonoContacto && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{contest.telefonoContacto}</span>
                  </div>
                )}

                {contest.emailContacto && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{contest.emailContacto}</span>
                  </div>
                )}

                {contest.direccion && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{contest.direccion}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const contest = await getContest(slug)

  if (!contest) {
    return {
      title: "Concurso no encontrado",
    }
  }

  return {
    title: `${contest.nombre} - ${contest.company.nombre}`,
    description: contest.descripcion,
    openGraph: {
      title: contest.nombre,
      description: contest.descripcion,
      images: contest.imagenPrincipal ? [contest.imagenPrincipal] : [],
    },
  }
}
