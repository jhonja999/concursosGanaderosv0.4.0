"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { ArrowUp } from "lucide-react"

export function SiteFooter() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user has scrolled 3/4 of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const maxScroll = scrollHeight - clientHeight
      const scrollPercentage = scrollTop / maxScroll
      
      // Show button when user has scrolled 55% of the page
      setShowBackToTop(scrollPercentage >= 0.55)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <Logo size="md" className="mb-4" href="/" />
              <p className="text-gray-300 dark:text-gray-400 text-sm md:text-base">
                La plataforma líder para concursos ganaderos en Perú.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Producto</h4>
              <ul className="space-y-2 text-gray-300 dark:text-gray-400">
                <li>
                  <Link href="/concursos" className="hover:text-white transition-colors text-sm md:text-base">
                    Concursos
                  </Link>
                </li>
                <li>
                  <Link href="/ganadores" className="hover:text-white transition-colors text-sm md:text-base">
                    Ganadores
                  </Link>
                </li>
                <li>
                  <Link href="/programacion" className="hover:text-white transition-colors text-sm md:text-base">
                    Programación
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Empresa</h4>
              <ul className="space-y-2 text-gray-300 dark:text-gray-400">
                <li>
                  <Link href="/nosotros" className="hover:text-white transition-colors text-sm md:text-base">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-white transition-colors text-sm md:text-base">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors text-sm md:text-base">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Soporte</h4>
              <ul className="space-y-2 text-gray-300 dark:text-gray-400">
                <li>
                  <Link href="/ayuda" className="hover:text-white transition-colors text-sm md:text-base">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" className="hover:text-white transition-colors text-sm md:text-base">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-white transition-colors text-sm md:text-base">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* Línea divisoria */}
          <div className="border-t border-gray-700 dark:border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center md:text-left">
                © 2025 Lo Mejor de Mi Tierra. Todos los derechos reservados.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center md:text-right">
                Desarrollado con ❤️ para los ganaderos de Cajamarca
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button with Llama */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-300 hover:scale-110"
          size="sm"
        >
          <div className="relative flex items-center justify-center w-full h-full">
            <ArrowUp className="h-7 w-7 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 text-xs leading-none">🦙</span>
          </div>
          <span className="sr-only">Volver arriba</span>
        </Button>
      )}
    </>
  )
}