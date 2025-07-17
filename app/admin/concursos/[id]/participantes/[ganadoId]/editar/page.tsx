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
}

interface Ganado {
  id: string
  nombre: string
  // Add other fields that GanadoContestForm expects in initialData
  numeroFicha: string
  fechaNacimiento?: string
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
  imagenes?: string[] // Ensure this is included for initialData
  documentos?: string[] // Ensure this is included for initialData
}

export default function EditarGanadoPage({ params }: { params: Promise<{ id: string; ganadoId: string }> }) {
  const resolvedParams = use(params)
  const contestId = resolvedParams.id
  const ganadoId = resolvedParams.ganadoId
  const router = useRouter()

  const [contest, setContest] = useState<Contest | null>(null)
  const [ganado, setGanado] = useState<Ganado | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contest details
        const contestResponse = await fetch(`/api/admin/concursos/${contestId}`)
        if (contestResponse.ok) {
          const contestData = await contestResponse.json()
          setContest(contestData.contest)
        } else {
          toast.error("Error al cargar los detalles del concurso.")
          router.push(`/admin/concursos/${contestId}/participantes`)
          return
        }

        // Fetch ganado details
        const ganadoResponse = await fetch(`/api/admin/concursos/${contestId}/ganado/${ganadoId}`)
        if (ganadoResponse.ok) {
          const ganadoData = await ganadoResponse.json()
          setGanado(ganadoData.ganado)
        } else {
          toast.error("Error al cargar los detalles del animal.")
          router.push(`/admin/concursos/${contestId}/participantes`)
          return
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error de red al cargar los datos.")
        router.push(`/admin/concursos/${contestId}/participantes`)
      } finally {
        setIsLoading(false)
      }
    }

    if (contestId && ganadoId) {
      fetchData()
    }
  }, [contestId, ganadoId, router])

  const handleSuccess = () => {
    router.push(`/admin/concursos/${contestId}/participantes`)
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}/ganado/${ganadoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el animal.")
      }

      toast.success("Animal actualizado exitosamente.")
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

  if (!contest || !ganado) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Concurso o animal no encontrado.</p>
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
      <GanadoContestForm
        contestId={contestId}
        initialData={ganado}
        onSubmitSuccess={handleSuccess}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
