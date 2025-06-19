"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Users,
  Building2,
  CreditCard,
  Shield,
  Settings,
  BarChart3,
  Bell,
  LogOut,
  UserCog,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Logo } from "@/components/shared/logo"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role: string
  isSuperAdmin: boolean
  company?: {
    id: string
    nombre: string
    subscription?: {
      plan: string
      status: string
      fechaExpiracion: string
    }
  }
}

const adminMenuItems = [
  {
    title: "Panel Principal",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Gestión de Usuarios",
    url: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Administración de Roles",
    url: "/admin/roles",
    icon: UserCog,
  },
  {
    title: "Gestión de Compañías",
    url: "/admin/companias",
    icon: Building2,
  },
  {
    title: "Control de Suscripciones",
    url: "/admin/suscripciones",
    icon: CreditCard,
  },
  {
    title: "Módulos y Permisos",
    url: "/admin/permisos",
    icon: Shield,
  },
  {
    title: "Reportes y Análisis",
    url: "/admin/reportes",
    icon: BarChart3,
  },
]

const settingsMenuItems = [
  {
    title: "Configuración",
    url: "/admin/configuracion",
    icon: Settings,
  },
  {
    title: "Notificaciones",
    url: "/admin/notificaciones",
    icon: Bell,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState<number>(0)
  const pathname = usePathname()

  useEffect(() => {
    fetchUserData()
    fetchAlerts()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/admin/alerts")
      const data = await response.json()
      setAlerts(data.count || 0)
    } catch (error) {
      console.error("Error fetching alerts:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/cerrar-sesion", { method: "POST" })
      window.location.href = "/iniciar-sesion"
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

  // Verificar que el usuario sea SUPERADMIN
  if (!user?.isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acceso Denegado</CardTitle>
            <CardDescription className="text-center">
              No tienes permisos para acceder al panel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard" className="text-primary hover:underline">
              Volver al Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r-2">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/admin/dashboard">
                  <Logo variant="compact" size="sm" href={null} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Panel Administrativo</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.nombre} {user?.apellido}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.url === "/admin/notificaciones" && alerts > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {alerts}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.url === "/admin/notificaciones" && alerts > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {alerts}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Resumen del Sistema */}
          <SidebarGroup>
            <SidebarGroupLabel>Estado del Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <Card className="border-0 shadow-none bg-sidebar-accent/50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Sistema Activo</CardTitle>
                  <CardDescription className="text-xs">Monitoreo en tiempo real</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Servicios operativos</span>
                  </div>
                  
                  {alerts > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md border border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div className="text-xs text-orange-800">
                        <div className="font-medium">{alerts} alertas pendientes</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white">
                      <span className="text-sm font-bold">SA</span>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.nombre} {user?.apellido}
                      </span>
                      <span className="truncate text-xs">Superadministrador</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white">
                        <span className="text-sm font-bold">SA</span>
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.nombre} {user?.apellido}
                        </span>
                        <span className="truncate text-xs">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard Usuario
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/configuracion">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Panel Administrativo</span>
              <Badge variant="destructive" className="text-xs">
                SUPERADMIN
              </Badge>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}