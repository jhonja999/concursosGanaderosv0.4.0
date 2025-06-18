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
import { Home, Users, Settings, LogOut, CreditCard, AlertTriangle, Bell } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Logo } from "@/components/shared/logo"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  role: string
  isSuperAdmin: boolean
  isActive: boolean
  company?: {
    id: string
    nombre: string
    subscription?: {
      plan: string
      status: string
      maxConcursos: number
      concursosUsados: number
      fechaExpiracion: string
      precio: number
    }
  }
}

// Simplified menu items for core functionality only
const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Usuarios",
    url: "/dashboard/usuarios",
    icon: Users,
  },
  {
    title: "Configuración",
    url: "/dashboard/configuracion",
    icon: Settings,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    fetchUserData()
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/cerrar-sesion", { method: "POST" })
      window.location.href = "/iniciar-sesion"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVO: { variant: "default" as const, text: "Activo" },
      EXPIRADO: { variant: "destructive" as const, text: "Expirado" },
      SUSPENDIDO: { variant: "secondary" as const, text: "Suspendido" },
      CANCELADO: { variant: "outline" as const, text: "Cancelado" },
    }

    const config = variants[status as keyof typeof variants] || variants.ACTIVO
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      BASICO: "bg-blue-100 text-blue-800",
      PROFESIONAL: "bg-purple-100 text-purple-800",
      EMPRESARIAL: "bg-amber-100 text-amber-800",
    }

    return <Badge className={colors[plan as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{plan}</Badge>
  }

  const isExpiringSoon = (fechaExpiracion: string) => {
    const expDate = new Date(fechaExpiracion)
    const now = new Date()
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 30 && daysUntilExpiration > 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <Logo variant="compact" size="sm" href={null} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.company?.nombre || "Sistema"}</span>
                    <span className="truncate text-xs">
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
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Subscription Info - Only show if user has company */}
          {user?.company?.subscription && (
            <SidebarGroup>
              <SidebarGroupLabel>Suscripción</SidebarGroupLabel>
              <SidebarGroupContent>
                <Card className="border-0 shadow-none bg-sidebar-accent/50">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Plan {user.company.subscription.plan}</CardTitle>
                      {getPlanBadge(user.company.subscription.plan)}
                    </div>
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs">Estado de la cuenta</CardDescription>
                      {getStatusBadge(user.company.subscription.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {/* Usage Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Concursos utilizados</span>
                        <span>
                          {user.company.subscription.concursosUsados}/{user.company.subscription.maxConcursos}
                        </span>
                      </div>
                      <Progress
                        value={
                          (user.company.subscription.concursosUsados / user.company.subscription.maxConcursos) * 100
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Expiration Warning */}
                    {isExpiringSoon(user.company.subscription.fechaExpiracion) && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md border border-orange-200">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <div className="text-xs text-orange-800">
                          <div className="font-medium">Renovación próxima</div>
                          <div>Expira: {formatDate(user.company.subscription.fechaExpiracion)}</div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      <div>Precio: {formatCurrency(Number(user.company.subscription.precio))}/año</div>
                    </div>
                  </CardContent>
                </Card>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
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
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-viridian text-white">
                      <span className="text-sm font-bold">
                        {user?.nombre?.charAt(0)}
                        {user?.apellido?.charAt(0)}
                      </span>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.nombre} {user?.apellido}
                      </span>
                      <span className="truncate text-xs">{user?.email}</span>
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
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-viridian text-white">
                        <span className="text-sm font-bold">
                          {user?.nombre?.charAt(0)}
                          {user?.apellido?.charAt(0)}
                        </span>
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
                    <Link href="/dashboard/perfil">
                      <Settings className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  {user?.company && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/suscripcion">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Suscripción
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/notificaciones">
                      <Bell className="mr-2 h-4 w-4" />
                      Notificaciones
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
              <span className="text-sm font-medium">{user?.company?.nombre || "Sistema"}</span>
              {user?.company?.subscription && (
                <>
                  <div className="h-1 w-1 rounded-full bg-sidebar-border" />
                  {getPlanBadge(user.company.subscription.plan)}
                </>
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
