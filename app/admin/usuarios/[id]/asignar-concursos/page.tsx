"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Calendar,
  MapPin,
  Users,
  Trophy,
  CheckCircle,
  AlertTriangle,
  Loader2,
  UserCheck,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

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
  company: {
    id: string
    nombre: string
  }
  isAssigned: boolean
}

interface ContestAssignment {
  contestId: string
  isActive: boolean
  assignedAt: string
  notes?: string
}

export default function AsignarConcursosPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [contests, setContests] = useState<Contest[]>([])
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])
  const [assignments, setAssignments] = useState<ContestAssignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchUserAndContests()
  }, [resolvedParams.id])

  useEffect(() => {
    filterContests()
  }, [contests, searchTerm, statusFilter, assignmentFilter])

  const fetchUserAndContests = async () => {
    try {
      setIsLoading(true)

      // Fetch user data
      const userResponse = await fetch(`/api/admin/users/${resolvedParams.id}`)
      if (!userResponse.ok) {
        throw new Error("Error al cargar los datos del usuario")
      }
      const userData = await userResponse.json()
      setUser(userData)

      // Fetch contests and assignments
      const contestsResponse = await fetch(`/api/admin/users/${resolvedParams.id}/contest-assignments`)
      if (!contestsResponse.ok) {
        throw new Error("Error al cargar los concursos")
      }
      const contestsData = await contestsResponse.json()
      setContests(contestsData.contests || [])
      setAssignments(contestsData.assignments || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error de conexión")
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
          contest.company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contest.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((contest) => contest.status === statusFilter)
    }

    if (assignmentFilter !== "all") {
      const isAssignedFilter = assignmentFilter === "assigned"
      filtered = filtered.filter((contest) => {
        const isAssigned = assignments.some((a) => a.contestId === contest.id)
        return isAssignedFilter ? isAssigned : !isAssigned
      })
    }

    setFilteredContests(filtered)
  }

  const handleAssignmentToggle = async (contestId: string, isAssigned: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}/contest-assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contestId,
          action: isAssigned ? "assign" : "unassign",
        }),
      })

      if (response.ok) {
        if (isAssigned) {
          setAssignments((prev) => [
            ...prev.filter((a) => a.contestId !== contestId),
            {
              contestId,
              isActive: true,
              assignedAt: new Date().toISOString(),
              notes: "",
            },
          ])
        } else {
          setAssignments((prev) => prev.filter((a) => a.contestId !== contestId))
        }

        setContests((prev) => prev.map((contest) => (contest.id === contestId ? { ...contest, isAssigned } : contest)))

        setSuccessMessage(`Concurso ${isAssigned ? "asignado" : "desasignado"} correctamente`)
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.error || "Error al actualizar la asignación")
        setTimeout(() => setErrorMessage(""), 5000)
      }
    } catch (error) {
      console.error("Error toggling assignment:", error)
      setErrorMessage("Error de conexión al actualizar la asignación")
      setTimeout(() => setErrorMessage(""), 5000)
    }
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
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/usuarios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Usuario no encontrado o no tienes permisos para editarlo.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const assignedCount = assignments.filter((a) => a.isActive).length
  const availableCount = contests.length - assignedCount
  const finishedAssignedCount = assignments.filter((a) => {
    const contest = contests.find((c) => c.id === a.contestId)
    return contest?.status === "FINALIZADO"
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/usuarios">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Asignar Concursos</h1>
          <p className="text-muted-foreground">
            Gestiona los concursos asignados a {user?.nombre} {user?.apellido}
            {user?.company && ` - ${user.company.nombre}`}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* User Info and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuario</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {user?.nombre} {user?.apellido}
            </div>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concursos Asignados</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedCount}</div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedAssignedCount}</div>
            <p className="text-xs text-muted-foreground">Para actualizar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disponibles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contests.length}</div>
            <p className="text-xs text-muted-foreground">En la compañía</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
          <CardDescription>Encuentra y filtra concursos para asignar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar concursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PUBLICADO">Publicado</SelectItem>
                <SelectItem value="INSCRIPCIONES_ABIERTAS">Inscripciones Abiertas</SelectItem>
                <SelectItem value="EN_CURSO">En Curso</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Asignación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="assigned">Asignados</SelectItem>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Concursos Disponibles ({filteredContests.length})</CardTitle>
          <CardDescription>Usa los switches para asignar/desasignar concursos instantáneamente</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Toggle</TableHead>
                <TableHead>Concurso</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Participantes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContests.map((contest) => {
                const isAssigned = assignments.some((a) => a.contestId === contest.id)

                return (
                  <TableRow key={contest.id}>
                    <TableCell>
                      <Switch
                        checked={isAssigned}
                        onCheckedChange={(checked) => handleAssignmentToggle(contest.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contest.nombre}</div>
                        {contest.descripcion && (
                          <div className="text-sm text-muted-foreground line-clamp-1">{contest.descripcion}</div>
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
                    <TableCell>
                      {contest.ubicacion ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{contest.ubicacion}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No especificada</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(contest.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        <span>{contest.participantCount}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredContests.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron concursos</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || assignmentFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay concursos disponibles"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/usuarios">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Usuarios
          </Link>
        </Button>
      </div>
    </div>
  )
}
