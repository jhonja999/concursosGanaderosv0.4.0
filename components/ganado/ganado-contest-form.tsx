"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, X, AlertTriangle, Crown, Trophy, Star, Clock, Heart, Zap, Building2, Plus } from "lucide-react"
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload"

// Tipos de animales y sus razas
const TIPOS_ANIMALES = {
  bovino: {
    label: "Bovino",
    razas: [
      "Holstein",
      "Jersey",
      "Brown Swiss",
      "Fleckvieh",
      "Angus",
      "Hereford",
      "Charolais",
      "Limousin",
      "Simmental",
      "Brahman",
      "Gyr",
      "Nelore",
    ],
  },
  ovino: {
    label: "Ovino",
    razas: [
      "Dorper",
      "Katahdin",
      "Santa Inés",
      "Morada Nova",
      "Pelibuey",
      "Suffolk",
      "Hampshire",
      "Texel",
      "Romney",
      "Corriedale",
    ],
  },
  equino: {
    label: "Equino",
    razas: [
      "Criollo Colombiano",
      "Paso Fino",
      "Cuarto de Milla",
      "Pura Sangre",
      "Árabe",
      "Andaluz",
      "Frisón",
      "Appaloosa",
      "Paint Horse",
    ],
  },
  cuy: {
    label: "Cuy",
    razas: ["Perú", "Andina", "Inti", "Cieneguilla", "Criollo Mejorado"],
  },
  caprino: {
    label: "Caprino",
    razas: ["Boer", "Nubia", "Saanen", "Toggenburg", "LaMancha", "Alpina", "Criolla", "Santandereana"],
  },
  porcino: {
    label: "Porcino",
    razas: ["Yorkshire", "Landrace", "Duroc", "Hampshire", "Pietrain", "Large White", "Criollo Cundiboyacense"],
  },
  mascotas: {
    label: "Mascotas",
    razas: ["Perro", "Gato", "Pájaro", "Roedor", "Reptil"],
  },
  otro: {
    label: "Otro (especificar)",
    razas: [],
  },
}

const SEXOS = [
  { value: "MACHO", label: "Macho" },
  { value: "HEMBRA", label: "Hembra" },
]

const ESTADOS = [
  { value: "borrador", label: "Borrador", color: "bg-gray-500" },
  { value: "revision", label: "En Revisión", color: "bg-yellow-500" },
  { value: "aprobado", label: "Aprobado", color: "bg-green-500" },
  { value: "publicado", label: "Publicado", color: "bg-blue-500" },
  { value: "rechazado", label: "Rechazado", color: "bg-red-500" },
]

interface GanadoFormData {
  // Información básica del animal
  nombre: string
  tipoAnimal: keyof typeof TIPOS_ANIMALES | string
  otroTipoAnimal?: string
  raza: string
  otraRaza?: string
  sexo: "MACHO" | "HEMBRA"
  fechaNacimiento?: string
  peso?: number
  descripcion?: string
  marcasDistintivas?: string

  // Genealogía
  padre?: string
  madre?: string
  lineaGenetica?: string

  // Propietario
  propietarioNombre: string
  propietarioDocumento?: string
  propietarioTelefono?: string
  propietarioEmail?: string
  propietarioDireccion?: string

  // Expositor (opcional)
  expositorNombre?: string
  expositorDocumento?: string
  expositorTelefono?: string
  expositorEmail?: string
  expositorEmpresa?: string
  expositorExperiencia?: string

  // Establo (opcional)
  establoId?: string
  nuevoEstabloNombre?: string
  nuevoEstabloUbicacion?: string
  nuevoEstabloDescripcion?: string

  // Categoría y concurso
  contestCategoryId: string
  numeroFicha: string

  // Estado y comercial
  estado: string
  enRemate: boolean
  precioBaseRemate?: number
  isDestacado: boolean

  // Puntaje - campos mejorados
  puntaje?: number
  posicion?: number
  calificacion?: string

  // Archivos
  imagenes: string[]
  documentos: string[]
}

interface GanadoFormProps {
  contestId: string
  initialData?: any
  onSubmit: (data: GanadoFormData) => Promise<void>
  onSubmitSuccess: () => void // Added onSubmitSuccess prop
  isLoading?: boolean
}

export function GanadoContestForm({
  contestId,
  initialData,
  onSubmit,
  onSubmitSuccess,
  isLoading = false,
}: GanadoFormProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [establos, setEstablos] = useState<any[]>([])
  const [contest, setContest] = useState<any>(null)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingEstablos, setLoadingEstablos] = useState(true)
  const [selectedTipoAnimal, setSelectedTipoAnimal] = useState<keyof typeof TIPOS_ANIMALES | string | "">("bovino")
  const [showOtraRazaInput, setShowOtraRazaInput] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [imagenes, setImagenes] = useState<string[]>(initialData?.imagenes || [])
  const [documentos, setDocumentos] = useState<string[]>(initialData?.documentos || [])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewEstablo, setShowNewEstablo] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
    getValues,
  } = useForm<GanadoFormData>({
    defaultValues: {
      estado: "borrador",
      enRemate: false,
      isDestacado: false,
      imagenes: [],
      documentos: [],
      puntaje: undefined,
      posicion: undefined,
      calificacion: undefined,
      ...initialData,
    },
    mode: "onChange",
  })

  const watchedValues = watch()

  // Cargar datos del concurso
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/api/admin/concursos/${contestId}`)
        if (response.ok) {
          const data = await response.json()
          setContest(data.contest)
        }
      } catch (error) {
        console.error("Error loading contest:", error)
      }
    }

    fetchContest()
  }, [contestId])

  // Cargar categorías del concurso
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/admin/concursos/${contestId}/categorias`)
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [contestId])

  // Cargar establos disponibles
  useEffect(() => {
    const fetchEstablos = async () => {
      try {
        const response = await fetch(`/api/admin/establos?contestId=${contestId}`)
        if (response.ok) {
          const data = await response.json()
          setEstablos(data.establos || [])
        }
      } catch (error) {
        console.error("Error loading establos:", error)
      } finally {
        setLoadingEstablos(false)
      }
    }

    fetchEstablos()
  }, [contestId])

  useEffect(() => {
    if (initialData?.tipoAnimal) {
      const isKnownType = Object.keys(TIPOS_ANIMALES).includes(initialData.tipoAnimal)
      if (isKnownType) {
        setSelectedTipoAnimal(initialData.tipoAnimal)
      } else {
        setSelectedTipoAnimal("otro")
        setValue("otroTipoAnimal", initialData.tipoAnimal, { shouldDirty: true })
      }
    }

    if (initialData?.raza) {
      const currentRazas =
        initialData?.tipoAnimal && TIPOS_ANIMALES[initialData.tipoAnimal as keyof typeof TIPOS_ANIMALES]
          ? TIPOS_ANIMALES[initialData.tipoAnimal as keyof typeof TIPOS_ANIMALES].razas
          : []
      if (!currentRazas.includes(initialData.raza)) {
        setValue("raza", "Otra", { shouldDirty: true })
        setValue("otraRaza", initialData.raza, { shouldDirty: true })
        setShowOtraRazaInput(true)
      }
    }

    // Inicializar imágenes si existen
    if (initialData?.imagenUrl) {
      const initialImages = [initialData.imagenUrl]
      setImagenes(initialImages)
      setValue("imagenes", initialImages, { shouldValidate: false, shouldDirty: false })
    } else if (initialData?.imagenes && Array.isArray(initialData.imagenes)) {
      setImagenes(initialData.imagenes)
      setValue("imagenes", initialData.imagenes, { shouldValidate: false, shouldDirty: false })
    }

    // Inicializar documentos si existen
    if (initialData?.documentos && Array.isArray(initialData.documentos)) {
      setDocumentos(initialData.documentos)
      setValue("documentos", initialData.documentos, { shouldValidate: false, shouldDirty: false })
    }
  }, [initialData, setValue])

  // Sincronizar selectedTipoAnimal con el valor del formulario
  useEffect(() => {
    if (watchedValues.tipoAnimal && watchedValues.tipoAnimal !== selectedTipoAnimal) {
      setSelectedTipoAnimal(watchedValues.tipoAnimal)
    }
  }, [watchedValues.tipoAnimal, selectedTipoAnimal])

  // Sincronizar showOtraRazaInput con el valor del formulario
  useEffect(() => {
    setShowOtraRazaInput(watchedValues.raza === "Otra")
  }, [watchedValues.raza])

  // Validaciones específicas por tipo de animal
  const validateAnimal = useCallback(() => {
    const errors: string[] = []

    if (watchedValues.fechaNacimiento) {
      const fechaNac = new Date(watchedValues.fechaNacimiento)
      const edadMeses = (Date.now() - fechaNac.getTime()) / (1000 * 60 * 60 * 24 * 30.44)

      switch (watchedValues.tipoAnimal) {
        case "bovino":
          if (edadMeses < 1) errors.push("Los bovinos deben tener mínimo 1 meses de edad")
          break
        case "ovino":
          if (edadMeses < 1) errors.push("Los ovinos deben tener mínimo 1 meses de edad")
          break
        case "equino":
          if (edadMeses < 1) errors.push("Los equinos deben tener mínimo 1 meses de edad")
          break
        case "cuy":
          if (edadMeses < 1 || edadMeses > 8) errors.push("Los cuyes deben tener entre 1 meses de edad")
          break
      }
    }

    // Validar puntaje según el tipo de puntaje del concurso
    if (contest?.tipoPuntaje) {
      switch (contest.tipoPuntaje) {
        case "NUMERICO":
        case "PUNTOS":
          if (watchedValues.puntaje !== undefined && watchedValues.puntaje !== null) {
            const puntaje = Number(watchedValues.puntaje)
            const min = contest.puntajeMinimo || 0
            const max = contest.puntajeMaximo || 100
            if (isNaN(puntaje) || puntaje < min || puntaje > max) {
              errors.push(`El puntaje debe estar entre ${min} y ${max}`)
            }
          }
          break
        case "POSICION":
          if (watchedValues.posicion !== undefined && watchedValues.posicion !== null) {
            const posicion = Number(watchedValues.posicion)
            const maxPosiciones = contest.posicionesDisponibles || 10
            if (isNaN(posicion) || posicion < 1 || posicion > maxPosiciones) {
              errors.push(`La posición debe estar entre 1 y ${maxPosiciones}`)
            }
          }
          break
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }, [watchedValues.tipoAnimal, watchedValues.fechaNacimiento, watchedValues.puntaje, watchedValues.posicion, contest])

  // Validar cuando cambien los valores relevantes
  useEffect(() => {
    if (watchedValues.tipoAnimal && watchedValues.fechaNacimiento) {
      validateAnimal()
    }
  }, [
    watchedValues.tipoAnimal,
    watchedValues.fechaNacimiento,
    watchedValues.puntaje,
    watchedValues.posicion,
    validateAnimal,
  ])

  // Prevenir navegación accidental con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Detectar cambios en el formulario
  useEffect(() => {
    const subscription = watch(() => {
      setHasUnsavedChanges(true)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const onFormSubmit = async (data: GanadoFormData, event?: React.FormEvent) => {
    // Prevent default form submission
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Form submission already in progress, ignoring...")
      return
    }

    console.log("Form data before validation:", data)

    if (!validateAnimal()) {
      console.log("Animal validation failed")
      return
    }

    const formData = {
      ...data,
      imagenes,
      documentos,
    }

    if (formData.tipoAnimal === "otro") {
      formData.tipoAnimal = formData.otroTipoAnimal || ""
    }
    if (formData.raza === "Otra") {
      formData.raza = formData.otraRaza || ""
    }

    delete formData.otroTipoAnimal
    delete formData.otraRaza

    console.log("Final form data:", formData)

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setHasUnsavedChanges(false) // Reset flag after successful save
      onSubmitSuccess() // Call onSubmitSuccess after successful submission
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Usar useCallback para evitar re-renders innecesarios
  const handleImageUpload = useCallback(
    (url: string) => {
      setImagenes((prev) => {
        const newImages = [...prev, url]
        setValue("imagenes", newImages, { shouldValidate: false, shouldDirty: false })
        setHasUnsavedChanges(true)
        return newImages
      })
    },
    [setValue],
  )

  const handleDocumentUpload = useCallback(
    (url: string) => {
      setDocumentos((prev) => {
        const newDocs = [...prev, url]
        setValue("documentos", newDocs, { shouldValidate: false, shouldDirty: false })
        setHasUnsavedChanges(true)
        return newDocs
      })
    },
    [setValue],
  )

  const removeImage = useCallback(
    (index: number) => {
      setImagenes((prev) => {
        const newImages = prev.filter((_, i) => i !== index)
        setValue("imagenes", newImages, { shouldValidate: false, shouldDirty: false })
        return newImages
      })
    },
    [setValue],
  )

  const removeDocument = useCallback(
    (index: number) => {
      setDocumentos((prev) => {
        const newDocs = prev.filter((_, i) => i !== index)
        setValue("documentos", newDocs, { shouldValidate: false, shouldDirty: false })
        return newDocs
      })
    },
    [setValue],
  )

  const getBadgeIcon = (estado: string) => {
    switch (estado) {
      case "campeón":
        return <Crown className="h-3 w-3" />
      case "ganador":
        return <Trophy className="h-3 w-3" />
      case "destacado":
        return <Star className="h-3 w-3" />
      case "nuevo":
        return <Clock className="h-3 w-3" />
      case "preñada":
        return <Heart className="h-3 w-3" />
      case "elite":
        return <Zap className="h-3 w-3" />
      default:
        return null
    }
  }

  const renderScoreFields = () => {
    if (!contest?.tipoPuntaje) return null

    switch (contest.tipoPuntaje) {
      case "NUMERICO":
      case "PUNTOS":
        return (
          <div className="space-y-2">
            <Label htmlFor="puntaje">
              {contest.tipoPuntaje === "NUMERICO" ? "Puntaje" : "Puntos"}
              {contest.puntajeMinimo !== undefined &&
                contest.puntajeMaximo !== undefined &&
                ` (${contest.puntajeMinimo} - ${contest.puntajeMaximo})`}
            </Label>
            <Input
              id="puntaje"
              type="number"
              step="0.1"
              min={contest.puntajeMinimo || 0}
              max={contest.puntajeMaximo || 100}
              {...register("puntaje", {
                valueAsNumber: true,
                min: {
                  value: contest.puntajeMinimo || 0,
                  message: `El puntaje debe ser mayor o igual a ${contest.puntajeMinimo || 0}`,
                },
                max: {
                  value: contest.puntajeMaximo || 100,
                  message: `El puntaje debe ser menor o igual a ${contest.puntajeMaximo || 100}`,
                },
              })}
              placeholder={`Ej: 85.5 (${contest.puntajeMinimo || 0}-${contest.puntajeMaximo || 100})`}
            />
            <p className="text-xs text-muted-foreground">
              {contest.tipoPuntaje === "NUMERICO" ? "Puntaje obtenido en el concurso" : "Puntos obtenidos"}
            </p>
            {errors.puntaje && (
              <Alert variant="destructive">
                <AlertDescription>{errors.puntaje.message}</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case "POSICION":
        return (
          <div className="space-y-2">
            <Label htmlFor="posicion">Posición (1-{contest.posicionesDisponibles || 10})</Label>
            <Input
              id="posicion"
              type="number"
              min="1"
              max={contest.posicionesDisponibles || 10}
              {...register("posicion", {
                valueAsNumber: true,
                min: { value: 1, message: "La posición debe ser mayor a 0" },
                max: {
                  value: contest.posicionesDisponibles || 10,
                  message: `La posición debe ser menor o igual a ${contest.posicionesDisponibles || 10}`,
                },
              })}
              placeholder="Ej: 1 (primer lugar)"
            />
            <p className="text-xs text-muted-foreground">
              Posición obtenida en el concurso (1er lugar, 2do lugar, etc.)
            </p>
            {errors.posicion && (
              <Alert variant="destructive">
                <AlertDescription>{errors.posicion.message}</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case "CALIFICACION":
        return (
          <div className="space-y-2">
            <Label htmlFor="calificacion">Calificación</Label>
            <Controller
              name="calificacion"
              control={control}
              render={({ field }) => (
                <Select value={field.value || "A"} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar calificación" />
                  </SelectTrigger>
                  <SelectContent>
                    {contest.calificacionesCustom && contest.calificacionesCustom.length > 0 ? (
                      contest.calificacionesCustom.map((cal: string) => (
                        <SelectItem key={cal} value={cal}>
                          {cal}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="A">A - Excelente</SelectItem>
                        <SelectItem value="B">B - Muy Bueno</SelectItem>
                        <SelectItem value="C">C - Bueno</SelectItem>
                        <SelectItem value="D">D - Regular</SelectItem>
                        <SelectItem value="E">E - Deficiente</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">Calificación obtenida en el concurso</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit((data) => onFormSubmit(data, e))()
      }}
      className="space-y-8"
    >
      <Tabs defaultValue="basica" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basica">Información Básica</TabsTrigger>
          <TabsTrigger value="actores">Propietario/Expositor</TabsTrigger>
          <TabsTrigger value="establo">Establo</TabsTrigger>
          <TabsTrigger value="categoria">Categoría</TabsTrigger>
          <TabsTrigger value="archivos">Archivos</TabsTrigger>
        </TabsList>

        {/* Información Básica */}
        <TabsContent value="basica" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Animal</CardTitle>
              <CardDescription>Información básica y características del animal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Animal *</Label>
                  <Input
                    id="nombre"
                    {...register("nombre", { required: "El nombre es requerido" })}
                    placeholder="Ej: MAP Lorado Rijeka EDNA"
                  />
                  {errors.nombre && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.nombre.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroFicha">Número de Ficha *</Label>
                  <Input
                    id="numeroFicha"
                    {...register("numeroFicha", { required: "El número de ficha es requerido" })}
                    placeholder="Ej: 001, A-123"
                  />
                  {errors.numeroFicha && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.numeroFicha.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoAnimal">Tipo de Animal *</Label>
                  <Controller
                    name="tipoAnimal"
                    control={control}
                    rules={{ required: "El tipo de animal es requerido" }}
                    render={({ field }) => (
                      <Select
                        value={field.value || "bovino"}
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedTipoAnimal(value as keyof typeof TIPOS_ANIMALES)
                          setValue("raza", "", { shouldValidate: true })
                          setShowOtraRazaInput(false)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo de animal" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TIPOS_ANIMALES).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tipoAnimal && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.tipoAnimal.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {selectedTipoAnimal === "otro" && (
                  <div className="space-y-2">
                    <Label htmlFor="otroTipoAnimal">Especificar tipo *</Label>
                    <Input
                      id="otroTipoAnimal"
                      {...register("otroTipoAnimal", {
                        required: "Debe especificar el tipo de animal si selecciona 'Otro'",
                      })}
                      placeholder="Ej: Conejo"
                    />
                    {errors.otroTipoAnimal && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.otroTipoAnimal.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="raza">Raza *</Label>
                  <Controller
                    name="raza"
                    control={control}
                    rules={{ required: "La raza es requerida" }}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value)
                          setShowOtraRazaInput(value === "Otra")
                        }}
                        disabled={!selectedTipoAnimal || selectedTipoAnimal === "otro"}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedTipoAnimal || selectedTipoAnimal === "otro"
                                ? "Seleccione un tipo primero"
                                : "Seleccionar raza"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTipoAnimal &&
                            TIPOS_ANIMALES[selectedTipoAnimal as keyof typeof TIPOS_ANIMALES]?.razas.map((raza) => (
                              <SelectItem key={raza} value={raza}>
                                {raza}
                              </SelectItem>
                            ))}
                          {selectedTipoAnimal && selectedTipoAnimal !== "otro" && (
                            <SelectItem value="Otra">Otra (especificar)</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.raza && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.raza.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {showOtraRazaInput && (
                  <div className="space-y-2">
                    <Label htmlFor="otraRaza">Especificar raza *</Label>
                    <Input
                      id="otraRaza"
                      {...register("otraRaza", { required: "Debe especificar la raza si selecciona 'Otra'" })}
                      placeholder="Ej: Criollo"
                    />
                    {errors.otraRaza && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.otraRaza.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Controller
                    name="sexo"
                    control={control}
                    rules={{ required: "El sexo es requerido" }}
                    render={({ field }) => (
                      <Select value={field.value || "MACHO"} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar sexo" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEXOS.map((sexo) => (
                            <SelectItem key={sexo.value} value={sexo.value}>
                              {sexo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.sexo && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.sexo.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento")} />
                  <p className="text-xs text-muted-foreground">Opcional - ayuda a validar la edad del animal</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    {...register("peso", {
                      valueAsNumber: true,
                      min: { value: 0.1, message: "El peso debe ser mayor a 0" },
                    })}
                    placeholder="Ej: 450.5 (opcional)"
                  />
                  <p className="text-xs text-muted-foreground">Opcional - peso actual del animal</p>
                </div>

                {/* Campos de puntaje dinámicos según el tipo de concurso */}
                {renderScoreFields()}
              </div>

              {/* Validaciones específicas */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Genealogía */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Genealogía (Opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="padre">Padre</Label>
                    <Input id="padre" {...register("padre")} placeholder="Nombre del padre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="madre">Madre</Label>
                    <Input id="madre" {...register("madre")} placeholder="Nombre de la madre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lineaGenetica">Línea Genética</Label>
                    <Input id="lineaGenetica" {...register("lineaGenetica")} placeholder="Línea genética" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Descripción y marcas */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    {...register("descripcion")}
                    placeholder="Descripción general del animal..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marcasDistintivas">Marcas Distintivas</Label>
                  <Textarea
                    id="marcasDistintivas"
                    {...register("marcasDistintivas")}
                    placeholder="Marcas, tatuajes, características especiales..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Propietario/Expositor */}
        <TabsContent value="actores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Propietario</CardTitle>
              <CardDescription>Información del propietario del animal (requerido)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propietarioNombre">Nombre Completo *</Label>
                  <Input
                    id="propietarioNombre"
                    {...register("propietarioNombre", { required: "El nombre del propietario es requerido" })}
                    placeholder="Nombre completo del propietario"
                  />
                  {errors.propietarioNombre && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.propietarioNombre.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propietarioDocumento">Documento</Label>
                  <Input
                    id="propietarioDocumento"
                    {...register("propietarioDocumento")}
                    placeholder="Cédula, RUT, NIT"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propietarioTelefono">Teléfono</Label>
                  <Input
                    id="propietarioTelefono"
                    {...register("propietarioTelefono")}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propietarioEmail">Email</Label>
                  <Input
                    id="propietarioEmail"
                    type="email"
                    {...register("propietarioEmail")}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="propietarioDireccion">Dirección</Label>
                  <Input
                    id="propietarioDireccion"
                    {...register("propietarioDireccion")}
                    placeholder="Dirección completa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expositor (Opcional)</CardTitle>
              <CardDescription>Información del expositor si es diferente al propietario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expositorNombre">Nombre Completo</Label>
                  <Input
                    id="expositorNombre"
                    {...register("expositorNombre")}
                    placeholder="Nombre completo del expositor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expositorDocumento">Documento</Label>
                  <Input id="expositorDocumento" {...register("expositorDocumento")} placeholder="Cédula, RUT, NIT" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expositorTelefono">Teléfono</Label>
                  <Input id="expositorTelefono" {...register("expositorTelefono")} placeholder="Número de teléfono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expositorEmail">Email</Label>
                  <Input
                    id="expositorEmail"
                    type="email"
                    {...register("expositorEmail")}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expositorEmpresa">Empresa/Establo</Label>
                  <Input
                    id="expositorEmpresa"
                    {...register("expositorEmpresa")}
                    placeholder="Nombre del establo o empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expositorExperiencia">Experiencia</Label>
                  <Textarea
                    id="expositorExperiencia"
                    {...register("expositorExperiencia")}
                    placeholder="Experiencia en exposiciones..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Establo */}
        <TabsContent value="establo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Establo (Opcional)
              </CardTitle>
              <CardDescription>Seleccione el establo donde se encuentra el animal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showNewEstablo ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="establoId">Establo Existente</Label>
                    <Controller
                      name="establoId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || "null-establo-option"} // Set default value for Select to a non-empty string
                          onValueChange={(value) => {
                            field.onChange(value === "null-establo-option" ? null : value) // Convert special string back to null
                          }}
                          disabled={loadingEstablos}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={loadingEstablos ? "Cargando establos..." : "Seleccionar establo"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null-establo-option">Sin establo</SelectItem>{" "}
                            {/* Changed value from "" to "null-establo-option" */}
                            {establos.map((establo) => (
                              <SelectItem key={establo.id} value={establo.id}>
                                {establo.nombre}
                                {establo.ubicacion && (
                                  <span className="text-sm text-gray-500 block">{establo.ubicacion}</span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewEstablo(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Crear Nuevo Establo
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Nuevo Establo</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewEstablo(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nuevoEstabloNombre">Nombre del Establo *</Label>
                      <Input
                        id="nuevoEstabloNombre"
                        {...register("nuevoEstabloNombre")}
                        placeholder="Nombre del establo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nuevoEstabloUbicacion">Ubicación</Label>
                      <Input
                        id="nuevoEstabloUbicacion"
                        {...register("nuevoEstabloUbicacion")}
                        placeholder="Ciudad, Departamento"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nuevoEstabloDescripcion">Descripción</Label>
                      <Textarea
                        id="nuevoEstabloDescripcion"
                        {...register("nuevoEstabloDescripcion")}
                        placeholder="Descripción del establo..."
                        rows={2}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categoría */}
        <TabsContent value="categoria" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categoría del Concurso</CardTitle>
              <CardDescription>Seleccione la categoría en la que participará el animal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contestCategoryId">Categoría *</Label>
                <Controller
                  name="contestCategoryId"
                  control={control}
                  rules={{ required: "La categoría es requerida" }}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange} disabled={loadingCategories}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={loadingCategories ? "Cargando categorías..." : "Seleccionar categoría"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nombre}
                            {category.descripcion && (
                              <span className="text-sm text-gray-500 block">{category.descripcion}</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.contestCategoryId && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.contestCategoryId.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Estado y opciones comerciales */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Estado y Opciones</h4>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || "borrador"} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${estado.color}`} />
                                {estado.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="enRemate"
                    control={control}
                    render={({ field }) => (
                      <Switch id="enRemate" checked={field.value || false} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="enRemate">En Remate</Label>
                </div>

                {watchedValues.enRemate && (
                  <div className="space-y-2">
                    <Label htmlFor="precioBaseRemate">Precio Base de Remate</Label>
                    <Input
                      id="precioBaseRemate"
                      type="number"
                      step="0.01"
                      {...register("precioBaseRemate", { valueAsNumber: true })}
                      placeholder="Precio en pesos colombianos"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Controller
                    name="isDestacado"
                    control={control}
                    render={({ field }) => (
                      <Switch id="isDestacado" checked={field.value || false} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="isDestacado">Animal Destacado</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archivos */}
        <TabsContent value="archivos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del Animal</CardTitle>
              <CardDescription>Suba imágenes del animal (máximo 10 imágenes)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div key={`images-${imagenes.length}`}>
                <CloudinaryUpload
                  onSuccess={handleImageUpload}
                  folder="ganado/imagenes"
                  resourceType="image"
                  maxFiles={10 - imagenes.length}
                  disabled={imagenes.length >= 10}
                />
              </div>

              {imagenes.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagenes.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Certificados sanitarios, registros genealógicos, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div key={`docs-${documentos.length}`}>
                <CloudinaryUpload
                  onSuccess={handleDocumentUpload}
                  folder="ganado/documentos"
                  resourceType="raw"
                  maxFiles={5 - documentos.length}
                  disabled={documentos.length >= 5}
                  acceptedFormats={["pdf", "doc", "docx", "jpg", "jpeg", "png"]}
                />
              </div>

              {documentos.length > 0 && (
                <div className="space-y-2">
                  {documentos.map((url, index) => (
                    <div key={`${url}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm truncate">Documento {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => window.open(url, "_blank")}>
                          Ver
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeDocument(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onSubmitSuccess}>
          {" "}
          {/* Changed onCancel to onSubmitSuccess */}
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isSubmitting || validationErrors.length > 0}
          className="min-w-[120px]"
        >
          {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Registrar"} Ganado
        </Button>
      </div>
    </form>
  )
}
