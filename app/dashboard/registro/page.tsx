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
  Search,
  MoreHorizontal,
  Eye,
  Users,
  Calendar,
  MapPin,
  Filter,
  RefreshCw,
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
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
  isActive: boolean
  company: {
    id: string
    nombre: string
  }
  assignedAt: string
  canUpdate: boolean
  canRegister: boolean
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

export default function RegistradorDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [assignedContests, setAssignedContests] = useState<Contest[]>([])
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserAndAssignedContests()
  }, [])

  useEffect(() => {
    filterContests()
  }, [assignedContests, searchTerm, statusFilter])

  const fetchUserAndAssignedContests = async () => {
    try {
      setIsLoading(true)

      // Fetch current user
      const userResponse = await fetch("/api/auth/me")
      if (!userResponse.ok) {
        throw new Error("No autorizado")
      }
      const userData = await userResponse.json()
      setUser(userData)

      // Fetch assigned contests for the registrador
      const contestsResponse = await fetch("/api/dashboard/registro/contests")
      if (contestsResponse.ok) {
        const contestsData = await contestsResponse.json()
        setAssignedContests(contestsData.contests || [])
      } else {
        console.error("Error fetching assigned contests")
        setAssignedContests([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setAssignedContests([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterContests = () => {
    let filtered = assignedContests

    if (searchTerm) {
      filtered = filtered.filter(
        (contest) =>
          contest.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contest.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contest.company.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((contest) => contest.status === statusFilter)
    }

    setFilteredContests(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      BORRADOR: { variant: "secondary" as const, text: "Borrador", icon: Clock },
      PUBLICADO: { variant: "default" as const, text: "Publicado", icon: CheckCircle },
      INSCRIPCIONES_ABIERTAS: { variant: "default" as const, text: "Inscripciones Abiertas", icon: UserPlus },
      INSCRIPCIONES_CERRADAS: { variant: "outline" as const, text: "Inscripciones Cerradas", icon: AlertCircle },
      EN_CURSO: { variant: "default" as const, text: "En Curso", icon: Trophy },
      FINALIZADO: { variant: "secondary" as const, text: "Finalizado", icon: CheckCircle },
      CANCELADO: { variant: "destructive" as const, text: "Cancelado", icon: AlertCircle },
    }

    const config = variants[status as keyof typeof variants] || {
      variant: "outline" as const,
      text: status,
      icon: Clock,
    }

    const IconComponent = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const canRegisterParticipants = (status: string) => {
    return status === "INSCRIPCIONES_ABIERTAS" || status === "EN_CURSO"
  }

  const canUpdateContest = (contest: Contest) => {
    return (
      contest.canUpdate ||
      ["INSCRIPCIONES_ABIERTAS", "EN_CURSO", "INSCRIPCIONES_CERRADAS", "FINALIZADO"].includes(contest.status)
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "REGISTRADOR") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  const activeContests = assignedContests.filter(
    (c) => c.status === "EN_CURSO" || c.status === "INSCRIPCIONES_ABIERTAS",
  )
  const upcomingContests = assignedContests.filter((c) => c.status === "PUBLICADO" || c.status === "BORRADOR")
  const finishedContests = assignedContests.filter((c) => c.status === "FINALIZADO")
  const availableForRegistration = assignedContests.filter((c) => canRegisterParticipants(c.status))
  const availableForUpdate = assignedContests.filter((c) => canUpdateContest(c))
  const totalParticipants = assignedContests.reduce((sum, contest) => sum + contest.participantCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Registro</h1>
          <p className="text-muted-foreground">
            Gestiona las inscripciones de participantes en los concursos asignados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUserAndAssignedContests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concursos Asignados</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedContests.length}</div>
            <p className="text-xs text-muted-foreground">Total de concursos asignados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles para Registro</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableForRegistration.length}</div>
            <p className="text-xs text-muted-foreground">Con inscripciones abiertas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concursos Activos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContests.length}</div>
            <p className="text-xs text-muted-foreground">En curso o próximos a iniciar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedContests.length}</div>
            <p className="text-xs text-muted-foreground">Disponibles para actualizar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">En todos los concursos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accesos directos para las tareas más comunes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {availableForRegistration.slice(0, 2).map((contest) => (
              <Button
                key={contest.id}
                asChild
                className="h-20 flex-col gap-2 cursor-pointer bg-transparent"
                variant="outline"
              >
                <Link href={`/admin/concursos/${contest.id}/participantes/nuevo/ganado`}>
                  <UserPlus className="h-6 w-6" />
                  <span className="text-center text-sm">Registrar en {contest.nombre}</span>
                </Link>
              </Button>
            ))}
            {finishedContests.slice(0, 1).map((contest) => (
              <Button
                key={`update-${contest.id}`}
                asChild
                className="h-20 flex-col gap-2 cursor-pointer bg-transparent"
                variant="outline"
              >
                <Link href={`/admin/concursos/${contest.id}/editar`}>
                  <FileText className="h-6 w-6" />
                  <span className="text-center text-sm">Actualizar {contest.nombre}</span>
                </Link>
              </Button>
            ))}
            {availableForRegistration.length === 0 && finishedContests.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay concursos disponibles para registro o actualización en este momento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                  placeholder="Nombre, ubicación o compañía..."
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
                  <SelectItem value="INSCRIPCIONES_ABIERTAS">Inscripciones Abiertas</SelectItem>
                  <SelectItem value="EN_CURSO">En Curso</SelectItem>
                  <SelectItem value="PUBLICADO">Publicado</SelectItem>
                  <SelectItem value="INSCRIPCIONES_CERRADAS">Inscripciones Cerradas</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Contests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Concursos Asignados ({filteredContests.length})</CardTitle>
          <CardDescription>
            Lista de concursos donde puedes registrar participantes o actualizar información
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concurso</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Asignado</TableHead>
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
                    <div className="text-sm">{contest.company.nombre}</div>
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
                    <div className="text-xs text-muted-foreground">{formatDate(contest.assignedAt)}</div>
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
                            Ver Detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}/participantes`}>
                            <Users className="mr-2 h-4 w-4" />
                            Ver Participantes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {canRegisterParticipants(contest.status) ? (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/concursos/${contest.id}/participantes/nuevo/ganado`}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Registrar Participante
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Registro No Disponible
                          </DropdownMenuItem>
                        )}
                        {canUpdateContest(contest) && (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/concursos/${contest.id}/editar`}>
                              <Edit className="mr-2 h-4 w-4" />
                              {contest.status === "FINALIZADO" ? "Actualizar Datos/Imágenes" : "Editar Concurso"}
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/concursos/${contest.id}/reportes`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Reportes
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
                  : "No tienes concursos asignados en este momento"}
              </p>
              {!searchTerm && statusFilter === "all" && assignedContests.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Contacta a tu administrador para que te asigne concursos
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
