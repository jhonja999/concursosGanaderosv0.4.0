"use client"

import { useState, useEffect } from "react"
// Badge removed from hero summary; kept minimal
import { Button } from "@/components/ui/button"
import { Users, Building2, Trophy, ArrowRight, Mountain, Badge } from "lucide-react"
import Link from "next/link"
import ContestCard from "@/components/ContestCard"
import { Logo } from "@/components/shared/logo"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ContestFilters } from "@/components/shared/contest-filters"

interface Contest {
  id: string
  nombre: string
  slug: string
  descripcion: string
  imagenPrincipal?: string | null
  status: string
  fechaInicio: string
  fechaFin?: string
  fechaInicioRegistro?: string
  fechaFinRegistro?: string
  ubicacion?: string
  cuotaInscripcion?: number
  tipoGanado?: string[]
  isActive: boolean
  participantCount: number
  company: {
    id: string
    nombre: string
    logo?: string
    descripcion?: string
    ubicacion?: string
  }
  createdAt: string
}

async function getContests(): Promise<Contest[]> {
  try {
    const response = await fetch("/api/concursos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch contests:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    return data.contests || []
  } catch (error) {
    console.error("Error fetching contests:", error)
    return []
  }
}

export default function ConcursosClientPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeContests, setActiveContests] = useState<Contest[]>([])
  const [finishedContests, setFinishedContests] = useState<Contest[]>([])
  // selectedStatus follows the API enum values or 'ALL'
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({ ALL: 0, PUBLICADO: 0, INSCRIPCIONES_ABIERTAS: 0, INSCRIPCIONES_CERRADAS: 0, EN_CURSO: 0, FINALIZADO: 0, CANCELADO: 0, BORRADOR: 0 })
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    setClientReady(true)
  }, [])

  useEffect(() => {
    const fetchContests = async () => {
      const contestsData = await getContests()
      // Sort by fechaInicio descending (latest first)
      const sortedContests = [...contestsData].sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
      setContests(sortedContests)
      // compute status counts from API `status` field and default filtered set
      const counts: Record<string, number> = { ALL: sortedContests.length, PUBLICADO: 0, INSCRIPCIONES_ABIERTAS: 0, INSCRIPCIONES_CERRADAS: 0, EN_CURSO: 0, FINALIZADO: 0, CANCELADO: 0, BORRADOR: 0 }
      sortedContests.forEach((c) => {
        const s = (c as any).status || 'PUBLICADO'
        if (counts[s] !== undefined) counts[s]++
        else counts[s] = 1
      })
      setStatusCounts(counts)

      // Default view: show all contests (historial)
      setFilteredContests(sortedContests)
      setSelectedStatus('ALL')
      setLoading(false)
    }
    fetchContests()
  }, [])

  // Update active/finished contests after filtering, only on client
  useEffect(() => {
    if (!clientReady) return
    const now = new Date()
    setActiveContests(
      filteredContests.filter((contest) => {
        const startDate = new Date(contest.fechaInicio)
        const endDate = contest.fechaFin ? new Date(contest.fechaFin) : null
        return !endDate || endDate >= now
      })
    )
    setFinishedContests(
      filteredContests.filter((contest) => {
        const endDate = contest.fechaFin ? new Date(contest.fechaFin) : null
        return endDate && endDate < now
      })
    )
  }, [filteredContests, clientReady])

  const handleFiltersChange = (filters: any) => {
    let filtered = [...contests]

    // Animal type filter: match any of the contest.tipoGanado array
    if (filters.animalType && filters.animalType !== 'all') {
      filtered = filtered.filter((contest) =>
        (contest.tipoGanado || []).some((tipo) => tipo.toLowerCase() === filters.animalType.toLowerCase()),
      )
    }

    // Location filter
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter((contest) => contest.ubicacion?.toLowerCase().includes(filters.location.toLowerCase()))
    }

    // Category filter: contest.categorias is an array
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((contest) => (contest as any).categorias?.some((c: string) => c === filters.category))
    }

    // Status filter (enum) - 'ALL' means no filtering
    if (clientReady && filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter((contest) => {
        const s = (contest as any).status || 'PUBLICADO'
        return s === filters.status
      })
    }

    // Sort filtered contests by fechaInicio descending (latest first)
    filtered.sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
    setFilteredContests(filtered)
  }

  if (loading || !clientReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 mx-auto text-green-600 mb-4 animate-pulse" />
          <p className="text-lg font-semibold text-gray-600">Cargando concursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - versión compacta en móvil */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-4 py-6 sm:py-10 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo pequeño en mobile */}
            <div className="flex justify-center mb-3">
              <Logo className="text-white" size="sm" href={null} />
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
              Concursos Ganaderos
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 opacity-95 leading-relaxed px-2">
              Los mejores concursos ganaderos de Cajamarca y la región norte del Perú
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 mb-4 sm:mb-6">
              {clientReady && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>{contests.length} Concursos</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{contests.reduce((acc, c) => acc + c.participantCount, 0)} Participantes</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{new Set(contests.map((c) => c.company.id)).size} Organizadores</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs />

        {/* Banner del clima */}
        {/* <WeatherBanner /> */}

        {contests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">No hay concursos disponibles</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Actualmente no hay concursos ganaderos programados en Cajamarca. ¡Vuelve pronto para ver las próximas
              competencias!
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Status tabs removed: status badges moved inside the filters panel to avoid duplicate controls */}

            {/* Filtros */}
            <ContestFilters
              onFiltersChange={handleFiltersChange}
              totalContests={contests.length}
              filteredCount={filteredContests.length}
              statusCounts={statusCounts}
            />

            {/* Concursos Activos */}
            {activeContests.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-1 h-8 bg-green-600 rounded-full" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Concursos Activos y Próximos</h2>
                  <Badge className="bg-green-600 text-white ml-2 px-3 py-1 text-sm font-bold">
                    {activeContests.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {activeContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </div>
              </section>
            )}

            {/* Concursos Finalizados */}
            {finishedContests.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-1 h-8 bg-gray-400 rounded-full" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Concursos Finalizados</h2>
                  <Badge className="ml-2 px-3 py-1 text-sm font-bold">
                    {finishedContests.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {finishedContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </div>
              </section>
            )}

            {/* Mensaje cuando no hay resultados filtrados */}
            {filteredContests.length === 0 && contests.length > 0 && (
              <div className="text-center py-16">
                <Trophy className="h-24 w-24 mx-auto text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">No se encontraron concursos</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  No hay concursos que coincidan con los filtros seleccionados. Intenta ajustar los criterios de
                  búsqueda.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
