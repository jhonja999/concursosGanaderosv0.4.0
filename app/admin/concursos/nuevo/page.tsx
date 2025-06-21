"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, Save, Trophy, CalendarIcon, MapPin, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ConcursoFormData {
  nombre: string
  slug: string
  descripcion: string
  imagenPrincipal: string
  fechaInicio: Date | undefined
  fechaFin: Date | undefined
  fechaInicioRegistro: Date | undefined
  fechaFinRegistro: Date | undefined
  ubicacion: string
  direccion: string
  capacidadMaxima: number
  cuotaInscripcion: number
  tipoGanado: string
  categorias: string[]
  premiacion: string
  reglamento: string
  contactoOrganizador: string
  telefonoContacto: string
  emailContacto: string
  requisitoEspeciales: string
  isPublic: boolean
  isActive: boolean
  permitirRegistroTardio: boolean
  isFeatured: boolean
  companyId: string
}

export default function NuevoConcursoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ConcursoFormData>({
    nombre: "",
    slug: "",
    descripcion: "",
    imagenPrincipal: "",
    fechaInicio: undefined,
    fechaFin: undefined,
    fechaInicioRegistro: undefined,
    fechaFinRegistro: undefined,
    ubicacion: "",
    direccion: "",
    capacidadMaxima: 0,
    cuotaInscripcion: 0,
    tipoGanado: "",
    categorias: [],
    premiacion: "",
    reglamento: "",
    contactoOrganizador: "",
    telefonoContacto: "",
    emailContacto: "",
    requisitoEspeciales: "",
    isPublic: false,
    isActive: false,
    permitirRegistroTardio: false,
    isFeatured: false,
    companyId: "",
  })

  const [companies, setCompanies] = useState<Array<{ id: string; nombre: string }>>([])

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .replace(/[áàäâ]/g, "a")
      .replace(/[éèëê]/g, "e")
      .replace(/[íìïî]/g, "i")
      .replace(/[óòöô]/g, "o")
      .replace(/[úùüû]/g, "u")
      .replace(/[ñ]/g, "n")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleInputChange = (field: keyof ConcursoFormData, value: string | boolean | number | Date | undefined) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-generate slug when name changes
      if (field === "nombre" && typeof value === "string") {
        updated.slug = generateSlug(value)
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.descripcion) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/contests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Concurso creado exitosamente")
        router.push("/admin/concursos")
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al crear el concurso")
      }
    } catch (error) {
      console.error("Error creating contest:", error)
      toast.error("Error al crear el concurso")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/concursos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nuevo Concurso</h1>
          <p className="text-muted-foreground">Crear un nuevo concurso ganadero</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>Información principal del concurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">
                      Nombre del Concurso <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Nombre del concurso"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      placeholder="slug-del-concurso"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Descripción detallada del concurso"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipoGanado">Tipo de Ganado</Label>
                    <Select onValueChange={(value) => handleInputChange("tipoGanado", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bovino">Bovino</SelectItem>
                        <SelectItem value="equino">Equino</SelectItem>
                        <SelectItem value="porcino">Porcino</SelectItem>
                        <SelectItem value="ovino">Ovino</SelectItem>
                        <SelectItem value="caprino">Caprino</SelectItem>
                        <SelectItem value="mixto">Mixto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacidadMaxima">Capacidad Máxima</Label>
                    <Input
                      id="capacidadMaxima"
                      type="number"
                      min="0"
                      value={formData.capacidadMaxima || ""}
                      onChange={(e) => handleInputChange("capacidadMaxima", Number.parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Fechas Importantes
                </CardTitle>
                <CardDescription>Configurar fechas del concurso y registro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Fecha de Inicio del Concurso</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.fechaInicio && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.fechaInicio ? (
                            format(formData.fechaInicio, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaInicio}
                          onSelect={(date) => handleInputChange("fechaInicio", date || undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha de Fin del Concurso</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.fechaFin && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.fechaFin ? (
                            format(formData.fechaFin, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaFin}
                          onSelect={(date) => handleInputChange("fechaFin", date || undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Inicio de Registros</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.fechaInicioRegistro && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.fechaInicioRegistro ? (
                            format(formData.fechaInicioRegistro, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaInicioRegistro}
                          onSelect={(date) => handleInputChange("fechaInicioRegistro", date || undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Fin de Registros</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.fechaFinRegistro && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.fechaFinRegistro ? (
                            format(formData.fechaFinRegistro, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaFinRegistro}
                          onSelect={(date) => handleInputChange("fechaFinRegistro", date || undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
                <CardDescription>Información del lugar donde se realizará el concurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación (Opcional)</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                    placeholder="Ciudad, Departamento (opcional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección Completa (Opcional)</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    placeholder="Dirección detallada del evento (opcional)"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Imagen Principal</CardTitle>
                <CardDescription>Imagen principal del concurso</CardDescription>
              </CardHeader>
              <CardContent>
                <CloudinaryUpload
                  value={formData.imagenPrincipal}
                  onChange={(url) => handleInputChange("imagenPrincipal", url)}
                  folder="concursos"
                  entityType="contest"
                  label="Imagen Principal"
                  description="Imagen representativa del concurso (máx. 10MB)"
                />
              </CardContent>
            </Card>

            {/* Company Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Compañía Organizadora</CardTitle>
                <CardDescription>Selecciona la compañía que organiza el concurso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="companyId">Compañía</Label>
                  <Select onValueChange={(value) => handleInputChange("companyId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una compañía" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>Opciones del concurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPublic">Público</Label>
                    <p className="text-xs text-muted-foreground">Visible en el sitio público</p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Activo</Label>
                    <p className="text-xs text-muted-foreground">Aceptar registros</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permitirRegistroTardio">Registro Tardío</Label>
                    <p className="text-xs text-muted-foreground">Permitir después de la fecha límite</p>
                  </div>
                  <Switch
                    id="permitirRegistroTardio"
                    checked={formData.permitirRegistroTardio}
                    onCheckedChange={(checked) => handleInputChange("permitirRegistroTardio", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isFeatured">Destacado</Label>
                    <p className="text-xs text-muted-foreground">Mostrar en secciones especiales</p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información Financiera
                </CardTitle>
                <CardDescription>Costos y premiación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cuotaInscripcion">Cuota de Inscripción (Opcional)</Label>
                  <Input
                    id="cuotaInscripcion"
                    type="number"
                    min="0"
                    value={formData.cuotaInscripcion || ""}
                    onChange={(e) => handleInputChange("cuotaInscripcion", Number.parseInt(e.target.value) || 0)}
                    placeholder="0 (opcional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="premiacion">Premiación (Opcional)</Label>
                  <Textarea
                    id="premiacion"
                    value={formData.premiacion}
                    onChange={(e) => handleInputChange("premiacion", e.target.value)}
                    placeholder="Descripción de premios (opcional)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Crear Concurso
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild className="w-full">
                    <Link href="/admin/concursos">Cancelar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
