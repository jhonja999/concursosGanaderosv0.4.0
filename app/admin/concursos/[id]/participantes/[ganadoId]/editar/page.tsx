"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GanadoForm } from "@/components/ganado/ganado-contest-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface EditGanadoPageProps {
  params: Promise<{ id: string; ganadoId: string }>
}

export default function EditGanadoPage({ params }: EditGanadoPageProps) {
  const router = useRouter()
  const [contestId, setContestId] = useState<string>("")
  const [ganadoId, setGanadoId] = useState<string>("")
  const [ganadoData, setGanadoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Resolver params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setContestId(resolvedParams.id)
      setGanadoId(resolvedParams.ganadoId)
    }
    resolveParams()
  }, [params])

  // Cargar datos del ganado
  useEffect(() => {
    if (!contestId || !ganadoId) return

    const fetchGanadoData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/concursos/${contestId}/ganado/${ganadoId}`)

        if (!response.ok) {
          throw new Error("Error al cargar los datos del animal")
        }

        const data = await response.json()

        // Transformar datos para el formulario
        const formData = {
          nombre: data.nombre,
          tipoAnimal: data.tipoAnimal || "bovino", // Default if not set
          raza: data.raza,
          sexo: data.sexo,
          fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString().split("T")[0] : "",
          peso: data.pesoKg,
          descripcion: data.descripcion || "",
          marcasDistintivas: data.marcasDistintivas || "",
          padre: data.padre || "",
          madre: data.madre || "",
          lineaGenetica: data.lineaGenetica || "",
          propietarioNombre: data.propietario?.nombreCompleto || "",
          propietarioDocumento: data.propietario?.documentoLegal || "",
          propietarioTelefono: data.propietario?.telefono || "",
          propietarioEmail: data.propietario?.email || "",
          propietarioDireccion: data.propietario?.direccion || "",
          expositorNombre: data.expositor?.nombreCompleto || "",
          expositorDocumento: data.expositor?.documentoIdentidad || "",
          expositorTelefono: data.expositor?.telefono || "",
          expositorEmail: data.expositor?.email || "",
          expositorEmpresa: data.expositor?.empresa || "",
          expositorExperiencia: data.expositor?.experiencia || "",
          contestCategoryId: data.contestCategoryId,
          numeroFicha: data.numeroFicha,
          estado: data.estado || "borrador",
          enRemate: data.enRemate || false,
          precioBaseRemate: data.precioBaseRemate,
          isDestacado: data.isDestacado || false,
          puntaje: data.puntaje,
          imagenes: data.imagenUrl ? [data.imagenUrl] : [],
          documentos: [],
        }

        setGanadoData(formData)
        setError(false)
      } catch (error) {
        console.error("Error fetching ganado data:", error)
        setError(true)
        toast.error("Error al cargar los datos del animal")
      } finally {
        setLoading(false)
      }
    }

    fetchGanadoData()
  }, [contestId, ganadoId])

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true)

      const response = await fetch(`/api/admin/concursos/${contestId}/ganado/${ganadoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el animal")
      }

      toast.success("Animal actualizado correctamente")
      router.push(`/admin/concursos/${contestId}/participantes`)
    } catch (error: any) {
      console.error("Error updating ganado:", error)
      toast.error(error.message || "Error al actualizar el animal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/admin/concursos/${contestId}/participantes`)
  }

  if (!contestId || !ganadoId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !ganadoData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md mx-auto">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold mb-2">Error al cargar</h3>
              <p>No se pudieron cargar los datos del animal.</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/concursos/${contestId}/participantes`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Participantes
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Editar Animal</h1>
          <p className="text-gray-600 mt-1">Modifica la información del animal registrado</p>
        </div>

        <GanadoForm
          contestId={contestId}
          initialData={ganadoData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={submitting}
        />
      </div>
    </div>
  )
}
