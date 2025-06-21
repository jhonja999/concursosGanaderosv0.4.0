"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, CheckCheck, AlertTriangle, Activity, Settings, RefreshCw } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "alert" | "activity" | "system"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  priority: "high" | "medium" | "low"
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
  total: number
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const fetchNotifications = useCallback(
    async (isManualRefresh = false) => {
      if (!mountedRef.current) return

      try {
        if (isManualRefresh) {
          setIsRefreshing(true)
        } else if (notifications.length === 0) {
          setIsLoading(true)
        }

        const response = await fetch("/api/admin/notifications", {
          cache: "no-store",
        })

        if (response.ok && mountedRef.current) {
          const data: NotificationsResponse = await response.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
          setLastUpdate(new Date())
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [notifications.length],
  )

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, action: "mark_read" }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchNotifications(true)
  }

  useEffect(() => {
    mountedRef.current = true

    // Carga inicial
    fetchNotifications()

    // Solo actualizar automáticamente cada 2 minutos y solo si el panel está cerrado
    intervalRef.current = setInterval(() => {
      if (mountedRef.current && !isOpen) {
        fetchNotifications()
      }
    }, 120000) // 2 minutos

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchNotifications, isOpen])

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case "alert":
        return priority === "high" ? (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        )
      case "activity":
        return <Activity className="h-4 w-4 text-blue-500" />
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={isRefreshing}>
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Marcar como leídas
                </Button>
              )}
            </div>
          </div>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              Última actualización: {formatTimeAgo(lastUpdate.toISOString())}
            </p>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      "p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                      !notification.isRead && "bg-blue-50/50 border-blue-200",
                    )}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <div className="flex items-center gap-2">
                            {notification.priority === "high" && (
                              <Badge variant="destructive" className="text-xs">
                                Urgente
                              </Badge>
                            )}
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">{notification.message}</p>

                        <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
