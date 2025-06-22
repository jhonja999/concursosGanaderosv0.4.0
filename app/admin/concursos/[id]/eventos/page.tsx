"use client"
import { use, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Plus, Edit, Trash2, CalendarDays } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { EventForm } from "@/components/admin/event-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"

interface Event {
  id: string
  title: string
  description?: string
  featuredImage?: string
  startDate: string
  endDate?: string
}

export default function GestionarEventosPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const contestId = resolvedParams.id

  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [contestId])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}/eventos`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        toast.error("Error al cargar los eventos del concurso.")
      }
    } catch (error) {
      toast.error("Error de red al cargar los eventos.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = () => {
    fetchEvents()
    setIsDialogOpen(false)
    setEditingEvent(null)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    const toastId = toast.loading("Eliminando evento...")
    try {
      const response = await fetch(`/api/admin/concursos/${contestId}/eventos/${eventId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Evento eliminado exitosamente.", { id: toastId })
        fetchEvents()
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al eliminar el evento.", { id: toastId })
      }
    } catch (error) {
      toast.error("Error de red al eliminar el evento.", { id: toastId })
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/concursos/${contestId}/editar`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Concurso
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestionar Agenda del Concurso</h1>
          <p className="text-muted-foreground">Añade, edita o elimina eventos del cronograma.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
          <CardDescription>Eventos programados para este concurso.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Sin Eventos"
              description="Aún no se han añadido eventos a la agenda de este concurso."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha de Inicio</TableHead>
                  <TableHead>Fecha de Fin</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {format(new Date(event.startDate), "dd 'de' MMMM, yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      {event.endDate
                        ? format(new Date(event.endDate), "dd 'de' MMMM, yyyy 'a las' HH:mm", {
                            locale: es,
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el evento.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(event.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(isOpen) => {
              setIsDialogOpen(isOpen)
              if (!isOpen) setEditingEvent(null)
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Editar Evento" : "Añadir Nuevo Evento"}</DialogTitle>
              </DialogHeader>
              <EventForm contestId={contestId} initialData={editingEvent} onSubmitSuccess={handleFormSubmit} />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
