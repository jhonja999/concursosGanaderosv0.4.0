"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, RefreshCw, Save, Upload, Clock, HardDrive, FileImage, XCircle, Loader2 } from "lucide-react"
import Image from "next/image"

interface ExistingImageInfo {
  exists: boolean
  image?: any
  filename?: string
  uploadedAt?: string
  size?: number
}

interface PreviewFile {
  file: File
  preview: string
  name: string
  size: string
  type: string
}

interface DuplicateImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingImage: ExistingImageInfo | null
  newFile: PreviewFile | null
  onUseExisting: () => void
  onOverwrite: () => void
  onUploadNew: () => void
  isProcessing?: boolean
}

export function DuplicateImageDialog({
  open,
  onOpenChange,
  existingImage,
  newFile,
  onUseExisting,
  onOverwrite,
  onUploadNew,
  isProcessing = false,
}: DuplicateImageDialogProps) {
  const [selectedAction, setSelectedAction] = useState<"existing" | "overwrite" | "new" | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatUploadDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleAction = (action: "existing" | "overwrite" | "new") => {
    setSelectedAction(action)
    switch (action) {
      case "existing":
        onUseExisting()
        break
      case "overwrite":
        onOverwrite()
        break
      case "new":
        onUploadNew()
        break
    }
  }

  if (!existingImage?.exists || !newFile) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Imagen Duplicada Detectada
          </DialogTitle>
          <DialogDescription>
            Se encontró una imagen con el mismo nombre. Compara ambas imágenes y elige qué hacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing Image */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      Imagen Existente
                    </h3>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      Ya subida
                    </Badge>
                  </div>

                  {existingImage.image && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={existingImage.image.secure_url || "/placeholder.svg"}
                        alt="Imagen existente"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Nombre:</p>
                        <p className="font-medium truncate">{existingImage.filename || "Nombre desconocido"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Subido:</p>
                        <p className="font-medium">
                          {existingImage.uploadedAt ? formatUploadDate(existingImage.uploadedAt) : "Fecha desconocida"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Tamaño:</p>
                        <p className="font-medium">
                          {existingImage.size ? formatFileSize(existingImage.size) : "Tamaño desconocido"}
                        </p>
                      </div>
                    </div>

                    {existingImage.image?.width && existingImage.image?.height && (
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Dimensiones:</p>
                          <p className="font-medium">
                            {existingImage.image.width} × {existingImage.image.height} px
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Image */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Nueva Imagen
                    </h3>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                      Por subir
                    </Badge>
                  </div>

                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={newFile.preview || "/placeholder.svg"}
                      alt="Nueva imagen"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Nombre:</p>
                        <p className="font-medium truncate">{newFile.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Seleccionado:</p>
                        <p className="font-medium">Ahora mismo</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Tamaño:</p>
                        <p className="font-medium">{newFile.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Tipo:</p>
                        <p className="font-medium">{newFile.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Action Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">¿Qué deseas hacer?</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Use Existing */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAction === "existing" ? "ring-2 ring-green-500 bg-green-50" : "hover:border-green-300"
                }`}
                onClick={() => !isProcessing && handleAction("existing")}
              >
                <CardContent className="p-4 text-center">
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">Usar Existente</h4>
                      <p className="text-sm text-green-600 mt-1">Selecciona la imagen ya subida</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>✓ Ahorra espacio</p>
                      <p>✓ Instantáneo</p>
                      <p>✓ Mantiene historial</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overwrite */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAction === "overwrite" ? "ring-2 ring-red-500 bg-red-50" : "hover:border-red-300"
                }`}
                onClick={() => !isProcessing && handleAction("overwrite")}
              >
                <CardContent className="p-4 text-center">
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Save className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800">Sobrescribir</h4>
                      <p className="text-sm text-red-600 mt-1">Reemplaza la imagen existente</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>⚠️ Reemplaza la anterior</p>
                      <p>✓ Mantiene el mismo nombre</p>
                      <p>✓ Actualiza contenido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload New */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAction === "new" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:border-blue-300"
                }`}
                onClick={() => !isProcessing && handleAction("new")}
              >
                <CardContent className="p-4 text-center">
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">Subir Nueva</h4>
                      <p className="text-sm text-blue-600 mt-1">Crea una versión con nombre único</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>✓ Mantiene ambas imágenes</p>
                      <p>✓ Nombre automático único</p>
                      <p>✓ Sin conflictos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">
                  {selectedAction === "existing" && "Seleccionando imagen existente..."}
                  {selectedAction === "overwrite" && "Sobrescribiendo imagen..."}
                  {selectedAction === "new" && "Subiendo nueva imagen..."}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleAction("existing")}
              variant="outline"
              disabled={isProcessing}
              className="flex-1 sm:flex-none"
            >
              {isProcessing && selectedAction === "existing" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Usar Existente
            </Button>

            <Button
              onClick={() => handleAction("overwrite")}
              variant="destructive"
              disabled={isProcessing}
              className="flex-1 sm:flex-none"
            >
              {isProcessing && selectedAction === "overwrite" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sobrescribir
            </Button>

            <Button onClick={() => handleAction("new")} disabled={isProcessing} className="flex-1 sm:flex-none">
              {isProcessing && selectedAction === "new" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Subir Nueva
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
