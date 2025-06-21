"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download
} from "lucide-react"
import { CATEGORIAS_GANADO, RAZAS_GANADO, SEXOS_GANADO, getCategoriaLabel, getRazaLabel, getSexoLabel } from "@/lib/constants/ganado"
import { formatDate } from "@/lib/utils"

interface Ganado {
  id: string
  nombre: string
  fecha_nacimiento?: string
  dias_nacida?: number
  categoria: string
  establo?: string
  en_remate: boolean
  propietario?: string
  descripcion?: string
  raza: string
  peso?: number
  sexo?: string
  imagen_url?: string
  puntaje?: number
  criador?: {
    id: string
    nombreCompleto: string
  }
  establoRel?: {
    id: string
    nombre: string
  }
  company: {
    nombre: string
  }
  createdBy: {
    nombre: string
    apellido: string
  }
  created_at: string
}

interface GanadoListProps {
  onEdit: (ganado: Ganado) => void
  onDelete: (id: string) => void
  onView: (ganado: Ganado) => void
  onAdd: () => void
}

export function GanadoList({ onEdit, onDelete, onView, onAdd }: GanadoListProps) {
  const [ganado, setGanado] = useState<Ganado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("")
  const [razaFilter, setRazaFilter] = useState("")
  const [sexoFilter, setSexoFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchGanado = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })

      if (search) params.append("search", search)
      if (categoriaFilter) params.append("categoria", categoriaFilter)
      if (razaFilter) params.append("raza", razaFilter)
      if (sexoFilter) params.append("sexo", sexoFilter)

      const response = await fetch(`/api/ganado?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGanado(data.ganado)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching ganado:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGanado()
  }, [currentPage, search, categoriaFilter, razaFilter, sexoFilter])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearch("")
    setCategoriaFilter("")
    setRazaFilter("")
    setSexoFilter("")
    setCurrentPage(1)
  }

  const exportData = () => {
    // Implementar exportación a CSV/Excel
    console.log("Exportar datos")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Ganado</h1>
          <p className="text-muted-foreground">Administra el registro de animales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Ganado
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, propietario..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {CATEGORIAS_GANADO.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={razaFilter} onValueChange={setRazaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Raza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las razas</SelectItem>
                {RAZAS_GANADO.map((raza) => (
                  <SelectItem key={raza.value} value={raza.value}>
                    {raza.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sexoFilter} onValueChange={setSexoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {SEXOS_GANADO.map((sexo) => (
                  <SelectItem key={sexo.value} value={sexo.value}>
                    {sexo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Ganado ({ganado.length} animales)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Establo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ganado.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={animal.imagen_url} alt={animal.nombre} />
                          <AvatarFallback>
                            {animal.nombre.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{animal.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {animal.sexo && getSexoLabel(animal.sexo)}
                            {animal.peso && ` • ${animal.peso} kg`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoriaLabel(animal.categoria)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getRazaLabel(animal.raza)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {animal.propietario || animal.criador?.nombreCompleto || "-"}
                    </TableCell>
                    <TableCell>
                      {animal.establo || animal.establoRel?.nombre || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {animal.en_remate && (
                          <Badge variant="destructive">En Remate</Badge>
                        )}
                        {animal.puntaje && (
                          <Badge variant="default">{animal.puntaje} pts</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(animal.created_at)}</div>
                        <div className="text-muted-foreground">
                          {animal.createdBy.nombre} {animal.createdBy.apellido}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(animal)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(animal)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(animal.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}