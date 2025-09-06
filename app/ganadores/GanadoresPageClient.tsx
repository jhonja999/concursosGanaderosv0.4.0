"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Crown, Medal, Star, MapPin, User, Award, ChevronDown, ChevronUp, Filter, X, Calendar, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/shared/logo"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { WinnerGridSkeleton } from "@/components/shared/skeletons"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

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
    imagenPrincipal?: string
    descripcion?: string
  }
  winners: Winner[]
}

interface FilterOptions {
  contests: Array<{ 
    id: string; 
    nombre: string; 
    status: string; 
    fechaInicio: string
    imagenPrincipal?: string
    descripcion?: string
  }>
  categories: string[]
  razas: string[]
  tiposGanado: string[]
  tiposPremio: string[]
}

// Componente optimizado para badges de posición
function PositionBadge({ position, size = 'md' }: { position: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const icons = {
    1: <Crown className="h-4 w-4" />,
    2: <Medal className="h-4 w-4" />,
    3: <Award className="h-4 w-4" />
  }

  const styles = {
    1: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-300',
    2: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-gray-200',
    3: 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 border-amber-300'
  }

  if (position > 0 && position <= 3) {
    return (
      <Badge className={`${sizeClasses[size]} ${styles[position as keyof typeof styles]} border-2 font-bold flex items-center gap-1 shadow-sm`}>
        {icons[position as keyof typeof icons]}
        <span>{position}°</span>
      </Badge>
    )
  }

  return position > 0 ? (
    <Badge variant="outline" className={`${sizeClasses[size]} border-gray-300 text-gray-600 font-semibold`}>
      {position}°
    </Badge>
  ) : null
}

function getContestStatusBadge(status: string) {
  switch (status) {
    case "FINALIZADO":
      return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Finalizado</Badge>
    case "EN_CURSO":
      return <Badge className="bg-green-500 text-white text-xs">En Curso</Badge>
    case "INSCRIPCIONES_ABIERTAS":
      return <Badge className="bg-blue-500 text-white text-xs">Inscripciones</Badge>
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>
  }
}

// Ícono por posición (1..3 con estilos distintivos, default trophy)
function getPositionIcon(position: number) {
  switch (position) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-400" />
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />
    case 3:
      return <Award className="h-6 w-6 text-amber-500" />
    default:
      return <Trophy className="h-6 w-6 text-blue-500" />
  }
}

// Componente mejorado para premios con diseño atractivo
function PrizeBadges({ prizes, showAll = false }: { prizes: string[]; showAll?: boolean }) {
  if (!prizes || prizes.length === 0) return null

  const displayPrizes = showAll ? prizes : prizes.slice(0, 3)
  const hasMore = prizes.length > 3 && !showAll

  return (
    <div className="flex flex-wrap gap-2">
      {displayPrizes.map((premio, idx) => {
        if (!premio || typeof premio !== "string" || premio.trim() === "") return null
        
        const premioLower = premio.toLowerCase()
        let bgColor = "bg-blue-100 text-blue-800 border-blue-200"
        let icon = "🏆"

        if (premioLower.includes("gran campeón")) {
          bgColor = "bg-purple-100 text-purple-800 border-purple-200"
          icon = "👑"
        } else if (premioLower.includes("campeón")) {
          bgColor = "bg-yellow-100 text-yellow-800 border-yellow-200"
          icon = "🥇"
        } else if (premioLower.includes("mejor")) {
          bgColor = "bg-green-100 text-green-800 border-green-200"
          icon = "⭐"
        } else if (premioLower.includes("primer")) {
          bgColor = "bg-rose-100 text-rose-800 border-rose-200"
          icon = "🥇"
        } else if (premioLower.includes("segundo")) {
          bgColor = "bg-gray-100 text-gray-800 border-gray-200"
          icon = "🥈"
        } else if (premioLower.includes("tercer")) {
          bgColor = "bg-orange-100 text-orange-800 border-orange-200"
          icon = "🥉"
        }

        return (
          <Badge key={idx} variant="outline" className={`${bgColor} text-xs font-medium px-2 py-1 flex items-center gap-1 shadow-sm hover:shadow-md transition-shadow`}>
            <span>{icon}</span>
            <span className="truncate">{premio.trim()}</span>
          </Badge>
        )
      })}
      {hasMore && (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
          +{prizes.length - 3} más
        </Badge>
      )}
    </div>
  )
}

// Componente optimizado para imágenes
function WinnerImage({ imageUrl, animalName, className = "" }: { 
  imageUrl?: string | null
  animalName: string
  className?: string 
}) {
  const [imgError, setImgError] = useState(false)
  const [imgSrc, setImgSrc] = useState(imageUrl || "")

  useEffect(() => {
    setImgSrc(imageUrl || "")
    setImgError(false)
  }, [imageUrl])

  const handleImageError = () => {
    setImgError(true)
    setImgSrc(`/api/placeholder/400/300?text=${encodeURIComponent(animalName.slice(0, 20))}&bg_color=2563eb&text_color=ffffff&font_size=20`)
  }

  if (imgError || !imgSrc) {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center relative overflow-hidden`}>
        <div className="text-center p-4">
          <Trophy className="h-12 w-12 mx-auto text-blue-400 dark:text-blue-300 mb-2" />
          <p className="text-xs text-blue-600 dark:text-blue-200 font-medium text-center">{animalName}</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={animalName}
      fill
      className={`${className} object-cover`}
      onError={handleImageError}
      priority={false}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

// Componente de concurso mobile optimizado
function MobileContestCard({ contestGroup, isExpanded, onToggle, onWinnerClick }: {
  contestGroup: ContestGroup
  isExpanded: boolean
  onToggle: () => void
  onWinnerClick: (winner: Winner) => void
}) {
  return (
    <Card className="border-primary/20 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Imagen con overlay de información */}
      <div className="relative h-56 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
        <img
          src={contestGroup.contestInfo.imagenPrincipal || "/api/placeholder/400/300?text=Concurso&bg_color=2563eb&text_color=ffffff"}
          alt={contestGroup.contestInfo.name}
          className="w-full h-full object-cover"
        />
        
        {/* Información superpuesta */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{contestGroup.contestInfo.name}</h3>
              {contestGroup.contestInfo.descripcion && (
                <p className="text-white/90 text-xs line-clamp-2 mb-2">{contestGroup.contestInfo.descripcion}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-white/80">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(contestGroup.contestInfo.date).toLocaleDateString("es-PE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {contestGroup.winners.length}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
              onClick={onToggle}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Información del concurso */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {getContestStatusBadge(contestGroup.contestInfo.status)}
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className="border-primary/20 text-primary dark:text-primary text-xs"
          >
            {isExpanded ? "Ocultar" : "Ver ganadores"}
          </Button>
        </div>
      </CardContent>

      {/* Ganadores con animación suave */}
      <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/30">
            <div className="grid gap-3">
              {contestGroup.winners.map((winner) => (
                <MobileWinnerCard key={winner.id} winner={winner} onClick={() => onWinnerClick(winner)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Componente de ganador optimizado para móvil
function MobileWinnerCard({ winner, onClick }: { winner: Winner; onClick: () => void }) {
  return (
    <div 
      className="bg-white dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border border-gray-200 dark:border-gray-600"
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Imagen y posición */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <div className="w-full h-full rounded-lg overflow-hidden">
            <WinnerImage 
              imageUrl={winner.imageUrl}
              animalName={winner.animalName}
              className="w-full h-full"
            />
          </div>
          <div className="absolute -top-1 -left-1">
            <PositionBadge position={winner.position} size="sm" />
          </div>
        </div>

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">
              {winner.animalName}
            </h4>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              {winner.tipoPuntaje === "POSICION" && winner.position > 0
                ? `${winner.position}°`
                : winner.tipoPuntaje === "CALIFICACION" && winner.calificacion
                ? winner.calificacion
                : `${winner.score} pts`}
            </span>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
            {winner.breed}
          </p>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <User className="h-3 w-3" />
            <span className="truncate">{winner.ownerName}</span>
          </div>

          {/* Premios - lo más importante */}
          {winner.prizes.length > 0 && (
            <div className="mt-2">
              <PrizeBadges prizes={winner.prizes} showAll={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Modal para detalles del ganador en mobile
function WinnerDetailModal({ 
  winner, 
  isOpen, 
  onClose 
}: { 
  winner: Winner | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!winner) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 my-8 max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg font-bold text-primary dark:text-primary flex items-center gap-2">
            <PositionBadge position={winner.position} size="md" />
            {winner.animalName}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] overflow-auto px-4 pb-4">
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative h-48 w-full rounded-lg overflow-hidden">
              <WinnerImage 
                imageUrl={winner.imageUrl}
                animalName={winner.animalName}
                className="w-full h-full"
              />
            </div>

            {/* PREMIOS - SECCIÓN PRINCIPAL */}
            {winner.prizes.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Premios Obtenidos ({winner.prizes.length})
                </h4>
                <div className="space-y-2">
                  <PrizeBadges prizes={winner.prizes} showAll={true} />
                </div>
              </div>
            )}

            {/* Información general */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Información del Ejemplar
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Raza</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{winner.breed}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Categoría</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{winner.category}</p>
                </div>
                {winner.numeroFicha && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Ficha</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{winner.numeroFicha}</p>
                  </div>
                )}
                {winner.tipoAnimal && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Tipo</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{winner.tipoAnimal}</p>
                  </div>
                )}
                {winner.sexo && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Sexo</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{winner.sexo}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Puntuación</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {winner.tipoPuntaje === "POSICION" && winner.position > 0
                      ? `${winner.position}° Lugar`
                      : winner.tipoPuntaje === "CALIFICACION" && winner.calificacion
                      ? winner.calificacion
                      : `${winner.score} pts`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Concurso</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{winner.contestName}</p>
                </div>
              </div>
            </div>

            {/* Propietario */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Propietario
              </h4>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{winner.ownerName}</p>
                {winner.expositorName && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expositor: {winner.expositorName}</p>
                  </>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>{winner.district}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button onClick={onClose} variant="outline" className="border-primary/20 text-primary dark:text-primary">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Componente principal
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
  const [expandedContests, setExpandedContests] = useState<Record<string, boolean>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null)

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = useCallback(async (appliedFilters = filters) => {
    try {
      setIsUpdating(true)
      const params = new URLSearchParams()
      if (appliedFilters.contestId !== "all") params.append("contestId", appliedFilters.contestId)
      if (appliedFilters.category !== "all") params.append("category", appliedFilters.category)
      if (appliedFilters.raza !== "all") params.append("raza", appliedFilters.raza)
      if (appliedFilters.tipoGanado !== "all") params.append("tipoGanado", appliedFilters.tipoGanado)
      if (appliedFilters.tipoPremio !== "all") params.append("tipoPremio", appliedFilters.tipoPremio)
      params.append("limit", appliedFilters.limit.toString())

      const response = await fetch(`/api/ganadores?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        const winnersWithContestInfo = data.winnersByContest || {}
        Object.keys(winnersWithContestInfo).forEach(contestId => {
          const contestInfo = data.filters?.contests?.find((c: any) => c.id === contestId)
          if (contestInfo) {
            winnersWithContestInfo[contestId].contestInfo = {
              ...winnersWithContestInfo[contestId].contestInfo,
              imagenPrincipal: contestInfo.imagenPrincipal,
              descripcion: contestInfo.descripcion
            }
          }
        })
        
        setWinnersByContest(winnersWithContestInfo)
        // Also fetch public contests (all statuses) to allow filtering by any contest state
        try {
          const contestsResp = await fetch('/api/concursos')
          if (contestsResp.ok) {
            const contestsData = await contestsResp.json()
            const publicContests = Array.isArray(contestsData.contests) ? contestsData.contests : []
            // Merge contest sources (from winners filters and public contests) de-duplicating by id
            const contestsFromWinners = (data.filters?.contests || []).map((c: any) => ({ id: c.id, nombre: c.nombre, status: c.status, fechaInicio: c.fechaInicio, imagenPrincipal: c.imagenPrincipal, descripcion: c.descripcion }))
            const merged = [...contestsFromWinners, ...publicContests]
            const unique = Array.from(new Map(merged.map((c: any) => [c.id, c])).values())

            setFilterOptions({
              contests: unique,
              categories: data.filters?.categories || [],
              razas: data.filters?.razas || [],
              tiposGanado: data.filters?.tiposGanado || [],
              tiposPremio: data.filters?.tiposPremio || [],
            })
          } else {
            setFilterOptions(data.filters || {
              contests: [],
              categories: [],
              razas: [],
              tiposGanado: [],
              tiposPremio: [],
            })
          }
        } catch (err) {
          console.error('Error fetching public contests for filters:', err)
          setFilterOptions(data.filters || {
            contests: [],
            categories: [],
            razas: [],
            tiposGanado: [],
            tiposPremio: [],
          })
        }
      }
    } catch (error) {
      console.error("Error fetching winners:", error)
    } finally {
      setLoading(false)
      setIsUpdating(false)
    }
  }, [filters])

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
    fetchWinners(newFilters)
  }, [fetchWinners])

  const toggleContestExpansion = (contestId: string) => {
    setExpandedContests(prev => ({ ...prev, [contestId]: !prev[contestId] }))
  }

  const handleWinnerClick = (winner: Winner) => {
    setSelectedWinner(winner)
  }

  const closeWinnerModal = () => {
    setSelectedWinner(null)
  }

  const contestGroups = Object.values(winnersByContest)
  const totalWinners = contestGroups.reduce((sum, group) => sum + group.winners.length, 0)
  const totalChampions = contestGroups.reduce(
    (sum, group) => sum + group.winners.filter((w) => w.isChampion || w.position === 1).length,
    0,
  )

  // Componente de filtros desplegables
  function CollapsibleFilters({ 
    filters, 
    filterOptions, 
    onFiltersChange, 
    isLoading,
    isOpen,
    onToggle
  }: {
    filters: any
    filterOptions: FilterOptions
    onFiltersChange: (filters: any) => void
    isLoading: boolean
    isOpen: boolean
    onToggle: () => void
  }) {
    const [localFilters, setLocalFilters] = useState(filters)
    const [pendingUpdate, setPendingUpdate] = useState<NodeJS.Timeout | null>(null)

    useEffect(() => {
      setLocalFilters(filters)
    }, [filters])

    const handleFilterChange = (key: string, value: string) => {
      const newFilters = { ...localFilters, [key]: value }
      setLocalFilters(newFilters)

      if (pendingUpdate) {
        clearTimeout(pendingUpdate)
      }

      const timeout = setTimeout(() => {
        onFiltersChange(newFilters)
      }, 400)

      setPendingUpdate(timeout)
    }

    return (
      <div className="mb-6">
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full lg:w-auto bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:border-primary/30 dark:text-primary dark:hover:bg-primary/30 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {isLoading && <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <Card className="border-primary/20 bg-primary/5 backdrop-blur dark:bg-gray-800/50 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Contest Filter */}
                  <div className="lg:col-span-4">
                    <label className="text-sm font-medium text-primary mb-2 block dark:text-primary">Concurso</label>
                    <select 
                      value={localFilters.contestId}
                      onChange={(e) => handleFilterChange('contestId', e.target.value)}
                      className="w-full p-3 border border-primary/20 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary/30"
                      disabled={isLoading}
                    >
                      <option value="all">Todos los concursos</option>
                      {filterOptions.contests.map(contest => (
                        <option key={contest.id} value={contest.id}>
                          {contest.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block dark:text-primary">Tipo</label>
                    <select 
                      value={localFilters.tipoGanado}
                      onChange={(e) => handleFilterChange('tipoGanado', e.target.value)}
                      className="w-full p-3 border border-primary/20 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary/30"
                      disabled={isLoading}
                    >
                      <option value="all">Todos</option>
                      {filterOptions.tiposGanado.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block dark:text-primary">Categoría</label>
                    <select 
                      value={localFilters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full p-3 border border-primary/20 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary/30"
                      disabled={isLoading}
                    >
                      <option value="all">Todas</option>
                      {filterOptions.categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Breed Filter */}
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block dark:text-primary">Raza</label>
                    <select 
                      value={localFilters.raza}
                      onChange={(e) => handleFilterChange('raza', e.target.value)}
                      className="w-full p-3 border border-primary/20 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary/30"
                      disabled={isLoading}
                    >
                      <option value="all">Todas</option>
                      {filterOptions.razas.map(raza => (
                        <option key={raza} value={raza}>{raza}</option>
                      ))}
                    </select>
                  </div>

                  {/* Prize Filter */}
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block dark:text-primary">Premio</label>
                    <select 
                      value={localFilters.tipoPremio}
                      onChange={(e) => handleFilterChange('tipoPremio', e.target.value)}
                      className="w-full p-3 border border-primary/20 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary/30"
                      disabled={isLoading}
                    >
                      <option value="all">Todos</option>
                      {filterOptions.tiposPremio.map(premio => (
                        <option key={premio} value={premio}>{premio}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => onFiltersChange({
                      contestId: "all",
                      category: "all",
                      raza: "all",
                      tipoGanado: "all",
                      tipoPremio: "all",
                      limit: 100,
                    })} 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary dark:text-primary"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Componente principal de concurso para desktop
  const DesktopContestCard = ({ contestGroup, isExpanded, onToggle }: {
    contestGroup: ContestGroup
    isExpanded: boolean
    onToggle: () => void
  }) => (
    <Card className="border-primary/20 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header con imagen */}
      <div className="relative h-64 w-full cursor-pointer group" onClick={onToggle}>
        <img
          src={contestGroup.contestInfo.imagenPrincipal || "/api/placeholder/800/400?text=Concurso&bg_color=2563eb&text_color=ffffff"}
          alt={contestGroup.contestInfo.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{contestGroup.contestInfo.name}</h2>
                {contestGroup.contestInfo.descripcion && (
                  <p className="text-white/90 text-sm line-clamp-2">{contestGroup.contestInfo.descripcion}</p>
                )}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1 text-sm text-white/90">
                    <Calendar className="h-4 w-4" />
                    {new Date(contestGroup.contestInfo.date).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-white/90">
                    <Users className="h-4 w-4" />
                    {contestGroup.winners.length} ganadores
                  </div>
                  {getContestStatusBadge(contestGroup.contestInfo.status)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm ml-4 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle()
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ganadores con animación */}
      <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contestGroup.winners.map((winner) => (
                <div key={winner.id} className="transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => handleWinnerClick(winner)}>
                  <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-400 dark:bg-gray-800 dark:border-gray-700 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <WinnerImage 
                        imageUrl={winner.imageUrl}
                        animalName={winner.animalName}
                        className="w-full h-full"
                      />
                      <div className="absolute top-3 left-3">
                        <PositionBadge position={winner.position} size="md" />
                      </div>
                      <div className="absolute top-3 right-3">
                        {getPositionIcon(winner.position)}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <h3 className="text-lg font-bold text-white truncate">{winner.animalName}</h3>
                        <p className="text-white/90 text-sm truncate">{winner.breed}</p>
                        {winner.numeroFicha && <p className="text-white/80 text-xs">Ficha: {winner.numeroFicha}</p>}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{winner.ownerName}</p>
                            {winner.expositorName && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">Exp: {winner.expositorName}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{winner.district}</span>
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {winner.tipoPuntaje === "POSICION"
                                ? "Posición"
                                : winner.tipoPuntaje === "CALIFICACION"
                                  ? "Calificación"
                                  : "Puntaje"}
                            </span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
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
                            <p className="font-medium text-gray-700 dark:text-gray-300 truncate">{winner.category}</p>
                          </div>
                        )}

                        {/* Premios destacados */}
                        {winner.prizes.length > 0 && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Premios ({winner.prizes.length})
                            </p>
                            <PrizeBadges prizes={winner.prizes} showAll={false} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-500">
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
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <WinnerGridSkeleton items={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/20 dark:bg-gray-900">
      {/* Hero Section - ORIGINAL MANTENIDO */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs />
        
        {/* Filtros desplegables */}
        <CollapsibleFilters 
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          isLoading={isUpdating}
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />

        {contestGroups.length === 0 ? (
          <Card className="border-primary/20 bg-primary/5 backdrop-blur dark:bg-gray-800/50 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto text-primary/30 dark:text-primary/50 mb-4" />
              <h2 className="text-xl font-bold text-primary dark:text-primary mb-2">No hay ganadores</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Aún no se han registrado ganadores para este filtro.</p>
              <Button asChild className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80">
                <Link href="/concursos">Ver Concursos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Renderizado condicional según el tamaño de pantalla */}
            {contestGroups.map((contestGroup) => {
              const isExpanded = expandedContests[contestGroup.contestInfo.id]
              
              return (
                <div key={contestGroup.contestInfo.id} className="transition-all duration-300">
                  {/* Versión Mobile */}
                  <div className="lg:hidden">
                    <MobileContestCard 
                      contestGroup={contestGroup} 
                      isExpanded={isExpanded} 
                      onToggle={() => toggleContestExpansion(contestGroup.contestInfo.id)} 
                      onWinnerClick={handleWinnerClick}
                    />
                  </div>
                  
                  {/* Versión Desktop */}
                  <div className="hidden lg:block">
                    <DesktopContestCard 
                      contestGroup={contestGroup} 
                      isExpanded={isExpanded} 
                      onToggle={() => toggleContestExpansion(contestGroup.contestInfo.id)} 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de detalles del ganador */}
        <WinnerDetailModal 
          winner={selectedWinner}
          isOpen={!!selectedWinner}
          onClose={closeWinnerModal}
        />

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button variant="outline" asChild className="bg-white hover:bg-gray-50 border-primary/20 text-primary hover:bg-primary/5 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-primary/30 dark:text-primary">
            <Link href="/concursos" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Ver Todos los Concursos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}