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
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Animal</TableHead>
            <TableHead>Ficha</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Raza</TableHead>
            <TableHead>Propietario</TableHead>
            <TableHead>Expositor</TableHead>
            <TableHead>Establo</TableHead>
            <TableHead>Edad/Peso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ganado.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={animal.imagenUrl || "/placeholder.svg?height=100&width=100&query=animal"} 
                      alt={animal.nombre} 
                    />
                    <AvatarFallback>
                      {animal.nombre.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-nowrap">{animal.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {animal.sexo === "MACHO" ? "Macho" : "Hembra"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-nowrap">
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <Tag className="h-3 w-3" />
                  {animal.numeroFicha || "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-nowrap">{animal.contestCategory.nombre}</TableCell>
              <TableCell className="text-nowrap">{animal.raza}</TableCell>
              <TableCell className="text-nowrap">{animal.propietario.nombreCompleto}</TableCell>
              <TableCell className="text-nowrap">{animal.expositor?.nombreCompleto || "N/A"}</TableCell>
              <TableCell className="text-nowrap">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  {animal.establo?.nombre || "N/A"}
                </div>
              </TableCell>
              <TableCell className="text-nowrap">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1 text-sm text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" /> 
                    {calculateAge(animal.fechaNacimiento)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-700">
                    <Weight className="h-4 w-4 text-gray-400" /> 
                    {animal.pesoKg} kg
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 w-24">
                  {animal.enRemate && (
                    <Badge variant="destructive">Remate</Badge>
                  )}
                  {animal.isDestacado && (
                    <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                      Destacado
                    </Badge>
                  )}
                  {animal.isGanador && (
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                      Ganador
                    </Badge>
                  )}
                  {animal.puntaje && (
                    <Badge variant="default">{animal.puntaje} pts</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(animal)}>
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
              <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                No hay ganado disponible con los filtros actuales.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t bg-background">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}