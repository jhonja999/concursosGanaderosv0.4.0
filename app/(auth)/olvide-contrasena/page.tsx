"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function OlvideContrasenaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error)
          return
        }
        throw new Error(data.error || "Error al procesar la solicitud")
      }

      setMessage(data.message)
      setRemaining(data.remaining)
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">¡Email Enviado!</h2>
              <p className="text-muted-foreground">{message}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-blue-800 mb-2">📧 Revisa tu email</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Busca un email de "Lo Mejor de Mi Tierra"</li>
                  <li>• Revisa tu carpeta de spam si no lo ves</li>
                  <li>• El enlace expira en 1 hora</li>
                  <li>• Solo puedes usar el enlace una vez</li>
                </ul>
              </div>

              {remaining !== null && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Intentos restantes: <strong>{remaining}</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button asChild variant="outline">
                  <Link href="/iniciar-sesion">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al inicio de sesión
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                    setMessage("")
                    setError("")
                  }}
                  variant="ghost"
                >
                  Enviar a otro email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/iniciar-sesion">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-center">¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription className="text-center">
            No te preocupes, te enviaremos un enlace para restablecerla
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">ℹ️ ¿Qué pasará después?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Te enviaremos un email con un enlace seguro</li>
                <li>• El enlace será válido por 1 hora</li>
                <li>• Podrás crear una nueva contraseña</li>
                <li>• Tu cuenta permanecerá segura</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar enlace de recuperación
            </Button>

            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <Link href="/iniciar-sesion" className="text-primary hover:underline">
                  Iniciar sesión
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="text-primary hover:underline">
                  Regístrate aquí
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
