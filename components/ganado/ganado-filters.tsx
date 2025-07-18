"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X, RotateCcw } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface GanadoFiltersProps {
  filters: {
    search: string
    raza: string
    categoria: string
    tipoAnimal: string
    sexo: string
    estado: string
    ordenar: string
  }
  onFiltersChange: (filters: any) => void
  availableFilters?: {
    categories: Array<{ id: string; nombre: string }>
    breeds: string[]
    animalTypes: string[]
  }
  isLoading?: boolean
}

export function GanadoFilters({ filters, onFiltersChange, availableFilters, isLoading = false }: GanadoFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      raza: "all",
      categoria: "all",
      tipoAnimal: "all",
      sexo: "all",
      estado: "all",
      ordenar: "createdAt",
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.search) count++
    if (localFilters.raza && localFilters.raza !== "all") count++
    if (localFilters.categoria && localFilters.categoria !== "all") count++
    if (localFilters.tipoAnimal && localFilters.tipoAnimal !== "all") count++
    if (localFilters.sexo && localFilters.sexo !== "all") count++
    if (localFilters.estado && localFilters.estado !== "all") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs bg-transparent">
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? "Ocultar" : "Mostrar"}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, propietario, ficha..."
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
                {localFilters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => handleFilterChange("search", "")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Grid de filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Raza - PRIMERO */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Raza</Label>
                <Select
                  value={localFilters.raza}
                  onValueChange={(value) => handleFilterChange("raza", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las razas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las razas</SelectItem>
                    {availableFilters?.breeds?.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoría</Label>
                <Select
                  value={localFilters.categoria}
                  onValueChange={(value) => handleFilterChange("categoria", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {availableFilters?.categories?.map((category) => (
                      <SelectItem key={category.id} value={category.nombre}>
                        {category.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Animal */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de Animal</Label>
                <Select
                  value={localFilters.tipoAnimal}
                  onValueChange={(value) => handleFilterChange("tipoAnimal", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {availableFilters?.animalTypes?.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sexo</Label>
                <Select
                  value={localFilters.sexo}
                  onValueChange={(value) => handleFilterChange("sexo", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="MACHO">Macho</SelectItem>
                    <SelectItem value="HEMBRA">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado</Label>
                <Select
                  value={localFilters.estado}
                  onValueChange={(value) => handleFilterChange("estado", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="destacado">Destacado</SelectItem>
                    <SelectItem value="ganador">Ganador</SelectItem>
                    <SelectItem value="remate">En Remate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar por */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ordenar por</Label>
                <Select
                  value={localFilters.ordenar}
                  onValueChange={(value) => handleFilterChange("ordenar", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Más recientes</SelectItem>
                    <SelectItem value="nombre">Nombre A-Z</SelectItem>
                    <SelectItem value="fecha">Fecha de nacimiento</SelectItem>
                    <SelectItem value="peso">Peso</SelectItem>
                    <SelectItem value="puntaje">Puntaje</SelectItem>
                    <SelectItem value="ficha">Número de ficha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros activos */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Filtros activos:</span>
                  {localFilters.search && (
                    <Badge variant="secondary" className="text-xs">
                      Búsqueda: {localFilters.search}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => handleFilterChange("search", "")}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {localFilters.raza && localFilters.raza !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Raza: {localFilters.raza}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => handleFilterChange("raza", "all")}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {localFilters.categoria && localFilters.categoria !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Categoría: {localFilters.categoria}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => handleFilterChange("categoria", "all")}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {localFilters.tipoAnimal && localFilters.tipoAnimal !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Tipo: {localFilters.tipoAnimal}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => handleFilterChange("tipoAnimal", "all")}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {localFilters.sexo && localFilters.sexo !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Sexo: {localFilters.sexo}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => handleFilterChange("sexo", "all")}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {localFilters.estado && localFilters.estado !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Estado: {localFilters.estado}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => handleFilterChange("estado", "all")}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
