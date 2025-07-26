"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Crown, Medal, Star, MapPin, User, Award, ArrowLeft, Gift, Calendar, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/shared/logo"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { WinnerGridSkeleton } from "@/components/shared/skeletons"

interface Winner {
  id: string
  position: number
  animalName: string
  ownerName: string
  expositorName?: string
  district: string
  breed: string
  score: number
  prizes: string[]
  contestName: string
  contestDate: string
  contestStatus: string
  category: string
  imageUrl?: string
  isChampion: boolean
  championType: string
  championTitle: string
  tipoAnimal?: string
  sexo?: string
  numeroFicha?: string
  calificacion?: string
  tipoPuntaje?: string
  isGanador?: boolean
}

interface ContestGroup {
  contestInfo: {
    id: string
    name: string
    date: string
    status: string
  }
  winners: Winner[]
}

interface FilterOptions {
  contests: Array<{ id: string; nombre: string; status: string; fechaInicio: string }>
  categories: string[]
  razas: string[]
  tiposGanado: string[]
  tiposPremio: string[]
}

function getPositionIcon(position: number) {
  switch (position) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />
    default:
      return <Trophy className="h-6 w-6 text-blue-500" />
  }
}

function getPositionBadge(position: number) {
  switch (position) {
    case 1:
      return <Badge className="bg-yellow-500 text-white font-bold">🥇 1er Lugar</Badge>
    case 2:
      return <Badge className="bg-gray-500 text-white font-bold">🥈 2do Lugar</Badge>
    case 3:
      return <Badge className="bg-amber-600 text-white font-bold">🥉 3er Lugar</Badge>
    default:
      return position > 0 ? (
        <Badge variant="outline" className="font-bold">
          {position}° Lugar
        </Badge>
      ) : null
  }
}

function getContestStatusBadge(status: string) {
  switch (status) {
    case "FINALIZADO":
      return (
        <Badge variant="secondary" className="text-xs">
          Finalizado
        </Badge>
      )
    case "EN_CURSO":
      return <Badge className="bg-green-500 text-white text-xs">En Curso</Badge>
    case "INSCRIPCIONES_ABIERTAS":
      return <Badge className="bg-blue-500 text-white text-xs">Inscripciones Abiertas</Badge>
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      )
  }
}

function PrizeBadges({ prizes, compact = false }: { prizes: string[]; compact?: boolean }) {
  if (!prizes || prizes.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1 ${compact ? "max-h-16 overflow-hidden" : ""}`}>
      {prizes.slice(0, compact ? 3 : prizes.length).map((premio, idx) => {
        if (!premio || typeof premio !== "string" || premio.trim() === "") return null

        let badgeClass = "bg-blue-100 text-blue-800 border-blue-200"
        const premioLower = premio.toLowerCase()

        if (premioLower.includes("gran campeón") || premioLower.includes("gran campeon")) {
          badgeClass = "bg-purple-100 text-purple-800 border-purple-200"
        } else if (premioLower.includes("campeón") || premioLower.includes("campeon")) {
          badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200"
        } else if (premioLower.includes("primer lugar") || premioLower.includes("1")) {
          badgeClass = "bg-green-100 text-green-800 border-green-200"
        } else if (premioLower.includes("mejor")) {
          badgeClass = "bg-indigo-100 text-indigo-800 border-indigo-200"
        }

        return (
          <Badge
            key={idx}
            variant="outline"
            className={`${badgeClass} text-xs font-medium whitespace-nowrap ${compact ? "px-2 py-1" : "px-3 py-1"}`}
          >
            {premio.trim()}
          </Badge>
        )
      })}
      {compact && prizes.length > 3 && (
        <Badge variant="outline" className="text-xs text-gray-500">
          +{prizes.length - 3} más
        </Badge>
      )}
    </div>
  )
}

export default function GanadoresPageClient() {
  const [winnersByContest, setWinnersByContest] = useState<Record<string, ContestGroup>>({})
  const [loading, setLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    contests: [],
    categories: [],
    razas: [],
    tiposGanado: [],
    tiposPremio: [],
  })
  const [filters, setFilters] = useState({
    contestId: "all",
    category: "all",
    raza: "all",
    tipoGanado: "all",
    tipoPremio: "all",
    limit: 100,
  })

  useEffect(() => {
    fetchWinners()
  }, [])

  // Fetch winners when filters change, but not on initial load
  useEffect(() => {
    if (filterOptions.contests.length > 0) {
      fetchWinners()
    }
  }, [filters])

  const fetchWinners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.contestId !== "all") params.append("contestId", filters.contestId)
      if (filters.category !== "all") params.append("category", filters.category)
      if (filters.raza !== "all") params.append("raza", filters.raza)
      if (filters.tipoGanado !== "all") params.append("tipoGanado", filters.tipoGanado)
      if (filters.tipoPremio !== "all") params.append("tipoPremio", filters.tipoPremio)
      params.append("limit", filters.limit.toString())

      const response = await fetch(`/api/ganadores?${params}`)
      if (response.ok) {
        const data = await response.json()
        console.log("Winners data received:", data)
        setWinnersByContest(data.winnersByContest || {})
        setFilterOptions(
          data.filters || {
            contests: [],
            categories: [],
            razas: [],
            tiposGanado: [],
            tiposPremio: [],
          },
        )
      } else {
        console.error("Error fetching winners", response.status)
        setWinnersByContest({})
      }
    } catch (error) {
      console.error("Error fetching winners:", error)
      setWinnersByContest({})
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      contestId: "all",
      category: "all",
      raza: "all",
      tipoGanado: "all",
      tipoPremio: "all",
      limit: 100,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <Logo className="text-white" size="lg" href={null} />
              </div>
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Trophy className="h-16 w-16 text-yellow-200" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Salón de la Fama
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-95 leading-relaxed px-4">
                Los mejores ejemplares y criadores de Cajamarca
              </p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <Breadcrumbs />
          <WinnerGridSkeleton items={6} />
        </div>
      </div>
    )
  }

  const contestGroups = Object.values(winnersByContest)
  const totalWinners = contestGroups.reduce((sum, group) => sum + group.winners.length, 0)
  const totalChampions = contestGroups.reduce(
    (sum, group) => sum + group.winners.filter((w) => w.isChampion || w.position === 1).length,
    0,
  )

  const FilterSection = () => (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Filtrar Ganadores
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Concurso</label>
            <Select
              value={filters.contestId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, contestId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los concursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los concursos</SelectItem>
                {filterOptions.contests.map((contest) => (
                  <SelectItem key={contest.id} value={contest.id}>
                    {contest.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Animal</label>
            <Select
              value={filters.tipoGanado}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, tipoGanado: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {filterOptions.tiposGanado.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Raza</label>
            <Select value={filters.raza} onValueChange={(value) => setFilters((prev) => ({ ...prev, raza: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las razas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las razas</SelectItem>
                {filterOptions.razas.map((raza) => (
                  <SelectItem key={raza} value={raza}>
                    {raza}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {filterOptions.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Premio</label>
            <Select
              value={filters.tipoPremio}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, tipoPremio: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los premios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los premios</SelectItem>
                {filterOptions.tiposPremio.map((premio) => (
                  <SelectItem key={premio} value={premio}>
                    {premio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={clearFilters} variant="outline" size="sm">
            Limpiar Filtros
          </Button>
          <Button onClick={fetchWinners} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Logo className="text-white" size="lg" href={null} />
            </div>
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Trophy className="h-16 w-16 text-yellow-200" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">Salón de la Fama</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-95 leading-relaxed px-4">
              Los mejores ejemplares y criadores de Cajamarca
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5" />
                  <span>{totalChampions} Campeones</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>{totalWinners} Ganadores</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <span>{contestGroups.length} Concursos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs />
        <FilterSection />

        {contestGroups.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">No hay ganadores registrados</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Aún no se han registrado ganadores de concursos. ¡Vuelve pronto para conocer a los campeones!
            </p>
            <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
              <Link href="/concursos">Ver Concursos Activos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {contestGroups.map((contestGroup) => (
              <Card key={contestGroup.contestInfo.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                        {contestGroup.contestInfo.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(contestGroup.contestInfo.date).toLocaleDateString("es-PE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {contestGroup.winners.length} ganadores
                        </div>
                        {getContestStatusBadge(contestGroup.contestInfo.status)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {contestGroup.winners.map((winner) => (
                      <Card
                        key={winner.id}
                        className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-400"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={winner.imageUrl || "/placeholder.svg?height=300&width=400&query=animal"}
                            alt={winner.animalName}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-3 left-3">{getPositionBadge(winner.position)}</div>
                          <div className="absolute top-3 right-3">{getPositionIcon(winner.position)}</div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                            <h3 className="text-lg font-bold text-white truncate">{winner.animalName}</h3>
                            <p className="text-white/90 text-sm truncate">{winner.breed}</p>
                            {winner.numeroFicha && <p className="text-white/80 text-xs">Ficha: {winner.numeroFicha}</p>}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-800 truncate">{winner.ownerName}</p>
                                {winner.expositorName && (
                                  <p className="text-sm text-gray-600 truncate">Exp: {winner.expositorName}</p>
                                )}
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{winner.district}</span>
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {winner.tipoPuntaje === "POSICION"
                                    ? "Posición"
                                    : winner.tipoPuntaje === "CALIFICACION"
                                      ? "Calificación"
                                      : "Puntaje"}
                                </span>
                                <span className="text-xl font-bold text-green-600">
                                  {winner.tipoPuntaje === "POSICION" && winner.position > 0
                                    ? `${winner.position}°`
                                    : winner.tipoPuntaje === "CALIFICACION" && winner.calificacion
                                      ? winner.calificacion
                                      : winner.score || 0}
                                </span>
                              </div>
                            </div>

                            {winner.category && (
                              <div className="text-sm">
                                <p className="font-medium text-gray-700 truncate">{winner.category}</p>
                              </div>
                            )}

                            {winner.prizes && winner.prizes.length > 0 && (
                              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                <p className="text-xs font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                                  <Gift className="h-3 w-3" />
                                  Premios ({winner.prizes.length})
                                </p>
                                <PrizeBadges prizes={winner.prizes} compact={true} />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" asChild className="bg-white hover:bg-gray-50">
            <Link href="/concursos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Concursos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
