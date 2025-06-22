"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Download, ArrowLeft } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface Ganado {
  id: string
  nombre: string
  numeroFicha: string
  fechaNacimiento?: string
  raza: string
  sexo: string
  pesoKg?: number
  descripcion?: string
  marcasDistintivas?: string
  padre?: string
  madre?: string
  lineaGenetica?: string
  enRemate: boolean
  precioBaseRemate?: number
  isDestacado: boolean
  imagenUrl?: string
  propietario: {
    id: string
    nombreCompleto: string
    documentoLegal?: string
    telefono?: string
    email?: string
    direccion?: string
  }
  expositor?: {
    id: string
    nombreCompleto: string
    documentoIdentidad?: string
    telefono?: string
    email?: string
    empresa?: string
    experiencia?: string
  }
  contestCategory: {
    id: string
    nombre: string
    descripcion?: string
  }
  contest: {
    nombre: string
  }
  company: {
    nombre: string
  }
  createdBy: {
    nombre: string
    apellido: string
  }
  createdAt: string
}

export default function ParticipantesPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string

  const [ganado, setGanado] = useState<Ganado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("all")
  const [razaFilter, setRazaFilter] = useState("all")
  const [sexoFilter, setSexoFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGanado, setSelectedGanado] = useState<Ganado | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [contest, setContest] = useState<any>(null)

  const fetchGanado = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })

      if (search) params.append("search", search)
      if (categoriaFilter && categoriaFilter !== "all") params.append("categoria", categoriaFilter)
      if (razaFilter && razaFilter !== "all") params.append("raza", razaFilter)
      if (sexoFilter && sexoFilter !== "all") params.append("sexo", sexoFilter)

      const response = await fetch(`/api/admin/concursos/${contestId}/ganado?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGanado(data.ganado)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching ganado:", error)
      toast.error("Error al cargar los participantes")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchContest = async () => {
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}`)
      if (response.ok) {
        const data = await response.json()
        setContest(data)
      }
    } catch (error) {
      console.error("Error fetching contest:", error)
    }
  }

  useEffect(() => {
    fetchGanado()
    fetchContest()
  }, [currentPage, search, categoriaFilter, razaFilter, sexoFilter, contestId])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearch("")
    setCategoriaFilter("all")
    setRazaFilter("all")
    setSexoFilter("all")
    setCurrentPage(1)
  }

  const handleDelete = async () => {
    if (!selectedGanado) return

    try {
      const response = await fetch(`/api/admin/concursos/${contestId}/ganado/${selectedGanado.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Animal eliminado correctamente")
        fetchGanado()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar el animal")
      }
    } catch (error) {
      console.error("Error deleting ganado:", error)
      toast.error("Error al eliminar el animal")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedGanado(null)
    }
  }

  const handleView = (animal: Ganado) => {
    setSelectedGanado(animal)
    setDetailsDialogOpen(true)
  }

  const handleEdit = (animal: Ganado) => {
    router.push(`/admin/concursos/${contestId}/participantes/${animal.id}/editar`)
  }

  const exportData = () => {
    // Implementar exportación a CSV/Excel
    toast.info("Función de exportación en desarrollo")
  }

  const getSexoLabel = (sexo: string) => {
    return sexo === "MACHO" ? "Macho" : "Hembra"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Participantes</h1>
            <p className="text-muted-foreground">
              {contest?.nombre} - {ganado.length} animales registrados
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => router.push(`/admin/concursos/${contestId}/participantes/nuevo/ganado`)}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Animal
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
                <SelectItem value="all">Todas las categorías</SelectItem>
                {/* Agregar categorías dinámicamente */}
              </SelectContent>
            </Select>

            <Select value={razaFilter} onValueChange={setRazaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Raza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las razas</SelectItem>
                {/* Agregar razas dinámicamente */}
              </SelectContent>
            </Select>

            <Select value={sexoFilter} onValueChange={setSexoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="MACHO">Macho</SelectItem>
                <SelectItem value="HEMBRA">Hembra</SelectItem>
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
          <CardTitle>Animales Registrados</CardTitle>
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
                  <TableHead>Ficha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Propietario</TableHead>
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
                          <AvatarImage src={animal.imagenUrl || "/placeholder.svg"} alt={animal.nombre} />
                          <AvatarFallback>{animal.nombre.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{animal.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {getSexoLabel(animal.sexo)}
                            {animal.pesoKg && ` • ${animal.pesoKg} kg`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{animal.numeroFicha}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{animal.contestCategory.nombre}</Badge>
                    </TableCell>
                    <TableCell>{animal.raza}</TableCell>
                    <TableCell>{animal.propietario.nombreCompleto}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {animal.enRemate && <Badge variant="destructive">En Remate</Badge>}
                        {animal.isDestacado && <Badge variant="default">Destacado</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(animal.createdAt)}</div>
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
                          <DropdownMenuItem onClick={() => handleView(animal)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(animal)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedGanado(animal)
                              setDeleteDialogOpen(true)
                            }}
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el animal{" "}
              <strong>{selectedGanado?.nombre}</strong> del concurso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de detalles */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Animal</DialogTitle>
            <DialogDescription>Información completa del animal registrado</DialogDescription>
          </DialogHeader>

          {selectedGanado && (
            <div className="space-y-6">
              {/* Imagen y datos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  {selectedGanado.imagenUrl ? (
                    <img
                      src={selectedGanado.imagenUrl || "/placeholder.svg"}
                      alt={selectedGanado.nombre}
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedGanado.nombre}</h3>
                    <p className="text-muted-foreground">Ficha #{selectedGanado.numeroFicha}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Raza</label>
                      <p>{selectedGanado.raza}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sexo</label>
                      <p>{getSexoLabel(selectedGanado.sexo)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                      <p>{selectedGanado.contestCategory.nombre}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Peso</label>
                      <p>{selectedGanado.pesoKg ? `${selectedGanado.pesoKg} kg` : "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedGanado.enRemate && <Badge variant="destructive">En Remate</Badge>}
                    {selectedGanado.isDestacado && <Badge variant="default">Destacado</Badge>}
                  </div>
                </div>
              </div>

              {/* Información del propietario */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Propietario</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                    <p>{selectedGanado.propietario.nombreCompleto}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Documento</label>
                    <p>{selectedGanado.propietario.documentoLegal || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <p>{selectedGanado.propietario.telefono || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedGanado.propietario.email || "No especificado"}</p>
                  </div>
                  {selectedGanado.propietario.direccion && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                      <p>{selectedGanado.propietario.direccion}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del expositor */}
              {selectedGanado.expositor && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Expositor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                      <p>{selectedGanado.expositor.nombreCompleto}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Documento</label>
                      <p>{selectedGanado.expositor.documentoIdentidad || "No especificado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <p>{selectedGanado.expositor.telefono || "No especificado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p>{selectedGanado.expositor.email || "No especificado"}</p>
                    </div>
                    {selectedGanado.expositor.empresa && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                        <p>{selectedGanado.expositor.empresa}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Genealogía */}
              {(selectedGanado.padre || selectedGanado.madre || selectedGanado.lineaGenetica) && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Genealogía</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Padre</label>
                      <p>{selectedGanado.padre || "No especificado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Madre</label>
                      <p>{selectedGanado.madre || "No especificado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Línea Genética</label>
                      <p>{selectedGanado.lineaGenetica || "No especificado"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              {(selectedGanado.descripcion || selectedGanado.marcasDistintivas) && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Información Adicional</h4>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    {selectedGanado.descripcion && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                        <p>{selectedGanado.descripcion}</p>
                      </div>
                    )}
                    {selectedGanado.marcasDistintivas && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Marcas Distintivas</label>
                        <p>{selectedGanado.marcasDistintivas}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información de remate */}
              {selectedGanado.enRemate && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Información de Remate</h4>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Precio Base</label>
                      <p className="text-lg font-semibold">
                        {selectedGanado.precioBaseRemate
                          ? formatCurrency(selectedGanado.precioBaseRemate)
                          : "Por definir"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
