"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Mountain, Users } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { WeatherBanner } from "@/components/shared/weather-banner"
import { useToast } from "@/hooks/use-toast"

const distritosCajamarca = [
  "Cajamarca",
  "Asunción",
  "Chetilla",
  "Cospan",
  "Encañada",
  "Jesús",
  "Llacanora",
  "Los Baños del Inca",
  "Magdalena",
  "Matara",
  "Namora",
  "San Juan",
]

const tiposConsulta = [
  "Información sobre concursos",
  "Registro de participantes",
  "Consultas técnicas",
  "Patrocinio y auspicio",
  "Quejas y sugerencias",
  "Otros",
]

interface FormData {
  nombre: string
  distrito: string
  telefono: string
  email: string
  tipoConsulta: string
  mensaje: string
}

export default function ContactoClientPage() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    distrito: "",
    telefono: "",
    email: "",
    tipoConsulta: "",
    mensaje: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simular envío del formulario
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsSubmitted(true)
      toast({
        title: "Mensaje enviado exitosamente",
        description: "Nos pondremos en contacto contigo pronto.",
      })

      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          nombre: "",
          distrito: "",
          telefono: "",
          email: "",
          tipoConsulta: "",
          mensaje: "",
        })
      }, 3000)
    } catch (error) {
      toast({
        title: "Error al enviar mensaje",
        description: "Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.nombre && formData.distrito && formData.telefono && formData.tipoConsulta && formData.mensaje

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Logo className="text-white" size="lg" href={null} />
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Phone className="h-16 w-16 text-blue-200" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">Contáctanos</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-95 leading-relaxed px-4">
              Estamos aquí para ayudarte con tus consultas sobre concursos ganaderos
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mountain className="h-6 w-6" />
                <span className="text-lg font-semibold">Campo Ferial de Cajamarca - 2,750 msnm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs />

        {/* Banner del clima */}
        <WeatherBanner />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Información de Contacto */}
          <div className="space-y-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <MapPin className="h-6 w-6" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dirección */}
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Dirección</h3>
                    <p className="text-gray-600">Campo Ferial de Cajamarca</p>
                    <p className="text-gray-600">Cajamarca, Perú</p>
                    <p className="text-sm text-blue-600 font-medium">2,750 metros sobre el nivel del mar</p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Teléfono</h3>
                    <p className="text-gray-600">(076) 123-456</p>
                    <p className="text-sm text-gray-500">Línea directa para consultas</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Correo Electrónico</h3>
                    <p className="text-gray-600">quipusoftcax@gmail.com</p>
                    <p className="text-sm text-gray-500">Respuesta en 24-48 horas</p>
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Horario de Atención</h3>
                    <p className="text-gray-600">Lunes a Sábado</p>
                    <p className="text-gray-600 font-semibold">7:00 AM - 5:00 PM</p>
                    <p className="text-sm text-gray-500">Domingos: Solo eventos especiales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Users className="h-6 w-6" />
                  ¿Cómo podemos ayudarte?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">🏆 Participantes</h4>
                    <p className="text-sm text-green-700">
                      Información sobre registro, requisitos, categorías y fechas de concursos.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">🤝 Organizadores</h4>
                    <p className="text-sm text-green-700">
                      Consultas sobre patrocinio, auspicio y organización de eventos.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">📋 Información General</h4>
                    <p className="text-sm text-green-700">
                      Dudas sobre ubicaciones, horarios, resultados y programación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de Contacto */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-6 w-6 text-blue-600" />
                Envíanos tu Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-green-600 mb-2">¡Mensaje Enviado!</h3>
                  <p className="text-gray-600 mb-4">
                    Gracias por contactarnos. Nos pondremos en contacto contigo pronto.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      <strong>Tiempo de respuesta:</strong> 24-48 horas hábiles
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre Completo */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-base font-semibold">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Ingresa tu nombre completo"
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  {/* Distrito y Teléfono */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="distrito" className="text-base font-semibold">
                        Distrito de Procedencia *
                      </Label>
                      <Select value={formData.distrito} onValueChange={(value) => handleInputChange("distrito", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecciona tu distrito" />
                        </SelectTrigger>
                        <SelectContent>
                          {distritosCajamarca.map((distrito) => (
                            <SelectItem key={distrito} value={distrito}>
                              {distrito}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-base font-semibold">
                        Teléfono *
                      </Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                        placeholder="Ej: 976 123 456"
                        className="h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Correo Electrónico (Opcional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="tu@email.com"
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Tipo de Consulta */}
                  <div className="space-y-2">
                    <Label htmlFor="tipoConsulta" className="text-base font-semibold">
                      Tipo de Consulta *
                    </Label>
                    <Select
                      value={formData.tipoConsulta}
                      onValueChange={(value) => handleInputChange("tipoConsulta", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecciona el tipo de consulta" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposConsulta.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-2">
                    <Label htmlFor="mensaje" className="text-base font-semibold">
                      Mensaje *
                    </Label>
                    <Textarea
                      id="mensaje"
                      value={formData.mensaje}
                      onChange={(e) => handleInputChange("mensaje", e.target.value)}
                      placeholder="Describe tu consulta o mensaje..."
                      className="min-h-32 text-base resize-none"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Mínimo 10 caracteres. Sé específico para una mejor atención.
                    </p>
                  </div>

                  {/* Botón de Envío */}
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    Al enviar este formulario, aceptas que nos pongamos en contacto contigo para responder tu consulta.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
