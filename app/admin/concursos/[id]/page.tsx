"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit3, CalendarDays, Building2, ClipboardList, Users, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { toast } from "sonner"

interface ContestDetails {
  id: string
  nombre: string
  // Add other relevant fields if needed for display
}

interface NavLinkItem {
  href: string
  title: string
  description: string
  icon: React.ElementType
  disabled?: boolean
  disabledMessage?: string
}

export default function ContestDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string

  const [contest, setContest] = useState<ContestDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (contestId) {
      const fetchContestDetails = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const response = await fetch(`/api/admin/concursos/${contestId}`)
          if (!response.ok) {
            if (response.status === 404) {
              setError("Concurso no encontrado.")
              toast.error("El concurso solicitado no existe.")
            } else {
              const errorData = await response.json()
              setError(errorData.message || "Error al cargar los detalles del concurso.")
              toast.error(errorData.message || "Error al cargar los detalles del concurso.")
            }
            setContest(null)
            return
          }
          const data = await response.json()
          setContest(data.contest)
        } catch (err) {
          console.error("Failed to fetch contest details:", err)
          setError("Ocurrió un error inesperado.")
          toast.error("Ocurrió un error inesperado al cargar el concurso.")
          setContest(null)
        } finally {
          setIsLoading(false)
        }
      }
      fetchContestDetails()
    }
  }, [contestId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-semibold">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/admin/concursos">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista de concursos
          </Link>
        </Button>
      </div>
    )
  }

  if (!contest) {
    // This case should ideally be covered by error handling, but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <p>No se pudo cargar la información del concurso.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/concursos">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista de concursos
          </Link>
        </Button>
      </div>
    )
  }

  const navLinks: NavLinkItem[] = [
    {
      href: `/admin/concursos/${contestId}/editar`,
      title: "Editar Información",
      description: "Modificar los detalles básicos del concurso.",
      icon: Edit3,
    },
    {
      href: `/admin/concursos/${contestId}/eventos`,
      title: "Gestionar Agenda",
      description: "Administrar el cronograma y eventos del concurso.",
      icon: CalendarDays,
    },
    {
      href: `/admin/concursos/${contestId}/auspiciadores`,
      title: "Gestionar Auspiciadores",
      description: "Añadir o editar los patrocinadores del concurso.",
      icon: Building2,
    },
    {
      href: `/admin/concursos/${contestId}/categorias`,
      title: "Gestionar Categorías",
      description: "Definir y administrar las categorías de participación.",
      icon: ClipboardList,
      // disabled: false, // Link is now active
    },
    {
      href: `/admin/concursos/${contestId}/participantes`,
      title: "Gestionar Participantes",
      description: "Registrar y administrar animales o productos inscritos.",
      icon: Users,
      // disabled: false, // Link is now active, points to placeholder
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/concursos")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gestionar Concurso</h1>
            <p className="text-muted-foreground truncate max-w-md" title={contest.nombre}>
              {contest.nombre}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {navLinks.map((item) => (
          <Card
            key={item.title}
            className={`hover:shadow-lg transition-shadow ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Link href={item.disabled ? "#" : item.href} passHref legacyBehavior>
              <a className={`block ${item.disabled ? "pointer-events-none" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                  <item.icon className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.disabled && item.disabledMessage && (
                    <p className="text-xs text-amber-600 mt-1">{item.disabledMessage}</p>
                  )}
                </CardContent>
              </a>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
