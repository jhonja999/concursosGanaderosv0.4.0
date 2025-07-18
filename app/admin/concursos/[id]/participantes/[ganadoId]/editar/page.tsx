"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { GanadoContestForm } from "@/components/ganado/ganado-contest-form"

interface Contest {
  id: string
  nombre: string
  companyId: string
}

interface Ganado {
  id: string
  nombre: string
  numeroFicha: string
  tipoAnimal: string
  fechaNacimiento?: Date | null
  raza: string
  sexo: string
  pesoKg?: number
  descripcion?: string
  marcasDistintivas?: string
  padre?: string
  madre?: string
  lineaGenetica?: string
  enRemate: boolean
  precioBaseRemate?: number
  isDestacado: boolean
  imagenUrl?: string
  propietarioId: string
  expositorId?: string
  establoId?: string
  contestCategoryId: string
  imagenes?: string[]
  documentos?: string[]
  // Propietario fields
  propietarioNombre: string
  propietarioDocumento?: string
  propietarioTelefono?: string
  propietarioEmail?: string
  propietarioDireccion?: string
  // Expositor fields
  expositorNombre?: string
  expositorDocumento?: string
  expositorTelefono?: string
  expositorEmail?: string
  expositorEmpresa?: string
  expositorExperiencia?: string
  // Formatted fields
  fechaNacimientoFormatted?: string
  peso?: string
  puntaje?: string
}

export default function EditarGanadoPage({ params }: { params: Promise<{ id: string; ganadoId: string }> }) {
  const resolvedParams = use(params)
  const contestId = resolvedParams.id
  const ganadoId = resolvedParams.ganadoId
  const router = useRouter()

  const [contest, setContest] = useState<Contest | null>(null)
  const [ganado, setGanado] = useState<Ganado | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch contest details
        const contestResponse = await fetch(`/api/admin/concursos/${contestId}`)
        if (!contestResponse.ok) {
          const errorData = await contestResponse.json()
          throw new Error(errorData.error || "Error al cargar los detalles del concurso.")
        }

        const contestData = await contestResponse.json()
        setContest(contestData.contest)

        // Fetch ganado details
        const ganadoResponse = await fetch(`/api/admin/concursos/${contestId}/ganado/${ganadoId}`)
        if (!ganadoResponse.ok) {
          const errorData = await ganadoResponse.json()
          throw new Error(errorData.error || "Error al cargar los detalles del animal.")
        }

        const ganadoData = await ganadoResponse.json()
        console.log("Ganado data received:", ganadoData) // Debug log

        // Transform the data for the form
        const transformedGanado = {
          ...ganadoData.ganado,
          fechaNacimiento: ganadoData.ganado.fechaNacimientoFormatted || "",
        }

        setGanado(transformedGanado)
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(error.message)
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (contestId && ganadoId) {
      fetchData()
    }
  }, [contestId, ganadoId])

  const handleSuccess = () => {
    toast.success("Animal actualizado exitosamente.")
    router.push(`/admin/concursos/${contestId}/participantes`)
  }

  const handleSubmit = async (data: any) => {
    try {
      console.log("Submitting data:", data) // Debug log

      const response = await fetch(`/api/admin/concursos/${contestId}/ganado/${ganadoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el animal.")
      }

      const result = await response.json()
      console.log("Update result:", result) // Debug log

      handleSuccess()
    } catch (error: any) {
      console.error("Error updating animal:", error)
      toast.error(error.message || "Error al actualizar el animal.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => router.push(`/admin/concursos/${contestId}/participantes`)}
          className="text-primary hover:underline"
        >
          Volver a participantes
        </button>
      </div>
    )
  }

  if (!contest || !ganado) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Concurso o animal no encontrado.</p>
        <button
          onClick={() => router.push(`/admin/concursos/${contestId}/participantes`)}
          className="text-primary hover:underline"
        >
          Volver a participantes
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Animal"
        description={`Editando: ${ganado.nombre} para ${contest.nombre}`}
        breadcrumbItems={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Concursos", href: "/admin/concursos" },
          { label: contest.nombre, href: `/admin/concursos/${contestId}` },
          { label: "Participantes", href: `/admin/concursos/${contestId}/participantes` },
          { label: ganado.nombre, href: `/admin/concursos/${contestId}/participantes/${ganadoId}/editar` },
          { label: "Editar" },
        ]}
      />
      <div className="bg-background border rounded-lg p-6">
        <GanadoContestForm
          contestId={contestId}
          initialData={ganado}
          onSubmitSuccess={handleSuccess}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
