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
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  Menu,
  LogOut,
  Settings,
  Bell,
  Trophy,
  Calendar,
  Award,
  Phone,
  Home,
  LogIn,
  UserPlus,
  Shield,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

interface NavbarUser {
  id: string
  nombre: string
  apellido: string
  email: string
  role: string
  avatar?: string
}

interface HomeNavbarProps {
  user?: NavbarUser | null
}

const navigationItems = [
  { href: "/concursos", label: "Concursos", icon: Trophy, description: "Ver todos los concursos" },
  { href: "/programacion", label: "Programación", icon: Calendar, description: "Horarios y eventos" },
  { href: "/ganadores", label: "Ganadores", icon: Award, description: "Salón de la fama" },
  { href: "/contacto", label: "Contacto", icon: Phone, description: "Información de contacto" },
]

export function HomeNavbar({ user }: HomeNavbarProps) {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/80 shadow-sm">        
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
           <div className="flex items-center">
            <Logo className="text-green-700" size="md" href="/" />
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const itemIsActive = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm lg:text-base font-semibold transition-all duration-200 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-lg hover:bg-green-50/80 dark:hover:bg-green-900/30",
                    itemIsActive 
                      ? "text-green-600 dark:text-green-400 bg-green-50/80 dark:bg-green-900/50" 
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            
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
                        <AvatarFallback className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
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
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center justify-end w-full">            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-6 pb-4 border-b bg-green-50 dark:bg-green-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <div>
                        <SheetTitle className="text-left text-xl font-bold text-green-800 dark:text-green-200">
                          Lo Mejor de Mi Tierra
                        </SheetTitle>
                        <p className="text-left text-sm text-green-600 dark:text-green-400">
                          Concursos Ganaderos - Cajamarca
                        </p>
                      </div>
                    </div>
                    {/* Theme toggle solo en móvil */}
                    <ThemeToggle />
                  </div>
                </SheetHeader>

                {/* Navigation Items */}
                <div className="flex-1 py-4">
                  <nav className="flex flex-col p-4">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const itemIsActive = isActive(item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/30 border-b border-gray-100 dark:border-gray-700 last:border-b-0",
                            itemIsActive
                              ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                              : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400",
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center w-12 h-12 rounded-lg",
                              itemIsActive ? "bg-green-200 dark:bg-green-800" : "bg-gray-100 dark:bg-gray-700",
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
                <div className="border-t p-4 space-y-3">
                  {user ? (
                    <>
                      {/* User Info */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.nombre} />
                          <AvatarFallback className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
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
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            <span className="text-sm font-medium">Panel Admin</span>
                          </Link>
                        )}

                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Home className="h-4 w-4" />
                          <span className="text-sm font-medium">Mi Perfil</span>
                        </Link>

                        <Link
                          href="/dashboard/notificaciones"
                          className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Bell className="h-4 w-4" />
                          <span className="text-sm font-medium">Notificaciones</span>
                          {notifications > 0 && (
                            <Badge variant="destructive" className="ml-auto text-xs">
                              {notifications > 9 ? "9+" : notifications}
                            </Badge>
                          )}
                        </Link>

                        <button
                          onClick={() => {
                            setIsOpen(false)
                            handleLogout()
                          }}
                          className="flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm font-medium">Cerrar Sesión</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/iniciar-sesion"
                        className="flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn className="h-4 w-4" />
                        <span className="font-medium">Iniciar Sesión</span>
                      </Link>
                      <Link
                        href="/registro"
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="font-medium">Registrarse</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="border-t p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Campo Ferial de Cajamarca</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Lun-Sáb: 7:00 AM - 5:00 PM</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">(076) 123-456</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}