"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Save,
  Trash2,
  UserIcon,
  Mail,
  Phone,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface UserData {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  role: string
  isActive: boolean
  contestAccess?: boolean
  company?: {
    id: string
    nombre: string
  }
  createdAt: string
  lastLogin?: string
}

interface Company {
  id: string
  nombre: string
}

interface FormData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  role: string
  isActive: boolean
  contestAccess: boolean
  companyId: string
}

interface FormErrors {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  role?: string
  general?: string
}

export default function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    role: "",
    isActive: true,
    contestAccess: false,
    companyId: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchUser()
    fetchCompanies()
  }, [params.id])

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          email: userData.email || "",
          telefono: userData.telefono || "",
          role: userData.role || "",
          isActive: userData.isActive ?? true,
          contestAccess: userData.contestAccess ?? false,
          companyId: userData.company?.id || "",
        })
      } else {
        setErrors({ general: "Error al cargar los datos del usuario" })
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setErrors({ general: "Error de conexión al cargar el usuario" })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      if (response.ok) {
        const companiesData = await response.json()
        setCompanies(companiesData)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido"
    } else if (formData.apellido.length < 2) {
      newErrors.apellido = "El apellido debe tener al menos 2 caracteres"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido"
    }

    if (formData.telefono && !/^\+?[\d\s\-$$$$]+$/.test(formData.telefono)) {
      newErrors.telefono = "El formato del teléfono no es válido"
    }

    if (!formData.role) {
      newErrors.role = "El rol es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setErrors({})
    setSuccessMessage("")

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim().toLowerCase(),
          telefono: formData.telefono.trim() || null,
          role: formData.role,
          isActive: formData.isActive,
          contestAccess: formData.contestAccess,
          companyId: formData.companyId || null,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setSuccessMessage("Usuario actualizado correctamente")

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/usuarios")
        }, 2000)
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          setErrors({ email: "Este email ya está en uso por otro usuario" })
        } else {
          setErrors({ general: errorData.error || "Error al actualizar el usuario" })
        }
      }
    } catch (error) {
      console.error("Error updating user:", error)
      setErrors({ general: "Error de conexión al actualizar el usuario" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/usuarios")
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || "Error al eliminar el usuario" })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      setErrors({ general: "Error de conexión al eliminar el usuario" })
    } finally {
      setIsDeleting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      SUPERADMIN: { variant: "destructive" as const, text: "SUPERADMIN" },
      CONCURSO_ADMIN: { variant: "default" as const, text: "Admin Concurso" },
      REGISTRADOR: { variant: "secondary" as const, text: "Registrador" },
    }

    const config = variants[role as keyof typeof variants] || { variant: "outline" as const, text: role }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos del usuario...</span>
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
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>Usuario no encontrado o no tienes permisos para editarlo.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/usuarios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Usuario</h1>
            <p className="text-muted-foreground">
              Modifica la información del usuario {user.nombre} {user.apellido}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.role !== "SUPERADMIN" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Eliminar Usuario
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                    <strong>
                      {user.nombre} {user.apellido}
                    </strong>{" "}
                    y todos sus datos asociados.
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
          )}
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
      {errors.general && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
            <CardDescription>Datos básicos y estado actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado Actual</Label>
              <div className="flex items-center gap-2">
                <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Activo" : "Inactivo"}</Badge>
                {getRoleBadge(user.role)}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Compañía</Label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.company?.nombre || "Sin asignar"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha de Registro</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Último Acceso</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Editar Información</CardTitle>
              <CardDescription>
                Modifica los datos del usuario. Los campos marcados con * son obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información Personal</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className={errors.nombre ? "border-red-500" : ""}
                        placeholder="Ingresa el nombre"
                      />
                      {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido *</Label>
                      <Input
                        id="apellido"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className={errors.apellido ? "border-red-500" : ""}
                        placeholder="Ingresa el apellido"
                      />
                      {errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className={`pl-10 ${errors.telefono ? "border-red-500" : ""}`}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    {errors.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}
                  </div>
                </div>

                <Separator />

                {/* Role and Permissions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Rol y Permisos</h3>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rol *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REGISTRADOR">Registrador</SelectItem>
                        <SelectItem value="CONCURSO_ADMIN">Admin Concurso</SelectItem>
                        {user.role === "SUPERADMIN" && <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>}
                      </SelectContent>
                    </Select>
                    {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Compañía</Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una compañía" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive">Usuario Activo</Label>
                      <p className="text-sm text-muted-foreground">Permite al usuario iniciar sesión en el sistema</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="contestAccess">Acceso a Concursos</Label>
                      <p className="text-sm text-muted-foreground">Permite al usuario participar en concursos</p>
                    </div>
                    <Switch
                      id="contestAccess"
                      checked={formData.contestAccess}
                      onCheckedChange={(checked) => setFormData({ ...formData, contestAccess: checked })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/usuarios">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
