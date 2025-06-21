"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Building2 } from "lucide-react"
import Link from "next/link"
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload"
import { toast } from "sonner"

interface CompanyFormData {
  nombre: string
  slug: string
  email: string
  telefono: string
  direccion: string
  descripcion: string
  logo: string
  website: string
  ubicacion: string
  tipoOrganizacion: string
  isFeatured: boolean
  isPublished: boolean
}

export default function NuevaCompaniaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CompanyFormData>({
    nombre: "",
    slug: "",
    email: "",
    telefono: "",
    direccion: "",
    descripcion: "",
    logo: "",
    website: "",
    ubicacion: "",
    tipoOrganizacion: "",
    isFeatured: false,
    isPublished: false,
  })

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

  const handleInputChange = (field: keyof CompanyFormData, value: string | boolean) => {
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

    if (!formData.nombre || !formData.email) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Compañía creada exitosamente")
        router.push("/admin/companias")
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al crear la compañía")
      }
    } catch (error) {
      console.error("Error creating company:", error)
      toast.error("Error al crear la compañía")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/companias">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nueva Compañía</h1>
          <p className="text-muted-foreground">Registra una nueva compañía organizadora</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>Información principal de la compañía</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">
                      Nombre de la Compañía <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Nombre de la compañía"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Este es el nombre público de la compañía.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      placeholder="slug-de-la-compania"
                    />
                    <p className="text-xs text-muted-foreground">
                      Este es el identificador único para URLs. Se genera automáticamente a partir del nombre.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Descripción de la compañía"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Breve descripción de la compañía.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="contacto@compania.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://www.compania.com"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      value={formData.ubicacion}
                      onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                      placeholder="Ciudad, País"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoOrganizacion">Tipo de Organización</Label>
                    <Input
                      id="tipoOrganizacion"
                      value={formData.tipoOrganizacion}
                      onChange={(e) => handleInputChange("tipoOrganizacion", e.target.value)}
                      placeholder="Asociación Ganadera, Cooperativa, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    placeholder="Dirección completa"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Logo de la Compañía</CardTitle>
                <CardDescription>Sube el logo oficial de la compañía</CardDescription>
              </CardHeader>
              <CardContent>
                <CloudinaryUpload
                  value={formData.logo}
                  onChange={(url) => handleInputChange("logo", url)}
                  folder="companias"
                  entityType="company"
                  label="Logo de la Compañía"
                  description="Sube el logo oficial (PNG/JPG, máx. 10MB)"
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>Opciones de visibilidad y destacado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isFeatured">Destacada</Label>
                    <p className="text-xs text-muted-foreground">Mostrar esta compañía en secciones destacadas.</p>
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
                    <Label htmlFor="isPublished">Publicada</Label>
                    <p className="text-xs text-muted-foreground">Hacer visible esta compañía en el sitio.</p>
                  </div>
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleInputChange("isPublished", checked)}
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
                        Crear Compañía
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild className="w-full">
                    <Link href="/admin/companias">Cancelar</Link>
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
