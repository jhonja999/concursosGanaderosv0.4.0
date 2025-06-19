"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Filter,
  Download,
  Mail,
  Phone,
  Building2,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  role: string
  isActive: boolean
  isSuperAdmin: boolean
  company?: {
    id: string
    nombre: string
  }
  createdAt: string
  lastLogin?: string
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [companies, setCompanies] = useState<{ id: string; nombre: string }[]>([])

  useEffect(() => {
    fetchUsers()
    fetchCompanies()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter, companyFilter])

  const fetchUsers = async () => {
    try {
      // Simular datos de usuarios
      const mockUsers: User[] = [
        {
          id: "1",
          nombre: "Juan",
          apellido: "Pérez",
          email: "juan.perez@example.com",
          telefono: "+57 300 123 4567",
          role: "CONCURSO_ADMIN",
          isActive: true,
          isSuperAdmin: false,
          company: { id: "1", nombre: "Ganadera El Progreso" },
          createdAt: "2024-01-15T10:00:00Z",
          lastLogin: "2024-01-20T14:30:00Z",
        },
        {
          id: "2",
          nombre: "María",
          apellido: "González",
          email: "maria.gonzalez@example.com",
          telefono: "+57 301 234 5678",
          role: "REGISTRADOR",
          isActive: true,
          isSuperAdmin: false,
          company: { id: "1", nombre: "Ganadera El Progreso" },
          createdAt: "2024-01-16T11:00:00Z",
          lastLogin: "2024-01-20T09:15:00Z",
        },
        {
          id: "3",
          nombre: "Carlos",
          apellido: "Rodríguez",
          email: "carlos.rodriguez@example.com",
          role: "SUPERADMIN",
          isActive: true,
          isSuperAdmin: true,
          createdAt: "2024-01-01T08:00:00Z",
          lastLogin: "2024-01-20T16:45:00Z",
        },
        {
          id: "4",
          nombre: "Ana",
          apellido: "Martínez",
          email: "ana.martinez@example.com",
          telefono: "+57 302 345 6789",
          role: "CONCURSO_ADMIN",
          isActive: false,
          isSuperAdmin: false,
          company: { id: "2", nombre: "Asociación Ganadera Norte" },
          createdAt: "2024-01-10T12:00:00Z",
        },
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      // Simular datos de compañías
      setCompanies([
        { id: "1", nombre: "Ganadera El Progreso" },
        { id: "2", nombre: "Asociación Ganadera Norte" },
        { id: "3", nombre: "Cooperativa Lechera Sur" },
      ])
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.company?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => 
        statusFilter === "active" ? user.isActive : !user.isActive
      )
    }

    if (companyFilter !== "all") {
      filtered = filtered.filter((user) => user.company?.id === companyFilter)
    }

    setFilteredUsers(filtered)
  }

  const getRoleBadge = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) {
      return <Badge variant="destructive">SUPERADMIN</Badge>
    }

    const variants = {
      CONCURSO_ADMIN: { variant: "default" as const, text: "Admin Concurso" },
      REGISTRADOR: { variant: "secondary" as const, text: "Registrador" },
    }

    const config = variants[role as keyof typeof variants] || { variant: "outline" as const, text: role }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Activo" : "Inactivo"}
      </Badge>
    )
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Aquí iría la llamada a la API para cambiar el estado
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ))
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        // Aquí iría la llamada a la API para eliminar
        setUsers(users.filter(user => user.id !== userId))
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const exportUsers = () => {
    // Implementar exportación de usuarios
    console.log("Exporting users...")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button asChild>
            <Link href="/admin/usuarios/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.isActive).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "CONCURSO_ADMIN" || u.isSuperAdmin).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.isSuperAdmin).length} superadmins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registradores</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "REGISTRADOR").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuarios operativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Compañía</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.company && !u.isSuperAdmin).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren asignación
            </p>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre, email o compañía..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
                  <SelectItem value="CONCURSO_ADMIN">Admin Concurso</SelectItem>
                  <SelectItem value="REGISTRADOR">Registrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Compañía</Label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las compañías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las compañías</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista de todos los usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Creado: {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.telefono && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.telefono}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role, user.isSuperAdmin)}
                  </TableCell>
                  <TableCell>
                    {user.company ? (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span className="text-sm">{user.company.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.isActive)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                    </div>
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
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/usuarios/${user.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        {!user.isSuperAdmin && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información completa del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nombre Completo</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.nombre} {selectedUser.apellido}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Teléfono</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.telefono || "No especificado"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Rol</Label>
                  <div className="mt-1">
                    {getRoleBadge(selectedUser.role, selectedUser.isSuperAdmin)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Compañía</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.company?.nombre || "Sin asignar"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedUser.isActive)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Fecha de Registro</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Último Acceso</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : "Nunca"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cerrar
            </Button>
            {selectedUser && (
              <Button asChild>
                <Link href={`/admin/usuarios/${selectedUser.id}/editar`}>
                  Editar Usuario
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}