"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Building2,
  Filter,
  RefreshCw,
  Trophy,
  Shield,
  ShieldCheck,
  ShieldX,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role: string
  isActive: boolean
  contestAccess: boolean
  lastLogin?: string
}

interface Subscription {
  id: string
  company: {
    id: string
    nombre: string
    email: string
    users: User[]
  }
  plan: string
  status: string
  fechaInicio: string
  fechaExpiracion: string
  precio: number
  maxConcursos: number
  concursosUsados: number
  autoRenewal: boolean
  paymentMethod: string
  lastPayment?: string
  nextPayment?: string
  contestAccessEnabled: boolean
}

interface PaymentHistory {
  id: string
  subscriptionId: string
  amount: number
  status: string
  date: string
  method: string
  transactionId: string
}

export default function SuscripcionesPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("subscriptions")

  useEffect(() => {
    fetchSubscriptions()
    fetchPaymentHistory()
  }, [])

  useEffect(() => {
    filterSubscriptions()
  }, [subscriptions, searchTerm, planFilter, statusFilter])

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (planFilter !== "all") params.append("plan", planFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/subscriptions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data || [])
      } else {
        console.error("Error fetching subscriptions:", response.statusText)
        setSubscriptions([])
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      setSubscriptions([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      if (response.ok) {
        const data = await response.json()
        setPaymentHistory(data || [])
      } else {
        console.error("Error fetching payment history:", response.statusText)
        setPaymentHistory([])
      }
    } catch (error) {
      console.error("Error fetching payment history:", error)
      setPaymentHistory([])
    }
  }

  const filterSubscriptions = () => {
    let filtered = subscriptions

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.company.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (planFilter !== "all") {
      filtered = filtered.filter((sub) => sub.plan === planFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter)
    }

    setFilteredSubscriptions(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVO: { variant: "default" as const, text: "Activo", icon: CheckCircle },
      EXPIRADO: { variant: "destructive" as const, text: "Expirado", icon: AlertTriangle },
      SUSPENDIDO: { variant: "secondary" as const, text: "Suspendido", icon: Clock },
      CANCELADO: { variant: "outline" as const, text: "Cancelado", icon: AlertTriangle },
    }

    const config = variants[status as keyof typeof variants] || variants.ACTIVO
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      BASICO: "bg-blue-100 text-blue-800 border-blue-200",
      PROFESIONAL: "bg-purple-100 text-purple-800 border-purple-200",
      EMPRESARIAL: "bg-amber-100 text-amber-800 border-amber-200",
    }

    return <Badge className={colors[plan as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{plan}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      COMPLETADO: { variant: "default" as const, text: "Completado" },
      FALLIDO: { variant: "destructive" as const, text: "Fallido" },
      PENDIENTE: { variant: "secondary" as const, text: "Pendiente" },
    }

    const config = variants[status as keyof typeof variants] || variants.PENDIENTE
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      CONCURSO_ADMIN: { variant: "default" as const, text: "Admin" },
      REGISTRADOR: { variant: "secondary" as const, text: "Registrador" },
    }

    const config = variants[role as keyof typeof variants] || { variant: "outline" as const, text: role }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getAccessBadge = (hasAccess: boolean) => {
    return hasAccess ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Permitido
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
        <ShieldX className="h-3 w-3 mr-1" />
        Bloqueado
      </Badge>
    )
  }

  const isExpiringSoon = (fechaExpiracion: string) => {
    const expDate = new Date(fechaExpiracion)
    const now = new Date()
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 30 && daysUntilExpiration > 0
  }

  const handleToggleContestAccess = async (subscriptionId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/contest-access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestAccessEnabled: enabled }),
      })

      if (response.ok) {
        setSubscriptions(
          subscriptions.map((sub) =>
            sub.id === subscriptionId
              ? {
                  ...sub,
                  contestAccessEnabled: enabled,
                  company: {
                    ...sub.company,
                    users: sub.company.users.map((user) => ({
                      ...user,
                      contestAccess: enabled ? user.contestAccess : false,
                    })),
                  },
                }
              : sub,
          ),
        )
      }
    } catch (error) {
      console.error("Error toggling contest access:", error)
    }
  }

  const handleToggleUserContestAccess = async (subscriptionId: string, userId: string, hasAccess: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestAccess: hasAccess }),
      })

      if (response.ok) {
        setSubscriptions(
          subscriptions.map((sub) =>
            sub.id === subscriptionId
              ? {
                  ...sub,
                  company: {
                    ...sub.company,
                    users: sub.company.users.map((user) =>
                      user.id === userId ? { ...user, contestAccess: hasAccess } : user,
                    ),
                  },
                }
              : sub,
          ),
        )
      }
    } catch (error) {
      console.error("Error toggling user contest access:", error)
    }
  }

  const handleBulkToggleUsers = async (subscriptionId: string, userIds: string[], hasAccess: boolean) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/users/bulk-access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds, contestAccess: hasAccess }),
      })

      if (response.ok) {
        setSubscriptions(
          subscriptions.map((sub) =>
            sub.id === subscriptionId
              ? {
                  ...sub,
                  company: {
                    ...sub.company,
                    users: sub.company.users.map((user) =>
                      userIds.includes(user.id) ? { ...user, contestAccess: hasAccess } : user,
                    ),
                  },
                }
              : sub,
          ),
        )
      }
    } catch (error) {
      console.error("Error bulk toggling user access:", error)
    }
  }

  // Calcular estadísticas
  const totalRevenue = subscriptions.filter((sub) => sub.status === "ACTIVO").reduce((sum, sub) => sum + sub.precio, 0)

  const expiringCount = subscriptions.filter(
    (sub) => sub.status === "ACTIVO" && isExpiringSoon(sub.fechaExpiracion),
  ).length

  const activeCount = subscriptions.filter((sub) => sub.status === "ACTIVO").length
  const expiredCount = subscriptions.filter((sub) => sub.status === "EXPIRADO").length

  const totalUsersWithAccess = subscriptions.reduce(
    (sum, sub) => sum + sub.company.users.filter((user) => user.contestAccess && user.isActive).length,
    0,
  )

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
          <h1 className="text-3xl font-bold">Control de Suscripciones</h1>
          <p className="text-muted-foreground">Gestiona planes, pagos, renovaciones y acceso a concursos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">{subscriptions.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringCount}</div>
            <p className="text-xs text-muted-foreground">En los próximos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
            <p className="text-xs text-muted-foreground">Requieren renovación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceso a Concursos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalUsersWithAccess}</div>
            <p className="text-xs text-muted-foreground">Usuarios con acceso</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          <TabsTrigger value="access-control">Control de Acceso</TabsTrigger>
          <TabsTrigger value="payments">Historial de Pagos</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Compañía o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los planes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los planes</SelectItem>
                      <SelectItem value="BASICO">Básico</SelectItem>
                      <SelectItem value="PROFESIONAL">Profesional</SelectItem>
                      <SelectItem value="EMPRESARIAL">Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="ACTIVO">Activo</SelectItem>
                      <SelectItem value="EXPIRADO">Expirado</SelectItem>
                      <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Suscripciones ({filteredSubscriptions.length})</CardTitle>
              <CardDescription>Lista de todas las suscripciones del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Compañía</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Acceso Concursos</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {subscription.company.nombre}
                          </div>
                          <div className="text-sm text-muted-foreground">{subscription.company.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(subscription.plan)}</TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                        {isExpiringSoon(subscription.fechaExpiracion) && (
                          <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Próximo a vencer
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs">
                              <span>Concursos</span>
                              <span>
                                {subscription.concursosUsados}/{subscription.maxConcursos}
                              </span>
                            </div>
                            <Progress
                              value={(subscription.concursosUsados / subscription.maxConcursos) * 100}
                              className="h-1"
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={subscription.contestAccessEnabled}
                              onCheckedChange={(checked) => handleToggleContestAccess(subscription.id, checked)}
                              disabled={subscription.status !== "ACTIVO"}
                            />
                            <span className="text-xs">
                              {subscription.contestAccessEnabled ? "Habilitado" : "Deshabilitado"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {subscription.company.users.filter((u) => u.contestAccess && u.isActive).length} de{" "}
                            {subscription.company.users.filter((u) => u.isActive).length} usuarios
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(subscription.fechaExpiracion)}</div>
                        {subscription.autoRenewal && (
                          <Badge variant="outline" className="text-xs mt-1">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Auto-renovación
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(subscription.precio)}</div>
                        <div className="text-xs text-muted-foreground">{subscription.paymentMethod}</div>
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
                                setSelectedSubscription(subscription)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubscription(subscription)
                                setIsAccessDialogOpen(true)
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Gestionar acceso
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
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
        </TabsContent>

        <TabsContent value="access-control" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Control de Acceso a Concursos
              </CardTitle>
              <CardDescription>Gestiona qué usuarios pueden acceder a las funcionalidades de concursos</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {subscriptions.map((subscription) => (
                  <AccordionItem key={subscription.id} value={subscription.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{subscription.company.nombre}</span>
                          {getPlanBadge(subscription.plan)}
                          {getStatusBadge(subscription.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={subscription.contestAccessEnabled ? "default" : "secondary"}>
                            {subscription.contestAccessEnabled ? "Habilitado" : "Deshabilitado"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {subscription.company.users.filter((u) => u.contestAccess && u.isActive).length}/
                            {subscription.company.users.filter((u) => u.isActive).length} usuarios
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        {/* Global Toggle */}
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Acceso Global a Concursos</h4>
                            <p className="text-sm text-muted-foreground">
                              Habilitar o deshabilitar el acceso a concursos para toda la compañía
                            </p>
                          </div>
                          <Switch
                            checked={subscription.contestAccessEnabled}
                            onCheckedChange={(checked) => handleToggleContestAccess(subscription.id, checked)}
                            disabled={subscription.status !== "ACTIVO"}
                          />
                        </div>

                        {/* Bulk Actions */}
                        {subscription.contestAccessEnabled && subscription.company.users.length > 0 && (
                          <div className="flex items-center gap-2 p-4 border rounded-lg">
                            <span className="text-sm font-medium">Acciones masivas:</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleBulkToggleUsers(
                                  subscription.id,
                                  subscription.company.users.filter((u) => u.isActive).map((u) => u.id),
                                  true,
                                )
                              }
                            >
                              <ShieldCheck className="h-4 w-4 mr-1" />
                              Permitir todos
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleBulkToggleUsers(
                                  subscription.id,
                                  subscription.company.users.filter((u) => u.isActive).map((u) => u.id),
                                  false,
                                )
                              }
                            >
                              <ShieldX className="h-4 w-4 mr-1" />
                              Bloquear todos
                            </Button>
                          </div>
                        )}

                        {/* Users List */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Usuarios ({subscription.company.users.length})</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Último Acceso</TableHead>
                                <TableHead>Acceso a Concursos</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {subscription.company.users.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {user.nombre} {user.apellido}
                                      </div>
                                      <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                                  <TableCell>
                                    <Badge variant={user.isActive ? "default" : "secondary"}>
                                      {user.isActive ? "Activo" : "Inactivo"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Switch
                                        checked={user.contestAccess}
                                        onCheckedChange={(checked) =>
                                          handleToggleUserContestAccess(subscription.id, user.id, checked)
                                        }
                                        disabled={!subscription.contestAccessEnabled || !user.isActive}
                                      />
                                      {getAccessBadge(user.contestAccess)}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>Registro de todos los pagos y transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Compañía</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>ID Transacción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => {
                    const subscription = subscriptions.find((s) => s.id === payment.subscriptionId)
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{subscription?.company.nombre || "N/A"}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["BASICO", "PROFESIONAL", "EMPRESARIAL"].map((plan) => {
                    const count = subscriptions.filter((s) => s.plan === plan).length
                    const percentage = subscriptions.length > 0 ? (count / subscriptions.length) * 100 : 0
                    return (
                      <div key={plan} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{plan}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Suscripciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["ACTIVO", "EXPIRADO", "SUSPENDIDO", "CANCELADO"].map((status) => {
                    const count = subscriptions.filter((s) => s.status === status).length
                    const percentage = subscriptions.length > 0 ? (count / subscriptions.length) * 100 : 0
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{status}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acceso a Concursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Compañías con acceso habilitado</span>
                      <span className="text-sm text-muted-foreground">
                        {subscriptions.filter((s) => s.contestAccessEnabled).length} de {subscriptions.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        subscriptions.length > 0
                          ? (subscriptions.filter((s) => s.contestAccessEnabled).length / subscriptions.length) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Usuarios con acceso</span>
                      <span className="text-sm text-muted-foreground">
                        {totalUsersWithAccess} de{" "}
                        {subscriptions.reduce(
                          (sum, sub) => sum + sub.company.users.filter((u) => u.isActive).length,
                          0,
                        )}
                      </span>
                    </div>
                    <Progress
                      value={
                        subscriptions.reduce(
                          (sum, sub) => sum + sub.company.users.filter((u) => u.isActive).length,
                          0,
                        ) > 0
                          ? (totalUsersWithAccess /
                              subscriptions.reduce(
                                (sum, sub) => sum + sub.company.users.filter((u) => u.isActive).length,
                                0,
                              )) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {subscriptions.reduce((sum, sub) => sum + sub.company.users.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Usuarios totales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {subscriptions.reduce((sum, sub) => sum + sub.maxConcursos, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Capacidad total</div>
                    </div>
                  </div>
                  <Progress
                    value={
                      subscriptions.reduce((sum, sub) => sum + sub.maxConcursos, 0) > 0
                        ? (subscriptions.reduce((sum, sub) => sum + sub.concursosUsados, 0) /
                            subscriptions.reduce((sum, sub) => sum + sub.maxConcursos, 0)) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {subscriptions.reduce((sum, sub) => sum + sub.maxConcursos, 0) > 0
                      ? (
                          (subscriptions.reduce((sum, sub) => sum + sub.concursosUsados, 0) /
                            subscriptions.reduce((sum, sub) => sum + sub.maxConcursos, 0)) *
                          100
                        ).toFixed(1)
                      : 0}
                    % de capacidad utilizada
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Subscription Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Suscripción</DialogTitle>
            <DialogDescription>Información completa de la suscripción seleccionada</DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Compañía</Label>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.company.nombre}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.company.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plan</Label>
                    <div className="mt-1">{getPlanBadge(selectedSubscription.plan)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Precio</Label>
                    <p className="text-sm text-muted-foreground">{formatCurrency(selectedSubscription.precio)} / año</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Método de Pago</Label>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de Inicio</Label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedSubscription.fechaInicio)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de Expiración</Label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedSubscription.fechaExpiracion)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Uso de Concursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Concursos utilizados</span>
                        <span>
                          {selectedSubscription.concursosUsados}/{selectedSubscription.maxConcursos}
                        </span>
                      </div>
                      <Progress
                        value={(selectedSubscription.concursosUsados / selectedSubscription.maxConcursos) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {((selectedSubscription.concursosUsados / selectedSubscription.maxConcursos) * 100).toFixed(1)}%
                        utilizado
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Usuarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total de usuarios</span>
                        <span>{selectedSubscription.company.users.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Usuarios activos</span>
                        <span>{selectedSubscription.company.users.filter((u) => u.isActive).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Con acceso a concursos</span>
                        <span>
                          {selectedSubscription.company.users.filter((u) => u.contestAccess && u.isActive).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cerrar
            </Button>
            <Button>Editar Suscripción</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Control Dialog */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Control de Acceso a Concursos
            </DialogTitle>
            <DialogDescription>
              Gestiona el acceso a concursos para {selectedSubscription?.company.nombre}
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-6">
              {/* Global Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium">Acceso Global a Concursos</h4>
                  <p className="text-sm text-muted-foreground">
                    Habilitar o deshabilitar el acceso a concursos para toda la compañía
                  </p>
                </div>
                <Switch
                  checked={selectedSubscription.contestAccessEnabled}
                  onCheckedChange={(checked) => {
                    handleToggleContestAccess(selectedSubscription.id, checked)
                    setSelectedSubscription({
                      ...selectedSubscription,
                      contestAccessEnabled: checked,
                      company: {
                        ...selectedSubscription.company,
                        users: selectedSubscription.company.users.map((user) => ({
                          ...user,
                          contestAccess: checked ? user.contestAccess : false,
                        })),
                      },
                    })
                  }}
                  disabled={selectedSubscription.status !== "ACTIVO"}
                />
              </div>

              {/* Bulk Actions */}
              {selectedSubscription.contestAccessEnabled && selectedSubscription.company.users.length > 0 && (
                <div className="flex items-center gap-2 p-4 border rounded-lg">
                  <span className="text-sm font-medium">Acciones masivas:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const activeUserIds = selectedSubscription.company.users
                        .filter((u) => u.isActive)
                        .map((u) => u.id)
                      handleBulkToggleUsers(selectedSubscription.id, activeUserIds, true)
                      setSelectedSubscription({
                        ...selectedSubscription,
                        company: {
                          ...selectedSubscription.company,
                          users: selectedSubscription.company.users.map((user) =>
                            user.isActive ? { ...user, contestAccess: true } : user,
                          ),
                        },
                      })
                    }}
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Permitir todos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const activeUserIds = selectedSubscription.company.users
                        .filter((u) => u.isActive)
                        .map((u) => u.id)
                      handleBulkToggleUsers(selectedSubscription.id, activeUserIds, false)
                      setSelectedSubscription({
                        ...selectedSubscription,
                        company: {
                          ...selectedSubscription.company,
                          users: selectedSubscription.company.users.map((user) =>
                            user.isActive ? { ...user, contestAccess: false } : user,
                          ),
                        },
                      })
                    }}
                  >
                    <ShieldX className="h-4 w-4 mr-1" />
                    Bloquear todos
                  </Button>
                </div>
              )}

              {/* Users Table */}
              <div className="space-y-4">
                <h4 className="font-medium">Usuarios ({selectedSubscription.company.users.length})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead>Acceso a Concursos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubscription.company.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.nombre} {user.apellido}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={user.contestAccess}
                              onCheckedChange={(checked) => {
                                handleToggleUserContestAccess(selectedSubscription.id, user.id, checked)
                                setSelectedSubscription({
                                  ...selectedSubscription,
                                  company: {
                                    ...selectedSubscription.company,
                                    users: selectedSubscription.company.users.map((u) =>
                                      u.id === user.id ? { ...u, contestAccess: checked } : u,
                                    ),
                                  },
                                })
                              }}
                              disabled={!selectedSubscription.contestAccessEnabled || !user.isActive}
                            />
                            {getAccessBadge(user.contestAccess)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccessDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => setIsAccessDialogOpen(false)}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
