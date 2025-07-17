"use client"

import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, Mountain, ChevronUp } from "lucide-react"

export function SiteFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-gray-900 text-white relative">
      {/* Botón Volver Arriba con Llama */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg p-0"
        size="sm"
      >
        <div className="flex flex-col items-center">
          <ChevronUp className="h-6 w-6" />
          <span className="text-xs">🦙</span>
        </div>
        <span className="sr-only">Volver arriba</span>
      </Button>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <Logo className="text-white mb-4" size="lg" href="/" />
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              La plataforma líder para concursos ganaderos en Cajamarca, conectando criadores, participantes y
              organizadores en la región ganadera más importante del norte peruano.
            </p>
            <div className="flex items-center gap-2 text-green-400">
              <Mountain className="h-5 w-5" />
              <span className="font-semibold">Cajamarca - 2,750 msnm</span>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">Enlaces Rápidos</h3>
            <nav className="space-y-3">
              <Link href="/" className="block text-gray-300 hover:text-white transition-colors">
                Inicio
              </Link>
              <Link href="/concursos" className="block text-gray-300 hover:text-white transition-colors">
                Concursos
              </Link>
              <Link href="/programacion" className="block text-gray-300 hover:text-white transition-colors">
                Programación
              </Link>
              <Link href="/ganadores" className="block text-gray-300 hover:text-white transition-colors">
                Ganadores
              </Link>
              <Link href="/contacto" className="block text-gray-300 hover:text-white transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Campo Ferial de Cajamarca</p>
                  <p className="text-gray-300 text-sm">Cajamarca, Perú</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">(076) 123-456</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">info@lomejordemitierra.pe</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Horario de Atención</p>
                  <p className="text-gray-300 text-sm">Lun-Sáb: 7:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 Lo Mejor de Mi Tierra. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm text-center md:text-right">
              Desarrollado con ❤️ para los ganaderos de Cajamarca
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
