"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Building2,
  Filter,
  Download,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Subscription {
  id: string
  company: {
    id: string
    nombre: string
    email: string
  }
  plan: string
  status: string
  fechaInicio: string
  fechaExpiracion: string
  precio: number
  maxUsers: number
  usersUsed: number
  maxStorage: number
  storageUsed: number
  autoRenewal: boolean
  paymentMethod: string
  lastPayment?: string
  nextPayment?: string
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
      // Datos simulados de suscripciones
      const mockSubscriptions: Subscription[] = [
        {
          id: "1",
          company: {
            id: "1",
            nombre: "Ganadera El Progreso",
            email: "admin@ganaderaprogreso.com",
          },
          plan: "PROFESIONAL",
          status: "ACTIVO",
          fechaInicio: "2024-01-01T00:00:00Z",
          fechaExpiracion: "2024-12-31T23:59:59Z",
          precio: 99000,
          maxUsers: 10,
          usersUsed: 7,
          maxStorage: 5000,
          storageUsed: 2300,
          autoRenewal: true,
          paymentMethod: "Tarjeta de Crédito",
          lastPayment: "2024-01-01T00:00:00Z",
          nextPayment: "2025-01-01T00:00:00Z",
        },
        {
          id: "2",
          company: {
            id: "2",
            nombre: "Asociación Ganadera Norte",
            email: "contacto@ganadernorte.com",
          },
          plan: "BASICO",
          status: "EXPIRADO",
          fechaInicio: "2023-06-01T00:00:00Z",
          fechaExpiracion: "2024-01-15T23:59:59Z",
          precio: 49000,
          maxUsers: 5,
          usersUsed: 3,
          maxStorage: 1000,
          storageUsed: 450,
          autoRenewal: false,
          paymentMethod: "Transferencia",
          lastPayment: "2023-06-01T00:00:00Z",
        },
        {
          id: "3",
          company: {
            id: "3",
            nombre: "Cooperativa Lechera Sur",
            email: "info@lecherasur.com",
          },
          plan: "EMPRESARIAL",
          status: "ACTIVO",
          fechaInicio: "2024-01-10T00:00:00Z",
          fechaExpiracion: "2024-02-28T23:59:59Z",
          precio: 199000,
          maxUsers: 25,
          usersUsed: 18,
          maxStorage: 10000,
          storageUsed: 6800,
          autoRenewal: true,
          paymentMethod: "Tarjeta de Crédito",
          lastPayment: "2024-01-10T00:00:00Z",
          nextPayment: "2024-02-28T00:00:00Z",
        },
      ]
      setSubscriptions(mockSubscriptions)
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      // Historial de pagos simulado
      const mockPayments: PaymentHistory[] = [
        {
          id: "1",
          subscriptionId: "1",
          amount: 99000,
          status: "COMPLETADO",
          date: "2024-01-01T00:00:00Z",
          method: "Tarjeta de Crédito",
          transactionId: "TXN-001",
        },
        {
          id: "2",
          subscriptionId: "3",
          amount: 199000,
          status: "COMPLETADO",
          date: "2024-01-10T00:00:00Z",
          method: "Tarjeta de Crédito",
          transactionId: "TXN-002",
        },
        {
          id: "3",
          subscriptionId: "2",
          amount: 49000,
          status: "FALLIDO",
          date: "2024-01-15T00:00:00Z",
          method: "Transferencia",
          transactionId: "TXN-003",
        },
      ]
      setPaymentHistory(mockPayments)
    } catch (error) {
      console.error("Error fetching payment history:", error)
    }
  }

  const filterSubscriptions = () => {
    let filtered = subscriptions

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.company.email.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
      <Badge className={colors[plan as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {plan}
      </Badge>
    )
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

  const isExpiringSoon = (fechaExpiracion: string) => {
    const expDate = new Date(fechaExpiracion)
    const now = new Date()
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 30 && daysUntilExpiration > 0
  }

  const handleRenewSubscription = async (subscriptionId: string) => {
    console.log("Renewing subscription:", subscriptionId)
  }

  const handleUpgradeSubscription = async (subscriptionId: string) => {
    console.log("Upgrading subscription:", subscriptionId)
  }

  const handleSuspendSubscription = async (subscriptionId: string) => {
    if (confirm("¿Estás seguro de que quieres suspender esta suscripción?")) {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: "SUSPENDIDO" } : sub
      ))
    }
  }

  const exportData = () => {
    console.log("Exporting subscription data...")
  }

  // Calcular estadísticas
  const totalRevenue = subscriptions
    .filter(sub => sub.status === "ACTIVO")
    .reduce((sum, sub) => sum + sub.precio, 0)

  const expiringCount = subscriptions.filter(sub => 
    sub.status === "ACTIVO" && isExpiringSoon(sub.fechaExpiracion)
  ).length

  const activeCount = subscriptions.filter(sub => sub.status === "ACTIVO").length
  const expiredCount = subscriptions.filter(sub => sub.status === "EXPIRADO").length

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
          <p className="text-muted-foreground">
            Gestiona planes, pagos y renovaciones de suscripciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <p className="text-xs text-muted-foreground">
              {subscriptions.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringCount}</div>
            <p className="text-xs text-muted-foreground">
              En los próximos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
            <p className="text-xs text-muted-foreground">
              Requieren renovación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
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
              <CardDescription>
                Lista de todas las suscripciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Compañía</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Uso</TableHead>
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
                          <div className="text-sm text-muted-foreground">
                            {subscription.company.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(subscription.plan)}
                      </TableCell>
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
                              <span>Usuarios</span>
                              <span>{subscription.usersUsed}/{subscription.maxUsers}</span>
                            </div>
                            <Progress 
                              value={(subscription.usersUsed / subscription.maxUsers) * 100} 
                              className="h-1"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs">
                              <span>Almacenamiento</span>
                              <span>{subscription.storageUsed}/{subscription.maxStorage} MB</span>
                            </div>
                            <Progress 
                              value={(subscription.storageUsed / subscription.maxStorage) * 100} 
                              className="h-1"
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(subscription.fechaExpiracion)}
                        </div>
                        {subscription.autoRenewal && (
                          <Badge variant="outline" className="text-xs mt-1">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Auto-renovación
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(subscription.precio)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {subscription.paymentMethod}
                        </div>
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
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {subscription.status === "EXPIRADO" && (
                              <DropdownMenuItem
                                onClick={() => handleRenewSubscription(subscription.id)}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Renovar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleUpgradeSubscription(subscription.id)}
                            >
                              <ArrowUpCircle className="mr-2 h-4 w-4" />
                              Actualizar Plan
                            </DropdownMenuItem>
                            {subscription.status === "ACTIVO" && (
                              <DropdownMenuItem
                                onClick={() => handleSuspendSubscription(subscription.id)}
                                className="text-red-600"
                              >
                                <ArrowDownCircle className="mr-2 h-4 w-4" />
                                Suspender
                              </DropdownMenuItem>
                            )}
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

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>
                Registro de todos los pagos y transacciones
              </CardDescription>
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
                    const subscription = subscriptions.find(s => s.id === payment.subscriptionId)
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {formatDate(payment.date)}
                        </TableCell>
                        <TableCell>
                          {subscription?.company.nombre || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {payment.method}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId}
                        </TableCell>
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
                    const count = subscriptions.filter(s => s.plan === plan).length
                    const percentage = (count / subscriptions.length) * 100
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
                    const count = subscriptions.filter(s => s.status === status).length
                    const percentage = (count / subscriptions.length) * 100
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Subscription Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Suscripción</DialogTitle>
            <DialogDescription>
              Información completa de la suscripción seleccionada
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Compañía</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubscription.company.nombre}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubscription.company.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plan</Label>
                    <div className="mt-1">
                      {getPlanBadge(selectedSubscription.plan)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedSubscription.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Precio</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(selectedSubscription.precio)} / año
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Método de Pago</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubscription.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de Inicio</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedSubscription.fechaInicio)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de Expiración</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedSubscription.fechaExpiracion)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Uso de Usuarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usuarios utilizados</span>
                        <span>{selectedSubscription.usersUsed}/{selectedSubscription.maxUsers}</span>
                      </div>
                      <Progress 
                        value={(selectedSubscription.usersUsed / selectedSubscription.maxUsers) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {((selectedSubscription.usersUsed / selectedSubscription.maxUsers) * 100).toFixed(1)}% utilizado
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Uso de Almacenamiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Almacenamiento utilizado</span>
                        <span>{selectedSubscription.storageUsed}/{selectedSubscription.maxStorage} MB</span>
                      </div>
                      <Progress 
                        value={(selectedSubscription.storageUsed / selectedSubscription.maxStorage) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {((selectedSubscription.storageUsed / selectedSubscription.maxStorage) * 100).toFixed(1)}% utilizado
                      </p>
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
            <Button>
              Editar Suscripción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}