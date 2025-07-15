"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Trophy,
  Bell,
  RefreshCw,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
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

interface SystemAlert {
  id: string
  type: "warning" | "error" | "info" | "success"
  title: string
  description: string
  date: string
  priority: "high" | "medium" | "low"
  isRead: boolean
  entityType?: string
  entityId?: string
}

interface RecentActivity {
  id: string
  type: "audit" | "notification" | "system" | "user_action"
  description: string
  user: string
  date: string
  status: "success" | "warning" | "error" | "info"
  entityType?: string
  details?: string
}

interface DistributionData {
  name: string
  value: number
  color: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
const REFRESH_INTERVAL = 60000 // 1 minuto
const MAX_ALERTS = 10
const MAX_ACTIVITIES = 15

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [distributionData, setDistributionData] = useState<DistributionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const fetchAllDashboardData = useCallback(async (isManualRefresh = false) => {
    if (!mountedRef.current) return

    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const [statsRes, chartsRes, alertsRes, activityRes, distributionRes] = await Promise.all([
        fetch("/api/admin/dashboard/stats", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch("/api/admin/dashboard/charts", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch("/api/admin/dashboard/alerts", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch("/api/admin/dashboard/activity", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch("/api/admin/dashboard/distribution", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
      ])

      if (!mountedRef.current) return

      // Procesar estadísticas
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Procesar gráficos
      if (chartsRes.ok) {
        const chartsData = await chartsRes.json()
        if (Array.isArray(chartsData)) {
          setChartData(chartsData)
        }
      }

      // Procesar alertas
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json()
        if (Array.isArray(alertsData)) {
          setAlerts(alertsData.slice(0, MAX_ALERTS))
        }
      }

      // Procesar actividad reciente
      if (activityRes.ok) {
        const activityData = await activityRes.json()
        if (Array.isArray(activityData)) {
          setRecentActivity(activityData.slice(0, MAX_ACTIVITIES))
        }
      }

      // Procesar distribución
      if (distributionRes.ok) {
        const distributionData = await distributionRes.json()
        if (Array.isArray(distributionData)) {
          setDistributionData(distributionData)
        }
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [])

  // Configurar actualizaciones automáticas
  useEffect(() => {
    mountedRef.current = true

    // Carga inicial
    fetchAllDashboardData()

    // Configurar intervalo de actualización
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        fetchAllDashboardData()
      }
    }, REFRESH_INTERVAL)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchAllDashboardData])

  const handleManualRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    fetchAllDashboardData(true).then(() => {
      // Reiniciar el intervalo después de la actualización manual
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          fetchAllDashboardData()
        }
      }, REFRESH_INTERVAL)
    })
  }

  const getAlertIcon = (type: string, priority: string) => {
    if (priority === "high") {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (status: string, type: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "info":
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "hace un momento"
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `hace ${diffInHours}h`

    const diffInDays = Math.floor(diffInHours / 24)
    return `hace ${diffInDays}d`
  }

  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length

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
          <p className="text-muted-foreground">
            Resumen general del sistema y métricas clave
            {lastUpdate && (
              <span className="ml-2 text-xs">• Última actualización: {formatTimeAgo(lastUpdate.toISOString())}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-3 w-3 mr-1" />
            Sistema Activo
          </Badge> */}
          <Button onClick={handleManualRefresh} variant="outline" size="sm" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Actualizando..." : "Actualizar"}
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
            <div className="text-2xl font-bold text-orange-600">{unreadAlertsCount}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 text-orange-500" />
              Notificaciones sin leer
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
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas del Sistema
                {unreadAlertsCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadAlertsCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Notificaciones importantes que requieren atención</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                      !alert.isRead ? "bg-blue-50/50 border-blue-200" : ""
                    }`}
                  >
                    {getAlertIcon(alert.type, alert.priority)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{alert.title}</p>
                        {!alert.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            alert.priority === "high"
                              ? "destructive"
                              : alert.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {alert.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(alert.date)}</span>
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
              <CardDescription>Últimas acciones y cambios en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    {getActivityIcon(activity.status, activity.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      {activity.details && <p className="text-xs text-muted-foreground">{activity.details}</p>}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(activity.date)}</span>
                        {activity.entityType && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.entityType}
                            </Badge>
                          </>
                        )}
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
              <Link href="/admin/companias/nuevo">
                <Building2 className="h-6 w-6" />
                Nueva Compañía
              </Link>
            </Button>
            <Button asChild className="h-20 flex-col gap-2 cursor-pointer bg-green-600 hover:bg-green-700">
              <Link href="/admin/concursos/nuevo">
                <Trophy className="h-6 w-6" />
                Nuevo Concurso
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 cursor-pointer bg-white text-black hover:bg-gray-100"
            >
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
