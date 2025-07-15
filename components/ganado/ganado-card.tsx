"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Crown,
  Trophy,
  Star,
  Clock,
  Zap,
  Eye,
  MessageCircle,
  Calendar,
  Weight,
  Award,
  Building2,
  MapPin,
} from "lucide-react"

interface GanadoCardProps {
  ganado: {
    id: string
    nombre: string
    raza: string
    sexo: "MACHO" | "HEMBRA"
    fechaNacimiento: Date
    pesoKg: number
    imagenUrl?: string
    enRemate: boolean
    precioBaseRemate?: number
    isDestacado: boolean
    isGanador: boolean
    premiosObtenidos: string[]
    puntaje?: number
    posicion?: number
    calificacion?: string
    numeroFicha?: string
    propietario: {
      nombreCompleto: string
      telefono?: string
      email?: string
    }
    expositor?: {
      nombreCompleto: string
      empresa?: string
    }
    establo?: {
      nombre: string
      ubicacion?: string
    }
    contestCategory: {
      nombre: string
    }
    contest: {
      nombre: string
      tipoPuntaje?: "NUMERICO" | "POSICION" | "CALIFICACION" | "PUNTOS"
    }
    createdAt?: Date
  }
  variant?: "public" | "admin"
  onViewDetails?: (id: string) => void
  onContact?: (id: string) => void
}

export function GanadoCard({ ganado, variant = "public", onViewDetails, onContact }: GanadoCardProps) {
  const [imageError, setImageError] = useState(false)

  const calculateAge = (birthDate: Date) => {
    if (!birthDate || isNaN(new Date(birthDate).getTime())) {
      return "Edad no disponible"
    }

    const now = new Date()
    const birth = new Date(birthDate)

    // Validar que la fecha de nacimiento no sea futura
    if (birth > now) {
      return "Fecha inválida"
    }

    const ageInMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (ageInMonths < 0) {
      return "Fecha inválida"
    }

    if (ageInMonths < 12) {
      return `${ageInMonths} meses`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years} años ${months} meses` : `${years} años`
    }
  }

  const getBadges = () => {
    const badges = []

    if (ganado.enRemate) {
      badges.push({
        text: "EN REMATE",
        variant: "destructive" as const,
        icon: <Zap className="h-3 w-3" />,
        animate: true,
      })
    }

    if (ganado.premiosObtenidos.includes("CAMPEÓN")) {
      badges.push({
        text: "CAMPEÓN",
        variant: "default" as const,
        icon: <Crown className="h-3 w-3" />,
        className: "bg-yellow-500 text-white hover:bg-yellow-600",
      })
    }

    if (ganado.isGanador) {
      badges.push({
        text: "GANADOR",
        variant: "default" as const,
        icon: <Trophy className="h-3 w-3" />,
        className: "bg-blue-500 text-white hover:bg-blue-600",
      })
    }

    if (ganado.isDestacado) {
      badges.push({
        text: "DESTACADO",
        variant: "default" as const,
        icon: <Star className="h-3 w-3" />,
        className: "bg-green-500 text-white hover:bg-green-600",
      })
    }

    // Badge "NUEVO" si fue creado en los últimos 7 días
    const createdRecently = ganado.createdAt
      ? new Date(ganado.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      : false
    if (createdRecently) {
      badges.push({
        text: "NUEVO",
        variant: "default" as const,
        icon: <Clock className="h-3 w-3" />,
        className: "bg-purple-500 text-white hover:bg-purple-600",
      })
    }

    // Badge "ÉLITE" para animales con puntaje alto
    if (ganado.puntaje && ganado.puntaje >= 90) {
      badges.push({
        text: "ÉLITE",
        variant: "default" as const,
        icon: <Zap className="h-3 w-3" />,
        className: "bg-black text-white hover:bg-gray-800 border-2 border-yellow-400",
      })
    }

    return badges
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getScoreDisplay = () => {
    const tipoPuntaje = ganado.contest.tipoPuntaje || "NUMERICO"

    switch (tipoPuntaje) {
      case "POSICION":
        if (ganado.posicion) {
          const suffix =
            ganado.posicion === 1 ? "er" : ganado.posicion === 2 ? "do" : ganado.posicion === 3 ? "er" : "to"
          return `${ganado.posicion}${suffix} lugar`
        }
        break
      case "CALIFICACION":
        if (ganado.calificacion) {
          return ganado.calificacion
        }
        break
      case "NUMERICO":
      case "PUNTOS":
      default:
        if (ganado.puntaje) {
          return ganado.puntaje.toFixed(1)
        }
        break
    }
    return null
  }

  const badges = getBadges()
  const scoreDisplay = getScoreDisplay()

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header con imagen y badges */}
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
          {ganado.imagenUrl && !imageError ? (
            <img
              src={ganado.imagenUrl || "/placeholder.svg"}
              alt={ganado.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🐄</div>
                <p className="text-sm">Sin imagen</p>
              </div>
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant}
                className={`
                  flex items-center gap-1 text-xs font-medium
                  ${badge.className || ""}
                  ${badge.animate ? "animate-pulse" : ""}
                `}
              >
                {badge.icon}
                {badge.text}
              </Badge>
            ))}
          </div>

          {/* Número de ficha */}
          {ganado.numeroFicha && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                #{ganado.numeroFicha}
              </Badge>
            </div>
          )}

          {/* Puntaje/Posición/Calificación */}
          {scoreDisplay && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="default" className="bg-blue-600 text-white flex items-center gap-1">
                <Award className="h-3 w-3" />
                {scoreDisplay}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Contenido principal */}
      <CardContent className="p-4 space-y-3">
        {/* Título y categoría */}
        <div>
          <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
            {ganado.nombre}
          </h3>
          <p className="text-sm text-gray-600">{ganado.contestCategory.nombre}</p>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Raza:</span>
            <span className="text-gray-600">{ganado.raza}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Sexo:</span>
            <span className="text-gray-600">{ganado.sexo === "MACHO" ? "Macho" : "Hembra"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{calculateAge(ganado.fechaNacimiento)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{ganado.pesoKg} kg</span>
          </div>
        </div>

        {/* Información del establo */}
        {ganado.establo && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-800 truncate">{ganado.establo.nombre}</p>
                {ganado.establo.ubicacion && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    <p className="text-xs text-blue-600 truncate">{ganado.establo.ubicacion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Precio si está en remate */}
        {ganado.enRemate && ganado.precioBaseRemate && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-800">Precio Base:</span>
              <span className="text-lg font-bold text-red-600">{formatPrice(ganado.precioBaseRemate)}</span>
            </div>
          </div>
        )}

        {/* Información del propietario */}
        <div className="border-t pt-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-xs">
                {ganado.propietario.nombreCompleto
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ganado.propietario.nombreCompleto}</p>
              <p className="text-xs text-gray-500">Propietario</p>
              {ganado.expositor && ganado.expositor.nombreCompleto !== ganado.propietario.nombreCompleto && (
                <p className="text-xs text-blue-600 mt-1">Exp: {ganado.expositor.nombreCompleto}</p>
              )}
            </div>
          </div>
        </div>

        {/* Premios obtenidos */}
        {ganado.premiosObtenidos.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ganado.premiosObtenidos.slice(0, 3).map((premio, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {premio}
              </Badge>
            ))}
            {ganado.premiosObtenidos.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{ganado.premiosObtenidos.length - 3} más
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer con acciones */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-transparent"
          onClick={() => onViewDetails?.(ganado.id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalles
        </Button>

        {variant === "public" && (ganado.propietario.telefono || ganado.propietario.email) && (
          <Button variant="default" size="sm" className="flex-1" onClick={() => onContact?.(ganado.id)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
