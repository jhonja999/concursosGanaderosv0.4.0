"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Users, Building2, CreditCard, FileText, LogOut, Menu, X, Bell } from "lucide-react"
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
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    checkAuth()
    fetchPendingRequests()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== "SUPERADMIN") {
          router.push("/dashboard")
          return
        }
        setUser(data.user)
      } else {
        router.push("/iniciar-sesion")
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/iniciar-sesion")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/admin/company-requests")
      if (response.ok) {
        const requests = await response.json()
        const pending = requests.filter((r: any) => r.status === "PENDIENTE").length
        setPendingRequests(pending)
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/cerrar-sesion", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
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

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const showBadge = item.badge === "pending-requests" && pendingRequests > 0

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {showBadge && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {pendingRequests}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
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
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
