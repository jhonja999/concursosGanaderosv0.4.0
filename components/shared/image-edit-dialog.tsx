"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload"
import { toast } from "sonner"

interface ImageEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentImageUrl?: string
  entityId: string
  entityType: string
  onImageUpdate: (newImageUrl: string) => void
}

export function ImageEditDialog({
  open,
  onOpenChange,
  currentImageUrl,
  entityId,
  entityType,
  onImageUpdate,
}: ImageEditDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleImageUpdate = async (newImageUrl: string) => {
    setIsUpdating(true)
    try {
      // Update the image in the database
      const response = await fetch(`/api/admin/ganado/${entityId}/image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ imagenUrl: newImageUrl }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la imagen")
      }

      onImageUpdate(newImageUrl)
      toast.success("Imagen actualizada exitosamente")
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating image:", error)
      toast.error("Error al actualizar la imagen")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!entityId) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/ganado/${entityId}/image`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Error al eliminar la imagen")

      onImageUpdate("")
      toast.success("Imagen eliminada")
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Error al eliminar la imagen")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Imagen</DialogTitle>
        </DialogHeader>
  <div className="space-y-4">
          {currentImageUrl && (
            <div className="text-center">
              <img
                src={currentImageUrl || "/placeholder.svg"}
                alt="Imagen actual"
                className="w-32 h-32 object-cover rounded-lg mx-auto border"
              />
              <p className="text-sm text-muted-foreground mt-2">Imagen actual</p>
            </div>
          )}
          <CloudinaryUpload
            value=""
            onChange={handleImageUpdate}
            folder={`ganado/${entityType}`}
            label="Nueva imagen"
            description="Selecciona una nueva imagen"
            entityType={entityType}
            entityId={entityId}
            disabled={isUpdating}
          />
          {currentImageUrl && (
            <div className="flex justify-end">
              <button
                className="text-sm text-red-600 hover:underline"
                onClick={handleDeleteImage}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar imagen"}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
