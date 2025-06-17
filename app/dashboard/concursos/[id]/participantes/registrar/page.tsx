"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { ArrowLeft, Save, UserPlus, AlertCircle } from "lucide-react"

interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  edadMinima?: number
  edadMaxima?: number
  sexo?: string
  raza?: string
}

interface Ganado {
  id: string
  nombre: string
  raza?: string
  categoria?: string
  sexo?: string
}

interface Concurso {
  id: string
  nombre: string
  fechaInicio: string
  fechaFin: string
  categorias: Categoria[]
}

export default function RegistrarParticipantePage() {
  const params = useParams()
  const router = useRouter()
  const concursoId = params.id as string

  const [concurso, setConcurso] = useState<Concurso | null>(null)
  const [ganado, setGanado] = useState<Ganado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    numeroFicha: "",
    propietario: "",
    telefono: "",
    email: "",
    categoriaId: "",
    ganadoId: "",
    observaciones: "",
  })

  useEffect(() => {
    fetchData()
  }, [concursoId])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch concurso with categories
      const concursoResponse = await fetch(`/api/concursos/${concursoId}`)
      const concursoData = await concursoResponse.json()
      setConcurso(concursoData)

      // Fetch available ganado
      const ganadoResponse = await fetch("/api/ganado")
      const ganadoData = await ganadoResponse.json()
      setGanado(ganadoData)

      // Generate next ficha number
      const fichaResponse = await fetch(`/api/concursos/${concursoId}/next-ficha`)
      const fichaData = await fichaResponse.json()
      setFormData((prev) => ({ ...prev, numeroFicha: fichaData.nextFicha }))
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/concursos/${concursoId}/participantes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar participante")
      }

      toast.success("Participante registrado exitosamente")
      router.push(`/dashboard/concursos/${concursoId}/participantes`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategoria = concurso?.categorias.find((c) => c.id === formData.categoriaId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Registrar Participante</h1>
          <p className="text-muted-foreground">
            Concurso: <strong>{concurso?.nombre}</strong>
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Información del Participante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Información del Participante
              </CardTitle>
              <CardDescription>Datos del propietario y contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numeroFicha">Número de Ficha</Label>
                <Input
                  id="numeroFicha"
                  value={formData.numeroFicha}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numeroFicha: e.target.value }))}
                  placeholder="Ej: 001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propietario">Propietario *</Label>
                <Input
                  id="propietario"
                  value={formData.propietario}
                  onChange={(e) => setFormData((prev) => ({ ...prev, propietario: e.target.value }))}
                  placeholder="Nombre completo del propietario"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Ej: +57 300 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información del Animal */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Animal</CardTitle>
              <CardDescription>Selecciona la categoría y el animal a participar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoriaId">Categoría *</Label>
                <Select
                  value={formData.categoriaId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoriaId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {concurso?.categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        <div>
                          <div className="font-medium">{categoria.nombre}</div>
                          {categoria.descripcion && (
                            <div className="text-sm text-muted-foreground">{categoria.descripcion}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategoria && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Requisitos de la Categoría:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedCategoria.edadMinima && <li>• Edad mínima: {selectedCategoria.edadMinima} años</li>}
                    {selectedCategoria.edadMaxima && <li>• Edad máxima: {selectedCategoria.edadMaxima} años</li>}
                    {selectedCategoria.sexo && <li>• Sexo: {selectedCategoria.sexo}</li>}
                    {selectedCategoria.raza && <li>• Raza: {selectedCategoria.raza}</li>}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ganadoId">Animal *</Label>
                <Select
                  value={formData.ganadoId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, ganadoId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {ganado.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        <div>
                          <div className="font-medium">{animal.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {animal.raza} - {animal.sexo} - {animal.categoria}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Información adicional sobre el participante..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
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
                Registrando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Registrar Participante
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
