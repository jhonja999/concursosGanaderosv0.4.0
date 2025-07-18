"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Calendar,
  Settings,
  Database,
  BarChart3,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Folder,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role: string
  isSuperAdmin: boolean
}

interface Notification {
  id: string
  type: "alert" | "activity" | "system"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  priority: "high" | "medium" | "low"
  metadata?: any
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavigationItem[]
  description?: string
  count?: number
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Panel principal con métricas y estadísticas",
  },
  {
    name: "Gestión de Usuarios",
    href: "/admin/usuarios",
    icon: Users,
    description: "Administración de usuarios del sistema",
    children: [
      {
        name: "Lista de Usuarios",
        href: "/admin/usuarios",
        icon: Users,
        description: "Ver todos los usuarios registrados",
      },
      {
        name: "Crear Usuario",
        href: "/admin/usuarios/nuevo",
        icon: Users,
        description: "Agregar nuevo usuario al sistema",
      },
    ],
  },
  {
    name: "Compañías",
    href: "/admin/companias",
    icon: Building2,
    description: "Gestión de empresas y organizaciones",
    children: [
      {
        name: "Lista de Compañías",
        href: "/admin/companias",
        icon: Building2,
        description: "Ver todas las compañías registradas",
      },
      {
        name: "Nueva Compañía",
        href: "/admin/companias/nuevo",
        icon: Building2,
        description: "Registrar nueva compañía",
      },
    ],
  },
  {
    name: "Concursos",
    href: "/admin/concursos",
    icon: Trophy,
    description: "Administración de concursos ganaderos",
    children: [
      {
        name: "Lista de Concursos",
        href: "/admin/concursos",
        icon: Trophy,
        description: "Ver todos los concursos",
      },
      {
        name: "Nuevo Concurso",
        href: "/admin/concursos/nuevo",
        icon: Trophy,
        description: "Crear nuevo concurso",
      },
      {
        name: "Categorías",
        href: "/admin/categorias",
        icon: Folder,
        description: "Gestionar categorías de concursos",
      },
    ],
  },
  {
    name: "Gestión de Contenido",
    href: "/admin/programacion",
    icon: ImageIcon,
    description: "Sistema de gestión de contenido (CMS)",
    children: [
      {
        name: "Programación",
        href: "/admin/programacion",
        icon: Calendar,
        description: "Gestionar imágenes y eventos de programación",
      },
      {
        name: "Medios",
        href: "/admin/medios",
        icon: ImageIcon,
        description: "Biblioteca de archivos multimedia",
      },
    ],
  },
  {
    name: "Suscripciones",
    href: "/admin/suscripciones",
    icon: CreditCard,
    description: "Gestión de planes y pagos",
    children: [
      {
        name: "Lista de Suscripciones",
        href: "/admin/suscripciones",
        icon: CreditCard,
        description: "Ver todas las suscripciones activas",
      },
      {
        name: "Reportes de Pago",
        href: "/admin/reportes-pago",
        icon: BarChart3,
        description: "Análisis de ingresos y pagos",
      },
    ],
  },
  {
    name: "Solicitudes",
    href: "/admin/solicitudes-compania",
    icon: FileText,
    badge: "pending-requests",
    description: "Solicitudes pendientes de aprobación",
  },
  {
    name: "Sistema",
    href: "/admin/sistema",
    icon: Settings,
    description: "Configuración y herramientas del sistema",
    children: [
      {
        name: "Base de Datos",
        href: "/admin/sistema/database",
        icon: Database,
        description: "Herramientas de base de datos",
      },
      {
        name: "Configuración",
        href: "/admin/sistema/config",
        icon: Settings,
        description: "Configuración general del sistema",
      },
      {
        name: "Logs del Sistema",
        href: "/admin/sistema/logs",
        icon: FileText,
        description: "Registros y auditoría del sistema",
      },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.role !== "SUPERADMIN") {
          router.push("/dashboard")
          return
        }
        setUser(data)
      } else {
        router.push("/iniciar-sesion")
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/iniciar-sesion")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/company-requests")
      if (response.ok) {
        const requests = await response.json()
        if (Array.isArray(requests)) {
          const pending = requests.filter((r: any) => r.status === "PENDIENTE").length
          setPendingRequests(pending)
        } else {
          setPendingRequests(0)
        }
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
      setPendingRequests(0)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(Array.isArray(data.notifications) ? data.notifications : [])
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setNotifications([])
    }
  }, [])

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }))
    setNotifications(updatedNotifications)

    fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Failed to mark all notifications as read on the server")
        }
      })
      .catch((error) => {
        console.error("Error marking all notifications as read:", error)
      })
  }

  useEffect(() => {
    checkAuth()
    fetchPendingRequests()
    fetchNotifications()

    const savedCollapsed = localStorage.getItem("sidebar-collapsed")
    if (savedCollapsed) {
      setIsCollapsed(JSON.parse(savedCollapsed))
    }

    // Auto-expand current section
    const currentSection = navigation.find(
      (item) => item.href === pathname || (item.children && item.children.some((child) => child.href === pathname)),
    )
    if (currentSection && currentSection.children) {
      setExpandedItems((prev) => new Set([...prev, currentSection.name]))
    }
  }, [checkAuth, fetchPendingRequests, fetchNotifications, pathname])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/cerrar-sesion", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newCollapsed))
  }

  const closeMobileSidebar = () => {
    setIsSidebarOpen(false)
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemName)) {
        newSet.delete(itemName)
      } else {
        newSet.add(itemName)
      }
      return newSet
    })
  }

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.href === pathname) return true
    if (item.children) {
      return item.children.some((child) => child.href === pathname)
    }
    return false
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isItemActive(item)
    const isExpanded = expandedItems.has(item.name)
    const hasChildren = item.children && item.children.length > 0
    const showBadge = item.badge === "pending-requests" && pendingRequests > 0

    return (
      <div key={item.name} className={cn("relative", level > 0 && "ml-4")}>
        {hasChildren && !isCollapsed ? (
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.name)}>
            <CollapsibleTrigger asChild>
              <div
                className={cn(
                  "group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer",
                  isActive ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="flex items-center">
                  <item.icon className="flex-shrink-0 h-5 w-5 mr-3" />
                  <div className="flex flex-col items-start">
                    <span className="truncate">{item.name}</span>
                    {item.description && !isCollapsed && (
                      <span className="text-xs opacity-75 truncate">{item.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {showBadge && (
                    <Badge variant="destructive" className="text-xs">
                      {pendingRequests}
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {item.children?.map((child) => renderNavigationItem(child, level + 1))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Link
            href={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              isActive ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              isCollapsed ? "justify-center" : "justify-start",
            )}
            onClick={closeMobileSidebar}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon className={cn("flex-shrink-0 h-5 w-5", isCollapsed ? "" : "mr-3")} />

            {!isCollapsed && (
              <div className="flex flex-col items-start flex-1">
                <span className="truncate">{item.name}</span>
                {item.description && <span className="text-xs opacity-75 truncate">{item.description}</span>}
              </div>
            )}

            {!isCollapsed && showBadge && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingRequests}
              </Badge>
            )}

            {isCollapsed && showBadge && <div className="absolute left-8 top-1 w-3 h-3 bg-red-500 rounded-full"></div>}
          </Link>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const sidebarWidth = isCollapsed ? "w-16" : "w-80"
  const mainMargin = isCollapsed ? "lg:ml-16" : "lg:ml-80"

  const unreadNotificationsCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={closeMobileSidebar} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-background shadow-lg transition-all duration-300 ease-in-out",
          "transform lg:transform-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          sidebarWidth,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header - Now clickable */}
          <div className="flex items-center justify-between h-16 px-4 border-b bg-background">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2 overflow-hidden hover:opacity-80 transition-opacity"
            >
              <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
              {!isCollapsed && <span className="text-xl font-bold whitespace-nowrap">Admin Panel</span>}
            </Link>

            <Button variant="ghost" size="sm" className="lg:hidden" onClick={closeMobileSidebar}>
              <X className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={toggleCollapse}>
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* User info */}
          {!isCollapsed && (
            <div className="p-4 border-b bg-background">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                  {user.nombre.charAt(0)}
                  {user.apellido.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <Badge variant="destructive" className="text-xs mt-1">
                    SUPERADMIN
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed user avatar */}
          {isCollapsed && (
            <div className="p-2 border-b bg-background flex justify-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                {user.nombre.charAt(0)}
                {user.apellido.charAt(0)}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 bg-background overflow-y-auto">
            {navigation.map((item) => renderNavigationItem(item))}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t bg-background">
            <Button
              variant="ghost"
              className={cn(
                "w-full transition-all duration-200",
                isCollapsed ? "justify-center px-2" : "justify-start",
              )}
              onClick={handleLogout}
              title={isCollapsed ? "Cerrar Sesión" : undefined}
            >
              <LogOut className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "" : "mr-3")} />
              {!isCollapsed && "Cerrar Sesión"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300", mainMargin)}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Notificaciones</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {notifications.length > 0 ? (
                      <>
                        <div className="divide-y divide-gray-200">
                          {notifications.slice(0, 10).map((notification) => (
                            <div key={notification.id} className="py-3 first:pt-0 last:pb-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                  <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <Button onClick={markAllAsRead} className="w-full bg-transparent" variant="outline">
                            Marcar todas como leídas
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-500">No hay notificaciones</p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
