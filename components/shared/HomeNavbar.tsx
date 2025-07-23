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
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  Menu,
  LogOut,
  Settings,
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
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Handle scroll for navbar compression
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/80 shadow-sm transition-all duration-300",
        isScrolled && "shadow-md",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-300",
            isScrolled ? "h-14" : "h-16 sm:h-20",
          )}
        >
          <div className="flex items-center">
            <Logo className="text-green-700" size={isScrolled ? "sm" : "md"} href="/" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const itemIsActive = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 font-semibold transition-all duration-200 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50/80 dark:hover:bg-green-900/30",
                    isScrolled ? "text-xs px-2 py-2" : "text-sm lg:text-base px-3 py-2",
                    itemIsActive
                      ? "text-green-600 dark:text-green-400 bg-green-50/80 dark:bg-green-900/50"
                      : "text-gray-700 dark:text-gray-300",
                  )}
                  title={isScrolled ? item.label : undefined}
                >
                  <Icon className={cn("flex-shrink-0", isScrolled ? "h-4 w-4" : "h-4 w-4 lg:h-5 lg:w-5")} />
                  {!isScrolled && <span className="hidden lg:inline">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {/* Theme Toggle */}
            {user ? (
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={cn("relative rounded-full", isScrolled ? "h-7 w-7" : "h-8 w-8")}>
                      <Avatar className={cn(isScrolled ? "h-7 w-7" : "h-8 w-8")}>
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
                    {user.role === "SUPERADMIN" && (
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
                  <Button variant="ghost" size={isScrolled ? "sm" : "default"}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {!isScrolled && "Iniciar Sesión"}
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button size={isScrolled ? "sm" : "default"} className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {!isScrolled && "Registrarse"}
                  </Button>
                </Link>
              </div>
            )}
            <ThemeToggle />
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
                        {user.role === "SUPERADMIN" && (
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
                          href="/admin/dashboard"
                          className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Home className="h-4 w-4" />
                          <span className="text-sm font-medium">Mi Perfil</span>
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