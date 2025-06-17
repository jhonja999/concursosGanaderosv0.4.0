"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Search, UserPlus, Edit, Trash2, Mail, Phone, Briefcase, Star, Eye, EyeOff } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Contact {
  id: string
  nombre: string
  apellido?: string
  cargo?: string
  telefono?: string
  email?: string
  whatsapp?: string
  linkedin?: string
  descripcion?: string
  isPrimary: boolean
  isPublic: boolean
  createdAt: string
}

export default function ContactosPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cargo: "",
    telefono: "",
    email: "",
    whatsapp: "",
    linkedin: "",
    descripcion: "",
    isPrimary: false,
    isPublic: true,
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchTerm])

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts")
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast.error("Error al cargar los contactos")
    } finally {
      setIsLoading(false)
    }
  }

  const filterContacts = () => {
    let filtered = contacts

    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.cargo?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredContacts(filtered)
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      cargo: "",
      telefono: "",
      email: "",
      whatsapp: "",
      linkedin: "",
      descripcion: "",
      isPrimary: false,
      isPublic: true,
    })
    setEditingContact(null)
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      nombre: contact.nombre,
      apellido: contact.apellido || "",
      cargo: contact.cargo || "",
      telefono: contact.telefono || "",
      email: contact.email || "",
      whatsapp: contact.whatsapp || "",
      linkedin: contact.linkedin || "",
      descripcion: contact.descripcion || "",
      isPrimary: contact.isPrimary,
      isPublic: contact.isPublic,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingContact ? `/api/contacts/${editingContact.id}` : "/api/contacts"
      const method = editingContact ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Error al guardar el contacto")
      }

      toast.success(editingContact ? "Contacto actualizado exitosamente" : "Contacto creado exitosamente")
      setIsDialogOpen(false)
      resetForm()
      fetchContacts()
    } catch (error) {
      console.error("Error saving contact:", error)
      toast.error("Error al guardar el contacto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
      return
    }

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el contacto")
      }

      toast.success("Contacto eliminado exitosamente")
      fetchContacts()
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast.error("Error al eliminar el contacto")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contactos de la Empresa</h1>
          <p className="text-muted-foreground">
            Gestiona los contactos de tu empresa para que los clientes puedan comunicarse contigo
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-viridian hover:bg-viridian/90" onClick={resetForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Contacto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContact ? "Editar Contacto" : "Agregar Nuevo Contacto"}</DialogTitle>
              <DialogDescription>
                {editingContact ? "Modifica la información del contacto" : "Agrega un nuevo contacto para tu empresa"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData((prev) => ({ ...prev, apellido: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cargo: e.target.value }))}
                  placeholder="Ej: Gerente General, Director de Ventas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="contacto@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/usuario"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Información adicional sobre el contacto..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPrimary"
                      checked={formData.isPrimary}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPrimary: checked }))}
                    />
                    <Label htmlFor="isPrimary" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Contacto Principal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="isPublic" className="flex items-center gap-2">
                      {formData.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      Visible Públicamente
                    </Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-viridian hover:bg-viridian/90">
                  {isSubmitting ? "Guardando..." : editingContact ? "Actualizar" : "Crear Contacto"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Contactos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contactos ({filteredContacts.length})</CardTitle>
          <CardDescription>Lista de contactos de tu empresa</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay contactos</h3>
              <p className="text-muted-foreground mb-4">
                Agrega el primer contacto de tu empresa para que los clientes puedan comunicarse contigo
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-viridian hover:bg-viridian/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Primer Contacto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Información de Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {contact.nombre} {contact.apellido}
                            {contact.isPrimary && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          </div>
                          {contact.descripcion && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{contact.descripcion}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.cargo && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span className="text-sm">{contact.cargo}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.telefono && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{contact.telefono}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {contact.isPrimary && <Badge variant="default">Principal</Badge>}
                        <Badge variant={contact.isPublic ? "secondary" : "outline"}>
                          {contact.isPublic ? "Público" : "Privado"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(contact.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(contact)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
