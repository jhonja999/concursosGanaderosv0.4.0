"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X, Calendar, MapPin, Trophy } from "lucide-react"
import { toast } from "sonner"

interface FilterOptions {
  category: string // This is for contest categories like "Adultos", "Jóvenes"
  status: string
  location: string
  animalType: string // This is for tipoGanado
}

interface ContestFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  totalContests: number
  filteredCount: number
  statusCounts?: Record<string, number>
}

// Use backend enum values for status; 'ALL' means no filter
const contestStatus = [
  { value: "ALL", label: "Todos los estados" },
  { value: "PUBLICADO", label: "Publicado" },
  { value: "INSCRIPCIONES_ABIERTAS", label: "Inscripciones abiertas" },
  { value: "INSCRIPCIONES_CERRADAS", label: "Inscripciones cerradas" },
  { value: "EN_CURSO", label: "En curso" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "BORRADOR", label: "Borrador" },
]

// Hardcoded categories for now, as they are contest-specific and not globally distinct in the same way as tipoGanado
const hardcodedCategories = [
  { value: "all", label: "Todas las categorías" },
  { value: "adultos", label: "Adultos" },
  { value: "jovenes", label: "Jóvenes" },
  { value: "crias", label: "Crías" },
  { value: "reproductores", label: "Reproductores" },
]

export function ContestFilters({ onFiltersChange, totalContests, filteredCount, statusCounts }: ContestFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
  status: "ALL",
    location: "all",
    animalType: "all",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [availableAnimalTypes, setAvailableAnimalTypes] = useState<string[]>([])
  const [availableCategorias, setAvailableCategorias] = useState<string[]>([])
  const [categoriesByType, setCategoriesByType] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const cachedLocations = localStorage.getItem("contestFilterLocations")
        const cachedAnimalTypes = localStorage.getItem("contestFilterAnimalTypes")
        const cachedCategorias = localStorage.getItem("contestFilterCategorias")

        if (cachedLocations && cachedAnimalTypes && cachedCategorias) {
          setAvailableLocations(JSON.parse(cachedLocations))
          setAvailableAnimalTypes(JSON.parse(cachedAnimalTypes))
          setAvailableCategorias(JSON.parse(cachedCategorias))
          return
        }

        const response = await fetch("/api/concursos/distinct-values")
        if (response.ok) {
          const data = await response.json()
          setAvailableLocations(data.locations || [])
          setAvailableAnimalTypes(data.animalTypes || [])
          setAvailableCategorias(data.categorias || [])
          setCategoriesByType(data.categoriesByType || {})

          // Cache in localStorage
          localStorage.setItem("contestFilterLocations", JSON.stringify(data.locations))
          localStorage.setItem("contestFilterAnimalTypes", JSON.stringify(data.animalTypes))
          localStorage.setItem("contestFilterCategorias", JSON.stringify(data.categorias || []))
        } else {
          toast.error("Error al cargar opciones de filtro.")
        }
      } catch (error) {
        console.error("Error fetching filter options:", error)
        toast.error("Error de red al cargar opciones de filtro.")
      }
    }

    fetchFilterOptions()
  }, [])

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  // when animalType changes, restrict categorias to those available for that type
  useEffect(() => {
    if (!filters.animalType || filters.animalType === 'all') {
      // reset to full list
      const cached = localStorage.getItem('contestFilterCategorias')
      if (cached) setAvailableCategorias(JSON.parse(cached))
      return
    }
    const key = filters.animalType.toLowerCase()
    const lista = categoriesByType[key]
    if (lista && lista.length > 0) {
      setAvailableCategorias(lista)
      // if current selected category is not in the list, reset it to 'all'
      if (filters.category !== 'all' && !lista.includes(filters.category)) {
        updateFilter('category', 'all')
      }
    } else {
      // no categories for this type -> clear
      setAvailableCategorias([])
      updateFilter('category', 'all')
    }
  }, [filters.animalType, categoriesByType])

  const clearFilters = () => {
    const emptyFilters = {
      category: "all",
      status: "ALL",
      location: "all",
      animalType: "all",
    }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    // Close the filters panel and return to default view (show all contests)
    setShowFilters(false)
  }

  const hasActiveFilters =
    filters.status !== "ALL" || filters.category !== "all" || filters.location !== "all" || filters.animalType !== "all"

  return (
    <div className="mb-8">
      {/* Botón de filtros y resumen */}
      <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
          <Button
      variant="outline"
      onClick={() => setShowFilters(!showFilters)}
      className="flex items-center gap-2 h-10 px-3"
          >
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filtros</span>
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 text-xs font-semibold">
                {Object.values(filters).filter((v) => v !== "all").length}
              </span>
            )}
          </Button>
          {/* Status quick control removed: use the 'Estado' select inside the filters panel */}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-semibold">{filteredCount}</span> de{" "}
          <span className="font-semibold">{totalContests}</span> concursos
        </div>
      </div>
      {/* Status badges quick filters (inside filter panel header) */}
  {/* Quick status badges removed - status is controlled in the panel below */}

      {/* Panel de filtros */}
      {showFilters && (
        <Card className="border border-green-200 bg-green-50 max-w-4xl mx-auto">
          <CardContent className="p-3">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
              {/* Tipo de Ganado (Animal Type) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-600" />
                  Tipo de Ganado
                </label>
                <Select value={filters.animalType} onValueChange={(value) => updateFilter("animalType", value)}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {availableAnimalTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado del Concurso */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Estado
                </label>
                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {contestStatus.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Ubicación
                </label>
                <Select value={filters.location} onValueChange={(value) => updateFilter("location", value)}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Seleccionar ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    {availableLocations.map((location) => (
                      <SelectItem key={location} value={location.toLowerCase()}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoría (keeping hardcoded for now as it's different from tipoGanado) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Categoría</label>
                  <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {availableCategorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>

            {/* Filtros activos */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Filtros activos:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.animalType !== "all" && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800">
                      Tipo: {availableAnimalTypes.find((t) => t.toLowerCase() === filters.animalType) || filters.animalType}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600 ml-1"
                        onClick={() => updateFilter("animalType", "all")}
                      />
                    </span>
                  )}
                  {filters.status !== "all" && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800">
                      Estado: {contestStatus.find((s) => s.value === filters.status)?.label || filters.status}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600 ml-1"
                        onClick={() => updateFilter("status", "all")}
                      />
                    </span>
                  )}
                  {filters.location !== "all" && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800">
                      Ubicación: {availableLocations.find((l) => l.toLowerCase() === filters.location) || filters.location}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600 ml-1"
                        onClick={() => updateFilter("location", "all")}
                      />
                    </span>
                  )}
                  {filters.category !== "all" && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800">
                      Categoría: {availableCategorias.find((c) => c.toLowerCase() === filters.category) || filters.category}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600 ml-1"
                        onClick={() => updateFilter("category", "all")}
                      />
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
