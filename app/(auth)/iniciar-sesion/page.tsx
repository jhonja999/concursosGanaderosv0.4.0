"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Logo } from "@/components/shared/logo"

export default function IniciarSesionPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/iniciar-sesion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // Ensure cookies are included
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión")
      }

      // Debug: Log the response data
      console.log("Login successful, user data:", data.user)
      console.log("User role:", data.user.role)
      console.log("Is SuperAdmin:", data.user.isSuperAdmin)

      // Wait a moment for the cookie to be set
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Force a full page refresh to ensure proper redirection
      if (data.user.role === "SUPERADMIN" || data.user.isSuperAdmin) {
        console.log("Redirecting to admin dashboard...")
        window.location.href = "/admin/dashboard"
      } else {
        console.log("Redirecting to user dashboard...")
        window.location.href = "/dashboard"
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <Logo size="lg" href="/" className="justify-center" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Iniciar sesión</h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link href="/registro" className="font-medium text-viridian hover:text-viridian/80">
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Dirección de email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-11 border-gray-300 focus:border-viridian focus:ring-viridian"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className="h-11 border-gray-300 focus:border-viridian focus:ring-viridian pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-viridian hover:bg-viridian/90 text-black font-medium"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuar
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Footer Links */}
        <div className="text-center">
          <Link href="/olvide-contrasena" className="text-sm font-medium text-viridian hover:text-viridian/80">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">Protegido por medidas de seguridad avanzadas</p>
        </div>
      </div>
    </div>
  )
}
