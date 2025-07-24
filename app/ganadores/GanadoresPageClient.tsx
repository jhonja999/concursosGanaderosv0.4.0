"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Crown, Medal, Star, MapPin, User, Award, ArrowLeft } from "lucide-react"
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
  district: string
  breed: string
  score: number
  prize: string
  contestName: string
  contestDate: string
  category: string
  imageUrl?: string
  isChampion: boolean
}

function getPositionIcon(position: number) {
  switch (position) {
    case 1:
      return <Crown className="h-8 w-8 text-yellow-500" />
    case 2:
      return <Medal className="h-8 w-8 text-gray-400" />
    case 3:
      return <Award className="h-8 w-8 text-amber-600" />
    default:
      return <Trophy className="h-8 w-8 text-blue-500" />
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
      return (
        <Badge variant="outline" className="font-bold">
          {position}° Lugar
        </Badge>
      )
  }
}

export default function GanadoresPageClient() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    contestId: "",
    category: "",
    limit: 50,
  })

  useEffect(() => {
    fetchWinners()
  }, [filters])

  const fetchWinners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.contestId) params.append("contestId", filters.contestId)
      if (filters.category) params.append("category", filters.category)
      params.append("limit", filters.limit.toString())

      const response = await fetch(`/api/ganadores?${params}`)
      if (response.ok) {
        const data = await response.json()
        setWinners(data.winners)
      } else {
        console.error("Error fetching winners")
        setWinners([])
      }
    } catch (error) {
      console.error("Error fetching winners:", error)
      setWinners([])
    } finally {
      setLoading(false)
    }
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

  const champions = winners.filter((w) => w.isChampion)
  const otherWinners = winners.filter((w) => !w.isChampion)

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
                  <span>{champions.length} Campeones</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>{winners.length} Ganadores</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{new Set(winners.map((w) => w.district)).size} Distritos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs />

        {/* Banner del clima */}
        {/* <WeatherBanner /> */}

        {winners.length === 0 ? (
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
          <div className="space-y-12">
            {/* Podio de Campeones */}
            {champions.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-yellow-500 rounded-full" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Campeones Destacados</h2>
                  <Badge className="bg-yellow-500 text-white ml-2 px-3 py-1 text-sm font-bold">
                    {champions.length}
                  </Badge>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                  {champions.map((winner, index) => (
                    <Card
                      key={winner.id}
                      className={`relative overflow-hidden shadow-xl border-2 ${
                        index === 0
                          ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50"
                          : index === 1
                            ? "border-gray-400 bg-gradient-to-br from-gray-50 to-slate-50"
                            : "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50"
                      } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}
                    >
                      {/* Imagen del animal */}
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={winner.imageUrl || "/placeholder.svg?height=400&width=600"}
                          alt={winner.animalName}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4">{getPositionBadge(winner.position)}</div>
                        <div className="absolute top-4 right-4">{getPositionIcon(winner.position)}</div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-xl font-bold text-white mb-1">{winner.animalName}</h3>
                          <p className="text-white/90 text-sm">{winner.breed}</p>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Información del propietario */}
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-800">{winner.ownerName}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {winner.district}
                              </p>
                            </div>
                          </div>

                          {/* Puntaje */}
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Puntaje Final</span>
                              <span className="text-2xl font-bold text-green-600">{winner.score}</span>
                            </div>
                          </div>

                          {/* Premio */}
                          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <p className="text-sm font-semibold text-yellow-800 mb-1">🏆 Premio</p>
                            <p className="text-sm text-yellow-700">{winner.prize}</p>
                          </div>

                          {/* Información del concurso */}
                          <div className="pt-3 border-t">
                            <p className="text-sm font-semibold text-gray-800">{winner.contestName}</p>
                            <p className="text-xs text-gray-600">{winner.category}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(winner.contestDate).toLocaleDateString("es-PE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Otros Ganadores */}
            {otherWinners.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-blue-500 rounded-full" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Otros Ganadores</h2>
                  <Badge className="bg-blue-500 text-white ml-2 px-3 py-1 text-sm font-bold">
                    {otherWinners.length}
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherWinners.map((winner) => (
                    <Card key={winner.id} className="hover:shadow-lg transition-shadow">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={winner.imageUrl || "/placeholder.svg?height=300&width=400"}
                          alt={winner.animalName}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3">{getPositionBadge(winner.position)}</div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <h3 className="text-lg font-bold text-white">{winner.animalName}</h3>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-800">{winner.ownerName}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {winner.district}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">{winner.score}</p>
                              <p className="text-xs text-gray-500">puntos</p>
                            </div>
                          </div>

                          <div className="text-sm">
                            <p className="font-medium text-gray-700">{winner.contestName}</p>
                            <p className="text-gray-600">{winner.category}</p>
                          </div>

                          <div className="bg-green-50 rounded p-2 border border-green-200">
                            <p className="text-xs font-semibold text-green-800">Premio: {winner.prize}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Botón de regreso */}
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
