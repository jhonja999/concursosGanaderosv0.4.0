"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, ImageIcon, Calendar, Clock, MapPin, Search, Download, Loader2, Eye } from "lucide-react"
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload"
import { toast } from "sonner"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TableSkeleton } from "@/components/shared/loading-skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProgramImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  publicId: string
  order: number
  isActive: boolean
  eventDate?: string
  eventTime?: string
  location?: string
  uploadedBy?: {
    nombre: string
    apellido: string
  }
  createdAt: string
  updatedAt: string
}

export default function AdminProgramacionPage() {
  const [images, setImages] = useState<ProgramImage[]>([])
  const [filteredImages, setFilteredImages] = useState<ProgramImage[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<ProgramImage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [selectedImage, setSelectedImage] = useState<ProgramImage | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    imageUrl: "",
    publicId: "",
  })

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    filterImages()
  }, [images, searchTerm, statusFilter])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/program-images", {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al cargar las imágenes")
        setImages([])
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Error al cargar las imágenes")
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const filterImages = () => {
    let filtered = images

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (image) =>
          image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((image) => (statusFilter === "active" ? image.isActive : !image.isActive))
    }

    setFilteredImages(filtered)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: "",
      imageUrl: "",
      publicId: "",
    })
    setEditingImage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.imageUrl) {
      toast.error("Título e imagen son obligatorios")
      return
    }

    setSubmitting(true)
    try {
      const url = editingImage ? `/api/admin/program-images/${editingImage.id}` : "/api/admin/program-images"

      const method = editingImage ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          publicId: formData.publicId,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          location: formData.location,
        }),
      })

      if (response.ok) {
        toast.success(editingImage ? "Imagen actualizada correctamente" : "Imagen agregada correctamente")
        setIsDialogOpen(false)
        resetForm()
        fetchImages()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al guardar la imagen")
      }
    } catch (error) {
      console.error("Error saving image:", error)
      toast.error("Error al guardar la imagen")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (image: ProgramImage) => {
    setEditingImage(image)
    setFormData({
      title: image.title,
      description: image.description || "",
      eventDate: image.eventDate ? image.eventDate.split("T")[0] : "",
      eventTime: image.eventTime || "",
      location: image.location || "",
      imageUrl: image.imageUrl,
      publicId: image.publicId,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/program-images/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Imagen eliminada correctamente")
        fetchImages()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al eliminar la imagen")
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Error al eliminar la imagen")
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/program-images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })
      if (response.ok) {
        toast.success(isActive ? "Imagen activada" : "Imagen desactivada")
        fetchImages()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Error al actualizar el estado")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error al actualizar el estado")
    }
  }

  const handleImageUpload = (url: string, publicId?: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
      publicId: publicId || "",
    }))
  }

  const handleViewImage = (image: ProgramImage) => {
    setSelectedImage(image)
    setIsViewDialogOpen(true)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(images, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `programacion-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Programación</h1>
            <p className="text-gray-600 dark:text-gray-400">Sistema de gestión de contenido para programación</p>
          </div>
        </div>
        <TableSkeleton rows={8} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Programación</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de gestión de contenido para programación de eventos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Imagen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingImage ? "Editar Imagen" : "Agregar Nueva Imagen"}</DialogTitle>
                <DialogDescription>
                  {editingImage ? "Modifica los datos de la imagen" : "Agrega una nueva imagen a la programación"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Inauguración de la Feria"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción detallada del evento..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Fecha del Evento</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Hora</Label>
                    <Input
                      id="eventTime"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      placeholder="Ej: 10:00 a.m."
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ej: Arena Principal"
                    />
                  </div>
                </div>
                <div>
                  <Label>Imagen *</Label>
                  <CloudinaryUpload
                    value={formData.imageUrl}
                    onChange={handleImageUpload}
                    folder="program-images"
                    label="Imagen del evento"
                    description="Sube una imagen para el evento de programación"
                  />
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Vista previa</Label>
                      <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden border">
                        <Image
                          src={formData.imageUrl || "/placeholder.svg"}
                          alt="Vista previa"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting || !formData.title || !formData.imageUrl}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingImage ? "Actualizando..." : "Agregando..."}
                      </>
                    ) : editingImage ? (
                      "Actualizar"
                    ) : (
                      "Agregar"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título, descripción o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Image Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogDescription>Vista detallada de la imagen de programación</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.imageUrl || "/placeholder.svg"}
                  alt={selectedImage.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Título</Label>
                  <p className="text-sm text-gray-600">{selectedImage.title}</p>
                </div>
                {selectedImage.description && (
                  <div>
                    <Label className="font-semibold">Descripción</Label>
                    <p className="text-sm text-gray-600">{selectedImage.description}</p>
                  </div>
                )}
                {selectedImage.eventDate && (
                  <div>
                    <Label className="font-semibold">Fecha del Evento</Label>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedImage.eventDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                )}
                {selectedImage.eventTime && (
                  <div>
                    <Label className="font-semibold">Hora</Label>
                    <p className="text-sm text-gray-600">{selectedImage.eventTime}</p>
                  </div>
                )}
                {selectedImage.location && (
                  <div>
                    <Label className="font-semibold">Ubicación</Label>
                    <p className="text-sm text-gray-600">{selectedImage.location}</p>
                  </div>
                )}
                <div>
                  <Label className="font-semibold">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={selectedImage.isActive ? "default" : "secondary"}>
                      {selectedImage.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {images.length === 0 ? "No hay imágenes" : "No se encontraron resultados"}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {images.length === 0
                ? "Agrega la primera imagen de programación para comenzar"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
            {images.length === 0 && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Imagen
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={image.isActive ? "default" : "secondary"}>
                      {image.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{image.title}</h3>
                    {image.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{image.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-gray-500">
                    {image.eventDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(image.eventDate), "dd MMM yyyy", { locale: es })}
                      </div>
                    )}
                    {image.eventTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {image.eventTime}
                      </div>
                    )}
                    {image.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {image.location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Switch
                      checked={image.isActive}
                      onCheckedChange={(checked) => handleToggleActive(image.id, checked)}
                    />
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewImage(image)} className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(image)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La imagen será eliminada permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(image.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
