"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Search, Plus, Edit, Trash2, Calendar, MapPin, Users, DollarSign, Star, Eye, ExternalLink } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

interface Event {
  id: string
  titulo: string
  slug: string
  descripcion?: string
  tipo: string
  fechaInicio: string
  fechaFin?: string
  ubicacion?: string
  direccion?: string
  precio?: number
  capacidad?: number
  imagen?: string
  isFeatured: boolean
  isPublished: boolean
  concurso?: {
    id: string
    nombre: string
  }
  createdAt: string
}

interface Concurso {
  id: string
  nombre: string
}

const tiposEvento = [
  { value: "CONFERENCIA", label: "Conferencia" },
  { value: "TALLER", label: "Taller" },
  { value: "FERIA", label: "Feria" },
  { value: "EXPOSICION", label: "Exposición" },
  { value: "NETWORKING", label: "Networking" },
  { value: "PREMIACION", label: "Premiación" },
]

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [concursos, setConcursos] = useState<Concurso[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "",
    fechaInicio: "",
    fechaFin: "",
    ubicacion: "",
    direccion: "",
    precio: "",
    capacidad: "",
    concursoId: "",
    isFeatured: false,
    isPublished: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, typeFilter])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch events
      const eventsResponse = await fetch("/api/events")
      const eventsData = await eventsResponse.json()
      setEvents(eventsData)

      // Fetch concursos for dropdown
      const concursosResponse = await fetch("/api/concursos")
      const concursosData = await concursosResponse.json()
      setConcursos(concursosData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((event) => event.tipo === typeFilter)
    }

    setFilteredEvents(filtered)
  }

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
      ubicacion: "",
      direccion: "",
      precio: "",
      capacidad: "",
      concursoId: "",
      isFeatured: false,
      isPublished: false,
    })
    setEditingEvent(null)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      titulo: event.titulo,
      descripcion: event.descripcion || "",
      tipo: event.tipo,
      fechaInicio: new Date(event.fechaInicio).toISOString().slice(0, 16),
      fechaFin: event.fechaFin ? new Date(event.fechaFin).toISOString().slice(0, 16) : "",
      ubicacion: event.ubicacion || "",
      direccion: event.direccion || "",
      precio: event.precio?.toString() || "",
      capacidad: event.capacidad?.toString() || "",
      concursoId: event.concurso?.id || "",
      isFeatured: event.isFeatured,
      isPublished: event.isPublished,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : "/api/events"
      const method = editingEvent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          precio: formData.precio ? Number.parseFloat(formData.precio) : null,
          capacidad: formData.capacidad ? Number.parseInt(formData.capacidad) : null,
          concursoId: formData.concursoId || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar el evento")
      }

      toast.success(editingEvent ? "Evento actualizado exitosamente" : "Evento creado exitosamente")
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving event:", error)
      toast.error("Error al guardar el evento")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el evento")
      }

      toast.success("Evento eliminado exitosamente")
      fetchData()
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Error al eliminar el evento")
    }
  }

  const getTypeBadge = (tipo: string) => {
    const colors = {
      CONFERENCIA: "bg-blue-100 text-blue-800",
      TALLER: "bg-green-100 text-green-800",
      FERIA: "bg-purple-100 text-purple-800",
      EXPOSICION: "bg-orange-100 text-orange-800",
      NETWORKING: "bg-pink-100 text-pink-800",
      PREMIACION: "bg-yellow-100 text-yellow-800",
    }

    return (
      <Badge className={colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {tiposEvento.find((t) => t.value === tipo)?.label || tipo}
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gestiona los eventos de tu empresa y concursos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-viridian hover:bg-viridian/90" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Modifica la información del evento" : "Crea un nuevo evento para tu empresa"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título del Evento *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Evento *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEvento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el evento..."
                  rows={3}
                />
              </div>

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
                  <Label htmlFor="fechaFin">Fecha de Fin</Label>
                  <Input
                    id="fechaFin"
                    type="datetime-local"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fechaFin: e.target.value }))}
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
                    placeholder="Ej: Centro de Convenciones"
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio (COP)</Label>
                  <Input
                    id="precio"
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, precio: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidad">Capacidad</Label>
                  <Input
                    id="capacidad"
                    type="number"
                    value={formData.capacidad}
                    onChange={(e) => setFormData((prev) => ({ ...prev, capacidad: e.target.value }))}
                    placeholder="Número de personas"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concursoId">Concurso Asociado</Label>
                  <Select
                    value={formData.concursoId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, concursoId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar concurso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin concurso asociado</SelectItem>
                      {concursos.map((concurso) => (
                        <SelectItem key={concurso.id} value={concurso.id}>
                          {concurso.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                    />
                    <Label htmlFor="isFeatured" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Evento Destacado
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublished: checked }))}
                    />
                    <Label htmlFor="isPublished" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Publicar Evento
                    </Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-viridian hover:bg-viridian/90">
                  {isSubmitting ? "Guardando..." : editingEvent ? "Actualizar" : "Crear Evento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tiposEvento.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos ({filteredEvents.length})</CardTitle>
          <CardDescription>Lista de eventos de tu empresa</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay eventos</h3>
              <p className="text-muted-foreground mb-4">Crea tu primer evento para promocionar tu empresa</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-viridian hover:bg-viridian/90">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Evento
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {event.titulo}
                          {event.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        {event.descripcion && (
                          <div className="text-sm text-muted-foreground line-clamp-1">{event.descripcion}</div>
                        )}
                        {event.concurso && (
                          <div className="text-xs text-muted-foreground">Asociado a: {event.concurso.nombre}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(event.tipo)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.fechaInicio)}
                        </div>
                        {event.fechaFin && (
                          <div className="text-muted-foreground">hasta {formatDate(event.fechaFin)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.ubicacion && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{event.ubicacion}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {event.precio && (
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(event.precio)}</span>
                          </div>
                        )}
                        {event.capacidad && (
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3" />
                            <span>{event.capacidad} personas</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={event.isPublished ? "default" : "secondary"}>
                          {event.isPublished ? "Publicado" : "Borrador"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {event.isPublished && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/eventos/${event.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
