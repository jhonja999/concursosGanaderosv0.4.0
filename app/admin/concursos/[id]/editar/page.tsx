"use client"

import type React from "react"
import { use } from "react"

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
import { ArrowLeft, Save, Trophy, CalendarIcon, MapPin, DollarSign, Plus, X, Building2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

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
  tipoConcurso: string
  categorias: string[]
  premiacion: string
  reglamento: string
  contactoOrganizador: string
  telefonoContacto: string
  emailContacto: string
  requisitoEspeciales: string
  isPublic: boolean
  isActive: boolean
  isFeatured: boolean
  permitirRegistroTardio: boolean
  companyId: string
}

export default function EditarConcursoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [companies, setCompanies] = useState<Array<{ id: string; nombre: string }>>([])
  const [newCategory, setNewCategory] = useState("")
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
    tipoConcurso: "",
    categorias: [],
    premiacion: "",
    reglamento: "",
    contactoOrganizador: "",
    telefonoContacto: "",
    emailContacto: "",
    requisitoEspeciales: "",
    isPublic: false,
    isActive: false,
    isFeatured: false,
    permitirRegistroTardio: false,
    companyId: "",
  })

  useEffect(() => {
    fetchContest()
    fetchCompanies()
  }, [resolvedParams.id])

  const fetchContest = async () => {
    try {
      const response = await fetch(`/api/admin/concursos/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        const contest = data.contest

        setFormData({
          nombre: contest.nombre || "",
          slug: contest.slug || "",
          descripcion: contest.descripcion || "",
          imagenPrincipal: contest.imagenPrincipal || "",
          fechaInicio: contest.fechaInicio ? new Date(contest.fechaInicio) : undefined,
          fechaFin: contest.fechaFin ? new Date(contest.fechaFin) : undefined,
          fechaInicioRegistro: contest.fechaInicioRegistro ? new Date(contest.fechaInicioRegistro) : undefined,
          fechaFinRegistro: contest.fechaFinRegistro ? new Date(contest.fechaFinRegistro) : undefined,
          ubicacion: contest.ubicacion || "",
          direccion: contest.direccion || "",
          capacidadMaxima: contest.capacidadMaxima || 0,
          cuotaInscripcion: contest.cuotaInscripcion || 0,
          tipoConcurso: contest.tipoGanado?.[0] || "", // Handle array to string conversion
          categorias: contest.categorias || [],
          premiacion:
            typeof contest.premiacion === "string" ? contest.premiacion : contest.premiacion?.descripcion || "",
          reglamento: contest.reglamento || "",
          contactoOrganizador: contest.contactoOrganizador || "",
          telefonoContacto: contest.telefonoContacto || "",
          emailContacto: contest.emailContacto || "",
          requisitoEspeciales: contest.requisitoEspeciales || "",
          isPublic: contest.isPublic || false,
          isActive: contest.isActive || false,
          isFeatured: contest.isFeatured || false,
          permitirRegistroTardio: contest.permitirRegistroTardio || false,
          companyId: contest.companyId || "",
        })
      } else {
        toast.error("Error al cargar el concurso")
        router.push("/admin/concursos")
      }
    } catch (error) {
      console.error("Error fetching contest:", error)
      toast.error("Error al cargar el concurso")
      router.push("/admin/concursos")
    } finally {
      setIsLoading(false)
    }
  }

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

  const addCategory = () => {
    if (newCategory.trim() && !formData.categorias.includes(newCategory.trim())) {
      setFormData((prev) => ({
        ...prev,
        categorias: [...prev.categorias, newCategory.trim()],
      }))
      setNewCategory("")
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((cat) => cat !== categoryToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.descripcion) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    if (!formData.companyId) {
      toast.error("Por favor selecciona una compañía organizadora")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/concursos/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // Ensure dates are properly formatted
          fechaInicio: formData.fechaInicio?.toISOString(),
          fechaFin: formData.fechaFin?.toISOString(),
          fechaInicioRegistro: formData.fechaInicioRegistro?.toISOString(),
          fechaFinRegistro: formData.fechaFinRegistro?.toISOString(),
        }),
      })

      if (response.ok) {
        toast.success("Concurso actualizado exitosamente")
        router.push("/admin/concursos")
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al actualizar el concurso")
      }
    } catch (error) {
      console.error("Error updating contest:", error)
      toast.error("Error al actualizar el concurso")
    } finally {
      setIsSaving(false)
    }
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/concursos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Editar Concurso</h1>
          <p className="text-muted-foreground">Modificar información del concurso</p>
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
                    <p className="text-xs text-muted-foreground">URL pública: localhost:3000/{formData.slug}</p>
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
                    <Label htmlFor="tipoConcurso">Tipo de Concurso</Label>
                    <Select
                      value={formData.tipoConcurso}
                      onValueChange={(value) => handleInputChange("tipoConcurso", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOVINO">Concurso Bovino</SelectItem>
                        <SelectItem value="EQUINO">Concurso Equino</SelectItem>
                        <SelectItem value="PORCINO">Concurso Porcino</SelectItem>
                        <SelectItem value="OVINO">Concurso Ovino</SelectItem>
                        <SelectItem value="CAPRINO">Concurso Caprino</SelectItem>
                        <SelectItem value="AVIAR">Concurso Aviar</SelectItem>
                        <SelectItem value="OTROS">Otros</SelectItem>
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

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categorías del Concurso</CardTitle>
                <CardDescription>
                  Define las categorías en las que se pueden inscribir los participantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nombre de la categoría"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCategory()
                      }
                    }}
                  />
                  <Button type="button" onClick={addCategory} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.categorias.length > 0 && (
                  <div className="space-y-2">
                    <Label>Categorías agregadas:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.categorias.map((categoria, index) => (
                        <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm">
                          <span>{categoria}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => removeCategory(categoria)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                    placeholder="Ciudad, Departamento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección Completa</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    placeholder="Dirección detallada del evento"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
                <CardDescription>Detalles adicionales del concurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reglamento">Reglamento</Label>
                  <Textarea
                    id="reglamento"
                    value={formData.reglamento}
                    onChange={(e) => handleInputChange("reglamento", e.target.value)}
                    placeholder="Reglamento del concurso"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requisitoEspeciales">Requisitos Especiales</Label>
                  <Textarea
                    id="requisitoEspeciales"
                    value={formData.requisitoEspeciales}
                    onChange={(e) => handleInputChange("requisitoEspeciales", e.target.value)}
                    placeholder="Requisitos especiales para participar"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="contactoOrganizador">Contacto Organizador</Label>
                    <Input
                      id="contactoOrganizador"
                      value={formData.contactoOrganizador}
                      onChange={(e) => handleInputChange("contactoOrganizador", e.target.value)}
                      placeholder="Nombre del contacto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefonoContacto">Teléfono de Contacto</Label>
                    <Input
                      id="telefonoContacto"
                      value={formData.telefonoContacto}
                      onChange={(e) => handleInputChange("telefonoContacto", e.target.value)}
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailContacto">Email de Contacto</Label>
                    <Input
                      id="emailContacto"
                      type="email"
                      value={formData.emailContacto}
                      onChange={(e) => handleInputChange("emailContacto", e.target.value)}
                      placeholder="contacto@concurso.com"
                    />
                  </div>
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
                  entityId={resolvedParams.id}
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
                  <Select value={formData.companyId} onValueChange={(value) => handleInputChange("companyId", value)}>
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
                    <Label htmlFor="isFeatured">Destacado</Label>
                    <p className="text-xs text-muted-foreground">Mostrar en secciones especiales</p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
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
                  <Label htmlFor="cuotaInscripcion">Cuota de Inscripción</Label>
                  <Input
                    id="cuotaInscripcion"
                    type="number"
                    min="0"
                    value={formData.cuotaInscripcion || ""}
                    onChange={(e) => handleInputChange("cuotaInscripcion", Number.parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="premiacion">Premiación</Label>
                  <Textarea
                    id="premiacion"
                    value={formData.premiacion}
                    onChange={(e) => handleInputChange("premiacion", e.target.value)}
                    placeholder="Descripción de premios"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild className="w-full">
                    <Link href="/admin/concursos">Cancelar</Link>
                  </Button>
                  <Button type="button" variant="outline" asChild className="w-full">
                    <Link href={`/admin/concursos/${resolvedParams.id}/auspiciadores`}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Gestionar Auspiciadores
                    </Link>
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
