"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GanadoFilters } from "@/components/ganado/ganado-filters"
import { GanadoCard } from "@/components/ganado/ganado-card"
import { GanadoDetailModal } from "@/components/ganado/ganado-detail-modal"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ImageGridSkeleton } from "@/components/shared/loading-skeleton"
import { AlertTriangle, MilkIcon as Cow, RefreshCw, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
  createdAt: Date
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

interface GanadoResponse {
  ganado: Ganado[]
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

export default function GanadoPage() {
  const router = useRouter()
  const [ganado, setGanado] = useState<Ganado[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [availableFilters, setAvailableFilters] = useState<{
    categories: Array<{ id: string; nombre: string }>
    breeds: string[]
    animalTypes: string[]
  }>({
    categories: [],
    breeds: [],
    animalTypes: [],
  })
  const [filters, setFilters] = useState({
    search: "",
    raza: "all",
    categoria: "all",
    tipoAnimal: "all",
    sexo: "all",
    estado: "all",
    ordenar: "createdAt",
  })
  const [selectedGanado, setSelectedGanado] = useState<Ganado | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGanado = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value && value !== "all")),
        })

        const response = await fetch(`/api/ganado?${params}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data: GanadoResponse = await response.json()

        setGanado(data.ganado)
        setPagination(data.pagination)
        setAvailableFilters(data.filters)
      } catch (error) {
        console.error("Error fetching ganado:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
        toast.error("Error al cargar el ganado")
      } finally {
        setIsLoading(false)
      }
    },
    [filters, pagination.limit],
  )

  useEffect(() => {
    fetchGanado(1)
  }, [filters])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    fetchGanado(page)
  }

  const handleRetry = () => {
    fetchGanado(pagination.page)
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Ganado", href: "/ganado" },
  ]

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error al cargar el ganado: {error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader title="Ganado" description="Gestiona y visualiza todo el ganado registrado">
        <Button onClick={() => router.push("/admin/ganado/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Ganado
        </Button>
      </PageHeader>

      <div className="space-y-6">
        {/* Filtros */}
        <GanadoFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableFilters={availableFilters}
          isLoading={isLoading}
        />

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Animales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : pagination.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Destacados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : ganado.filter((g) => g.isDestacado).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ganadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : ganado.filter((g) => g.isGanador).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En Remate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : ganado.filter((g) => g.enRemate).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Ganado */}
        {isLoading ? (
          <ImageGridSkeleton items={6} />
        ) : ganado.length === 0 ? (
          <EmptyState
            icon={Cow}
            title="No se encontró ganado"
            description="No hay animales que coincidan con los filtros seleccionados."
            action={{
              label: "Limpiar filtros",
              onClick: () =>
                setFilters({
                  search: "",
                  raza: "all",
                  categoria: "all",
                  tipoAnimal: "all",
                  sexo: "all",
                  estado: "all",
                  ordenar: "createdAt",
                }),
              variant: "outline",
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ganado.map((animal) => (
                <GanadoCard key={animal.id} ganado={animal} onViewDetails={() => setSelectedGanado(animal)} />
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
        )}
      </div>

      {/* Modal de detalle */}
      {selectedGanado && (
        <GanadoDetailModal ganado={selectedGanado} isOpen={!!selectedGanado} onClose={() => setSelectedGanado(null)} />
      )}
    </div>
  )
}
