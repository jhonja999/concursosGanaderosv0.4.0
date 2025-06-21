"use client"

import type React from "react"
import { useState } from "react"
import { ExternalLink } from "lucide-react"

interface Auspiciador {
  id: string
  nombre: string
  imagen: string
  website?: string
}

interface SponsorsSectionProps {
  auspiciadores: Auspiciador[]
  title?: string
  className?: string
}

export function SponsorsSection({ auspiciadores, title = "Auspiciadores", className = "" }: SponsorsSectionProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  if (!auspiciadores || auspiciadores.length === 0) {
    return null
  }

  const handleImageError = (auspiciadorId: string) => {
    setImageErrors((prev) => new Set(prev).add(auspiciadorId))
  }

  const handleSponsorClick = (auspiciador: Auspiciador) => {
    if (auspiciador.website) {
      window.open(auspiciador.website, "_blank", "noopener,noreferrer")
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, auspiciador: Auspiciador) => {
    if ((event.key === "Enter" || event.key === " ") && auspiciador.website) {
      event.preventDefault()
      handleSponsorClick(auspiciador)
    }
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {auspiciadores.map((auspiciador) => {
            const hasWebsite = Boolean(auspiciador.website)
            const hasImageError = imageErrors.has(auspiciador.id)

            return (
              <div
                key={auspiciador.id}
                className={`
                  group relative bg-white rounded-lg p-4 shadow-sm border transition-all duration-200
                  ${
                    hasWebsite
                      ? "cursor-pointer hover:shadow-md hover:scale-105 hover:border-blue-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                      : ""
                  }
                `}
                onClick={() => handleSponsorClick(auspiciador)}
                onKeyDown={(e) => handleKeyDown(e, auspiciador)}
                tabIndex={hasWebsite ? 0 : -1}
                role={hasWebsite ? "button" : "img"}
                aria-label={hasWebsite ? `Visitar sitio web de ${auspiciador.nombre}` : `Logo de ${auspiciador.nombre}`}
              >
                <div className="aspect-video relative overflow-hidden rounded-md bg-gray-50">
                  {!hasImageError ? (
                    <img
                      src={auspiciador.imagen || "/placeholder.svg"}
                      alt={`Logo de ${auspiciador.nombre}`}
                      className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
                      onError={() => handleImageError(auspiciador.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <span className="text-xs text-center px-2">{auspiciador.nombre}</span>
                    </div>
                  )}

                  {/* Hover overlay for clickable sponsors */}
                  {hasWebsite && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2 shadow-lg">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sponsor name */}
                <div className="mt-2 text-center">
                  <h3 className="text-xs font-medium text-gray-900 line-clamp-2">{auspiciador.nombre}</h3>
                  {hasWebsite && (
                    <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Visitar sitio
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
