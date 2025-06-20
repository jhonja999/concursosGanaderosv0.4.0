"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role: string
  isSuperAdmin: boolean
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    name: "Suscripciones",
    href: "/admin/suscripciones",
    icon: CreditCard,
  },
  {
    name: "Solicitudes de Compañía",
    href: "/admin/solicitudes-compania",
    icon: FileText,
    badge: "pending-requests",
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
        // Verificar que requests es un array antes de usar filter
        if (Array.isArray(requests)) {
          const pending = requests.filter((r: any) => r.status === "PENDIENTE").length
          setPendingRequests(pending)
        } else {
          console.warn("Company requests response is not an array:", requests)
          setPendingRequests(0)
        }
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
      setPendingRequests(0)
    }
  }, [])

  useEffect(() => {
    // Solo ejecutar una vez al montar el componente
    checkAuth()
    fetchPendingRequests()

    // Recuperar estado del sidebar del localStorage
    const savedCollapsed = localStorage.getItem("sidebar-collapsed")
    if (savedCollapsed) {
      setIsCollapsed(JSON.parse(savedCollapsed))
    }
  }, [checkAuth, fetchPendingRequests])

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

  const sidebarWidth = isCollapsed ? "w-16" : "w-64"
  const mainMargin = isCollapsed ? "lg:ml-16" : "lg:ml-64"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={closeMobileSidebar} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ease-in-out",
          // Mobile
          "transform lg:transform-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop
          "lg:translate-x-0",
          sidebarWidth,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b bg-white">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
              {!isCollapsed && <span className="text-xl font-bold whitespace-nowrap">Admin Panel</span>}
            </div>

            {/* Mobile close button */}
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={closeMobileSidebar}>
              <X className="h-5 w-5" />
            </Button>

            {/* Desktop collapse button */}
            <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={toggleCollapse}>
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* User info */}
          {!isCollapsed && (
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                  {user.nombre.charAt(0)}
                  {user.apellido.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
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
            <div className="p-2 border-b bg-white flex justify-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                {user.nombre.charAt(0)}
                {user.apellido.charAt(0)}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 bg-white overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const showBadge = item.badge === "pending-requests" && pendingRequests > 0

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed ? "justify-center" : "justify-start",
                  )}
                  onClick={closeMobileSidebar}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("flex-shrink-0 h-5 w-5", isCollapsed ? "" : "mr-3")} />

                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.name}</span>
                      {showBadge && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          {pendingRequests}
                        </Badge>
                      )}
                    </>
                  )}

                  {isCollapsed && showBadge && (
                    <div className="absolute left-8 top-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t bg-white">
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
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
