"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, MilkIcon as Cow } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Animal {
  id: string
  nombre: string
  raza?: string
  expositor?: {
    nombre: string
    apellido?: string
  }
  GanadoImage: Array<{
    image: {
      url: string
      alt?: string
    }
  }>
}

export function AnimalSlider() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnimals()
  }, [])

  useEffect(() => {
    if (animals.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % animals.length)
      }, 5000)

      return () => clearInterval(timer)
    }
  }, [animals.length])

  const fetchAnimals = async () => {
    try {
      const response = await fetch("/api/ganado?public=true")
      const data = await response.json()
      setAnimals(data.slice(0, 6)) // Mostrar máximo 6 animales
    } catch (error) {
      console.error("Error fetching animals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + animals.length) % animals.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % animals.length)
  }

  if (isLoading || animals.length === 0) {
    return null
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">Animales Destacados</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={goToPrevious} className="text-white hover:bg-white/20">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToNext} className="text-white hover:bg-white/20">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {animals.slice(currentIndex, currentIndex + 3).map((animal, index) => (
              <div
                key={animal.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="relative aspect-video bg-gradient-to-br from-viridian/20 to-pastel-green/20 flex items-center justify-center">
                  {animal.GanadoImage[0]?.image.url ? (
                    <Image
                      src={animal.GanadoImage[0].image.url || "/placeholder.svg"}
                      alt={animal.GanadoImage[0].image.alt || animal.nombre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Cow className="h-12 w-12 text-white/50 mx-auto mb-2" />
                      <span className="text-white/70 text-sm">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white mb-1">{animal.nombre}</h4>
                  <div className="space-y-1">
                    {animal.raza && <p className="text-white/70 text-sm">{animal.raza}</p>}
                    {animal.expositor && (
                      <p className="text-white/60 text-xs">
                        {animal.expositor.nombre} {animal.expositor.apellido}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {animals.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
