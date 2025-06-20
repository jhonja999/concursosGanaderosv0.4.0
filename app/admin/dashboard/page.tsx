"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
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
  status: "success" | "warning" | "error" | "info"
}

interface DistributionData {
  name: string
  value: number
  color: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [distributionData, setDistributionData] = useState<DistributionData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Usar una sola función para cargar todos los datos
    fetchAllDashboardData()
  }, [])

  const fetchAllDashboardData = async () => {
    try {
      setIsLoading(true)

      // Hacer todas las llamadas en paralelo pero con una sola verificación de token
      const [statsRes, chartsRes, alertsRes, activityRes, distributionRes] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/charts"),
        fetch("/api/admin/dashboard/alerts"),
        fetch("/api/admin/dashboard/activity"),
        fetch("/api/admin/dashboard/distribution"),
      ])

      // Procesar respuestas
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (chartsRes.ok) {
        const chartsData = await chartsRes.json()
        if (Array.isArray(chartsData)) {
          setChartData(chartsData)
        }
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json()
        setAlerts(Array.isArray(alertsData) ? alertsData : [])
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(Array.isArray(activityData) ? activityData : [])
      }

      if (distributionRes.ok) {
        const distributionData = await distributionRes.json()
        setDistributionData(Array.isArray(distributionData) ? distributionData : [])
      }
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
    <div className="w-full max-w-none space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Panel Administrativo</h1>
          <p className="text-muted-foreground">Resumen general del sistema y métricas clave</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-3 w-3 mr-1" />
            Sistema Activo
          </Badge>
          <Button onClick={fetchAllDashboardData} variant="outline" size="sm">
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalUsers || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{stats?.userGrowth || 0}% vs mes anterior
            </div>
            <Progress value={stats?.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.activeUsers || 0} activos (
              {stats?.totalUsers ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compañías</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {stats?.activeSubscriptions || 0} con suscripción activa
            </div>
            <Progress
              value={stats?.totalCompanies ? (stats.activeSubscriptions / stats.totalCompanies) * 100 : 0}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalCompanies ? ((stats.activeSubscriptions / stats.totalCompanies) * 100).toFixed(1) : 0}% tasa
              de conversión
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{stats?.revenueGrowth || 0}% vs mes anterior
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total acumulado: {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.expiringSubscriptions || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 text-orange-500" />
              Suscripciones por vencer
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stats?.pendingRequests || 0} solicitudes pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Alerts */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Charts */}
        <div className="xl:col-span-2">
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
                  <CardDescription>Evolución mensual de usuarios y suscripciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="Usuarios" />
                        <Line
                          type="monotone"
                          dataKey="subscriptions"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          name="Suscripciones"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos Mensuales</CardTitle>
                  <CardDescription>Evolución de ingresos por suscripciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="revenue" fill="#8884d8" name="Ingresos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Plan</CardTitle>
                  <CardDescription>Distribución de suscripciones por tipo de plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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
              <CardDescription>Notificaciones importantes que requieren atención</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                          {alert.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(alert.date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay alertas pendientes</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas acciones en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded transition-colors"
                  >
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accesos directos a las funciones más utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-20 flex-col gap-2 cursor-pointer">
              <Link href="/admin/usuarios">
                <Users className="h-6 w-6" />
                Gestionar Usuarios
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 cursor-pointer bg-white text-black hover:bg-gray-100"
            >
              <Link href="/admin/suscripciones">
                <CreditCard className="h-6 w-6" />
                Suscripciones
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 cursor-pointer bg-white text-black hover:bg-gray-100"
            >
              <Link href="/admin/solicitudes-compania">
                <Building2 className="h-6 w-6" />
                Solicitudes
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 cursor-pointer bg-white text-black hover:bg-gray-100"
            >
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
