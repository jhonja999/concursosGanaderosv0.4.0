"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface GanadoFiltersProps {
  onFiltersChange: (filters: any) => void
  categories?: Array<{ id: string; nombre: string }>
  loading?: boolean
}

export function GanadoFilters({ onFiltersChange, categories = [], loading = false }: GanadoFiltersProps) {
  const [search, setSearch] = useState("")
  const [categoria, setCategoria] = useState("all")
  const [raza, setRaza] = useState("all")
  const [sexo, setSexo] = useState("all")
  const [enRemate, setEnRemate] = useState("all")
  const [sortBy, setSortBy] = useState("none")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showFilters, setShowFilters] = useState(false)

  // Opciones de ordenamiento
  const sortOptions = [
    { value: "nombre", label: "Nombre" },
    { value: "raza", label: "Raza" },
    { value: "puntaje", label: "Puntaje" },
    { value: "fechaNacimiento", label: "Edad" },
    { value: "pesoKg", label: "Peso" },
    { value: "createdAt", label: "Fecha de Registro" },
  ]

  // Razas comunes
  const razasComunes = [
    "Holstein",
    "Angus",
    "Brahman",
    "Charolais",
    "Simmental",
    "Limousin",
    "Hereford",
    "Gyr",
    "Nelore",
    "Fleckvieh",
    "Jersey",
    "Brown Swiss",
  ]

  useEffect(() => {
    const filters = {
      search: search.trim() || undefined,
      categoria: categoria === "all" ? undefined : categoria,
      raza: raza === "all" ? undefined : raza,
      sexo: sexo === "all" ? undefined : sexo,
      enRemate: enRemate === "all" ? undefined : enRemate,
      sortBy: sortBy === "none" ? undefined : sortBy,
      sortOrder: sortOrder,
    }

    // Remover valores undefined
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined))

    onFiltersChange(cleanFilters)
  }, [search, categoria, raza, sexo, enRemate, sortBy, sortOrder, onFiltersChange])

  const clearFilters = () => {
    setSearch("")
    setCategoria("all")
    setRaza("all")
    setSexo("all")
    setEnRemate("all")
    setSortBy("none")
    setSortOrder("asc")
  }

  const hasActiveFilters =
    search || categoria !== "all" || raza !== "all" || sexo !== "all" || enRemate !== "all" || sortBy !== "none"

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Búsqueda y controles principales */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, raza, propietario..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {
                      [
                        search,
                        categoria !== "all",
                        raza !== "all",
                        sexo !== "all",
                        enRemate !== "all",
                        sortBy !== "none",
                      ].filter(Boolean).length
                    }
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} size="sm" disabled={loading}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-4 border-t">
              {/* Categoría */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoría</Label>
                <Select value={categoria} onValueChange={setCategoria} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Raza */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Raza</Label>
                <Select value={raza} onValueChange={setRaza} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las razas</SelectItem>
                    {razasComunes.map((razaOption) => (
                      <SelectItem key={razaOption} value={razaOption}>
                        {razaOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sexo</Label>
                <Select value={sexo} onValueChange={setSexo} disabled={loading}>
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

              {/* En Remate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado</Label>
                <Select value={enRemate} onValueChange={setEnRemate} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">En Remate</SelectItem>
                    <SelectItem value="false">No en Remate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar por */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin ordenar</SelectItem>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Orden */}
              {sortBy !== "none" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Orden</Label>
                  <Button
                    variant="outline"
                    onClick={toggleSortOrder}
                    className="w-full justify-start"
                    disabled={loading}
                  >
                    {sortOrder === "asc" ? (
                      <>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Ascendente
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Descendente
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: "{search}"
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSearch("")} />
                </Badge>
              )}
              {categoria !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Categoría: {categoria}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setCategoria("all")} />
                </Badge>
              )}
              {raza !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Raza: {raza}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setRaza("all")} />
                </Badge>
              )}
              {sexo !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sexo: {sexo}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSexo("all")} />
                </Badge>
              )}
              {enRemate !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {enRemate === "true" ? "En Remate" : "No en Remate"}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setEnRemate("all")} />
                </Badge>
              )}
              {sortBy !== "none" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" />
                  {sortOptions.find((opt) => opt.value === sortBy)?.label} ({sortOrder === "asc" ? "A-Z" : "Z-A"})
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSortBy("none")} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
