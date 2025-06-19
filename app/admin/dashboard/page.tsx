"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Calendar,
  Eye,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalCompanies: number
  activeSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  expiringSubscriptions: number
  pendingRequests: number
  userGrowth: number
  revenueGrowth: number
}

interface ChartData {
  name: string
  users: number
  revenue: number
  subscriptions: number
}

interface Alert {
  id: string
  type: "warning" | "error" | "info"
  title: string
  description: string
  date: string
  priority: "high" | "medium" | "low"
}

interface RecentActivity {
  id: string
  type: string
  description: string
  user: string
  date: string
  status: "success" | "warning" | "error"
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simular datos para el dashboard
      setStats({
        totalUsers: 1247,
        activeUsers: 1156,
        totalCompanies: 89,
        activeSubscriptions: 76,
        totalRevenue: 125000,
        monthlyRevenue: 15600,
        expiringSubscriptions: 12,
        pendingRequests: 5,
        userGrowth: 12.5,
        revenueGrowth: 8.3,
      })

      setChartData([
        { name: "Ene", users: 120, revenue: 12000, subscriptions: 15 },
        { name: "Feb", users: 145, revenue: 14500, subscriptions: 18 },
        { name: "Mar", users: 167, revenue: 16700, subscriptions: 22 },
        { name: "Abr", users: 189, revenue: 18900, subscriptions: 25 },
        { name: "May", users: 210, revenue: 21000, subscriptions: 28 },
        { name: "Jun", users: 234, revenue: 23400, subscriptions: 32 },
      ])

      setAlerts([
        {
          id: "1",
          type: "warning",
          title: "Suscripciones por vencer",
          description: "12 suscripciones vencen en los próximos 7 días",
          date: new Date().toISOString(),
          priority: "high",
        },
        {
          id: "2",
          type: "info",
          title: "Nuevas solicitudes",
          description: "5 solicitudes de compañías pendientes de revisión",
          date: new Date().toISOString(),
          priority: "medium",
        },
        {
          id: "3",
          type: "error",
          title: "Pagos fallidos",
          description: "3 pagos automáticos fallaron en las últimas 24h",
          date: new Date().toISOString(),
          priority: "high",
        },
      ])

      setRecentActivity([
        {
          id: "1",
          type: "user_created",
          description: "Nuevo usuario registrado: Juan Pérez",
          user: "Sistema",
          date: new Date().toISOString(),
          status: "success",
        },
        {
          id: "2",
          type: "subscription_renewed",
          description: "Suscripción renovada: Ganadera El Progreso",
          user: "Sistema",
          date: new Date().toISOString(),
          status: "success",
        },
        {
          id: "3",
          type: "payment_failed",
          description: "Pago fallido: Asociación Ganadera Norte",
          user: "Sistema",
          date: new Date().toISOString(),
          status: "error",
        },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
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
          <h1 className="text-3xl font-bold">Panel Administrativo</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema y métricas clave
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-3 w-3 mr-1" />
            Sistema Activo
          </Badge>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{stats?.userGrowth}% vs mes anterior
            </div>
            <Progress value={(stats?.activeUsers! / stats?.totalUsers!) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.activeUsers} activos ({((stats?.activeUsers! / stats?.totalUsers!) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compañías</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {stats?.activeSubscriptions} con suscripción activa
            </div>
            <Progress value={(stats?.activeSubscriptions! / stats?.totalCompanies!) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {((stats?.activeSubscriptions! / stats?.totalCompanies!) * 100).toFixed(1)}% tasa de conversión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{stats?.revenueGrowth}% vs mes anterior
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total acumulado: {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.expiringSubscriptions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 text-orange-500" />
              Suscripciones por vencer
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.pendingRequests} solicitudes pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="growth" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="growth">Crecimiento</TabsTrigger>
              <TabsTrigger value="revenue">Ingresos</TabsTrigger>
              <TabsTrigger value="distribution">Distribución</TabsTrigger>
            </TabsList>
            
            <TabsContent value="growth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Crecimiento de Usuarios</CardTitle>
                  <CardDescription>
                    Evolución mensual de usuarios y suscripciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="subscriptions" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos Mensuales</CardTitle>
                  <CardDescription>
                    Evolución de ingresos por suscripciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Plan</CardTitle>
                  <CardDescription>
                    Distribución de suscripciones por tipo de plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Básico", value: 45, color: "#0088FE" },
                          { name: "Profesional", value: 35, color: "#00C49F" },
                          { name: "Empresarial", value: 20, color: "#FFBB28" },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Alerts and Activity */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas del Sistema
              </CardTitle>
              <CardDescription>
                Notificaciones importantes que requieren atención
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                        {alert.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(alert.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/notificaciones">
                  Ver todas las alertas
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimas acciones en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  {getActivityIcon(activity.status)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{formatDate(activity.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/actividad">
                  Ver historial completo
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-20 flex-col gap-2">
              <Link href="/admin/usuarios/nuevo">
                <Users className="h-6 w-6" />
                Crear Usuario
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/companias/nueva">
                <Building2 className="h-6 w-6" />
                Nueva Compañía
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/suscripciones">
                <CreditCard className="h-6 w-6" />
                Gestionar Suscripciones
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/reportes">
                <BarChart3 className="h-6 w-6" />
                Ver Reportes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}