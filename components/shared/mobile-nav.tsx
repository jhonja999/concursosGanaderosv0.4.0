"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Trophy, Calendar, Award, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Inicio",
    href: "/",
    icon: Home,
    description: "Página principal",
  },
  {
    name: "Concursos",
    href: "/concursos",
    icon: Trophy,
    description: "Ver todos los concursos",
  },
  {
    name: "Programación",
    href: "/programacion",
    icon: Calendar,
    description: "Horarios y eventos",
  },
  {
    name: "Ganadores",
    href: "/ganadores",
    icon: Award,
    description: "Salón de la fama",
  },
  {
    name: "Contacto",
    href: "/contacto",
    icon: Phone,
    description: "Información de contacto",
  },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden h-12 w-12 p-0 hover:bg-green-100" size="sm">
          <Menu className="h-6 w-6 text-gray-700" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 pb-4 border-b bg-green-50">
          <SheetTitle className="text-left text-xl font-bold text-green-800">Lo Mejor de Mi Tierra</SheetTitle>
          <p className="text-left text-sm text-green-600">Concursos Ganaderos - Cajamarca</p>
        </SheetHeader>

        <nav className="flex flex-col p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-green-50 border-b border-gray-100 last:border-b-0",
                  isActive ? "bg-green-100 text-green-700" : "text-gray-700 hover:text-green-600",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg",
                    isActive ? "bg-green-200" : "bg-gray-100",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Información de contacto en el menú móvil */}
        <div className="mt-auto p-4 border-t bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800">Campo Ferial de Cajamarca</p>
            <p className="text-xs text-gray-600">Lun-Sáb: 7:00 AM - 5:00 PM</p>
            <p className="text-xs text-gray-600">(076) 123-456</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
