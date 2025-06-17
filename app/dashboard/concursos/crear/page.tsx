"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { ArrowLeft, Save, Plus, Trash2, Trophy, Package, Blend, AlertCircle, Calendar, FileText } from "lucide-react"

interface Categoria {
  id: string
  nombre: string
  descripcion: string
  orden: number
  sexo?: string
  edadMinima?: number
  edadMaxima?: number
  tipoProducto?: string
  criterios?: string
}

const tiposConcurso = [
  { value: "GANADO", label: "Ganado", icon: Trophy, description: "Concurso de ganado bovino, equino, etc." },
  {
    value: "PRODUCTO",
    label: "Producto",
    icon: Package,
    description: "Concurso de productos como café, lácteos, etc.",
  },
  { value: "MIXTO", label: "Mixto", icon: Blend, description: "Concurso que acepta tanto ganado como productos" },
]

const sexoOptions = [
  { value: "MACHO", label: "Macho" },
  { value: "HEMBRA", label: "Hembra" },
  { value: "SIN_RESTRICCION", label: "Sin Restricción" },
]

export default function CrearConcursoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "",
    fechaInicio: "",
    fechaFin: "",
    fechaInscripcionInicio: "",
    fechaInscripcionFin: "",
    ubicacion: "",
    direccion: "",
    premios: "",
    reglamento: "",
    isPublished: false,
    isFeatured: false,
  })

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
    sexo: "",
    edadMinima: "",
    edadMaxima: "",
    tipoProducto: "",
    criterios: "",
  })

  const agregarCategoria = () => {
    if (!nuevaCategoria.nombre.trim()) {
      toast.error("El nombre de la categoría es requerido")
      return
    }

    const categoria: Categoria = {
      id: Date.now().toString(),
      nombre: nuevaCategoria.nombre,
      descripcion: nuevaCategoria.descripcion,
      orden: categorias.length,
      sexo: nuevaCategoria.sexo || undefined,
      edadMinima: nuevaCategoria.edadMinima ? Number.parseInt(nuevaCategoria.edadMinima) : undefined,
      edadMaxima: nuevaCategoria.edadMaxima ? Number.parseInt(nuevaCategoria.edadMaxima) : undefined,
      tipoProducto: nuevaCategoria.tipoProducto || undefined,
      criterios: nuevaCategoria.criterios || undefined,
    }

    setCategorias([...categorias, categoria])
    setNuevaCategoria({
      nombre: "",
      descripcion: "",
      sexo: "",
      edadMinima: "",
      edadMaxima: "",
      tipoProducto: "",
      criterios: "",
    })
    toast.success("Categoría agregada")
  }

  const eliminarCategoria = (id: string) => {
    setCategorias(categorias.filter((c) => c.id !== id))
    toast.success("Categoría eliminada")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (categorias.length === 0) {
      setError("Debes agregar al menos una categoría")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/concursos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categorias: categorias.map((c) => ({
            nombre: c.nombre,
            descripcion: c.descripcion,
            orden: c.orden,
            sexo: c.sexo,
            edadMinima: c.edadMinima,
            edadMaxima: c.edadMaxima,
            tipoProducto: c.tipoProducto,
            criterios: c.criterios,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el concurso")
      }

      toast.success("Concurso creado exitosamente")
      router.push(`/dashboard/concursos/${data.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const tipoSeleccionado = tiposConcurso.find((t) => t.value === formData.tipo)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Concurso</h1>
          <p className="text-muted-foreground">Configura tu concurso con categorías personalizadas</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Información Básica */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>Datos principales del concurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Concurso *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Gran Concurso Ganadero 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Concurso *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de concurso" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposConcurso.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center gap-2">
                            <tipo.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{tipo.label}</div>
                              <div className="text-xs text-muted-foreground">{tipo.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Describe el concurso, sus objetivos y características..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fechas y Ubicación
                </CardTitle>
                <CardDescription>Programa las fechas del concurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                    <Input
                      id="fechaInicio"
                      type="datetime-local"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha de Fin *</Label>
                    <Input
                      id="fechaFin"
                      type="datetime-local"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fechaFin: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInscripcionInicio">Inicio de Inscripciones</Label>
                    <Input
                      id="fechaInscripcionInicio"
                      type="datetime-local"
                      value={formData.fechaInscripcionInicio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fechaInscripcionInicio: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaInscripcionFin">Fin de Inscripciones</Label>
                    <Input
                      id="fechaInscripcionFin"
                      type="datetime-local"
                      value={formData.fechaInscripcionFin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fechaInscripcionFin: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ubicacion: e.target.value }))}
                      placeholder="Ej: Finca La Esperanza"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData((prev) => ({ ...prev, direccion: e.target.value }))}
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información Adicional
                </CardTitle>
                <CardDescription>Premios y reglamento del concurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="premios">Premios</Label>
                  <Textarea
                    id="premios"
                    value={formData.premios}
                    onChange={(e) => setFormData((prev) => ({ ...prev, premios: e.target.value }))}
                    placeholder="Describe los premios y reconocimientos..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reglamento">Reglamento</Label>
                  <Textarea
                    id="reglamento"
                    value={formData.reglamento}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reglamento: e.target.value }))}
                    placeholder="Reglas y condiciones del concurso..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                      />
                      <Label htmlFor="isFeatured">Concurso Destacado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublished"
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublished: checked }))}
                      />
                      <Label htmlFor="isPublished">Publicar Concurso</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categorías */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Categorías del Concurso</CardTitle>
                <CardDescription>
                  {tipoSeleccionado
                    ? `Crea categorías específicas para tu concurso de ${tipoSeleccionado.label.toLowerCase()}`
                    : "Selecciona el tipo de concurso para configurar las categorías"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.tipo && (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="nombreCategoria">Nombre de la Categoría</Label>
                        <Input
                          id="nombreCategoria"
                          value={nuevaCategoria.nombre}
                          onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, nombre: e.target.value }))}
                          placeholder={
                            formData.tipo === "GANADO"
                              ? "Ej: Toros Adultos"
                              : formData.tipo === "PRODUCTO"
                                ? "Ej: Café Especial"
                                : "Ej: Categoría General"
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descripcionCategoria">Descripción</Label>
                        <Textarea
                          id="descripcionCategoria"
                          value={nuevaCategoria.descripcion}
                          onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, descripcion: e.target.value }))}
                          placeholder="Describe los requisitos de esta categoría..."
                          rows={2}
                        />
                      </div>

                      {(formData.tipo === "GANADO" || formData.tipo === "MIXTO") && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="sexoCategoria">Sexo</Label>
                            <Select
                              value={nuevaCategoria.sexo}
                              onValueChange={(value) => setNuevaCategoria((prev) => ({ ...prev, sexo: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar sexo" />
                              </SelectTrigger>
                              <SelectContent>
                                {sexoOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label htmlFor="edadMinima">Edad Mín. (días)</Label>
                              <Input
                                id="edadMinima"
                                type="number"
                                value={nuevaCategoria.edadMinima}
                                onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, edadMinima: e.target.value }))}
                                placeholder="0"
                                min="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edadMaxima">Edad Máx. (días)</Label>
                              <Input
                                id="edadMaxima"
                                type="number"
                                value={nuevaCategoria.edadMaxima}
                                onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, edadMaxima: e.target.value }))}
                                placeholder="365"
                                min="0"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {(formData.tipo === "PRODUCTO" || formData.tipo === "MIXTO") && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="tipoProducto">Tipo de Producto</Label>
                            <Input
                              id="tipoProducto"
                              value={nuevaCategoria.tipoProducto}
                              onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, tipoProducto: e.target.value }))}
                              placeholder="Ej: Café Arábica, Queso Fresco"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="criterios">Criterios de Evaluación</Label>
                            <Textarea
                              id="criterios"
                              value={nuevaCategoria.criterios}
                              onChange={(e) => setNuevaCategoria((prev) => ({ ...prev, criterios: e.target.value }))}
                              placeholder="Criterios específicos para evaluar esta categoría..."
                              rows={2}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <Button type="button" onClick={agregarCategoria} className="w-full" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Categoría
                    </Button>
                  </>
                )}

                {categorias.length > 0 && (
                  <div className="space-y-2">
                    <Label>Categorías Agregadas ({categorias.length})</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {categorias.map((categoria) => (
                        <div key={categoria.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{categoria.nombre}</div>
                            {categoria.descripcion && (
                              <div className="text-sm text-muted-foreground line-clamp-1">{categoria.descripcion}</div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {categoria.sexo && <Badge variant="outline">{categoria.sexo}</Badge>}
                              {categoria.edadMinima && <Badge variant="outline">Min: {categoria.edadMinima}d</Badge>}
                              {categoria.edadMaxima && <Badge variant="outline">Max: {categoria.edadMaxima}d</Badge>}
                              {categoria.tipoProducto && <Badge variant="outline">{categoria.tipoProducto}</Badge>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarCategoria(categoria.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-viridian hover:bg-viridian/90">
            {isSubmitting ? (
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
        </div>
      </form>
    </div>
  )
}
