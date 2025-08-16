"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Trophy,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Users,
  Calendar,
  MapPin,
  Star,
  Filter,
  RefreshCw,
  Settings,
  BarChart3,
  FileText,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface Contest {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  fechaInicio: string
  fechaFin?: string
  ubicacion?: string
  status: string
  participantCount: number
  registrationCount: number
  isFeatured: boolean
  isActive: boolean
  company: {
    id: string
    nombre: string
  }
  createdAt: string
}

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role: string
  company?: {
    id: string
    nombre: string
  }
}

export default function ContestAdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [contests, setContests] = useState<Contest[]>([])
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserAndContests()
  }, [])

  useEffect(() => {
    filterContests()
  }, [contests, searchTerm, statusFilter])

  const fetchUserAndContests = async () => {
    try {
      setIsLoading(true)

      // Fetch current user
      const userResponse = await fetch("/api/auth/me")
      if (!userResponse.ok) {
        throw new Error("No autorizado")
      }
      const userData = await userResponse.json()
      setUser(userData)

      // Fetch contests for the user's company
      const contestsResponse = await fetch("/api/dashboard/contests")
      if (contestsResponse.ok) {
        const contestsData = await contestsResponse.json()
        const contestsArray = contestsData.contests || contestsData || []
        setContests(Array.isArray(contestsArray) ? contestsArray : [])
      } else {
        console.error("Error fetching contests")
        setContests([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setContests([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterContests = () => {
    let filtered = contests

    if (searchTerm) {
      filtered = filtered.filter(
        (contest) =>
          contest.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contest.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((contest) => contest.status === statusFilter)
    }

    setFilteredContests(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      BORRADOR: { variant: "secondary" as const, text: "Borrador" },
      PUBLICADO: { variant: "default" as const, text: "Publicado" },
      INSCRIPCIONES_ABIERTAS: { variant: "default" as const, text: "Inscripciones Abiertas" },
      INSCRIPCIONES_CERRADAS: { variant: "outline" as const, text: "Inscripciones Cerradas" },
      EN_CURSO: { variant: "default" as const, text: "En Curso" },
      FINALIZADO: { variant: "secondary" as const, text: "Finalizado" },
      CANCELADO: { variant: "destructive" as const, text: "Cancelado" },
    }

    const config = variants[status as keyof typeof variants] || { variant: "outline" as const, text: status }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "CONCURSO_ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  const activeContests = contests.filter((c) => c.status === "EN_CURSO" || c.status === "INSCRIPCIONES_ABIERTAS")
  const upcomingContests = contests.filter((c) => c.status === "PUBLICADO" || c.status === "BORRADOR")
  const finishedContests = contests.filter((c) => c.status === "FINALIZADO")
  const totalParticipants = contests.reduce((sum, contest) => sum + contest.participantCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Concursos</h1>
          <p className="text-muted-foreground">Gestiona los concursos de {user.company?.nombre || "tu organización"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUserAndContests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button asChild>
            <Link href="/admin/concursos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Concurso
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concursos Activos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContests.length}</div>
            <p className="text-xs text-muted-foreground">En curso o con inscripciones abiertas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Concursos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingContests.length}</div>
            <p className="text-xs text-muted-foreground">Publicados o en preparación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">En todos los concursos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concursos Finalizados</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedContests.length}</div>
            <p className="text-xs text-muted-foreground">Completados exitosamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="PUBLICADO">Publicado</SelectItem>
                  <SelectItem value="INSCRIPCIONES_ABIERTAS">Inscripciones Abiertas</SelectItem>
                  <SelectItem value="INSCRIPCIONES_CERRADAS">Inscripciones Cerradas</SelectItem>
                  <SelectItem value="EN_CURSO">En Curso</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Concursos ({filteredContests.length})</CardTitle>
          <CardDescription>Lista de todos los concursos de tu organización</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concurso</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Inscripciones</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContests.map((contest) => (
                <TableRow key={contest.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contest.nombre}</div>
                      {contest.ubicacion && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {contest.ubicacion}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(contest.fechaInicio)}</span>
                    </div>
                    {contest.fechaFin && (
                      <div className="text-xs text-muted-foreground">hasta {formatDate(contest.fechaFin)}</div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(contest.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{contest.participantCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      <span>{contest.registrationCount}</span>
                    </div>
                  </TableCell>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}/participantes`}>
                            <Users className="mr-2 h-4 w-4" />
                            Gestionar Participantes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}/categorias`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Gestionar Categorías
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}/eventos`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Gestionar Eventos
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}/reportes`}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Ver Reportes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}/resultados`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Gestionar Resultados
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredContests.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron concursos</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Crea tu primer concurso para comenzar"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button asChild className="mt-4">
                  <Link href="/admin/concursos/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Concurso
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
