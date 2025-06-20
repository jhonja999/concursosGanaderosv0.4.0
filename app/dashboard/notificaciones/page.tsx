"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bell, Check, Clock, User, Building2, CreditCard, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  status: "UNREAD" | "READ" | "ARCHIVED"
  metadata?: any
  entityType?: string
  entityId?: string
  createdAt: string
  readAt?: string
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })

      if (response.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === notificationId ? { ...n, status: "READ" as const, readAt: new Date().toISOString() } : n,
          ),
        )
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "USER_CREATED":
      case "USER_UPDATED":
      case "USER_DELETED":
        return <User className="h-4 w-4" />
      case "COMPANY_CREATED":
      case "COMPANY_UPDATED":
        return <Building2 className="h-4 w-4" />
      case "SUBSCRIPTION_CREATED":
      case "SUBSCRIPTION_UPDATED":
      case "PAYMENT_RECEIVED":
        return <CreditCard className="h-4 w-4" />
      case "SUBSCRIPTION_EXPIRED":
      case "PAYMENT_FAILED":
      case "SYSTEM_ALERT":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "USER_CREATED":
      case "COMPANY_CREATED":
      case "SUBSCRIPTION_CREATED":
      case "PAYMENT_RECEIVED":
        return "bg-green-100 text-green-800"
      case "USER_UPDATED":
      case "COMPANY_UPDATED":
      case "SUBSCRIPTION_UPDATED":
        return "bg-blue-100 text-blue-800"
      case "USER_DELETED":
      case "SUBSCRIPTION_EXPIRED":
      case "PAYMENT_FAILED":
        return "bg-red-100 text-red-800"
      case "SYSTEM_ALERT":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">Mantente al día con las actividades del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{unreadCount} sin leer</Badge>
          <Button variant="outline" onClick={fetchNotifications}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">Notificaciones totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Leer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leídas</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length - unreadCount}</div>
            <p className="text-xs text-muted-foreground">Ya revisadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Historial de eventos y cambios en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay notificaciones</h3>
              <p className="text-muted-foreground">
                Las notificaciones aparecerán aquí cuando ocurran eventos en el sistema
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      notification.status === "UNREAD" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={notification.status === "UNREAD" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {notification.status === "UNREAD" ? "Nuevo" : "Leído"}
                          </Badge>
                          {notification.status === "UNREAD" && (
                            <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>

                        {notification.metadata && (
                          <div className="text-xs text-gray-500">
                            {notification.entityType && <span className="capitalize">{notification.entityType}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
