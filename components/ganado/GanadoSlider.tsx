"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MilkIcon as Cow, Tag, Play, Pause } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/autoplay"

interface GanadoItem {
  id: string
  nombre: string
  raza: string | null
  imagenUrl: string | null
}

interface GanadoSliderProps {
  ganado: GanadoItem[]
}

// Componente para manejar imágenes con error handling
function ImageWithFallback({
  src,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
  fallbackContent,
}: {
  src: string
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  fallbackContent?: React.ReactNode
}) {
  return (
    <div className="relative w-full h-full">
      <Image
        alt={alt}
        className={className}
        fill={fill}
        src={src || "/placeholder.svg"}
        sizes={sizes}
        priority={priority}
        style={{
          objectFit: "cover",
        }}
      />
      {fallbackContent && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 items-center justify-center flex">
          {fallbackContent}
        </div>
      )}
    </div>
  )
}

export default function GanadoSlider({ ganado }: GanadoSliderProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)

  const toggleAutoplay = () => {
    if (swiperInstance) {
      if (isPlaying) {
        swiperInstance.autoplay.stop()
      } else {
        swiperInstance.autoplay.start()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <section className="w-full py-16 md:py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center space-y-6 mb-12 md:mb-16 lg:mb-20">
          <div className="space-y-4 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <Cow className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Ejemplares Destacados</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Ganado Destacado
            </h2>
            <p className="mx-auto text-gray-600 dark:text-gray-300 text-lg md:text-xl lg:text-2xl max-w-3xl leading-relaxed">
              Conoce los ejemplares más destacados de nuestros concursos ganaderos
            </p>
          </div>
        </div>

        {/* Slider Section */}
        {ganado.length > 0 ? (
          <div className="relative max-w-7xl mx-auto">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              pagination={{
                el: ".swiper-pagination-custom",
                clickable: true,
                bulletClass: "swiper-pagination-bullet-custom",
                bulletActiveClass: "swiper-pagination-bullet-active-custom",
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={ganado.length > 1}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 28,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 32,
                },
              }}
              onSwiper={setSwiperInstance}
              className="ganado-slider"
            >
              {ganado.map((animal) => (
                <SwiperSlide key={animal.id}>
                  <Link href={`/ganado/${animal.id}`} className="group block h-full">
                    <Card className="flex flex-col h-full rounded-2xl border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group-hover:border-emerald-500/50 overflow-hidden">
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden">
                        {animal.imagenUrl ? (
                          <ImageWithFallback
                            src={animal.imagenUrl || "/placeholder.svg"}
                            alt={animal.nombre}
                            className="transition-transform duration-700 group-hover:scale-110"
                            fill={true}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            fallbackContent={<Cow className="h-20 w-20 text-white opacity-80" />}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-green-500 to-blue-600 flex items-center justify-center">
                            <Cow className="h-20 w-20 text-white opacity-80" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Badge */}
                        <div className="absolute top-4 right-4 transform translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg px-3 py-1 text-sm font-semibold">
                            Destacado
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-6 flex flex-col flex-1 space-y-4">
                        <div className="space-y-3">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                            {animal.nombre}
                          </h3>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">
                              <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ganado</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                              <Cow className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {animal.raza || "Raza no especificada"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-300 hover:scale-110">
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>

            <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-300 hover:scale-110">
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Custom Pagination with Play/Pause */}
            <div className="flex items-center justify-center gap-4 mt-8 md:mt-12">
              <div className="swiper-pagination-custom flex items-center gap-2"></div>

              <Button
                onClick={toggleAutoplay}
                variant="outline"
                size="sm"
                className="ml-4 w-10 h-10 p-0 rounded-full border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30 bg-transparent"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 md:py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cow className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-400 mb-3">No hay ganado destacado</h3>
              <p className="text-gray-500 mb-8">Próximamente tendremos nuevos ejemplares destacados</p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="flex justify-center mt-12 md:mt-16">
          <Link href="/ganado">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Ver todo el ganado
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .ganado-slider .swiper-pagination-bullet-custom {
          width: 12px;
          height: 12px;
          background: rgb(156 163 175);
          border-radius: 50%;
          opacity: 1;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .ganado-slider .swiper-pagination-bullet-active-custom {
          background: rgb(5 150 105);
          transform: scale(1.2);
        }
        
        .ganado-slider .swiper-pagination-bullet-custom:hover {
          background: rgb(5 150 105);
          transform: scale(1.1);
        }
        
        .dark .ganado-slider .swiper-pagination-bullet-custom {
          background: rgb(75 85 99);
        }
        
        .dark .ganado-slider .swiper-pagination-bullet-active-custom {
          background: rgb(16 185 129);
        }
        
        .dark .ganado-slider .swiper-pagination-bullet-custom:hover {
          background: rgb(16 185 129);
        }
      `}</style>
    </section>
  )
}
