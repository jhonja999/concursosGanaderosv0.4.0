"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GanadoCard } from "@/components/ganado/ganado-card"
import { GanadoFilters } from "@/components/ganado/ganado-filters"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { GanadoDetailModal } from "@/components/ganado/ganado-detail-modal"

interface Ganado {
  id: string
  nombre: string
  tipoAnimal?: string
  raza: string
  sexo: "MACHO" | "HEMBRA"
  fechaNacimiento: Date
  pesoKg: number
  imagenUrl?: string
  enRemate: boolean
  precioBaseRemate?: number
  isDestacado: boolean
  isGanador?: boolean
  premiosObtenidos?: string[]
  numeroFicha?: string
  puntaje?: number
  createdAt?: Date
  propietario: {
    nombreCompleto: string
    telefono?: string
    email?: string
  }
  expositor?: {
    nombreCompleto: string
    empresa?: string
  }
  contestCategory: {
    id: string
    nombre: string
  }
  contest: {
    nombre: string
    tipoPuntaje?: "NUMERICO" | "POSICION" | "CALIFICACION" | "PUNTOS"
  }
}

interface Contest {
  id: string
  nombre: string
}

interface ParticipantesData {
  ganado: Ganado[]
  contest: Contest
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    categories: Array<{ id: string; nombre: string }>
    breeds: string[]
    animalTypes: string[]
  }
}

export default function ParticipantesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [slug, setSlug] = useState<string>("")
  const [data, setData] = useState<ParticipantesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGanado, setSelectedGanado] = useState<Ganado | null>(null)

  // Ref para evitar múltiples requests simultáneos
  const fetchingRef = useRef(false)
  const lastFetchRef = useRef<string>("")

  // Resolver params de forma asíncrona
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    resolveParams()
  }, [params])

  const fetchParticipantes = useCallback(async () => {
    if (!slug || fetchingRef.current) return

    // Crear una clave única para esta request
    const currentParams = searchParams.toString()
    const fetchKey = `${slug}-${currentParams}`

    // Si ya hicimos esta misma request, no la repetimos
    if (lastFetchRef.current === fetchKey) {
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)

      console.log(`Fetching participantes for: ${fetchKey}`)

      const queryParams = new URLSearchParams(currentParams)
      const queryString = queryParams.toString()
      const url = `/api/concursos/${slug}/participantes${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        cache: "no-store",
      })

      if (!response.ok) {
        setError(true)
        return
      }

      const result = await response.json()
      setData(result)
      setError(false)
      lastFetchRef.current = fetchKey

      console.log(`Successfully fetched participantes for: ${fetchKey}`)
    } catch (error) {
      console.error("Error fetching participantes:", error)
      setError(true)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [slug, searchParams])

  // Fetch data cuando cambie el slug o searchParams, pero con debounce
  useEffect(() => {
    if (!slug) return

    const timeoutId = setTimeout(() => {
      fetchParticipantes()
    }, 100) // Pequeño debounce para evitar requests múltiples

    return () => clearTimeout(timeoutId)
  }, [slug, fetchParticipantes])

  const handleFiltersChange = useCallback(
    (newFilters: any) => {
      if (!slug) return

      const urlParams = new URLSearchParams()

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "" && value !== "all") {
          urlParams.set(key, value as string)
        }
      })

      const queryString = urlParams.toString()
      const newUrl = `/${slug}/participantes${queryString ? `?${queryString}` : ""}`

      router.push(newUrl)
    },
    [slug, router],
  )

  const handleViewDetails = useCallback(
    (id: string) => {
      const animal = data?.ganado.find((g) => g.id === id)
      if (animal) {
        setSelectedGanado(animal)
        setIsModalOpen(true)
      }
    },
    [data],
  )

  const handleContact = useCallback((id: string) => {
    console.log("Contactar:", id)
    // TODO: Implementar contacto
  }, [])

  const handlePageChange = useCallback(
    (page: number) => {
      const urlParams = new URLSearchParams(searchParams.toString())
      urlParams.set("page", String(page))
      router.push(`/${slug}/participantes?${urlParams.toString()}`)
    },
    [slug, searchParams, router],
  )

  // Loading inicial mientras resolvemos params
  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md mx-auto">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold mb-2">Error al cargar</h3>
              <p>No se pudieron cargar los participantes del concurso.</p>
              <Button
                className="mt-4"
                onClick={() => {
                  lastFetchRef.current = ""
                  fetchParticipantes()
                }}
              >
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { ganado, contest, pagination, filters } = data

  // Transformar datos para asegurar compatibilidad de tipos
  const ganadoWithRealData = ganado.map((animal) => ({
    ...animal,
    isGanador: Boolean(animal.isGanador), // Asegurar que sea boolean
    premiosObtenidos: animal.premiosObtenidos || [], // Asegurar que sea array
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Concurso
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Participantes</h1>
              <p className="text-gray-600 mt-1">{contest.nombre}</p>
              <p className="text-sm text-gray-500 mt-1">
                {pagination.total} {pagination.total === 1 ? "participante" : "participantes"} registrados
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Página {pagination.page} de {pagination.pages}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <GanadoFilters
            onFiltersChange={handleFiltersChange}
            categories={filters.categories}
            breeds={filters.breeds}
            animalTypes={filters.animalTypes}
            loading={loading}
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {!loading && ganado.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <div className="text-6xl mb-4">🐄</div>
                <h3 className="text-xl font-semibold mb-2">No hay participantes</h3>
                <p>No se encontraron animales registrados con los filtros seleccionados.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          !loading && (
            <>
              {/* Grid de participantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {ganadoWithRealData.map((animal) => (
                  <GanadoCard
                    key={animal.id}
                    ganado={animal}
                    variant="public"
                    onViewDetails={() => handleViewDetails(animal.id)}
                    onContact={() => handleContact(animal.id)}
                  />
                ))}
              </div>

              {/* Paginación */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )
        )}
      </div>

      {isModalOpen && selectedGanado && (
        <GanadoDetailModal ganado={selectedGanado} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
