"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MessageCircle, Phone, Mail, MapPin, Clock } from "lucide-react"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { WeatherBanner } from "@/components/shared/weather-banner"

// Información centralizada de contacto
const contactInfo = {
  whatsappNumber: "+51 965 768 311",
  whatsappNote: "Respuesta inmediata durante horario de oficina",
  email: "quipusoftcax@gmail.com",
  emailNote: "Respuesta en 24-48 horas",
  phone: "+51 965 768 311",
  phoneNote: "Lunes a Viernes, 9:00 AM - 6:00 PM",
  schedule: {
    weekdays: "9:00 AM - 5:00 PM",
    saturday: "9:00 AM - 1:00 PM",
    sunday: "Cerrado",
    availabilityNote: "WhatsApp disponible 24/7",
  },
  location: {
    city: "Cajamarca, Perú",
    coverage: "Servicio a nivel nacional por Cajamarca",
  },
}

export default function ContactoClientPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      const whatsappMessage = `
*Nueva Consulta - Lo Mejor de Mi Tierra*

👤 *Nombre:* ${formData.nombre}
📧 *Email:* ${formData.email}
📞 *Teléfono:* ${formData.telefono || "No proporcionado"}
📌 *Asunto:* ${formData.asunto || "Consulta general"}

📝 *Mensaje:*
${formData.mensaje}

---
Enviado desde el formulario de contacto web
      `.trim()

      const encodedMessage = encodeURIComponent(whatsappMessage)
      const whatsappUrl = `https://wa.me/${contactInfo.whatsappNumber}?text=${encodedMessage}`

      window.open(whatsappUrl, "_blank")

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
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Phone className="h-16 w-16 text-blue-200" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">
              Contáctanos
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 opacity-95">
              Estamos aquí para ayudarte con tus consultas
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs />
        <WeatherBanner />

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
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asunto">Asunto</Label>
                    <Input
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleInputChange}
                      placeholder="Motivo de la consulta"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje *</Label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Escribe tu mensaje aquí..."
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
                  <div className="bg-green-100 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                    <p>{contactInfo.whatsappNumber}</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.whatsappNote}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Correo Electrónico</h3>
                    <p>{contactInfo.email}</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.emailNote}</p>
                  </div>
                </div>

                {/* <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Teléfono</h3>
                    <p>{contactInfo.phone}</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.phoneNote}</p>
                  </div>
                </div> */}

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ubicación</h3>
                    <p>{contactInfo.location.city}</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.location.coverage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Horarios de Atención
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Lunes - Viernes</span>
                    <span className="text-muted-foreground">{contactInfo.schedule.weekdays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados</span>
                    <span className="text-muted-foreground">{contactInfo.schedule.saturday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos</span>
                    <span className="text-muted-foreground">{contactInfo.schedule.sunday}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>{contactInfo.schedule.availabilityNote}</strong> - Te responderemos lo antes posible
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
