"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MessageCircle, Phone, Mail, MapPin, Clock } from "lucide-react"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { WeatherBanner } from "@/components/shared/weather-banner"

export default function ContactoClientPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.email || !formData.mensaje) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    setIsSubmitting(true)

    try {
      // Crear mensaje para WhatsApp
      const whatsappMessage = `
*Nueva Consulta - Lo Mejor de Mi Tierra*

*Nombre:* ${formData.nombre}
*Email:* ${formData.email}
*Teléfono:* ${formData.telefono || "No proporcionado"}
*Asunto:* ${formData.asunto || "Consulta general"}

*Mensaje:*
${formData.mensaje}

---
Enviado desde el formulario de contacto web
      `.trim()

      // Número de WhatsApp (puedes cambiarlo por el número real)
      const whatsappNumber = "51976123456" // Cambiar por el número real
      const encodedMessage = encodeURIComponent(whatsappMessage)
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

      // Abrir WhatsApp
      window.open(whatsappUrl, "_blank")

      // Limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        asunto: "",
        mensaje: "",
      })

      toast.success("¡Consulta preparada! Se abrirá WhatsApp para enviar tu mensaje.")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al procesar la consulta. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
         {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Phone className="h-16 w-16 text-blue-200" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">Contáctanos</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-95 leading-relaxed px-4">
              Estamos aquí para ayudarte con tus consultas sobre concursos ganaderos
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs />

        {/* Banner del clima */}
        <WeatherBanner />


      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulario de Contacto */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MessageCircle className="h-6 w-6 text-green-600" />
                Envíanos tu Consulta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Completa el formulario y te contactaremos vía WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-foreground">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="bg-background border-input text-foreground"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-background border-input text-foreground"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-foreground">
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="bg-background border-input text-foreground"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asunto" className="text-foreground">
                      Asunto
                    </Label>
                    <Input
                      id="asunto"
                      name="asunto"
                      type="text"
                      value={formData.asunto}
                      onChange={handleInputChange}
                      className="bg-background border-input text-foreground"
                      placeholder="Tema de tu consulta"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje" className="text-foreground">
                    Mensaje *
                  </Label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="bg-background border-input text-foreground resize-none"
                    placeholder="Describe tu consulta o mensaje..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Preparando consulta...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Enviar por WhatsApp
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <div className="space-y-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Información de Contacto</CardTitle>
                <CardDescription className="text-muted-foreground">Otras formas de contactarnos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">WhatsApp</h3>
                    <p className="text-muted-foreground">+51 976 123 456</p>
                    <p className="text-sm text-muted-foreground">Respuesta inmediata durante horario de oficina</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Correo Electrónico</h3>
                    <p className="text-muted-foreground">quipusoftcax@gmail.com</p>
                    <p className="text-sm text-muted-foreground">Respuesta en 24-48 horas</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Teléfono</h3>
                    <p className="text-muted-foreground">+51 976 123 456</p>
                    <p className="text-sm text-muted-foreground">Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Ubicación</h3>
                    <p className="text-muted-foreground">Lima, Perú</p>
                    <p className="text-sm text-muted-foreground">Servicio a nivel nacional</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-green-600" />
                  Horarios de Atención
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground">Lunes - Viernes</span>
                    <span className="text-muted-foreground">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Sábados</span>
                    <span className="text-muted-foreground">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Domingos</span>
                    <span className="text-muted-foreground">Cerrado</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>WhatsApp disponible 24/7</strong> - Te responderemos lo antes posible
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
