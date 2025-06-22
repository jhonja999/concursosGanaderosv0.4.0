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
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Mail, Phone, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface Company {
  id: string
  nombre: string
}

interface FormData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  password: string
  confirmPassword: string
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
  password?: string
  confirmPassword?: string
  role?: string
  general?: string
}

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    role: "",
    isActive: true,
    contestAccess: false,
    companyId: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      if (response.ok) {
        const data = await response.json()
        // Assuming the API returns { companies: [...] } or just [...]
        // This handles both cases, preferring data.companies if it exists.
        setCompanies(Array.isArray(data.companies) ? data.companies : Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch companies. Status:", response.status)
        setCompanies([]) // Set to empty array on failed response
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      setCompanies([]) // Set to empty array on catch
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

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma la contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
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

    setIsLoading(true)
    setErrors({})
    setSuccessMessage("")

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim().toLowerCase(),
          telefono: formData.telefono.trim() || null,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive,
          contestAccess: formData.contestAccess,
          companyId: formData.companyId || null,
        }),
      })

      if (response.ok) {
        setSuccessMessage("Usuario creado correctamente")

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/admin/usuarios")
        }, 2000)
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          setErrors({ email: "Este email ya está en uso" })
        } else {
          setErrors({ general: errorData.error || "Error al crear el usuario" })
        }
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setErrors({ general: "Error de conexión al crear el usuario" })
    } finally {
      setIsLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold">Nuevo Usuario</h1>
          <p className="text-muted-foreground">Crea un nuevo usuario para el sistema</p>
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>
            Completa todos los campos requeridos. Los campos marcados con * son obligatorios.
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

            {/* Password */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contraseña</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? "border-red-500" : ""}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    placeholder="Repite la contraseña"
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
