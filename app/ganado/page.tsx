"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, MilkIcon as Cow, Calendar, Building, Tag, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface GanadoItem {
  id: string
  nombre: string
  raza: string | null
  sexo: string | null
  imagenUrl: string | null
  propietario: string | null
  establo: string | null
  created_at: Date
  contest: {
    id: string
    nombre: string
    slug: string
  } | null
}

interface Contest {
  id: string
  nombre: string
  slug: string
}

interface GanadoClientPageProps {
  initialGanado: GanadoItem[]
  initialTotal: number
  initialPage: number
  initialContests: Contest[]
}

export default function GanadoClientPage({
  initialGanado,
  initialTotal,
  initialPage,
  initialContests,
}: GanadoClientPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [ganado, setGanado] = useState<GanadoItem[]>(initialGanado)
  const [total, setTotal] = useState(initialTotal)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [contests] = useState<Contest[]>(initialContests)

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [selectedContest, setSelectedContest] = useState(searchParams.get("contestId") || "all")
  const [selectedRaza, setSelectedRaza] = useState(searchParams.get("raza") || "all")
  const [selectedSexo, setSelectedSexo] = useState(searchParams.get("sexo") || "all")

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchGanado = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (selectedContest !== "all") params.set("contestId", selectedContest)
      if (selectedRaza !== "all") params.set("raza", selectedRaza)
      if (selectedSexo !== "all") params.set("sexo", selectedSexo)
      params.set("page", page.toString())
      params.set("limit", limit.toString())

      const response = await fetch(`/api/ganado?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setGanado(data.ganado)
        setTotal(data.total)
        setCurrentPage(page)

        // Update URL
        router.push(`/ganado?${params.toString()}`, { scroll: false })
      }
    } catch (error) {
      console.error("Error fetching ganado:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchGanado(1)
  }

  const handleFilterChange = () => {
    fetchGanado(1)
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedContest("all")
    setSelectedRaza("all")
    setSelectedSexo("all")
    router.push("/ganado")
    fetchGanado(1)
  }

  // Group ganado by contest
  const ganadoByContest = ganado.reduce(
    (acc, animal) => {
      const contestName = animal.contest?.nombre || "Sin concurso"
      if (!acc[contestName]) {
        acc[contestName] = []
      }
      acc[contestName].push(animal)
      return acc
    },
    {} as Record<string, GanadoItem[]>,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
            <Cow className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Registro Completo</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ganado Registrado
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explora todos los ejemplares registrados en nuestros concursos ganaderos
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre, propietario, establo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Concurso</label>
                <Select value={selectedContest} onValueChange={setSelectedContest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los concursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los concursos</SelectItem>
                    {contests.map((contest) => (
                      <SelectItem key={contest.id} value={contest.id}>
                        {contest.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Raza</label>
                <Select value={selectedRaza} onValueChange={setSelectedRaza}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las razas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las razas</SelectItem>
                    <SelectItem value="Holstein">Holstein</SelectItem>
                    <SelectItem value="Brown Swiss">Brown Swiss</SelectItem>
                    <SelectItem value="Jersey">Jersey</SelectItem>
                    <SelectItem value="Simmental">Simmental</SelectItem>
                    <SelectItem value="Angus">Angus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo</label>
                <Select value={selectedSexo} onValueChange={setSelectedSexo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Macho">Macho</SelectItem>
                    <SelectItem value="Hembra">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button onClick={handleFilterChange} variant="outline">
                Aplicar Filtros
              </Button>
              <Button onClick={clearFilters} variant="ghost">
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Object.keys(ganadoByContest).length > 0 ? (
            Object.entries(ganadoByContest).map(([contestName, animals]) => (
              <div key={contestName} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                    <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">{contestName}</span>
                  </div>
                  <Badge variant="secondary">{animals.length} ejemplares</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {animals.map((animal) => (
                    <Link key={animal.id} href={`/ganado/${animal.id}`} className="group">
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-800">
                        <div className="relative aspect-square overflow-hidden">
                          {animal.imagenUrl ? (
                            <Image
                              src={animal.imagenUrl || "/placeholder.svg"}
                              alt={animal.nombre}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                              <Cow className="h-16 w-16 text-white opacity-80" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-white/90 text-gray-800 shadow-sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {animal.nombre}
                          </h3>

                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            {animal.raza && (
                              <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3" />
                                <span>{animal.raza}</span>
                              </div>
                            )}
                            {animal.propietario && (
                              <div className="flex items-center gap-2">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{animal.propietario}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(animal.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cow className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-400 mb-3">No se encontraron resultados</h3>
              <p className="text-gray-500 mb-6">Intenta ajustar los filtros de búsqueda</p>
              <Button onClick={clearFilters} variant="outline">
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => fetchGanado(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => fetchGanado(page)}
                    disabled={loading}
                    className={cn(currentPage === page && "bg-emerald-600 hover:bg-emerald-700")}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => fetchGanado(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
