"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Building2, FileText, Send, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

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

interface CompanyRequest {
  id: string
  nombreCompania: string
  status: string
  createdAt: string
  notas?: string
}

export default function SolicitarCompaniaPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [existingRequest, setExistingRequest] = useState<CompanyRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    nombreCompania: "",
    descripcionCompania: "",
    tipoOrganizacion: "",
    ubicacion: "",
    website: "",
    motivacion: "",
    experiencia: "",
  })

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      // Verificar usuario actual
      const userResponse = await fetch("/api/auth/me")
      if (!userResponse.ok) {
        router.push("/iniciar-sesion")
        return
      }

      const userData = await userResponse.json()
      setUser(userData.user)

      // Si ya tiene compañía, redirigir al dashboard
      if (userData.user.company) {
        router.push("/dashboard")
        return
      }

      // Verificar si ya tiene una solicitud pendiente
      const requestResponse = await fetch("/api/company-requests")
      if (requestResponse.ok) {
        const requests = await requestResponse.json()
        if (requests.length > 0) {
          setExistingRequest(requests[0])
        }
      }
    } catch (error) {
      console.error("Error checking user status:", error)
      setError("Error al verificar el estado del usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/company-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess("Solicitud enviada exitosamente. Recibirás una notificación cuando sea revisada.")
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || "Error al enviar la solicitud")
      }
    } catch (error) {
      console.error("Error submitting request:", error)
      setError("Error al enviar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDIENTE: { variant: "secondary" as const, text: "Pendiente", icon: Clock },
      EN_REVISION: { variant: "default" as const, text: "En Revisión", icon: AlertTriangle },
      APROBADA: { variant: "default" as const, text: "Aprobada", icon: CheckCircle },
      RECHAZADA: { variant: "destructive" as const, text: "Rechazada", icon: XCircle },
    }

    const config = variants[status as keyof typeof variants] || variants.PENDIENTE
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Solicitar Compañía</h1>
          <p className="text-gray-600">
            Para acceder a todas las funcionalidades, necesitas crear una compañía que será revisada por nuestro equipo
          </p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nombre Completo</Label>
                <p className="text-sm text-muted-foreground">
                  {user.nombre} {user.apellido}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Request Status */}
        {existingRequest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Estado de tu Solicitud
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{existingRequest.nombreCompania}</h3>
                    <p className="text-sm text-muted-foreground">
                      Solicitada el {new Date(existingRequest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(existingRequest.status)}
                </div>

                {existingRequest.notas && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Notas del revisor:</strong> {existingRequest.notas}
                    </AlertDescription>
                  </Alert>
                )}

                {existingRequest.status === "RECHAZADA" && (
                  <Alert>
                    <AlertDescription>
                      Tu solicitud fue rechazada. Puedes enviar una nueva solicitud con las correcciones sugeridas.
                    </AlertDescription>
                  </Alert>
                )}

                {existingRequest.status === "APROBADA" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ¡Felicidades! Tu solicitud fue aprobada. Actualiza la página para acceder a tu dashboard.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Form */}
        {(!existingRequest || existingRequest.status === "RECHAZADA") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                {existingRequest?.status === "RECHAZADA" ? "Nueva Solicitud" : "Solicitar Compañía"}
              </CardTitle>
              <CardDescription>Completa la información para solicitar la creación de tu compañía</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreCompania">
                      Nombre de la Compañía <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombreCompania"
                      value={formData.nombreCompania}
                      onChange={(e) => setFormData({ ...formData, nombreCompania: e.target.value })}
                      placeholder="Ej: Asociación Ganadera del Valle"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoOrganizacion">
                      Tipo de Organización <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.tipoOrganizacion}
                      onValueChange={(value) => setFormData({ ...formData, tipoOrganizacion: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asociación Ganadera">Asociación Ganadera</SelectItem>
                        <SelectItem value="Cooperativa">Cooperativa</SelectItem>
                        <SelectItem value="Fundación">Fundación</SelectItem>
                        <SelectItem value="Empresa Privada">Empresa Privada</SelectItem>
                        <SelectItem value="Institución Educativa">Institución Educativa</SelectItem>
                        <SelectItem value="Entidad Gubernamental">Entidad Gubernamental</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                      placeholder="Ciudad, Departamento, País"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.ejemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcionCompania">Descripción de la Compañía</Label>
                  <Textarea
                    id="descripcionCompania"
                    value={formData.descripcionCompania}
                    onChange={(e) => setFormData({ ...formData, descripcionCompania: e.target.value })}
                    placeholder="Describe brevemente tu organización, sus objetivos y actividades principales..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivacion">
                    Motivación <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="motivacion"
                    value={formData.motivacion}
                    onChange={(e) => setFormData({ ...formData, motivacion: e.target.value })}
                    placeholder="¿Por qué quieres crear esta compañía en nuestra plataforma? ¿Qué tipo de concursos planeas organizar?"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experiencia">Experiencia Previa</Label>
                  <Textarea
                    id="experiencia"
                    value={formData.experiencia}
                    onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                    placeholder="Describe tu experiencia organizando eventos, concursos o actividades relacionadas con el sector ganadero..."
                    rows={3}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => router.push("/")}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Pending Request Info */}
        {existingRequest && existingRequest.status === "PENDIENTE" && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Clock className="h-12 w-12 text-blue-500 mx-auto" />
                <h3 className="text-lg font-medium">Solicitud en Proceso</h3>
                <p className="text-muted-foreground">
                  Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por email cuando tengamos una
                  respuesta.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
