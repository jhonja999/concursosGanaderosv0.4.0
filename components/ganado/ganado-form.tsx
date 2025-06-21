"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload, X, Check } from "lucide-react"
import { CATEGORIAS_GANADO, RAZAS_GANADO, SEXOS_GANADO } from "@/lib/constants/ganado"

interface GanadoFormData {
  nombre: string
  fecha_nacimiento?: string
  dias_nacida?: number
  categoria: string
  establo?: string
  en_remate: boolean
  propietario?: string
  descripcion?: string
  raza: string
  peso?: number
  sexo?: string
  imagen_url?: string
  puntaje?: number
}

interface GanadoFormProps {
  initialData?: any
  onSubmit: (data: GanadoFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface Suggestion {
  id: string
  nombreCompleto?: string
  nombre?: string
  telefono?: string
  email?: string
  ubicacion?: string
}

export function GanadoForm({ initialData, onSubmit, onCancel, isLoading = false }: GanadoFormProps) {
  const [criadorSuggestions, setCriadorSuggestions] = useState<Suggestion[]>([])
  const [establoSuggestions, setEstabloSuggestions] = useState<Suggestion[]>([])
  const [showCriadorSuggestions, setShowCriadorSuggestions] = useState(false)
  const [showEstabloSuggestions, setShowEstabloSuggestions] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<GanadoFormData>({
    defaultValues: initialData || {
      en_remate: false,
    }
  })

  const watchedPropietario = watch("propietario")
  const watchedEstablo = watch("establo")
  const watchedImagenUrl = watch("imagen_url")

  // Buscar sugerencias de criadores
  const searchCriadores = async (query: string) => {
    if (query.length < 2) {
      setCriadorSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/criadores/suggestions?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const suggestions = await response.json()
        setCriadorSuggestions(suggestions)
        setShowCriadorSuggestions(true)
      }
    } catch (error) {
      console.error("Error fetching criador suggestions:", error)
    }
  }

  // Buscar sugerencias de establos
  const searchEstablos = async (query: string) => {
    if (query.length < 2) {
      setEstabloSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/establos/suggestions?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const suggestions = await response.json()
        setEstabloSuggestions(suggestions)
        setShowEstabloSuggestions(true)
      }
    } catch (error) {
      console.error("Error fetching establo suggestions:", error)
    }
  }

  // Manejar cambios en el campo propietario
  useEffect(() => {
    if (watchedPropietario) {
      const timeoutId = setTimeout(() => {
        searchCriadores(watchedPropietario)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setCriadorSuggestions([])
      setShowCriadorSuggestions(false)
    }
  }, [watchedPropietario])

  // Manejar cambios en el campo establo
  useEffect(() => {
    if (watchedEstablo) {
      const timeoutId = setTimeout(() => {
        searchEstablos(watchedEstablo)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setEstabloSuggestions([])
      setShowEstabloSuggestions(false)
    }
  }, [watchedEstablo])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      // Aquí implementarías la subida a tu servicio de imágenes (Cloudinary, etc.)
      // Por ahora, simularemos la subida
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // URL simulada - reemplazar con la URL real de la imagen subida
      const imageUrl = `https://example.com/images/${file.name}`
      setValue("imagen_url", imageUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const onFormSubmit = async (data: GanadoFormData) => {
    try {
      await onSubmit(data)
      reset()
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Ganado" : "Registrar Nuevo Ganado"}</CardTitle>
        <CardDescription>
          Complete la información del animal. Los campos marcados con * son obligatorios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Animal *</Label>
              <Input
                id="nombre"
                {...register("nombre", { required: "El nombre es requerido" })}
                placeholder="Ej: MAP Lorado Rijeka EDNA"
              />
              {errors.nombre && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.nombre.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                {...register("fecha_nacimiento")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias_nacida">Días de Nacida</Label>
              <Input
                id="dias_nacida"
                type="number"
                {...register("dias_nacida", { valueAsNumber: true })}
                placeholder="Ej: 365"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.01"
                {...register("peso", { valueAsNumber: true })}
                placeholder="Ej: 450.5"
              />
            </div>
          </div>

          {/* Categorización */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select onValueChange={(value) => setValue("categoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_GANADO.map((categoria) => (
                    <SelectItem key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <Alert variant="destructive">
                  <AlertDescription>La categoría es requerida</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="raza">Raza *</Label>
              <Select onValueChange={(value) => setValue("raza", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar raza" />
                </SelectTrigger>
                <SelectContent>
                  {RAZAS_GANADO.map((raza) => (
                    <SelectItem key={raza.value} value={raza.value}>
                      {raza.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.raza && (
                <Alert variant="destructive">
                  <AlertDescription>La raza es requerida</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select onValueChange={(value) => setValue("sexo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sexo" />
                </SelectTrigger>
                <SelectContent>
                  {SEXOS_GANADO.map((sexo) => (
                    <SelectItem key={sexo.value} value={sexo.value}>
                      {sexo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Propietario con Autocompletado */}
          <div className="space-y-2 relative">
            <Label htmlFor="propietario">Propietario/Criador</Label>
            <Input
              id="propietario"
              {...register("propietario")}
              placeholder="Escriba el nombre del propietario..."
              autoComplete="off"
              onFocus={() => watchedPropietario && setShowCriadorSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCriadorSuggestions(false), 200)}
            />
            
            {showCriadorSuggestions && criadorSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {criadorSuggestions.map((criador) => (
                  <div
                    key={criador.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setValue("propietario", criador.nombreCompleto || criador.nombre || "")
                      setShowCriadorSuggestions(false)
                    }}
                  >
                    <div className="font-medium">{criador.nombreCompleto || criador.nombre}</div>
                    {criador.telefono && (
                      <div className="text-sm text-gray-500">{criador.telefono}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Establo con Autocompletado */}
          <div className="space-y-2 relative">
            <Label htmlFor="establo">Establo</Label>
            <Input
              id="establo"
              {...register("establo")}
              placeholder="Escriba el nombre del establo..."
              autoComplete="off"
              onFocus={() => watchedEstablo && setShowEstabloSuggestions(true)}
              onBlur={() => setTimeout(() => setShowEstabloSuggestions(false), 200)}
            />
            
            {showEstabloSuggestions && establoSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {establoSuggestions.map((establo) => (
                  <div
                    key={establo.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setValue("establo", establo.nombre || "")
                      setShowEstabloSuggestions(false)
                    }}
                  >
                    <div className="font-medium">{establo.nombre}</div>
                    {establo.ubicacion && (
                      <div className="text-sm text-gray-500">{establo.ubicacion}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register("descripcion")}
              placeholder="Información adicional sobre el animal..."
              rows={3}
            />
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <Label htmlFor="imagen">Imagen del Animal</Label>
            <div className="flex items-center gap-4">
              <Input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
              />
              {isUploadingImage && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Subiendo...</span>
                </div>
              )}
            </div>
            
            {watchedImagenUrl && (
              <div className="mt-2">
                <img
                  src={watchedImagenUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>

          {/* Opciones Adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="en_remate"
                {...register("en_remate")}
                onCheckedChange={(checked) => setValue("en_remate", checked)}
              />
              <Label htmlFor="en_remate">En Remate</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="puntaje">Puntaje</Label>
              <Input
                id="puntaje"
                type="number"
                step="0.1"
                {...register("puntaje", { valueAsNumber: true })}
                placeholder="Ej: 85.5"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Actualizar" : "Registrar"} Ganado
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}