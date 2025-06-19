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
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"
import { Logo } from "@/components/shared/logo"

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombreCompania: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al registrarse")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/iniciar-sesion")
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-6 pb-8">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">¡Cuenta creada!</h2>
                  <p className="text-gray-600">
                    Tu cuenta ha sido creada exitosamente. Serás redirigido al inicio de sesión.
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-viridian h-1 rounded-full animate-pulse" style={{ width: "100%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <Logo size="lg" href="/" className="justify-center" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Crear cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/iniciar-sesion" className="font-medium text-viridian hover:text-viridian/80">
              Iniciar sesión
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
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      placeholder="Juan"
                      value={formData.nombre}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                      className="h-11 border-gray-300 focus:border-viridian focus:ring-viridian"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido" className="text-sm font-medium text-gray-700">
                      Apellido
                    </Label>
                    <Input
                      id="apellido"
                      placeholder="Pérez"
                      value={formData.apellido}
                      onChange={(e) => setFormData((prev) => ({ ...prev, apellido: e.target.value }))}
                      className="h-11 border-gray-300 focus:border-viridian focus:ring-viridian"
                      required
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="nombreCompania" className="text-sm font-medium text-gray-700">
                    Nombre de la empresa
                  </Label>
                  <Input
                    id="nombreCompania"
                    placeholder="Mi Empresa Ganadera"
                    value={formData.nombreCompania}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombreCompania: e.target.value }))}
                    className="h-11 border-gray-300 focus:border-viridian focus:ring-viridian"
                    required
                  />
                </div>

                {/* Email */}
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

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crea una contraseña segura"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="h-11 border-gray-300 focus:border-viridian focus:ring-viridian"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-viridian hover:bg-viridian/90 text-black font-medium"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear cuenta
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Terms Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al crear una cuenta, aceptas nuestros{" "}
            <Link href="/terminos" className="text-viridian hover:text-viridian/80">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacidad" className="text-viridian hover:text-viridian/80">
              Política de Privacidad
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">Protegido por medidas de seguridad avanzadas</p>
        </div>
      </div>
    </div>
  )
}
