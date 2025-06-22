"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ContestCategory } from "@prisma/client"
import { SexoGanado } from "@prisma/client"
import { CATEGORIAS_GANADO } from "@/lib/constants/ganado" // Import the standardized categories

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().optional(),
  orden: z.coerce.number().int().optional(),
  criteriosEdadMinMeses: z.coerce.number().int().positive().optional().nullable(),
  criteriosEdadMaxMeses: z.coerce.number().int().positive().optional().nullable(),
  criteriosPesoMinKg: z.coerce.number().positive().optional().nullable(),
  criteriosPesoMaxKg: z.coerce.number().positive().optional().nullable(),
  criteriosSexo: z.nativeEnum(SexoGanado).optional().nullable(),
  // No need for template in the schema, it's a UI helper
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  initialData?: ContestCategory | null
  onSubmit: (values: CategoryFormValues) => Promise<void>
  isSubmitting: boolean
}

export function CategoryForm({ initialData, onSubmit, isSubmitting }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      descripcion: initialData?.descripcion || "",
      orden: initialData?.orden || 0,
      criteriosEdadMinMeses: initialData?.criteriosEdadMinMeses || null,
      criteriosEdadMaxMeses: initialData?.criteriosEdadMaxMeses || null,
      criteriosPesoMinKg: initialData?.criteriosPesoMinKg || null,
      criteriosPesoMaxKg: initialData?.criteriosPesoMaxKg || null,
      criteriosSexo: initialData?.criteriosSexo || null,
    },
  })

  const sexoGanadoOptions = Object.values(SexoGanado)

  const handleTemplateChange = (templateValue: string) => {
    const selectedTemplate = CATEGORIAS_GANADO.find((cat) => cat.value === templateValue)
    if (selectedTemplate) {
      form.setValue("nombre", selectedTemplate.label, { shouldValidate: true })
      // If CATEGORIAS_GANADO had more detailed criteria, you could set them here:
      // form.setValue("criteriosEdadMinMeses", selectedTemplate.defaultCriteria?.edadMin || null);
      // form.setValue("criteriosSexo", selectedTemplate.defaultCriteria?.sexo || null);
    } else if (templateValue === "NINGUNA") {
      form.setValue("nombre", initialData?.nombre || "", { shouldValidate: true }) // Reset to initial or empty
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {!initialData && ( // Show template selector only for new categories
          <FormItem>
            <FormLabel>Usar Plantilla (Opcional)</FormLabel>
            <Select onValueChange={handleTemplateChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar una plantilla estándar..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="NINGUNA">-- Sin Plantilla --</SelectItem>
                {CATEGORIAS_GANADO.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Selecciona una plantilla para pre-rellenar el nombre de la categoría.</FormDescription>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Categoría</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Terneras de 6 a 12 meses" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalles adicionales sobre la categoría" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="orden"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden de Presentación</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormDescription>Determina el orden en que aparecerá la categoría. Menor número primero.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <h3 className="text-lg font-medium pt-4">Criterios Específicos (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="criteriosEdadMinMeses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edad Mínima (meses)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 6" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="criteriosEdadMaxMeses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edad Máxima (meses)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 12" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="criteriosPesoMinKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Mínimo (Kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Ej: 150.5" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="criteriosPesoMaxKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Máximo (Kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Ej: 250" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="criteriosSexo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo Requerido</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sexo (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NINGUNO_CRITERIO_SEXO_VALUE">Todos</SelectItem>{" "}
                    {/* Use a distinct value for "none" or "all" */}
                    {sexoGanadoOptions.map((sexoValue: SexoGanado) => (
                      <SelectItem key={sexoValue} value={sexoValue}>
                        {sexoValue.charAt(0).toUpperCase() + sexoValue.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? initialData
              ? "Guardando Cambios..."
              : "Creando Categoría..."
            : initialData
              ? "Guardar Cambios"
              : "Crear Categoría"}
        </Button>
      </form>
    </Form>
  )
}
