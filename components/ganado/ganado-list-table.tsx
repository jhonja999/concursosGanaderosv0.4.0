"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Tag, Calendar, Weight, Building2 } from "lucide-react"

interface Ganado {
  id: string
  nombre: string
  tipoAnimal: string
  raza: string
  sexo: "MACHO" | "HEMBRA"
  fechaNacimiento: Date
  pesoKg: number
  imagenUrl?: string
  enRemate: boolean
  precioBaseRemate?: number
  isDestacado: boolean
  isGanador: boolean
  premiosObtenidos: string[]
  numeroFicha?: string
  puntaje?: number
  createdAt: Date
  propietario: {
    nombreCompleto: string
    telefono?: string
    email?: string
  }
  expositor?: {
    nombreCompleto: string
    empresa?: string
  }
  establo?: {
    id: string
    nombre: string
    ubicacion?: string
  }
  contestCategory: {
    id: string
    nombre: string
  }
  contest: {
    nombre: string
    tipoPuntaje?: "NUMERICO" | "POSICION" | "CALIFICACION" | "PUNTOS"
  }
}

interface GanadoListTableProps {
  ganado: Ganado[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  onPageChange: (page: number) => void
  onViewDetails: (ganado: Ganado) => void
}

export function GanadoListTable({ ganado, pagination, onPageChange, onViewDetails }: GanadoListTableProps) {
  const calculateAge = (birthDate: Date) => {
    if (!birthDate || isNaN(new Date(birthDate).getTime())) {
      return "Edad no disponible"
    }

    const now = new Date()
    const birth = new Date(birthDate)

    if (birth > now) {
      return "Fecha inválida"
    }

    const ageInMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths} meses`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years}a ${months}m` : `${years}a`
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Animal</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Ficha</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Categoría</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Raza</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Propietario</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Expositor</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Establo</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Edad/Peso</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">Estado</TableHead>
            <TableHead className="text-right text-gray-900 dark:text-gray-100 font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ganado.map((animal) => (
            <TableRow 
              key={animal.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-600">
                    <AvatarImage 
                      src={animal.imagenUrl || "/placeholder.svg?height=100&width=100&query=animal"} 
                      alt={animal.nombre} 
                    />
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold">
                      {animal.nombre.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-nowrap text-gray-900 dark:text-gray-100">{animal.nombre}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {animal.sexo === "MACHO" ? "Macho" : "Hembra"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-nowrap">
                <Badge 
                  variant="outline" 
                  className="flex items-center gap-1 w-fit border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                >
                  <Tag className="h-3 w-3" />
                  {animal.numeroFicha || "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-nowrap text-gray-900 dark:text-gray-100">{animal.contestCategory.nombre}</TableCell>
              <TableCell className="text-nowrap text-gray-900 dark:text-gray-100">{animal.raza}</TableCell>
              <TableCell className="text-nowrap text-gray-900 dark:text-gray-100">{animal.propietario.nombreCompleto}</TableCell>
              <TableCell className="text-nowrap text-gray-900 dark:text-gray-100">{animal.expositor?.nombreCompleto || "N/A"}</TableCell>
              <TableCell className="text-nowrap">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-gray-100">{animal.establo?.nombre || "N/A"}</span>
                </div>
              </TableCell>
              <TableCell className="text-nowrap">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" /> 
                    {calculateAge(animal.fechaNacimiento)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                    <Weight className="h-4 w-4 text-gray-400 dark:text-gray-500" /> 
                    {animal.pesoKg} kg
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 w-24">
                  {animal.enRemate && (
                    <Badge className="bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 border-red-500 dark:border-red-600">
                      Remate
                    </Badge>
                  )}
                  {animal.isDestacado && (
                    <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-600 dark:hover:bg-yellow-700 border-yellow-500 dark:border-yellow-600">
                      Destacado
                    </Badge>
                  )}
                  {animal.isGanador && (
                    <Badge className="bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 border-blue-500 dark:border-blue-600">
                      Ganador
                    </Badge>
                  )}
                  {animal.puntaje && (
                    <Badge className="bg-emerald-500 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-700 border-emerald-500 dark:border-emerald-600">
                      {animal.puntaje} pts
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/20"
                  >
                    <DropdownMenuItem 
                      onClick={() => onViewDetails(animal)}
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </DropdownMenuItem>
                    {/* Más acciones si son necesarias */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {ganado.length === 0 && (
            <TableRow>
              <TableCell 
                colSpan={10} 
                className="h-24 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl">🐄</div>
                  <p className="font-medium">No hay ganado disponible</p>
                  <p className="text-sm">Intenta cambiar los filtros actuales</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = i + 1
              const isCurrentPage = pageNum === pagination.page
              return (
                <Button
                  key={pageNum}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={isCurrentPage 
                    ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500" 
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                >
                  {pageNum}
                </Button>
              )
            })}
            {pagination.pages > 5 && (
              <>
                {pagination.pages > 6 && <span className="text-gray-500 dark:text-gray-400">...</span>}
                <Button
                  variant={pagination.pages === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pagination.pages)}
                  className={pagination.pages === pagination.page 
                    ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500" 
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                >
                  {pagination.pages}
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}