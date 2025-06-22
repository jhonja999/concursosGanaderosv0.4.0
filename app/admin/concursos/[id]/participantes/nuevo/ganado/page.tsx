"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GanadoForm } from "@/components/ganado/ganado-contest-form"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NuevoGanadoPage({ params }: PageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [contestId, setContestId] = useState<string>("")

  // Resolve params
  React.useEffect(() => {
    params.then((resolvedParams) => {
      setContestId(resolvedParams.id)
    })
  }, [params])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}/ganado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al registrar el ganado")
      }

      const result = await response.json()
      toast.success("Ganado registrado exitosamente")
      router.push(`/admin/concursos/${contestId}/participantes`)
    } catch (error) {
      console.error("Error:", error)
      toast.error(error instanceof Error ? error.message : "Error al registrar el ganado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/admin/concursos/${contestId}/participantes`)
  }

  if (!contestId) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Nuevo Ganado"
        description="Complete la información del animal para registrarlo en el concurso"
      />

      <Card>
        <CardContent className="p-6">
          <GanadoForm contestId={contestId} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
