"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload"
import { CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EventFormProps {
  contestId: string
  initialData?: {
    id: string
    title: string
    description?: string
    featuredImage?: string
    startDate: string
    endDate?: string
  } | null
  onSubmitSuccess: () => void
}

export function EventForm({ contestId, initialData, onSubmitSuccess }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    featuredImage: initialData?.featuredImage || "",
    startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
    endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    if (!formData.title || !formData.startDate) {
      toast.error("El título y la fecha de inicio son obligatorios.")
      setIsSaving(false)
      return
    }

    const apiEndpoint = initialData
      ? `/api/admin/concursos/${contestId}/eventos/${initialData.id}`
      : `/api/admin/concursos/${contestId}/eventos`
    const method = initialData ? "PUT" : "POST"

    const toastId = toast.loading(initialData ? "Actualizando evento..." : "Creando evento...")

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate?.toISOString(),
          endDate: formData.endDate?.toISOString(),
        }),
      })

      if (response.ok) {
        toast.success(initialData ? "Evento actualizado" : "Evento creado", { id: toastId })
        onSubmitSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al guardar el evento.", { id: toastId })
      }
    } catch (error) {
      toast.error("Error de red al guardar el evento.", { id: toastId })
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título del Evento</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Ej: Juzgamiento de Ganado Brahman"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha y Hora de Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? (
                  format(formData.startDate, "PPP HH:mm", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => handleInputChange("startDate", date)}
                initialFocus
              />
              {/* Basic time picker - for more advanced needs, a dedicated library would be better */}
              <div className="p-2 border-t">
                <Input
                  type="time"
                  defaultValue={formData.startDate ? format(formData.startDate, "HH:mm") : "09:00"}
                  onChange={(e) => {
                    const time = e.target.value.split(":")
                    const newDate = new Date(formData.startDate || new Date())
                    newDate.setHours(Number.parseInt(time[0]), Number.parseInt(time[1]))
                    handleInputChange("startDate", newDate)
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Fecha y Hora de Fin (Opcional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.endDate ? (
                  format(formData.endDate, "PPP HH:mm", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.endDate}
                onSelect={(date) => handleInputChange("endDate", date)}
                initialFocus
              />
              <div className="p-2 border-t">
                <Input
                  type="time"
                  defaultValue={formData.endDate ? format(formData.endDate, "HH:mm") : "17:00"}
                  onChange={(e) => {
                    const time = e.target.value.split(":")
                    const newDate = new Date(formData.endDate || new Date())
                    newDate.setHours(Number.parseInt(time[0]), Number.parseInt(time[1]))
                    handleInputChange("endDate", newDate)
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Detalles sobre el evento..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Imagen Destacada</Label>
        <CloudinaryUpload
          value={formData.featuredImage}
          onChange={(url) => handleInputChange("featuredImage", url)}
          folder={`concursos/${contestId}/eventos`}
          entityType="event"
          entityId={initialData?.id || ""}
          label="Imagen del Evento"
          description="Imagen representativa del evento (máx. 10MB)"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Evento
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
