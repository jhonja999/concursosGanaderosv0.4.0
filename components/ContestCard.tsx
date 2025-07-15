"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, Building2, Trophy, Eye, Star, Clock } from "lucide-react"
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

function isNewContest(createdAt: string) {
  const created = new Date(createdAt)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return created > weekAgo
}

interface ContestCardProps {
  contest: Contest
}

export default function ContestCard({ contest }: ContestCardProps) {
  // Verificar si tiene imagen válida
  const hasValidImage = contest.imagenPrincipal && contest.imagenPrincipal.trim() !== ""

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg bg-white">
      <CardHeader className="p-0 relative">
        {/* Main Contest Image Container */}
        <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
          
          {/* Imagen Principal del Concurso */}
          {hasValidImage ? (
            <img
              src={contest.imagenPrincipal!}
              alt={contest.nombre}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                console.error("Error loading contest image:", contest.imagenPrincipal)
                // Ocultar la imagen que falló y mostrar el fallback
                const imgElement = e.currentTarget as HTMLImageElement
                const parentDiv = imgElement.parentElement
                if (parentDiv) {
                  imgElement.style.display = "none"
                  const fallbackDiv = parentDiv.querySelector('.fallback-content') as HTMLElement
                  if (fallbackDiv) {
                    fallbackDiv.style.display = "flex"
                  }
                }
              }}
            />
          ) : null}

          {/* Fallback Content - Background con logo y diseño original */}
          {/* <div
            className={`fallback-content w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 ${hasValidImage ? "hidden" : "flex"}`}
          > */}
            <div className="text-center text-gray-600">
              {/* Logo de la empresa si existe */}
              {contest.company.logo ? (
                <div className="mb-4">
                  <img
                    src={contest.company.logo}
                    alt={contest.company.nombre}
                    className="w-full h-full mx-auto object-contain opacity-80 rounded-lg"
                    onError={(e) => {
                      // Si el logo falla, ocultarlo y mostrar solo el icono Trophy
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              ) : (
                <Trophy className="h-20 w-20 mx-auto mb-4 text-blue-500" />
              )}
              
             {/*  <p className="text-xl font-semibold">{contest.nombre}</p>
              <p className="text-sm opacity-75 mt-2">Concurso Ganadero</p> */}
            </div>
          </div>

          {/* Overlay Gradient for Better Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Status Badge - Top Left */}
          <div className="absolute top-4 left-4 z-10">{getStatusBadge(contest)}</div>

          {/* New Badge - Top Right */}
          {isNewContest(contest.createdAt) && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-green-500 text-white flex items-center gap-1 shadow-lg">
                <Star className="h-3 w-3" />
                Nuevo
              </Badge>
            </div>
          )}

          {/* Contest Type Badges - Bottom Left */}
          {contest.tipoGanado && contest.tipoGanado.length > 0 && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="flex flex-wrap gap-1 max-w-[200px]">
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
            <div className="absolute bottom-4 right-4 z-10">
              <div className="w-10 h-10 bg-white/95 rounded-lg shadow-md p-1.5 backdrop-blur-sm">
                <img
                  src={contest.company.logo}
                  alt={contest.company.nombre}
                  className="w-full h-full object-contain opacity-80"
                  onError={(e) => {
                    // Ocultar el contenedor del logo si falla
                    const logoContainer = e.currentTarget.parentElement
                    if (logoContainer) {
                      logoContainer.style.display = "none"
                    }
                  }}
                />
              </div>
            </div>
          )}
        {/* </div> */}
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Title and Company */}
        <div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {contest.nombre}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{contest.company.nombre}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{contest.descripcion}</p>

        {/* Contest Info */}
        <div className="space-y-3">
          {/* Date and Location */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="font-medium">
                {format(new Date(contest.fechaInicio), "dd MMM yyyy", { locale: es })}
              </span>
            </div>
            {contest.ubicacion && (
              <>
                <span className="hidden sm:block text-gray-300">•</span>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="truncate font-medium">{contest.ubicacion}</span>
                </div>
              </>
            )}
          </div>

          {/* Participants and Registration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {contest.participantCount > 0 && (
                <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Users className="h-4 w-4" />
                  <span className="font-bold">{contest.participantCount}</span>
                  <span className="text-gray-600">participantes</span>
                </div>
              )}

              {contest.cuotaInscripcion && contest.cuotaInscripcion > 0 && (
                <div className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">
                  ${contest.cuotaInscripcion.toLocaleString()} COP
                </div>
              )}
            </div>

            {/* Registration Status */}
            {contest.fechaInicioRegistro && contest.fechaFinRegistro && (
              <div className="text-xs">
                {new Date() < new Date(contest.fechaInicioRegistro) ? (
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                    <Clock className="h-3 w-3 mr-1" />
                    Próximamente
                  </Badge>
                ) : new Date() <= new Date(contest.fechaFinRegistro) ? (
                  <Badge className="bg-green-500 text-white shadow-md">Inscripciones Abiertas</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100">
                    Inscripciones Cerradas
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* All Animal Types - More Prominent */}
          {contest.tipoGanado && contest.tipoGanado.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Tipos de Ganado</p>
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

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md">
            <Link href={`/${contest.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Concurso
            </Link>
          </Button>

          {contest.participantCount > 0 && (
            <Button variant="outline" asChild className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <Link href={`/${contest.slug}/participantes`}>
                <Users className="h-4 w-4 mr-2" />
                Participantes
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
