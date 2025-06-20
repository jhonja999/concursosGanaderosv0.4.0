import type React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, CreditCard, Building2, Settings, BarChart3, Bell, LogOut, Shield } from "lucide-react"
import Link from "next/link"

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",
    url: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Suscripciones",
    url: "/admin/suscripciones",
    icon: CreditCard,
  },
  {
    title: "Compañías",
    url: "/admin/companias",
    icon: Building2,
  },
  {
    title: "Solicitudes",
    url: "/admin/solicitudes",
    icon: Shield,
  },
  {
    title: "Reportes",
    url: "/admin/reportes",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    url: "/admin/configuracion",
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="inset">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Concursos Ganaderos</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <div className="h-2 w-2 bg-green-600 rounded-full mr-1"></div>
                  Sistema Activo
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notificaciones
                <Badge variant="destructive" className="ml-auto">
                  3
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline">SUPERADMIN</Badge>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
