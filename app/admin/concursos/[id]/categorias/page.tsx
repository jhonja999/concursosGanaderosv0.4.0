"use client"

import { Card } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PlusCircle, Edit, Trash2, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { CategoryForm } from "@/components/admin/category-form"
import type { ContestCategory, SexoGanado } from "@prisma/client"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"

export default function ContestCategoriesPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string

  const [categories, setCategories] = useState<ContestCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ContestCategory | null>(null)
  const [contestName, setContestName] = useState<string>("")

  const fetchContestName = async () => {
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}`)
      if (response.ok) {
        const data = await response.json()
        setContestName(data.contest?.nombre || "Concurso")
      }
    } catch (error) {
      console.error("Error fetching contest name:", error)
      setContestName("Concurso")
    }
  }

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}/categorias`)
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar las categorías.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (contestId) {
      fetchContestName()
      fetchCategories()
    }
  }, [contestId])

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true)
    const apiUrl = selectedCategory
      ? `/api/admin/concursos/${contestId}/categorias/${selectedCategory.id}`
      : `/api/admin/concursos/${contestId}/categorias`
    const method = selectedCategory ? "PUT" : "POST"

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || (selectedCategory ? "Error al actualizar" : "Error al crear"))
      }

      toast.success(`Categoría ${selectedCategory ? "actualizada" : "creada"} exitosamente.`)
      setShowFormDialog(false)
      setSelectedCategory(null)
      fetchCategories() // Refresh list
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}/categorias/${selectedCategory.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al eliminar la categoría.")
      }
      toast.success("Categoría eliminada exitosamente.")
      setShowDeleteDialog(false)
      setSelectedCategory(null)
      fetchCategories() // Refresh list
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateForm = () => {
    setSelectedCategory(null)
    setShowFormDialog(true)
  }

  const openEditForm = (category: ContestCategory) => {
    setSelectedCategory(category)
    setShowFormDialog(true)
  }

  const openDeleteDialog = (category: ContestCategory) => {
    setSelectedCategory(category)
    setShowDeleteDialog(true)
  }

  const formatSexo = (sexo: SexoGanado | null | undefined) => {
    if (!sexo) return "N/A"
    return sexo.charAt(0).toUpperCase() + sexo.slice(1).toLowerCase()
  }

  if (isLoading && !contestName) {
    // Show main loader if contest name is also loading
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Categorías de ${contestName}`}
        description="Gestiona las categorías de participación para este concurso."
        breadcrumbItems={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Concursos", href: "/admin/concursos" },
          { label: contestName || "Concurso", href: `/admin/concursos/${contestId}` },
          { label: "Categorías" },
        ]}
      >
        <Button onClick={openCreateForm}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nueva Categoría
        </Button>
      </PageHeader>

      {isLoading && categories.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : !isLoading && categories.length === 0 ? (
        <EmptyState
          icon={ClipboardList} // Pass component directly
          title="No hay categorías"
          description="Aún no se han creado categorías para este concurso. ¡Empieza añadiendo una!"
          action={{
            // Pass an object for the action
            label: "Crear Primera Categoría",
            onClick: openCreateForm,
            icon: PlusCircle, // Optional: if EmptyState supports an icon in its button
          }}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Edad (Meses)</TableHead>
                <TableHead>Peso (Kg)</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.nombre}</TableCell>
                  <TableCell>{category.orden}</TableCell>
                  <TableCell>
                    {category.criteriosEdadMinMeses || "-"} / {category.criteriosEdadMaxMeses || "-"}
                  </TableCell>
                  <TableCell>
                    {category.criteriosPesoMinKg || "-"} / {category.criteriosPesoMaxKg || "-"}
                  </TableCell>
                  <TableCell>{formatSexo(category.criteriosSexo)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(category)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog
        open={showFormDialog}
        onOpenChange={(isOpen) => {
          setShowFormDialog(isOpen)
          if (!isOpen) setSelectedCategory(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Modifica los detalles de la categoría."
                : "Completa el formulario para añadir una nueva categoría."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CategoryForm initialData={selectedCategory} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la categoría "{selectedCategory?.nombre}"? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
