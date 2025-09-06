"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Trophy, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Calendar, MapPin, Users, Star } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/shared/breadcrumbs" // Import Breadcrumbs

interface Contest {
  id: string
  nombre: string
  slug: string
  descripcion: string
  imagenPrincipal?: string
  fechaInicio?: string
  fechaFin?: string
  ubicacion?: string
  capacidadMaxima?: number
  cuotaInscripcion?: number
  tipoGanado?: string[]
  isPublic: boolean
  isActive: boolean
  isFeatured: boolean
  company?: {
    id: string
    nombre: string
  }
  _count?: {
    registrations: number
    categories: number
  }
  createdAt: string
  updatedAt: string
}

export default function ConcursosPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contestToDelete, setContestToDelete] = useState<Contest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchContests()
  }, [])

  // Re-fetch when status filter changes
  useEffect(() => {
    // If user selects a status, reload from server
    fetchContests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  useEffect(() => {
    const filtered = contests.filter(
      (contest) =>
        contest.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contest.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contest.company?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contest.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredContests(filtered)
  }, [contests, searchTerm])

  const fetchContests = async () => {
    try {
      // Paginate and aggregate results to include historical contests
      const pageLimit = 200
      let page = 1
      let allContests: Contest[] = []

      while (true) {
        const params = new URLSearchParams()
        params.append("limit", pageLimit.toString())
        params.append("page", page.toString())
        if (searchTerm) params.append("search", searchTerm)
        if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)

        const res = await fetch(`/api/admin/concursos?${params.toString()}`, { credentials: "include" })
        if (!res.ok) {
          toast.error("Error al cargar los concursos")
          break
        }

        const data = await res.json()
        const pageContests: Contest[] = data.contests || []
        allContests = allContests.concat(pageContests)

        const pages = data.pagination?.pages || 1
        if (page >= pages) break
        page += 1
      }

      setContests(allContests)
    } catch (error) {
      console.error("Error fetching contests:", error)
      toast.error("Error al cargar los concursos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContest = async () => {
    if (!contestToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/concursos/${contestToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast.success("Concurso eliminado exitosamente")
        setContests(contests.filter((c) => c.id !== contestToDelete.id))
        setDeleteDialogOpen(false)
        setContestToDelete(null)
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al eliminar el concurso")
      }
    } catch (error) {
      console.error("Error deleting contest:", error)
      toast.error("Error al eliminar el concurso")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (contest: Contest) => {
    if (!contest.isActive) {
      return <Badge variant="secondary">Inactivo</Badge>
    }

    if (contest.fechaInicio) {
      const startDate = new Date(contest.fechaInicio)
      const now = new Date()

      if (startDate > now) {
        return <Badge variant="outline">Próximo</Badge>
      } else if (contest.fechaFin) {
        const endDate = new Date(contest.fechaFin)
        if (endDate < now) {
          return <Badge variant="destructive">Finalizado</Badge>
        } else {
          return <Badge variant="default">En curso</Badge>
        }
      } else {
        return <Badge variant="default">Activo</Badge>
      }
    }

    return <Badge variant="default">Activo</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Concursos" }]} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Concursos</h1>
          <p className="text-muted-foreground">Gestiona los concursos ganaderos.</p>
        </div>
        <Button asChild>
          <Link href="/admin/concursos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Concurso
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar concursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="h-12 w-56">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="public">Públicos</SelectItem>
                  <SelectItem value="private">Privados</SelectItem>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="EN_CURSO">En curso</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizados</SelectItem>
                  <SelectItem value="INSCRIPCIONES_ABIERTAS">Inscripciones abiertas</SelectItem>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => fetchContests()}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredContests.length} concurso{filteredContests.length !== 1 ? "s" : ""} encontrado
            {filteredContests.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContests.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No hay concursos"
              description="No se encontraron concursos que coincidan con tu búsqueda."
              action={{
                label: "Crear Primer Concurso",
                onClick: () => router.push("/admin/concursos/nuevo"),
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Compañía</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Destacado</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Categorías</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContests.map((contest) => (
                    <TableRow key={contest.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {contest.imagenPrincipal && (
                            <img
                              src={contest.imagenPrincipal || "/placeholder.svg"}
                              alt={contest.nombre}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{contest.nombre}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {contest.ubicacion || "Sin ubicación"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contest.company ? (
                          <div className="font-medium">{contest.company.nombre}</div>
                        ) : (
                          <span className="text-muted-foreground">Sin compañía</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contest.fechaInicio ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">
                              {format(new Date(contest.fechaInicio), "dd MMM yyyy", { locale: es })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin fecha</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(contest)}</TableCell>
                      <TableCell>
                        {contest.isFeatured ? (
                          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{contest._count?.registrations || 0}</span>
                          {contest.capacidadMaxima && (
                            <span className="text-muted-foreground">/{contest.capacidadMaxima}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{contest._count?.categories || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span>{contest.tipoGanado?.[0] || "N/A"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/concursos/${contest.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/concursos/${contest.id}/editar`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setContestToDelete(contest)
                                setDeleteDialogOpen(true)
                              }}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar concurso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el concurso{" "}
              <strong>{contestToDelete?.nombre}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContest}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
