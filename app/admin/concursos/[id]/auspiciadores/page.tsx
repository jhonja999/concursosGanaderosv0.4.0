"use client"

import type React from "react"
import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, Edit, Trash2, Building2, ImageIcon, ExternalLink } from "lucide-react"
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { PageHeader } from "@/components/shared/page-header" // Import PageHeader

interface Auspiciador {
  id: string
  nombre: string
  imagen: string
  website?: string
}

interface Contest {
  id: string
  nombre: string
  slug: string
}

export default function AuspiciadoresPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [contest, setContest] = useState<Contest | null>(null)
  const [auspiciadores, setAuspiciadores] = useState<Auspiciador[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAuspiciador, setEditingAuspiciador] = useState<Auspiciador | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    imagen: "",
    website: "",
  })

  useEffect(() => {
    fetchData()
  }, [resolvedParams.id])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/concursos/${resolvedParams.id}/auspiciadores`)
      if (response.ok) {
        const data = await response.json()
        setContest(data.contest)
        setAuspiciadores(data.auspiciadores || [])
      } else {
        toast.error("Error al cargar los datos")
        router.push("/admin/concursos")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error al cargar los datos")
      router.push("/admin/concursos")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      imagen: "",
      website: "",
    })
    setEditingAuspiciador(null)
  }

  const openDialog = (auspiciador?: Auspiciador) => {
    if (auspiciador) {
      setEditingAuspiciador(auspiciador)
      setFormData({
        nombre: auspiciador.nombre,
        imagen: auspiciador.imagen,
        website: auspiciador.website || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim() || !formData.imagen) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    // Validate website URL if provided
    if (formData.website && formData.website.trim()) {
      const websiteUrl = formData.website.trim()
      if (!websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
        toast.error("La URL del sitio web debe comenzar con http:// o https://")
        return
      }
    }

    setIsSaving(true)

    try {
      const url = `/api/admin/concursos/${resolvedParams.id}/auspiciadores`
      const method = editingAuspiciador ? "PUT" : "POST"
      const body = {
        ...formData,
        website: formData.website.trim() || undefined,
        ...(editingAuspiciador && { id: editingAuspiciador.id }),
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        setAuspiciadores(data.auspiciadores || [])
        toast.success(data.message)
        closeDialog()
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al guardar el auspiciador")
      }
    } catch (error) {
      console.error("Error saving sponsor:", error)
      toast.error("Error al guardar el auspiciador")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (auspiciadorId: string) => {
    try {
      const response = await fetch(`/api/admin/concursos/${resolvedParams.id}/auspiciadores`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: auspiciadorId }),
      })

      if (response.ok) {
        const data = await response.json()
        setAuspiciadores(data.auspiciadores || [])
        toast.success(data.message)
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al eliminar el auspiciador")
      }
    } catch (error) {
      console.error("Error deleting sponsor:", error)
      toast.error("Error al eliminar el auspiciador")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Concurso no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestionar Auspiciadores"
        description={contest.nombre}
        breadcrumbItems={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Concursos", href: "/admin/concursos" },
          { label: contest.nombre, href: `/admin/concursos/${resolvedParams.id}` },
          { label: "Auspiciadores" },
        ]}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Auspiciador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingAuspiciador ? "Editar Auspiciador" : "Agregar Auspiciador"}</DialogTitle>
                <DialogDescription>
                  {editingAuspiciador
                    ? "Modifica la información del auspiciador"
                    : "Agrega un nuevo auspiciador al concurso"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre del Auspiciador <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre de la empresa o auspiciador"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.ejemplo.com"
                  />
                  <p className="text-xs text-muted-foreground">URL del sitio web del auspiciador (opcional)</p>
                </div>

                <div className="space-y-2">
                  <Label>
                    Logo/Imagen <span className="text-red-500">*</span>
                  </Label>
                  <CloudinaryUpload
                    value={formData.imagen}
                    onChange={(url) => setFormData((prev) => ({ ...prev, imagen: url }))}
                    folder="auspiciadores"
                    entityType="sponsor"
                    entityId={editingAuspiciador?.id || "new"}
                    label="Logo del Auspiciador"
                    description="Imagen del logo o marca del auspiciador (máx. 5MB)"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>{editingAuspiciador ? "Actualizar" : "Agregar"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Auspiciadores del Concurso
          </CardTitle>
          <CardDescription>Gestiona los auspiciadores que aparecerán en la página pública del concurso</CardDescription>
        </CardHeader>
        <CardContent>
          {auspiciadores.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay auspiciadores</h3>
              <p className="text-muted-foreground mb-4">
                Agrega auspiciadores para mostrarlos en la página pública del concurso
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Auspiciador
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {auspiciadores.map((auspiciador) => (
                <Card key={auspiciador.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={auspiciador.imagen || "/placeholder.svg"}
                        alt={auspiciador.nombre}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-2 mb-3">
                      <h4 className="font-semibold text-sm line-clamp-2">{auspiciador.nombre}</h4>
                      {auspiciador.website && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate">{auspiciador.website}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => openDialog(auspiciador)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar auspiciador?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente a "{auspiciador.nombre}" de la lista de
                              auspiciadores del concurso.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(auspiciador.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
