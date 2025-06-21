"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Beef,
  WheatIcon as Sheep,
  DogIcon as Horse,
  Coffee,
  Milk,
  Settings,
  ChevronRight,
  Database,
  LayoutTemplateIcon as Template,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"

interface Sector {
  id: string
  nombre: string
  descripcion: string
  icono: string
  tipos_concurso: TipoConcurso[]
}

interface TipoConcurso {
  id: string
  nombre: string
  descripcion: string
  plantillas_count: number
  razas_count: number
}

interface PlantillaCategoria {
  id: string
  nombre: string
  descripcion: string
  tipo_categoria: string
  tipo_concurso: string
  es_estandar: boolean
  uso_estimado: number
}

const iconMap: Record<string, any> = {
  "🐄": Beef,
  "🐑": Sheep,
  "🐎": Horse,
  "🥛": Milk,
  "☕": Coffee,
  "🧀": Database,
  "🌾": Template,
}

export default function CategoriasPage() {
  const [sectores, setSectores] = useState<Sector[]>([])
  const [plantillas, setPlantillas] = useState<PlantillaCategoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sectoresRes, plantillasRes] = await Promise.all([
        fetch("/api/admin/categorias/sectores"),
        fetch("/api/admin/categorias/plantillas"),
      ])

      if (sectoresRes.ok) {
        const sectoresData = await sectoresRes.json()
        setSectores(sectoresData.sectores || [])
      }

      if (plantillasRes.ok) {
        const plantillasData = await plantillasRes.json()
        setPlantillas(plantillasData.plantillas || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPlantillas = plantillas.filter((plantilla) => {
    const matchesSearch =
      plantilla.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plantilla.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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
          <h1 className="text-2xl sm:text-3xl font-bold">Sistema de Categorías</h1>
          <p className="text-muted-foreground">
            Gestiona plantillas de categorías para facilitar la creación de concursos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/categorias/sectores/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Sector
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/categorias/plantillas/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="sectores">Sectores</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sectores Activos</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sectores.length}</div>
                <p className="text-xs text-muted-foreground">Ganadero, Productos, Artesanal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tipos de Concurso</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sectores.reduce((acc, sector) => acc + sector.tipos_concurso.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Bovinos, Ovinos, Lácteos, etc.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plantillas Disponibles</CardTitle>
                <Template className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plantillas.length}</div>
                <p className="text-xs text-muted-foreground">
                  {plantillas.filter((p) => p.es_estandar).length} estándar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Razas Registradas</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sectores.reduce(
                    (acc, sector) => acc + sector.tipos_concurso.reduce((acc2, tipo) => acc2 + tipo.razas_count, 0),
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Fleckvieh PDP, Holstein PPC, etc.</p>
              </CardContent>
            </Card>
          </div>

          {/* Sectores Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sectores.map((sector) => {
              const IconComponent = iconMap[sector.icono] || Beef
              return (
                <Card key={sector.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {sector.nombre}
                    </CardTitle>
                    <CardDescription>{sector.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Tipos de Concurso:</span>
                        <Badge variant="secondary">{sector.tipos_concurso.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {sector.tipos_concurso.slice(0, 3).map((tipo) => (
                          <div key={tipo.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{tipo.nombre}</span>
                            <span className="text-muted-foreground">{tipo.plantillas_count} plantillas</span>
                          </div>
                        ))}
                        {sector.tipos_concurso.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{sector.tipos_concurso.length - 3} más...
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/admin/categorias/sectores/${sector.id}`}>
                          Ver Detalles
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Información Importante */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Cómo Funciona el Sistema</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <div className="space-y-2 text-sm">
                <p>
                  <strong>1. Plantillas:</strong> Son sugerencias estandarizadas que facilitan la creación de concursos.
                </p>
                <p>
                  <strong>2. Categorías por Concurso:</strong> Cada concurso crea sus propias categorías basadas en las
                  plantillas.
                </p>
                <p>
                  <strong>3. Flexibilidad Total:</strong> Los organizadores pueden usar plantillas o crear categorías
                  completamente personalizadas.
                </p>
                <p>
                  <strong>4. Estandarización:</strong> Las plantillas aseguran consistencia entre concursos similares.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sectores Tab */}
        <TabsContent value="sectores" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sectores Disponibles</CardTitle>
                  <CardDescription>Sectores principales para organización de concursos</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/categorias/sectores/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Sector
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectores.map((sector) => {
                  const IconComponent = iconMap[sector.icono] || Beef
                  return (
                    <div key={sector.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6" />
                        <div>
                          <h3 className="font-medium">{sector.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{sector.descripcion}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{sector.tipos_concurso.length} tipos</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/categorias/sectores/${sector.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/categorias/sectores/${sector.id}/editar`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plantillas Tab */}
        <TabsContent value="plantillas" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar plantillas de categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button asChild>
                  <Link href="/admin/categorias/plantillas/nueva">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Plantilla
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plantillas Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filteredPlantillas.length} plantilla{filteredPlantillas.length !== 1 ? "s" : ""} encontrada
                {filteredPlantillas.length !== 1 ? "s" : ""}
              </CardTitle>
              <CardDescription>
                Estas plantillas se usan como sugerencias al crear categorías en concursos específicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPlantillas.length === 0 ? (
                <EmptyState
                  icon={Template}
                  title="No hay plantillas"
                  description="No se encontraron plantillas que coincidan con tu búsqueda."
                  action={{
                    label: "Crear Primera Plantilla",
                    onClick: () => (window.location.href = "/admin/categorias/plantillas/nueva"),
                  }}
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Uso Estimado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlantillas.map((plantilla) => (
                        <TableRow key={plantilla.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{plantilla.nombre}</div>
                              <div className="text-sm text-muted-foreground">{plantilla.descripcion}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{plantilla.tipo_categoria}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{plantilla.tipo_concurso}</span>
                          </TableCell>
                          <TableCell>
                            {plantilla.es_estandar ? (
                              <Badge variant="default">Estándar</Badge>
                            ) : (
                              <Badge variant="secondary">Personalizada</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span>{plantilla.uso_estimado} concursos</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/categorias/plantillas/${plantilla.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/categorias/plantillas/${plantilla.id}/editar`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                {!plantilla.es_estandar && (
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estadísticas Tab */}
        <TabsContent value="estadisticas" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas Más Utilizadas</CardTitle>
                <CardDescription>Plantillas que más se usan en concursos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plantillas
                    .sort((a, b) => b.uso_estimado - a.uso_estimado)
                    .slice(0, 5)
                    .map((plantilla, index) => (
                      <div key={plantilla.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                          <span className="text-sm">{plantilla.nombre}</span>
                        </div>
                        <Badge variant="secondary">{plantilla.uso_estimado} usos</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
                <CardDescription>Cantidad de plantillas por tipo de categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    plantillas.reduce(
                      (acc, plantilla) => {
                        acc[plantilla.tipo_categoria] = (acc[plantilla.tipo_categoria] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([tipo, count]) => (
                    <div key={tipo} className="flex items-center justify-between">
                      <span className="text-sm">{tipo}</span>
                      <Badge variant="outline">{count} plantillas</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
