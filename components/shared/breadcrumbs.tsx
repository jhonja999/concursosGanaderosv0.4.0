"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Si no se proporcionan items, generar automáticamente desde la URL
  const breadcrumbItems = items || generateBreadcrumbs(pathname)

  if (breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav className={cn("flex items-center space-x-2 text-sm text-gray-600 mb-6", className)}>
      <Link href="/" className="flex items-center gap-1 hover:text-green-600 transition-colors">
        <Home className="h-4 w-4" />
        <span>Inicio</span>
      </Link>

      {breadcrumbItems.slice(1).map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-green-600 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }]

  let currentPath = ""

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Mapear segmentos a nombres legibles
    const segmentNames: Record<string, string> = {
      concursos: "Concursos",
      programacion: "Programación",
      ganadores: "Ganadores",
      contacto: "Contacto",
      participantes: "Participantes",
      admin: "Administración",
      dashboard: "Panel de Control",
    }

    const label = segmentNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  })

  return breadcrumbs
}
