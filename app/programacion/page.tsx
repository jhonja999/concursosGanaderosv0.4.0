"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { WeatherBanner } from "@/components/shared/weather-banner"
import { ImageGridSkeleton } from "@/components/shared/loading-skeleton"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog" // Importar DialogTitle

interface ProgramImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  order: number
  eventDate?: string
  eventTime?: string
  location?: string
  createdAt: string
}

export default function ProgramacionPage() {
  const [images, setImages] = useState<ProgramImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ProgramImage | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // State para manejar el inicio del toque en dispositivos móviles
  const [touchStartX, setTouchStartX] = useState(0)
  // Umbral de píxeles para considerar un deslizamiento
  const touchThreshold = 50

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/program-images")
      if (response.ok) {
        const data = await response.json()
        // Ordenar las imágenes por la propiedad 'order'
        const sortedData = data.images.sort((a: ProgramImage, b: ProgramImage) => a.order - b.order)
        setImages(sortedData)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  const openImageModal = (image: ProgramImage, index: number) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const goToPrevious = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1
    setCurrentImageIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const goToNext = () => {
    const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0
    setCurrentImageIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  // Manejador para navegación con teclado (flechas y Esc)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImage) {
      if (e.key === "ArrowLeft") goToPrevious()
      if (e.key === "ArrowRight") goToNext()
      if (e.key === "Escape") closeImageModal()
    }
  }

  // Manejador para el inicio del toque (guardar posición inicial X)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  // Manejador para el final del toque (detectar deslizamiento)
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchEndX - touchStartX // Calcular la distancia del deslizamiento

    // Si el deslizamiento es hacia la derecha (deltaX > touchThreshold), ir a la imagen anterior
    if (deltaX > touchThreshold) {
      goToPrevious()
    }
    // Si el deslizamiento es hacia la izquierda (deltaX < -touchThreshold), ir a la imagen siguiente
    else if (deltaX < -touchThreshold) {
      goToNext()
    }
  }

  // Añadir y remover listeners de eventos de teclado y toque
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage, currentImageIndex, images]) // Asegurarse de que las dependencias sean correctas

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />

        {/* Banner del clima */}
        <WeatherBanner />

        {/* Header de la página de programación */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Programación de Eventos</h1>
            <p className="text-lg text-gray-600">Cronograma oficial de la Feria Fongal Cajamarca 2025</p>
          </div>

          <Button variant="outline" asChild className="hidden sm:flex bg-transparent">
            <Link href="/concursos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Concursos
            </Link>
          </Button>
        </div>

        {loading ? (
          <ImageGridSkeleton items={6} />
        ) : images.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Programación en preparación</h3>
              <p className="text-gray-500 text-center mb-6">La programación detallada estará disponible próximamente</p>
              <Button asChild>
                <Link href="/concursos">Ver Concursos Disponibles</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid de imágenes */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                // La Card completa es clicable para abrir el modal de la imagen
                <Card
                  key={image.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => openImageModal(image, index)}
                >
                  <div className="relative aspect-[4/6] overflow-hidden">
                    <Image
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={image.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-600 text-white">
                        {index + 1} de {images.length}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-2">
                    <h3 className="font-bold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {image.title}
                    </h3>

                    {image.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">{image.description}</p>
                    )}

                    <div className="space-y-2">
                      {image.eventDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(image.eventDate), "EEEE, dd 'de' MMMM", { locale: es })}
                        </div>
                      )}

                      {image.eventTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {image.eventTime}
                        </div>
                      )}

                      {image.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {image.location}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Modal de imagen completa */}
            <Dialog open={!!selectedImage} onOpenChange={closeImageModal}>
              <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Botón cerrar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                    onClick={closeImageModal}
                  >
                    <X className="h-6 w-6" />
                  </Button>

                  {/* Botones de navegación (solo si hay más de una imagen) */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                        onClick={goToPrevious}
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                        onClick={goToNext}
                      >
                        <ChevronRight className="h-8 w-8" />
                      </Button>
                    </>
                  )}

                  {/* Imagen principal en el modal */}
                  {selectedImage && (
                    <div className="relative w-full h-full flex flex-col">
                      {/* Contenedor de la imagen con detección de toque para deslizamiento */}
                      <div className="flex-1 relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                        <Image
                          src={selectedImage.imageUrl || "/placeholder.svg"}
                          alt={selectedImage.title}
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>

                      {/* Información de la imagen en el modal */}
                      <div className="bg-black/80 text-white p-6 max-h-48 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                          <div className="flex items-center justify-between mb-4">
                            {/* DialogTitle para accesibilidad, usando el h2 como su hijo */}
                            <DialogTitle asChild>
                              <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
                            </DialogTitle>
                            <Badge className="bg-blue-600 text-white">
                              {currentImageIndex + 1} de {images.length}
                            </Badge>
                          </div>

                          {selectedImage.description && (
                            <p className="text-gray-300 mb-4 leading-relaxed">{selectedImage.description}</p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm">
                            {selectedImage.eventDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(selectedImage.eventDate), "EEEE, dd 'de' MMMM 'de' yyyy", {
                                  locale: es,
                                })}
                              </div>
                            )}

                            {selectedImage.eventTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {selectedImage.eventTime}
                              </div>
                            )}

                            {selectedImage.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {selectedImage.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Información adicional */}
        <Card className="border-2 border-yellow-200 bg-yellow-50 mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-yellow-800 mb-4 text-center">
              Información Importante para Visitantes
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">📋 Para Participantes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Llegar 30 minutos antes del evento</li>
                  <li>• Portar documentos de identificación</li>
                  <li>• Seguir las indicaciones del personal</li>
                  <li>• Respetar los horarios establecidos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">🎯 Para Visitantes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Entrada libre a eventos públicos</li>
                  <li>• Respetar las áreas restringidas</li>
                  <li>• Consultar horarios actualizados</li>
                  <li>• Disfrutar de la gastronomía local</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
