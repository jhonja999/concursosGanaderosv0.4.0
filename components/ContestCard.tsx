"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, Building2, Trophy, Eye, Star, Clock, Beef, Heart, Award, Zap } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface Contest {
  id: string
  nombre: string
  slug: string
  descripcion: string
  imagenPrincipal?: string | null
  fechaInicio: string
  fechaFin?: string
  fechaInicioRegistro?: string
  fechaFinRegistro?: string
  ubicacion?: string
  cuotaInscripcion?: number
  tipoGanado?: string[]
  isActive: boolean
  participantCount: number
  company: {
    id: string
    nombre: string
    logo?: string
    descripcion?: string
    ubicacion?: string
  }
  createdAt: string
}

interface ContestCardProps {
  contest: Contest
}

// Función para obtener el badge de estado del concurso
function getStatusBadge(contest: Contest) {
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

// Función para verificar si es un concurso nuevo (última semana)
function isNewContest(createdAt: string) {
  const created = new Date(createdAt)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return created > weekAgo
}

// Función mejorada para obtener el icono según el tipo de ganado
function getAnimalIcon(tipoGanado?: string[]) {
  if (!tipoGanado || tipoGanado.length === 0) {
    return <Trophy className="h-4 w-4" />
  }

  const tipos = tipoGanado.join(" ").toLowerCase()

  if (
    tipos.includes("bovino") ||
    tipos.includes("vacuno") ||
    tipos.includes("toro") ||
    tipos.includes("vaca") ||
    tipos.includes("res")
  ) {
    return <Beef className="h-4 w-4" />
  }

  if (tipos.includes("equino") || tipos.includes("caballo") || tipos.includes("yegua") || tipos.includes("potro")) {
    return <Zap className="h-4 w-4" />
  }

  if (tipos.includes("ovino") || tipos.includes("oveja") || tipos.includes("carnero") || tipos.includes("cordero")) {
    return <Heart className="h-4 w-4" />
  }

  if (tipos.includes("caprino") || tipos.includes("cabra") || tipos.includes("chivo") || tipos.includes("macho")) {
    return <Award className="h-4 w-4" />
  }

  if (tipos.includes("porcino") || tipos.includes("cerdo") || tipos.includes("cochino") || tipos.includes("marrano")) {
    return <Users className="h-4 w-4" />
  }

  // Por defecto, usar icono de trofeo para concursos generales
  return <Trophy className="h-4 w-4" />
}

// Función mejorada para obtener el texto de participantes según el tipo
function getParticipantText(tipoGanado?: string[], count = 0) {
  if (!tipoGanado || tipoGanado.length === 0) {
    return count === 1 ? "ejemplar inscrito" : "ejemplares inscritos"
  }

  const tipos = tipoGanado.join(" ").toLowerCase()

  if (
    tipos.includes("bovino") ||
    tipos.includes("vacuno") ||
    tipos.includes("toro") ||
    tipos.includes("vaca") ||
    tipos.includes("res")
  ) {
    return count === 1 ? "bovino inscrito" : "bovinos inscritos"
  }

  if (tipos.includes("equino") || tipos.includes("caballo") || tipos.includes("yegua") || tipos.includes("potro")) {
    return count === 1 ? "equino inscrito" : "equinos inscritos"
  }

  if (tipos.includes("ovino") || tipos.includes("oveja") || tipos.includes("carnero") || tipos.includes("cordero")) {
    return count === 1 ? "ovino inscrito" : "ovinos inscritos"
  }

  if (tipos.includes("caprino") || tipos.includes("cabra") || tipos.includes("chivo") || tipos.includes("macho")) {
    return count === 1 ? "caprino inscrito" : "caprinos inscritos"
  }

  if (tipos.includes("porcino") || tipos.includes("cerdo") || tipos.includes("cochino") || tipos.includes("marrano")) {
    return count === 1 ? "porcino inscrito" : "porcinos inscritos"
  }

  // Por defecto
  return count === 1 ? "ejemplar inscrito" : "ejemplares inscritos"
}

// Función para validar si una imagen es válida
function validateImageUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === "") return false
  if (url.includes("placeholder.svg") || url.includes("placeholder.com")) return false
  return true
}

// Función para manejar errores de imagen
function handleImageError(e: React.SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) {
  const target = e.currentTarget

  if (fallbackUrl && target.src !== fallbackUrl) {
    target.src = fallbackUrl
  } else {
    target.style.display = "none"
    const fallbackDiv = target.parentElement?.querySelector(".fallback-content") as HTMLElement
    if (fallbackDiv) {
      fallbackDiv.style.display = "flex"
    }
  }
}

export default function ContestCard({ contest }: ContestCardProps) {
  const hasValidImage = validateImageUrl(contest.imagenPrincipal)
  const animalIcon = getAnimalIcon(contest.tipoGanado)
  const participantText = getParticipantText(contest.tipoGanado, contest.participantCount)

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg bg-white h-full flex flex-col">
      <CardHeader className="p-0 relative flex-shrink-0">
        {/* Main Contest Image Container - Clickeable */}
        <Link href={`/${contest.slug}`} className="block">
          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 cursor-pointer">
            {/* Imagen Principal del Concurso */}
            {hasValidImage ? (
              <img
                src={contest.imagenPrincipal! || "/placeholder.svg"}
                alt={contest.nombre}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => handleImageError(e, "/placeholder.svg?height=400&width=600")}
              />
            ) : null}

            {/* Fallback Content - Background con logo y diseño original */}
            <div
              className={`fallback-content w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 ${hasValidImage ? "hidden" : "flex"}`}
            >
              <div className="text-center text-gray-600 px-4">
                {contest.company.logo ? (
                  <div className="mb-4">
                    <img
                      src={contest.company.logo || "/placeholder.svg"}
                      alt={contest.company.nombre}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto object-contain opacity-80 rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                ) : (
                  <Trophy className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-blue-500" />
                )}

                <p className="text-lg sm:text-xl font-semibold line-clamp-2">{contest.nombre}</p>
                <p className="text-xs sm:text-sm opacity-75 mt-2">Concurso Ganadero</p>
              </div>
            </div>

            {/* Overlay Gradient for Better Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Status Badge - Top Left */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">{getStatusBadge(contest)}</div>

            {/* New Badge - Top Right */}
            {isNewContest(contest.createdAt) && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                <Badge className="bg-green-500 text-white flex items-center gap-1 shadow-lg text-xs">
                  <Star className="h-3 w-3" />
                  <span className="hidden sm:inline">Nuevo</span>
                </Badge>
              </div>
            )}

            {/* Contest Type Badges - Bottom Left */}
            {contest.tipoGanado && contest.tipoGanado.length > 0 && (
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-10">
                <div className="flex flex-wrap gap-1 max-w-[150px] sm:max-w-[200px]">
                  {contest.tipoGanado.slice(0, 2).map((tipo, index) => (
                    <Badge
                      key={index}
                      className="bg-white/90 text-gray-800 text-xs font-medium shadow-md backdrop-blur-sm border-0"
                    >
                      {tipo}
                    </Badge>
                  ))}
                  {contest.tipoGanado.length > 2 && (
                    <Badge className="bg-white/90 text-gray-800 text-xs font-medium shadow-md backdrop-blur-sm border-0">
                      +{contest.tipoGanado.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Company Logo - Bottom Right - Solo cuando hay imagen principal */}
            {hasValidImage && contest.company.logo && (
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/95 rounded-lg shadow-md p-1.5 backdrop-blur-sm">
                  <img
                    src={contest.company.logo || "/placeholder.svg"}
                    alt={contest.company.nombre}
                    className="w-full h-full object-contain opacity-80"
                    onError={(e) => {
                      const logoContainer = e.currentTarget.parentElement
                      if (logoContainer) {
                        logoContainer.style.display = "none"
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col">
        {/* Title and Company */}
        <div className="flex-shrink-0">
          <Link href={`/${contest.slug}`} className="block">
            <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight cursor-pointer">
              {contest.nombre}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="font-medium truncate">{contest.company.nombre}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed flex-shrink-0">{contest.descripcion}</p>

        {/* Contest Info - Flexible space */}
        <div className="space-y-3 flex-1">
          {/* Date and Location */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="font-medium">
                {format(new Date(contest.fechaInicio), "dd MMM yyyy", { locale: es })}
              </span>
            </div>
            {contest.ubicacion && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="truncate font-medium">{contest.ubicacion}</span>
              </div>
            )}
          </div>

          {/* Participants and Registration */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              {contest.participantCount > 0 && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-full w-fit">
                  {animalIcon}
                  <span className="font-bold">{contest.participantCount}</span>
                  <span className="text-gray-600 text-xs hidden sm:inline">{participantText}</span>
                  <span className="text-gray-600 text-xs sm:hidden">
                    {contest.participantCount === 1 ? "inscrito" : "inscritos"}
                  </span>
                </div>
              )}

              {contest.cuotaInscripcion && contest.cuotaInscripcion > 0 && (
                <div className="text-green-600 font-bold bg-green-50 px-3 py-2 rounded-full w-fit text-sm">
                  ${contest.cuotaInscripcion.toLocaleString()} COP
                </div>
              )}
            </div>

            {/* Registration Status */}
            {contest.fechaInicioRegistro && contest.fechaFinRegistro && (
              <div className="flex justify-start">
                {new Date() < new Date(contest.fechaInicioRegistro) ? (
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Próximamente</span>
                    <span className="sm:hidden">Próximo</span>
                  </Badge>
                ) : new Date() <= new Date(contest.fechaFinRegistro) ? (
                  <Badge className="bg-green-500 text-white shadow-md">
                    <span className="hidden sm:inline">Inscripciones Abiertas</span>
                    <span className="sm:hidden">Abierto</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100">
                    <span className="hidden sm:inline">Inscripciones Cerradas</span>
                    <span className="sm:hidden">Cerrado</span>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* All Animal Types - More Prominent */}
          {contest.tipoGanado && contest.tipoGanado.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                <span className="hidden sm:inline">Tipos de Ganado</span>
                <span className="sm:hidden">Categorías</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {contest.tipoGanado.map((tipo, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-white border border-gray-200 text-gray-700 font-medium"
                  >
                    {tipo}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4 flex-shrink-0" />

        {/* Actions - Fixed at bottom */}
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md h-10 sm:h-auto">
            <Link href={`/${contest.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ver Concurso</span>
              <span className="sm:hidden">Ver Detalles</span>
            </Link>
          </Button>

          {contest.participantCount > 0 && (
            <Button
              variant="outline"
              asChild
              className="border-blue-200 text-blue-600 hover:bg-blue-50 h-10 sm:h-auto sm:w-auto bg-transparent"
            >
              <Link href={`/${contest.slug}/participantes`}>
                {animalIcon}
                <span className="ml-2 hidden sm:inline">Ver {contest.participantCount}</span>
                <span className="ml-2 sm:hidden">{contest.participantCount}</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Información adicional para móvil */}
        <div className="sm:hidden pt-2 border-t border-gray-100 flex-shrink-0">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Creado: {format(new Date(contest.createdAt), "dd/MM/yyyy")}</span>
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {contest.company.ubicacion || "Colombia"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
