"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
}

const contestStatus = [
  { value: "all", label: "Todos los estados" },
  { value: "próximos", label: "Próximos" },
  { value: "en curso", label: "En curso" },
  { value: "finalizados", label: "Finalizados" },
  { value: "inscripciones abiertas", label: "Inscripciones abiertas" },
]

// Hardcoded categories for now, as they are contest-specific and not globally distinct in the same way as tipoGanado
const hardcodedCategories = [
  { value: "all", label: "Todas las categorías" },
  { value: "adultos", label: "Adultos" },
  { value: "jovenes", label: "Jóvenes" },
  { value: "crias", label: "Crías" },
  { value: "reproductores", label: "Reproductores" },
]

export function ContestFilters({ onFiltersChange, totalContests, filteredCount }: ContestFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
    status: "all",
    location: "all",
    animalType: "all",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [availableAnimalTypes, setAvailableAnimalTypes] = useState<string[]>([])

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const cachedLocations = localStorage.getItem("contestFilterLocations")
        const cachedAnimalTypes = localStorage.getItem("contestFilterAnimalTypes")

        if (cachedLocations && cachedAnimalTypes) {
          setAvailableLocations(JSON.parse(cachedLocations))
          setAvailableAnimalTypes(JSON.parse(cachedAnimalTypes))
          return
        }

        const response = await fetch("/api/concursos/distinct-values")
        if (response.ok) {
          const data = await response.json()
          setAvailableLocations(data.locations || [])
          setAvailableAnimalTypes(data.animalTypes || [])

          // Cache in localStorage
          localStorage.setItem("contestFilterLocations", JSON.stringify(data.locations))
          localStorage.setItem("contestFilterAnimalTypes", JSON.stringify(data.animalTypes))
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

  const clearFilters = () => {
    const emptyFilters = {
      category: "all",
      status: "all",
      location: "all",
      animalType: "all",
    }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "all")

  return (
    <div className="mb-8">
      {/* Botón de filtros y resumen */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-12 px-4"
          >
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filtros</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.values(filters).filter((v) => v !== "all").length}
              </Badge>
            )}
          </Button>

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

      {/* Panel de filtros */}
      {showFilters && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Tipo de Ganado (Animal Type) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-600" />
                  Tipo de Ganado
                </label>
                <Select value={filters.animalType} onValueChange={(value) => updateFilter("animalType", value)}>
                  <SelectTrigger className="h-12">
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
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Estado
                </label>
                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger className="h-12">
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
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Ubicación
                </label>
                <Select value={filters.location} onValueChange={(value) => updateFilter("location", value)}>
                  <SelectTrigger className="h-12">
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
                <label className="text-sm font-semibold text-gray-700">Categoría</label>
                <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    {hardcodedCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros activos */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Filtros activos:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.animalType !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Tipo:{" "}
                      {availableAnimalTypes.find((t) => t.toLowerCase() === filters.animalType) || filters.animalType}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => updateFilter("animalType", "all")}
                      />
                    </Badge>
                  )}
                  {filters.status !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Estado: {contestStatus.find((s) => s.value === filters.status)?.label || filters.status}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => updateFilter("status", "all")}
                      />
                    </Badge>
                  )}
                  {filters.location !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Ubicación:{" "}
                      {availableLocations.find((l) => l.toLowerCase() === filters.location) || filters.location}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => updateFilter("location", "all")}
                      />
                    </Badge>
                  )}
                  {filters.category !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Categoría:{" "}
                      {hardcodedCategories.find((c) => c.value === filters.category)?.label || filters.category}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => updateFilter("category", "all")}
                      />
                    </Badge>
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
