import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Building2, Trophy, Eye, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import ContestCard from "@/components/ContestCard"
import { Logo } from "@/components/shared/logo"

interface Contest {
  id: string
  nombre: string
  slug: string
  descripcion: string
  imagenPrincipal?: string | null
  fechaInicio: string
  fechaFin?: string
  fechaInicioRegistro?: string
  fechaFinRegistro?: string
  ubicacion?: string
  cuotaInscripcion?: number
  tipoGanado?: string[]
  isActive: boolean
  participantCount: number
  company: {
    id: string
    nombre: string
    logo?: string
    descripcion?: string
    ubicacion?: string
  }
  createdAt: string
}

async function getContests(): Promise<Contest[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/concursos`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch contests")
    }

    const data = await response.json()
    return data.contests || []
  } catch (error) {
    console.error("Error fetching contests:", error)
    return []
  }
}

export default async function ConcursosPage() {
  const contests = await getContests()

  // Separate contests by status
  const activeContests = contests.filter((contest) => {
    const now = new Date()
    const startDate = new Date(contest.fechaInicio)
    const endDate = contest.fechaFin ? new Date(contest.fechaFin) : null

    return !endDate || endDate >= now
  })

  const finishedContests = contests.filter((contest) => {
    const now = new Date()
    const endDate = contest.fechaFin ? new Date(contest.fechaFin) : null

    return endDate && endDate < now
  })

  return (
    
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Logo className="ml-80 mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Concursos Ganaderos</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Descubre y participa en los mejores concursos ganaderos del país
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <span>{contests.length} Concursos Disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{contests.reduce((acc, c) => acc + c.participantCount, 0)} Participantes</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>{new Set(contests.map((c) => c.company.id)).size} Organizadores</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {contests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">No hay concursos disponibles</h2>
            <p className="text-gray-500 mb-8">Actualmente no hay concursos ganaderos programados. ¡Vuelve pronto!</p>
            <Button asChild>
              <Link href="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active Contests */}
            {activeContests.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-blue-500 rounded-full" />
                  <h2 className="text-3xl font-bold text-gray-800">Concursos Activos y Próximos</h2>
                  <Badge variant="default" className="ml-2">
                    {activeContests.length}
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </div>
              </section>
            )}

            {/* Finished Contests */}
            {finishedContests.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-gray-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-gray-800">Concursos Finalizados</h2>
                  <Badge variant="secondary" className="ml-2">
                    {finishedContests.length}
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {finishedContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const metadata = {
  title: "Concursos Ganaderos - Todos los Concursos",
  description:
    "Descubre y participa en los mejores concursos ganaderos del país. Encuentra información completa sobre fechas, ubicaciones, participantes y más.",
  openGraph: {
    title: "Concursos Ganaderos - Todos los Concursos",
    description: "Descubre y participa en los mejores concursos ganaderos del país",
    type: "website",
  },
}