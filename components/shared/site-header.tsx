"use client"
import { Logo } from "@/components/shared/logo"
import { MainNav } from "@/components/shared/main-nav"
import { MobileNav } from "@/components/shared/mobile-nav"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo className="text-green-700" size="md" href="/" />
          </div>

          {/* Navegación Desktop */}
          <MainNav />

          {/* Controles de la derecha */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
