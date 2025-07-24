"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    
    // Detectar si es mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const toggleTheme = () => {
    setIsAnimating(true)
    
    const newTheme = theme === "light" ? "dark" : "light"
    
    setTimeout(() => {
      setTheme(newTheme)
      setTimeout(() => setIsAnimating(false), 300)
    }, 150)
  }

  const getThemeIcon = (currentTheme: string | undefined, animating: boolean) => {
    const iconClasses = `h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
      animating ? 'rotate-180 scale-0' : 'rotate-0 scale-100'
    }`
    
    if (currentTheme === "dark") {
      return <Moon className={`${iconClasses} text-blue-400`} />
    }
    return <Sun className={`${iconClasses} text-yellow-500`} />
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled className="relative overflow-hidden">
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-50" />
        <span className="sr-only">Cambiar tema</span>
      </Button>
    )
  }

  // Versión mobile - un solo click
  if (isMobile) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
          isAnimating ? 'bg-primary/10' : ''
        }`}
      >
        <div className="relative">
          {getThemeIcon(theme, isAnimating)}
          
          {/* Efecto de pulso durante la animación */}
          {isAnimating && (
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          )}
        </div>
        
        <span className="sr-only">
          Cambiar tema - Actual: {theme === "dark" ? "Oscuro" : "Claro"}
        </span>
        
        {/* Indicador visual del tema actual */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
          theme === "dark" ? "bg-blue-400" : "bg-yellow-500"
        }`} />
      </Button>
    )
  }

  // Versión desktop - dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative overflow-hidden transition-all duration-300 hover:scale-105">
          <div className="relative">
            {getThemeIcon(theme, false)}
          </div>
          <span className="sr-only">Cambiar tema</span>
          
          {/* Indicador visual del tema actual */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
            theme === "dark" ? "bg-blue-400" : "bg-yellow-500"
          }`} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`cursor-pointer transition-all duration-200 ${
            theme === "light" ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
          }`}
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Claro</span>
          {theme === "light" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`cursor-pointer transition-all duration-200 ${
            theme === "dark" ? "bg-blue-50 dark:bg-blue-900/20" : ""
          }`}
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Oscuro</span>
          {theme === "dark" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}