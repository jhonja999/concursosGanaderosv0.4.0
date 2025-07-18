"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MilkIcon as Cow, Tag, Play, Pause } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

interface GanadoItem {
  id: string;
  nombre: string;
  raza: string | null;
  imagenUrl: string | null;
}

interface GanadoSliderProps {
  ganado: GanadoItem[];
}

// Componente mejorado para manejar imágenes con error handling
function ImageWithFallback({
  src,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Si no hay src o hay error, mostrar fallback con gradiente
  if (!src || imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-green-500 to-blue-500 flex items-center justify-center relative">
        <Cow className="h-16 w-16 text-white opacity-90" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-blue-500 flex items-center justify-center animate-pulse">
          <Cow className="h-16 w-16 text-white opacity-70" />
        </div>
      )}
      <Image
        alt={alt}
        className={`${className} ${
          imageLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        fill={fill}
        src={src || "/placeholder.svg"}
        sizes={sizes}
        priority={priority}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export default function GanadoSlider({ ganado }: GanadoSliderProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  const toggleAutoplay = () => {
    if (swiperInstance) {
      if (isPlaying) {
        swiperInstance.autoplay.stop();
      } else {
        swiperInstance.autoplay.start();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-8 md:mb-12 lg:mb-16">
          <div className="space-y-3 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <Cow className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Ejemplares Destacados
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Ganado Destacado
            </h2>
            <p className="mx-auto text-gray-600 dark:text-gray-300 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed">
              Conoce los ejemplares más destacados de nuestros concursos
              ganaderos
            </p>
          </div>
        </div>

        {/* Slider Section */}
        {ganado.length > 0 ? (
          <div className="relative max-w-6xl mx-auto">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              centeredSlides={true}
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
                  centeredSlides: false,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                  centeredSlides: false,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 28,
                  centeredSlides: false,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 32,
                  centeredSlides: false,
                },
              }}
              onSwiper={setSwiperInstance}
              className="ganado-slider px-4 sm:px-0"
            >
              {ganado.map((animal) => (
                <SwiperSlide key={animal.id} className="flex justify-center">
                  <Link
                    href={`/ganado/${animal.id}`}
                    className="group block w-full max-w-sm mx-auto"
                  >
                    <Card className="flex flex-col h-full rounded-2xl border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group-hover:border-emerald-500/50 overflow-hidden">
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                        <ImageWithFallback
                          src={animal.imagenUrl || "/placeholder.svg"}
                          alt={`${animal.nombre} - ${animal.raza || "Ganado"}`}
                          className="transition-transform duration-700 group-hover:scale-110"
                          fill={true}
                          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
                          priority={false}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Badge */}
                        <div className="absolute top-3 right-3 transform translate-x-1 group-hover:translate-x-0 transition-transform duration-300">
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg px-2.5 py-1 text-xs font-semibold rounded-full">
                            Destacado
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4 flex flex-col flex-1 space-y-3">
                        <div className="space-y-2">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                            {animal.nombre}
                          </h3>
                        </div>

                        <div className="flex flex-col gap-2 mt-auto">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full">
                              <Tag className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Ganado
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                              <Cow className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
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

            {/* Custom Navigation Buttons - Más cerca de las cards */}
            <div className="swiper-button-prev-custom absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-300 hover:scale-110">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>

            <div className="swiper-button-next-custom absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-300 hover:scale-110">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            {/* Custom Pagination with Play/Pause - CENTRADO CORRECTAMENTE */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
              <div className="swiper-pagination-custom flex justify-center items-center gap-2" />

              <Button
                onClick={toggleAutoplay}
                variant="outline"
                size="icon"
                className="w-9 h-9 p-0 rounded-full border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30 bg-transparent"
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
          <div className="text-center py-12 md:py-16">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cow className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No hay ganado destacado
              </h3>
              <p className="text-gray-500 mb-6">
                Próximamente tendremos nuevos ejemplares destacados
              </p>
            </div>
          </div>
        )}

        {/* Call to Action - Más cerca */}
        <div className="flex justify-center mt-8 md:mt-12">
          <Link href="/ganado">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Ver todo el ganado
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .ganado-slider .swiper-pagination-bullet-custom {
          width: 10px;
          height: 10px;
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

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .ganado-slider .swiper-slide {
            display: flex;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
