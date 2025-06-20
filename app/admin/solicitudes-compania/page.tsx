"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Mail,
  FileText,
  Filter,
  RefreshCw,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface CompanyRequest {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  nombreCompania: string
  descripcionCompania?: string
  tipoOrganizacion?: string
  ubicacion?: string
  website?: string
  motivacion?: string
  experiencia?: string
  status: string
  notas?: string
  reviewedBy?: {
    id: string
    nombre: string
    apellido: string
  }
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export default function SolicitudesCompaniaPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<CompanyRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<CompanyRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/company-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data || [])
      } else {
        console.error("Error fetching requests:", response.statusText)
        setRequests([])
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.nombreCompania.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDIENTE: { variant: "secondary" as const, text: "Pendiente", icon: Clock },
      EN_REVISION: { variant: "default" as const, text: "En Revisión", icon: AlertTriangle },
      APROBADA: { variant: "default" as const, text: "Aprobada", icon: CheckCircle },
      RECHAZADA: { variant: "destructive" as const, text: "Rechazada", icon: XCircle },
    }

    const config = variants[status as keyof typeof variants] || variants.PENDIENTE
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const handleReviewRequest = async (requestId: string, action: "approve" | "reject") => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/company-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notas: reviewNotes,
        }),
      })

      if (response.ok) {
        await fetchRequests()
        setIsDialogOpen(false)
        setReviewNotes("")
        setSelectedRequest(null)
      } else {
        console.error("Error processing request:", response.statusText)
      }
    } catch (error) {
      console.error("Error processing request:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Calcular estadísticas
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDIENTE").length,
    approved: requests.filter((r) => r.status === "APROBADA").length,
    rejected: requests.filter((r) => r.status === "RECHAZADA").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Compañía</h1>
          <p className="text-muted-foreground">Gestiona las solicitudes para crear nuevas compañías</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre, email o compañía..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                  <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                  <SelectItem value="APROBADA">Aprobadas</SelectItem>
                  <SelectItem value="RECHAZADA">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes ({filteredRequests.length})</CardTitle>
          <CardDescription>Lista de todas las solicitudes de compañía</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitante</TableHead>
                <TableHead>Compañía Solicitada</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {request.nombre} {request.apellido}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {request.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{request.nombreCompania}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.tipoOrganizacion || "No especificado"}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(request.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
            <DialogDescription>Revisa la información completa de la solicitud</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Información del Solicitante
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Nombre Completo</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.nombre} {selectedRequest.apellido}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                    </div>
                    {selectedRequest.telefono && (
                      <div>
                        <Label className="text-sm font-medium">Teléfono</Label>
                        <p className="text-sm text-muted-foreground">{selectedRequest.telefono}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Información de la Compañía
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Nombre de la Compañía</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.nombreCompania}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tipo de Organización</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.tipoOrganizacion || "No especificado"}
                      </p>
                    </div>
                    {selectedRequest.ubicacion && (
                      <div>
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <p className="text-sm text-muted-foreground">{selectedRequest.ubicacion}</p>
                      </div>
                    )}
                    {selectedRequest.website && (
                      <div>
                        <Label className="text-sm font-medium">Sitio Web</Label>
                        <p className="text-sm text-muted-foreground">{selectedRequest.website}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Descriptions */}
              {selectedRequest.descripcionCompania && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Descripción de la Compañía</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedRequest.descripcionCompania}
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedRequest.motivacion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Motivación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRequest.motivacion}</p>
                  </CardContent>
                </Card>
              )}

              {selectedRequest.experiencia && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Experiencia Previa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRequest.experiencia}</p>
                  </CardContent>
                </Card>
              )}

              {/* Status and Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Estado de la Solicitud</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Estado Actual:</Label>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de Solicitud</Label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  {selectedRequest.reviewedBy && (
                    <div>
                      <Label className="text-sm font-medium">Revisado por</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.reviewedBy.nombre} {selectedRequest.reviewedBy.apellido} el{" "}
                        {selectedRequest.reviewedAt && formatDate(selectedRequest.reviewedAt)}
                      </p>
                    </div>
                  )}
                  {selectedRequest.notas && (
                    <div>
                      <Label className="text-sm font-medium">Notas del Revisor</Label>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRequest.notas}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Actions */}
              {selectedRequest.status === "PENDIENTE" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revisar Solicitud</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reviewNotes">Notas (opcional)</Label>
                      <Textarea
                        id="reviewNotes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Agrega comentarios sobre la decisión..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cerrar
            </Button>
            {selectedRequest?.status === "PENDIENTE" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewRequest(selectedRequest.id, "reject")}
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button onClick={() => handleReviewRequest(selectedRequest.id, "approve")} disabled={isProcessing}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
