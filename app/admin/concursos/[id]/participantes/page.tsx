"use client"

import { useParams, useRouter } from "next/navigation"
import { Users, ArrowLeft, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { useEffect, useState } from "react"

export default function ContestParticipantsPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string
  const [contestName, setContestName] = useState<string>("")
  const [isLoadingContestName, setIsLoadingContestName] = useState(true)

  useEffect(() => {
    if (contestId) {
      const fetchContestName = async () => {
        setIsLoadingContestName(true)
        try {
          const response = await fetch(`/api/admin/concursos/${contestId}`)
          if (response.ok) {
            const data = await response.json()
            setContestName(data.contest?.nombre || "Concurso")
          } else {
            setContestName("Concurso")
          }
        } catch (error) {
          console.error("Error fetching contest name:", error)
          setContestName("Concurso")
        } finally {
          setIsLoadingContestName(false)
        }
      }
      fetchContestName()
    }
  }, [contestId])

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLoadingContestName ? "Cargando..." : `Participantes de ${contestName}`}
        description="Gestiona los animales o productos inscritos en este concurso."
        breadcrumbItems={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Concursos", href: "/admin/concursos" },
          { label: isLoadingContestName ? "Concurso" : contestName, href: `/admin/concursos/${contestId}` },
          { label: "Participantes" },
        ]}
      >
        {/* Button to add new participant will go here */}
        <Button disabled>
          <Users className="mr-2 h-4 w-4" /> Nuevo Participante (Próximamente)
        </Button>
      </PageHeader>

      <EmptyState
        icon={Construction} // Pass component directly
        title="En Construcción"
        description="La gestión de participantes está actualmente en desarrollo y estará disponible pronto."
        action={{
          // Pass an object for the action
          label: "Volver al Concurso",
          onClick: () => router.push(`/admin/concursos/${contestId}`), // Make sure router is imported and available
          icon: ArrowLeft, // Optional
          variant: "outline",
        }}
      />
    </div>
  )
}
