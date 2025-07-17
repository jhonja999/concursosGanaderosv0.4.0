"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Trophy, Calendar, Award, Phone } from "lucide-react"

const navigation = [
  {
    name: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    name: "Concursos",
    href: "/concursos",
    icon: Trophy,
  },
  {
    name: "Programación",
    href: "/programacion",
    icon: Calendar,
  },
  {
    name: "Ganadores",
    href: "/ganadores",
    icon: Award,
  },
  {
    name: "Contacto",
    href: "/contacto",
    icon: Phone,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-base font-semibold transition-colors hover:text-green-600 px-3 py-2 rounded-lg hover:bg-green-50",
              isActive ? "text-green-600 bg-green-50" : "text-gray-700",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
