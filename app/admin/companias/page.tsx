"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Building2, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { toast } from "sonner"

interface Company {
  id: string
  nombre: string
  slug: string
  email: string
  telefono?: string
  ubicacion?: string
  descripcion?: string
  logo?: string
  website?: string
  tipoOrganizacion?: string
  isFeatured: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    contests: number
    users: number
  }
}

export default function CompaniasPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      } else {
        toast.error("Error al cargar las compañías")
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast.error("Error al cargar las compañías")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCompany = async () => {
    if (!deleteCompany) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/companies/${deleteCompany.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Compañía eliminada exitosamente")
        setCompanies(companies.filter((c) => c.id !== deleteCompany.id))
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al eliminar la compañía")
      }
    } catch (error) {
      console.error("Error deleting company:", error)
      toast.error("Error al eliminar la compañía")
    } finally {
      setIsDeleting(false)
      setDeleteCompany(null)
    }
  }

  const handleCreateCompany = () => {
    router.push("/admin/companias/nuevo")
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Compañías</h1>
          <p className="text-muted-foreground">Gestiona las compañías organizadoras</p>
        </div>
        <Button asChild>
          <Link href="/admin/companias/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Compañía
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar compañías por nombre, email o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay compañías"
          description={
            searchTerm
              ? "No se encontraron compañías que coincidan con tu búsqueda."
              : "Aún no hay compañías registradas. Crea la primera compañía."
          }
          action={
            !searchTerm
              ? {
                  label: "Nueva Compañía",
                  onClick: handleCreateCompany,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={company.logo || "/placeholder.svg"} alt={company.nombre} />
                      <AvatarFallback>
                        <Building2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{company.nombre}</CardTitle>
                      <CardDescription className="text-sm truncate">{company.email}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/companias/${company.id}/editar`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/companias/${company.id}/editar`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteCompany(company)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {company.isFeatured && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Destacada
                    </Badge>
                  )}
                  <Badge variant={company.isPublished ? "default" : "outline"} className="text-xs">
                    {company.isPublished ? "Publicada" : "Borrador"}
                  </Badge>
                </div>

                {/* Company Info */}
                <div className="space-y-2 text-sm">
                  {company.ubicacion && <p className="text-muted-foreground truncate">📍 {company.ubicacion}</p>}
                  {company.tipoOrganizacion && (
                    <p className="text-muted-foreground truncate">🏢 {company.tipoOrganizacion}</p>
                  )}
                  {company._count && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground">
                        🏆 {company._count.contests} concurso{company._count.contests !== 1 ? "s" : ""}
                      </p>
                      <p className="text-muted-foreground">
                        👥 {company._count.users} usuario{company._count.users !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {company.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{company.descripcion}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCompany} onOpenChange={() => setDeleteCompany(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar compañía?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la compañía{" "}
              <strong>{deleteCompany?.nombre}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
