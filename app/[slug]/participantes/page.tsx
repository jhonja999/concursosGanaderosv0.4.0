"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { GanadoCard } from "@/components/ganado/ganado-card"
import { GanadoFilters } from "@/components/ganado/ganado-filters"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { GanadoDetailModal } from "@/components/ganado/ganado-detail-modal"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { GanadoListTable } from "@/components/ganado/ganado-list-table"

interface Ganado {
  id: string
  nombre: string
  tipoAnimal: string
  raza: string
  sexo: "MACHO" | "HEMBRA"
  fechaNacimiento: Date
  pesoKg: number
  imagenUrl?: string
  enRemate: boolean
  precioBaseRemate?: number
  isDestacado: boolean
  isGanador: boolean
  premiosObtenidos: string[]
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
  establo?: {
    id: string
    nombre: string
    ubicacion?: string
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
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    raza: searchParams.get("raza") || "all",
    categoria: searchParams.get("categoria") || "all",
    tipoAnimal: searchParams.get("tipoAnimal") || "all",
    sexo: searchParams.get("sexo") || "all",
    estado: searchParams.get("estado") || "all",
    ordenar: searchParams.get("ordenar") || "createdAt",
  })
  const [viewMode, setViewMode] = useState<"cards" | "list">("list")

  // Ref para evitar múltiples requests simultáneos y para almacenar la última URL de búsqueda
  const fetchingRef = useRef(false)
  const lastFetchUrlRef = useRef<string>("")

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

    // Construir los parámetros de URL basados en el estado actual de los filtros
    const currentUrlParams = new URLSearchParams(searchParams.toString())

    // Mapear el filtro 'categoria' de la UI a 'categoriaId' para la API
    const selectedCategory = data?.filters?.categories.find((cat) => cat.nombre === filters.categoria)
    if (filters.categoria && filters.categoria !== "all" && selectedCategory) {
      currentUrlParams.set("categoriaId", selectedCategory.id)
    } else {
      currentUrlParams.delete("categoriaId")
    }

    // Mapear el filtro 'estado' de la UI a los parámetros booleanos de la API
    currentUrlParams.delete("enRemate")
    currentUrlParams.delete("isDestacado")
    currentUrlParams.delete("isGanador")

    if (filters.estado === "remate") {
      currentUrlParams.set("enRemate", "true")
    } else if (filters.estado === "destacado") {
      currentUrlParams.set("isDestacado", "true")
    } else if (filters.estado === "ganador") {
      currentUrlParams.set("isGanador", "true")
    }

    // Añadir otros filtros
    if (filters.search) currentUrlParams.set("search", filters.search)
    else currentUrlParams.delete("search")

    if (filters.raza && filters.raza !== "all") currentUrlParams.set("raza", filters.raza)
    else currentUrlParams.delete("raza")

    if (filters.tipoAnimal && filters.tipoAnimal !== "all") currentUrlParams.set("tipoAnimal", filters.tipoAnimal)
    else currentUrlParams.delete("tipoAnimal")

    if (filters.sexo && filters.sexo !== "all") currentUrlParams.set("sexo", filters.sexo)
    else currentUrlParams.delete("sexo")

    if (filters.ordenar && filters.ordenar !== "createdAt") currentUrlParams.set("sortBy", filters.ordenar)
    else currentUrlParams.delete("sortBy")

    // Asegurar que la paginación se pasa correctamente
    const currentPage = Number.parseInt(searchParams.get("page") || "1")
    currentUrlParams.set("page", currentPage.toString())

    const queryString = currentUrlParams.toString()
    const fetchKey = `/${slug}/participantes${queryString ? `?${queryString}` : ""}`

    if (lastFetchUrlRef.current === fetchKey) {
      console.log("Skipping redundant fetch:", fetchKey)
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      setError(false)

      console.log(`Fetching participantes for: ${fetchKey}`)

      const url = `/api/concursos/${slug}/participantes${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      const processedData: ParticipantesData = {
        ganado: Array.isArray(result.ganado) ? result.ganado : [],
        contest: result.contest || { id: "", nombre: "Concurso" },
        pagination: {
          page: result.pagination?.page || 1,
          limit: result.pagination?.limit || 20,
          total: result.pagination?.total || 0,
          pages: result.pagination?.pages || 1,
        },
        filters: {
          categories: Array.isArray(result.filters?.categories) ? result.filters.categories : [],
          breeds: Array.isArray(result.filters?.breeds) ? result.filters.breeds : [],
          animalTypes: Array.isArray(result.filters?.animalTypes) ? result.filters.animalTypes : [],
        },
      }

      setData(processedData)
      lastFetchUrlRef.current = fetchKey

      console.log(`Successfully fetched participantes for: ${fetchKey}`, processedData)
    } catch (error) {
      console.error("Error fetching participantes:", error)
      setError(true)
      setData(null)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [slug, searchParams, filters, data?.filters?.categories])

  // Efecto para sincronizar filtros desde la URL al estado local
  useEffect(() => {
    const currentFilters = {
      search: searchParams.get("search") || "",
      raza: searchParams.get("raza") || "all",
      categoria: data?.filters?.categories.find((cat) => cat.id === searchParams.get("categoriaId"))?.nombre || "all",
      tipoAnimal: searchParams.get("tipoAnimal") || "all",
      sexo: searchParams.get("sexo") || "all",
      estado:
        searchParams.get("enRemate") === "true"
          ? "remate"
          : searchParams.get("isDestacado") === "true"
            ? "destacado"
            : searchParams.get("isGanador") === "true"
              ? "ganador"
              : "all",
      ordenar: searchParams.get("sortBy") || "createdAt",
    }
    setFilters(currentFilters)
  }, [searchParams, data?.filters?.categories])

  // Fetch data cuando cambie el slug o searchParams, pero con debounce
  useEffect(() => {
    if (!slug) return

    const timeoutId = setTimeout(() => {
      fetchParticipantes()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [slug, fetchParticipantes])

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      if (!slug) return

      const urlParams = new URLSearchParams(searchParams.toString())

      // Actualiza o elimina cada filtro según el nuevo estado
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "" && value !== "all") {
          if (key === "categoria") {
            const categoryId = data?.filters?.categories.find((cat) => cat.nombre === value)?.id
            if (categoryId) {
              urlParams.set("categoriaId", categoryId)
            } else {
              urlParams.delete("categoriaId")
            }
          } else if (key === "estado") {
            urlParams.delete("enRemate")
            urlParams.delete("isDestacado")
            urlParams.delete("isGanador")
            if (value === "remate") {
              urlParams.set("enRemate", "true")
            } else if (value === "destacado") {
              urlParams.set("isDestacado", "true")
            } else if (value === "ganador") {
              urlParams.set("isGanador", "true")
            }
          } else if (key === "ordenar") {
            urlParams.set("sortBy", value)
          } else {
            urlParams.set(key, value as string)
          }
        } else {
          if (key === "categoria") urlParams.delete("categoriaId")
          else if (key === "estado") {
            urlParams.delete("enRemate")
            urlParams.delete("isDestacado")
            urlParams.delete("isGanador")
          } else if (key === "ordenar") {
            urlParams.delete("sortBy")
          } else urlParams.delete(key)
        }
      })

      const currentPage = Number.parseInt(urlParams.get("page") || "1")
      if (
        (newFilters.search !== filters.search ||
          newFilters.raza !== filters.raza ||
          newFilters.categoria !== filters.categoria ||
          newFilters.tipoAnimal !== filters.tipoAnimal ||
          newFilters.sexo !== filters.sexo ||
          newFilters.estado !== filters.estado ||
          newFilters.ordenar !== filters.ordenar) &&
        currentPage !== 1
      ) {
        urlParams.set("page", "1")
      }

      const queryString = urlParams.toString()
      const newUrl = `/${slug}/participantes${queryString ? `?${queryString}` : ""}`

      // Comparar con la URL actual usando window.location
      const currentUrl = `${window.location.pathname}${window.location.search}`
      if (currentUrl !== newUrl) {
        router.push(newUrl)
      } else {
        fetchParticipantes()
      }
      setFilters(newFilters)
    },
    [slug, router, searchParams, filters, data?.filters?.categories, fetchParticipantes],
  )

  const handleViewDetails = useCallback((animal: Ganado) => {
    setSelectedGanado(animal)
    setIsModalOpen(true)
  }, [])

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

  // Define las opciones de estado disponibles para la página de concurso
  const allowedStatesForFilters = [
    { value: "all", label: "Todos los estados" },
    { value: "remate", label: "En Remate" },
    { value: "destacado", label: "Destacado" },
    { value: "ganador", label: "Ganador" },
  ]

  // Loading inicial mientras resolvemos params o si no hay datos
  if (!slug || (loading && !data)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent>
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 font-baloo">
                Error al cargar
              </h3>
              <p className="text-gray-600 dark:text-gray-300">No se pudieron cargar los participantes del concurso.</p>
              <Button
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
                onClick={() => {
                  lastFetchUrlRef.current = ""
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

  const { ganado, contest, pagination, filters: availableFilters } = data

  // Transformar datos para asegurar compatibilidad de tipos
  const ganadoWithRealData = ganado.map((animal) => ({
    ...animal,
    // Asegurar que los campos requeridos tengan valores por defecto
    tipoAnimal: animal.tipoAnimal || "Bovino",
    pesoKg: Number(animal.pesoKg) || 0,
    isGanador: Boolean(animal.isGanador),
    premiosObtenidos: animal.premiosObtenidos || [],
    fechaNacimiento: new Date(animal.fechaNacimiento),
    createdAt: animal.createdAt ? new Date(animal.createdAt) : new Date(),
    puntaje: animal.puntaje ? Number(animal.puntaje) : undefined,
    precioBaseRemate: animal.precioBaseRemate ? Number(animal.precioBaseRemate) : undefined,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-baloo">Participantes</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{contest.nombre}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <GanadoFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableFilters={availableFilters}
            allowedStates={allowedStatesForFilters}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Selector de Vista */}
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value: "cards" | "list") => value && setViewMode(value)}
          aria-label="Seleccionar vista"
        >
          <ToggleGroupItem
            value="list"
            aria-label="Vista de lista"
            className="data-[state=on]:bg-blue-500 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600"
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="cards"
            aria-label="Vista de tarjetas"
            className="data-[state=on]:bg-blue-500 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600"
          >
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {!loading && ganado.length === 0 ? (
          <Card className="text-center py-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent>
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <div className="text-6xl mb-4">🐄</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 font-baloo">
                  No hay participantes
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No se encontraron animales registrados con los filtros seleccionados.
                </p>
                <Button
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
                  onClick={() =>
                    handleFiltersChange({
                      ...filters,
                      search: "",
                      raza: "all",
                      categoria: "all",
                      tipoAnimal: "all",
                      sexo: "all",
                      estado: "all",
                    })
                  }
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          !loading && (
            <>
              {/* Grid de participantes */}
              {viewMode === "cards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {ganadoWithRealData.map((animal) => (
                    <GanadoCard
                      key={animal.id}
                      ganado={animal}
                      variant="public"
                      onViewDetails={() => handleViewDetails(animal)}
                      onContact={() => handleContact(animal.id)}
                    />
                  ))}
                </div>
              )}

              {/* Vista de tabla */}
              {viewMode === "list" && (
                <GanadoListTable
                  ganado={ganadoWithRealData}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onViewDetails={handleViewDetails}
                />
              )}

              {/* Paginación */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                          className={
                            pageNum === pagination.page
                              ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
                              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }
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
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
