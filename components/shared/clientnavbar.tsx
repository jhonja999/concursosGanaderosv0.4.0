"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import {
  Menu,
  LogOut,
  Settings,
  Bell,
  Trophy,
  Calendar,
  Users,
  Phone,
  Home,
  LogIn,
  UserPlus,
  Shield,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ClientNavbarUser {
  id: string
  nombre: string
  apellido: string
  email: string
  role: string
  avatar?: string
}

interface ClientNavbarProps {
  user?: ClientNavbarUser | null
}

const navigationItems = [
  { href: "/", label: "Inicio", icon: Home, description: "Página principal" },
  { href: "/concursos", label: "Concursos", icon: Trophy, description: "Ver todos los concursos" },
  { href: "/programacion", label: "Programación", icon: Calendar, description: "Horarios y eventos" },
  { href: "/ganadores", label: "Ganadores", icon: Users, description: "Salón de la fama" },
  { href: "/contacto", label: "Contacto", icon: Phone, description: "Información de contacto" },
]

export function ClientNavbar({ user }: ClientNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/cerrar-sesion", {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Sesión cerrada correctamente")
        router.push("/")
        router.refresh()
      } else {
        toast.error("Error al cerrar sesión")
      }
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Error al cerrar sesión")
    }
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const MobileNavigation = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SheetHeader className="p-6 pb-4 border-b bg-emerald-50 dark:bg-emerald-950/30">
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle className="text-left text-xl font-bold text-emerald-800 dark:text-emerald-300">
              Lo Mejor de Mi Tierra
            </SheetTitle>
            <p className="text-left text-sm text-emerald-600 dark:text-emerald-400">
              Concursos Ganaderos - Cajamarca
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SheetHeader>

      {/* Navigation Items */}
      <div className="flex-1 py-4">
        <nav className="flex flex-col px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const itemIsActive = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-b border-gray-100 dark:border-gray-800 last:border-b-0",
                  itemIsActive 
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" 
                    : "text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                    itemIsActive 
                      ? "bg-emerald-200 dark:bg-emerald-800" 
                      : "bg-gray-100 dark:bg-gray-800",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base">{item.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
        {user ? (
          <>
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.nombre} />
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {user.nombre.charAt(0)}
                  {user.apellido.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="space-y-1">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-4 p-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-medium">Panel Admin</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-4 p-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium">Mi Perfil</span>
              </Link>

              <Link
                href="/dashboard/notificaciones"
                className="flex items-center gap-4 p-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 relative">
                  <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  {notifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notifications > 9 ? "9+" : notifications}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-medium">Notificaciones</span>
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="flex items-center gap-4 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <Link
              href="/iniciar-sesion"
              className="flex items-center gap-4 p-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800">
                <LogIn className="h-5 w-5" />
              </div>
              <span className="font-medium">Iniciar Sesión</span>
            </Link>
            <Link
              href="/registro"
              className="flex items-center gap-4 p-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="font-medium">Registrarse</span>
            </Link>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cambiar Tema</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-emerald-50 dark:bg-emerald-950/20">
        <div className="text-center space-y-1">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Campo Ferial de Cajamarca</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Lun-Sáb: 7:00 AM - 5:00 PM</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">(076) 123-456</p>
        </div>
      </div>
    </div>
  )

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="md" href="/" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive(item.href) ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <Link href="/dashboard/notificaciones">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {notifications > 9 ? "9+" : notifications}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.nombre} />
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                          {user.nombre.charAt(0)}
                          {user.apellido.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.nombre} {user.apellido}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {user.role === "ADMIN" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Panel Admin</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/configuracion" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/iniciar-sesion">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 sm:w-96 p-0">
                <MobileNavigation />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}