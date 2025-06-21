"use client"

import { useState } from "react"
import { GanadoList } from "@/components/ganado/ganado-list"
import { GanadoForm } from "@/components/ganado/ganado-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface Ganado {
  id: string
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

export default function GanadoPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingGanado, setEditingGanado] = useState<Ganado | null>(null)
  const [viewingGanado, setViewingGanado] = useState<Ganado | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = () => {
    setEditingGanado(null)
    setShowForm(true)
  }

  const handleEdit = (ganado: Ganado) => {
    setEditingGanado(ganado)
    setShowForm(true)
  }

  const handleView = (ganado: Ganado) => {
    setViewingGanado(ganado)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este animal?")) {
      return
    }

    try {
      const response = await fetch(`/api/ganado/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Animal eliminado correctamente")
        // Refrescar la lista
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar el animal")
      }
    } catch (error) {
      console.error("Error deleting ganado:", error)
      toast.error("Error al eliminar el animal")
    }
  }

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const url = editingGanado ? `/api/ganado/${editingGanado.id}` : "/api/ganado"
      const method = editingGanado ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(editingGanado ? "Animal actualizado correctamente" : "Animal registrado correctamente")
        setShowForm(false)
        setEditingGanado(null)
        // Refrescar la lista
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al guardar el animal")
      }
    } catch (error) {
      console.error("Error submitting ganado:", error)
      toast.error("Error al guardar el animal")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingGanado(null)
  }

  return (
    <div className="container mx-auto py-6">
      {!showForm ? (
        <GanadoList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      ) : (
        <GanadoForm
          initialData={editingGanado}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

      {/* Dialog para ver detalles */}
      <Dialog open={!!viewingGanado} onOpenChange={() => setViewingGanado(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Animal</DialogTitle>
          </DialogHeader>
          {viewingGanado && (
            <div className="space-y-4">
              {viewingGanado.imagen_url && (
                <div className="flex justify-center">
                  <img
                    src={viewingGanado.imagen_url}
                    alt={viewingGanado.nombre}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Nombre:</strong> {viewingGanado.nombre}
                </div>
                <div>
                  <strong>Categoría:</strong> {viewingGanado.categoria}
                </div>
                <div>
                  <strong>Raza:</strong> {viewingGanado.raza}
                </div>
                <div>
                  <strong>Sexo:</strong> {viewingGanado.sexo || "No especificado"}
                </div>
                <div>
                  <strong>Propietario:</strong> {viewingGanado.propietario || "No especificado"}
                </div>
                <div>
                  <strong>Establo:</strong> {viewingGanado.establo || "No especificado"}
                </div>
                {viewingGanado.peso && (
                  <div>
                    <strong>Peso:</strong> {viewingGanado.peso} kg
                  </div>
                )}
                {viewingGanado.puntaje && (
                  <div>
                    <strong>Puntaje:</strong> {viewingGanado.puntaje}
                  </div>
                )}
              </div>

              {viewingGanado.descripcion && (
                <div>
                  <strong>Descripción:</strong>
                  <p className="mt-1 text-sm text-gray-600">{viewingGanado.descripcion}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}