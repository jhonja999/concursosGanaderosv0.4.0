"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Search, UserPlus, Trash2, Mail, Phone, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  role: string
  createdAt: string
}

interface ConcursoRegistrador {
  id: string
  user: User
  createdAt: string
}

interface Concurso {
  id: string
  nombre: string
  fechaInicio: string
  fechaFin: string
}

export default function ConcursoRegistradoresPage() {
  const params = useParams()
  const concursoId = params.id as string

  const [concurso, setConcurso] = useState<Concurso | null>(null)
  const [registradores, setRegistradores] = useState<ConcursoRegistrador[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    fetchData()
  }, [concursoId])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch concurso details
      const concursoResponse = await fetch(`/api/concursos/${concursoId}`)
      const concursoData = await concursoResponse.json()
      setConcurso(concursoData)

      // Fetch current registradores
      const registradoresResponse = await fetch(`/api/concursos/${concursoId}/registradores`)
      const registradoresData = await registradoresResponse.json()
      setRegistradores(registradoresData)

      // Fetch available users (company users not already assigned)
      const usersResponse = await fetch(`/api/concursos/${concursoId}/available-users`)
      const usersData = await usersResponse.json()
      setAvailableUsers(usersData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignRegistrador = async () => {
    if (!selectedUserId) {
      toast.error("Selecciona un usuario")
      return
    }

    try {
      setIsAssigning(true)
      const response = await fetch(`/api/concursos/${concursoId}/registradores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUserId }),
      })

      if (!response.ok) {
        throw new Error("Error al asignar registrador")
      }

      toast.success("Registrador asignado exitosamente")
      setIsDialogOpen(false)
      setSelectedUserId("")
      fetchData()
    } catch (error) {
      console.error("Error assigning registrador:", error)
      toast.error("Error al asignar registrador")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveRegistrador = async (registradorId: string) => {
    try {
      const response = await fetch(`/api/concursos/${concursoId}/registradores/${registradorId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al remover registrador")
      }

      toast.success("Registrador removido exitosamente")
      fetchData()
    } catch (error) {
      console.error("Error removing registrador:", error)
      toast.error("Error al remover registrador")
    }
  }

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Registradores</h1>
          <p className="text-muted-foreground mt-2">
            Asigna usuarios para registrar participantes en: <strong>{concurso?.nombre}</strong>
          </p>
          {concurso && (
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Inicio: {formatDate(concurso.fechaInicio)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Fin: {formatDate(concurso.fechaFin)}</span>
              </div>
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-viridian hover:bg-viridian/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Asignar Registrador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Asignar Nuevo Registrador</DialogTitle>
              <DialogDescription>
                Selecciona un usuario de tu empresa para asignar como registrador de este concurso
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar Usuario</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user">Seleccionar Usuario</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">
                              {user.nombre} {user.apellido}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay usuarios disponibles para asignar</p>
                  <p className="text-sm">
                    Todos los usuarios de tu empresa ya están asignados o no existen usuarios adicionales
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAssignRegistrador}
                disabled={!selectedUserId || isAssigning}
                className="bg-viridian hover:bg-viridian/90"
              >
                {isAssigning ? "Asignando..." : "Asignar Registrador"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Registradores */}
      <Card>
        <CardHeader>
          <CardTitle>Registradores Asignados ({registradores.length})</CardTitle>
          <CardDescription>Usuarios autorizados para registrar participantes en este concurso</CardDescription>
        </CardHeader>
        <CardContent>
          {registradores.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay registradores asignados</h3>
              <p className="text-muted-foreground mb-4">
                Asigna usuarios de tu empresa para que puedan registrar participantes
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-viridian hover:bg-viridian/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Primer Registrador
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha Asignación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registradores.map((registrador) => (
                  <TableRow key={registrador.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {registrador.user.nombre} {registrador.user.apellido}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {registrador.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {registrador.user.telefono && (
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {registrador.user.telefono}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{registrador.user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(registrador.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRegistrador(registrador.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
