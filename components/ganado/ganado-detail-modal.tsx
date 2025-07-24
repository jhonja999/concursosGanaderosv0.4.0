"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Weight,
  Award,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Gavel,
  Star,
  Trophy,
  Crown,
  Tag,
} from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface Ganado {
  id: string
  nombre: string
  tipoAnimal?: string
  raza: string
  sexo: "MACHO" | "HEMBRA"
  fechaNacimiento: Date
  pesoKg: number
  imagenUrl?: string
  imagenes?: string[]
  enRemate: boolean
  precioBaseRemate?: number
  isDestacado: boolean
  isGanador?: boolean
  premiosObtenidos?: string[]
  numeroFicha?: string
  puntaje?: number
  posicion?: number
  calificacion?: string
  descripcion?: string
  marcasDistintivas?: string
  padre?: string
  madre?: string
  lineaGenetica?: string
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
    id: string
    nombre: string
  }
  contest: {
    nombre: string
    tipoPuntaje?: "NUMERICO" | "POSICION" | "CALIFICACION" | "PUNTOS"
  }
}

interface GanadoDetailModalProps {
  ganado: Ganado
  isOpen: boolean
  onClose: () => void
}

export function GanadoDetailModal({ ganado, isOpen, onClose }: GanadoDetailModalProps) {
  const calculateAge = (birthDate: Date) => {
    if (!birthDate || isNaN(new Date(birthDate).getTime())) return "N/A"
    const ageInMonths =
      (new Date().getFullYear() - new Date(birthDate).getFullYear()) * 12 +
      (new Date().getMonth() - new Date(birthDate).getMonth())
    if (ageInMonths < 12) return `${ageInMonths} meses`
    const years = Math.floor(ageInMonths / 12)
    const months = ageInMonths % 12
    return months > 0 ? `${years} años y ${months} meses` : `${years} años`
  }

  const formatPrice = (price?: number) => {
    if (!price) return "N/A"
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
      price,
    )
  }

  const getScoreDisplay = () => {
    const tipoPuntaje = ganado.contest.tipoPuntaje || "NUMERICO"
    switch (tipoPuntaje) {
      case "POSICION":
        return ganado.posicion ? `${ganado.posicion}º Lugar` : null
      case "CALIFICACION":
        return ganado.calificacion || null
      default:
        return ganado.puntaje ? ganado.puntaje.toFixed(1) : null
    }
  }

  const allImages = [ganado.imagenUrl, ...(ganado.imagenes || [])].filter(
    (url, index, self) => url && self.indexOf(url) === index,
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{ganado.nombre}</DialogTitle>
          <DialogDescription>
            {ganado.contestCategory.nombre} | {ganado.contest.nombre}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Columna Izquierda: Imagen y Badges */}
          <div className="space-y-4">
            {allImages.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {allImages.map((img, idx) => (
                    <CarouselItem key={idx}>
                      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`${ganado.nombre} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                🐄 Sin imagen
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {ganado.numeroFicha && (
                <Badge variant="secondary">
                  <Tag className="w-3 h-3 mr-1" />#{ganado.numeroFicha}
                </Badge>
              )}
              {ganado.isDestacado && (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Star className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              )}
              {ganado.isGanador && (
                <Badge className="bg-blue-500 hover:bg-blue-600">
                  <Trophy className="w-3 h-3 mr-1" />
                  Ganador
                </Badge>
              )}
              {ganado.premiosObtenidos?.includes("CAMPEÓN") && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                  <Crown className="w-3 h-3 mr-1" />
                  Campeón
                </Badge>
              )}
              {ganado.enRemate && (
                <Badge variant="destructive" className="animate-pulse">
                  <Gavel className="w-3 h-3 mr-1" />
                  En Remate
                </Badge>
              )}
            </div>
            {ganado.premiosObtenidos && ganado.premiosObtenidos.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Premios</h4>
                <div className="flex flex-wrap gap-2">
                  {ganado.premiosObtenidos.map((premio, i) => (
                    <Badge key={i} variant="outline">
                      {premio}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Detalles */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-gray-500" /> <span>{ganado.pesoKg || "N/A"} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" /> <span>{calculateAge(ganado.fechaNacimiento)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v1.333A4.002 4.002 0 0115 9.333V15a1 1 0 11-2 0v-5.667a2 2 0 00-2-2v5.667a1 1 0 11-2 0V9.333a4.002 4.002 0 014-4.666V4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                  <path d="M10 18a4 4 0 100-8 4 4 0 000 8zm0 2a6 6 0 100-12 6 6 0 000 12z" />
                </svg>
                <span>{ganado.sexo === "MACHO" ? "Macho" : "Hembra"}</span>
              </div>
              {getScoreDisplay() && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-500" /> <span>{getScoreDisplay()}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Tipo:</span> {ganado.tipoAnimal || "No especificado"}
              </div>
              <div>
                <span className="font-semibold">Raza:</span> {ganado.raza || "N/A"}
              </div>
            </div>

            {ganado.padre || ganado.madre || ganado.lineaGenetica ? (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Genealogía</h4>
                  <p className="text-sm">
                    <strong>Padre:</strong> {ganado.padre || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong>Madre:</strong> {ganado.madre || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong>Línea Genética:</strong> {ganado.lineaGenetica || "N/A"}
                  </p>
                </div>
              </>
            ) : null}

            <Separator />

            {ganado.descripcion && (
              <div>
                <h4 className="font-semibold mb-2">Descripción</h4>
                <p className="text-sm text-gray-600">{ganado.descripcion}</p>
              </div>
            )}
            {ganado.marcasDistintivas && (
              <div>
                <h4 className="font-semibold mb-2">Marcas Distintivas</h4>
                <p className="text-sm text-gray-600">{ganado.marcasDistintivas}</p>
              </div>
            )}

            {ganado.enRemate && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">Precio Base Remate:</span>
                  <span className="text-lg font-bold text-red-600">{formatPrice(ganado.precioBaseRemate)}</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Propietario, Expositor, Establo */}
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Criador
                </h4>
                <p className="text-sm">{ganado.propietario.nombreCompleto}</p>
                {ganado.propietario.telefono && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {ganado.propietario.telefono}
                  </p>
                )}
                {ganado.propietario.email && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {ganado.propietario.email}
                  </p>
                )}
              </div>
              {ganado.expositor && (
                <div>
                  <h4 className="font-semibold">Expositor</h4>
                  <p className="text-sm">{ganado.expositor.nombreCompleto}</p>
                </div>
              )}
              {ganado.establo && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Establo
                  </h4>
                  <p className="text-sm">{ganado.establo.nombre}</p>
                  {ganado.establo.ubicacion && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {ganado.establo.ubicacion}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {(ganado.propietario.telefono || ganado.propietario.email) && (
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              Contactar al Propietario
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
