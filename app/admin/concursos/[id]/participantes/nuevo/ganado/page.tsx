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

export default function NuevoGanadoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const contestId = resolvedParams.id
  const router = useRouter()

  const [contest, setContest] = useState<Contest | null>(null)
  const [isLoadingContest, setIsLoadingContest] = useState(true)

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/api/admin/concursos/${contestId}`)
        if (response.ok) {
          const data = await response.json()
          setContest(data.contest)
        } else {
          toast.error("Error al cargar los detalles del concurso.")
          router.push(`/admin/concursos/${contestId}/participantes`)
        }
      } catch (error) {
        console.error("Error fetching contest:", error)
        toast.error("Error de red al cargar los detalles del concurso.")
        router.push(`/admin/concursos/${contestId}/participantes`)
      } finally {
        setIsLoadingContest(false)
      }
    }

    if (contestId) {
      fetchContest()
    }
  }, [contestId, router])

  const handleSuccess = () => {
    router.push(`/admin/concursos/${contestId}/participantes`)
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}/ganado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al registrar el animal.")
      }

      toast.success("Animal registrado exitosamente.")
      handleSuccess()
    } catch (error: any) {
      console.error("Error registering animal:", error)
      toast.error(error.message || "Error al registrar el animal.")
    }
  }

  if (isLoadingContest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Concurso no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Nuevo Animal"
        description={`Para el concurso: ${contest.nombre}`}
        breadcrumbItems={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Concursos", href: "/admin/concursos" },
          { label: contest.nombre, href: `/admin/concursos/${contestId}` },
          { label: "Participantes", href: `/admin/concursos/${contestId}/participantes` },
          { label: "Nuevo Animal" },
        ]}
      />
      <GanadoContestForm contestId={contestId} onSubmitSuccess={handleSuccess} onSubmit={handleSubmit} />
    </div>
  )
}
