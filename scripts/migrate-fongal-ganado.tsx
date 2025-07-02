import { PrismaClient, type SexoGanado } from "@prisma/client"

const prisma = new PrismaClient()

interface GanadoCSV {
  id: string
  name: string
  createdAt: string
  nacimiento: string
  diasNacida: string
  categoria: string
  establo: string
  remate: string
  propietario: string
  descripcion: string
  raza: string
  sexo: string
  imageSrc: string
  puntaje: string
}

// Mapeo de razas para normalizar
const razaMapping: Record<string, string> = {
  "FLECKVIEH PPC": "Fleckvieh PPC",
  FLECKVIEH: "Fleckvieh",
  HOLSTEIN: "Holstein",
  "BROWN SWISS": "Brown Swiss",
  SIMMENTAL: "Simmental",
  JERSEY: "Jersey",
  ANGUS: "Angus",
  BRAHMAN: "Brahman",
  CRIOLLO: "Criollo",
  FLECKVIEH_PPC: "Fleckvieh PPC", // Ensure consistency with enum values
  HOLSTEIN_PDP: "Holstein PDP",
  HOLSTEIN_PPC: "Holstein PPC",
  JERSEY_PDP: "Jersey PDP",
  JERSEY_PPC: "Jersey PPC",
  BROWN_SWISS_PDP: "Brown Swiss PDP",
  BROWN_SWISS_PPC: "Brown Swiss PPC",
  FLECKVIEH_PDP: "Fleckvieh PDP",
}

// Función para normalizar razas
function normalizarRaza(raza: string): string {
  const razaNormalizada = razaMapping[raza.toUpperCase()]
  return razaNormalizada || raza
}

// Función para determinar el sexo basado en el texto
function determinarSexo(texto: string): SexoGanado {
  const textoLower = texto.toLowerCase()
  if (textoLower.includes("macho") || textoLower.includes("toro") || textoLower.includes("torete")) {
    return "MACHO"
  }
  return "HEMBRA"
}

// Función para determinar la categoría basada en el nombre de la categoría del CSV o por edad/sexo
async function determinarCategoria(
  contestId: string,
  csvCategoriaName: string,
  edadMeses: number,
  sexo: SexoGanado,
): Promise<string | null> {
  try {
    // 1. Intentar encontrar la categoría por el nombre exacto del CSV
    const directMatchCategory = await prisma.contestCategory.findFirst({
      where: {
        contestId: contestId,
        nombre: csvCategoriaName,
      },
    })

    if (directMatchCategory) {
      return directMatchCategory.id
    }

    // 2. Si no hay coincidencia directa, intentar por lógica de edad/sexo (fallback)
    // Esta lógica es un fallback y puede necesitar ser más sofisticada o ajustada a tus categorías específicas.
    // Se recomienda que los nombres de categoría en el CSV coincidan con los de la base de datos.
    const categorias = await prisma.contestCategory.findMany({
      where: { contestId },
      orderBy: { orden: "asc" },
    })

    if (categorias.length === 0) {
      return null
    }

    // Ejemplo de lógica de mapeo basada en edad y sexo (ajustar según categorías reales)
    if (sexo === "MACHO") {
      if (edadMeses <= 12) return categorias.find((c) => c.nombre.includes("Ternero Menor"))?.id || null
      if (edadMeses <= 18) return categorias.find((c) => c.nombre.includes("Ternero Mayor"))?.id || null
      if (edadMeses <= 24) return categorias.find((c) => c.nombre.includes("Torete"))?.id || null
      if (edadMeses <= 36) return categorias.find((c) => c.nombre.includes("Toro Joven"))?.id || null
      return categorias.find((c) => c.nombre.includes("Toro Adulto"))?.id || null
    } else {
      // HEMBRA
      if (edadMeses <= 12) return categorias.find((c) => c.nombre.includes("Ternera Menor"))?.id || null
      if (edadMeses <= 18) return categorias.find((c) => c.nombre.includes("Ternera Mayor"))?.id || null
      if (edadMeses <= 24) return categorias.find((c) => c.nombre.includes("Vaquillona"))?.id || null
      if (edadMeses <= 36) return categorias.find((c) => c.nombre.includes("Vaca Joven"))?.id || null
      return categorias.find((c) => c.nombre.includes("Vaca Adulta"))?.id || null
    }
  } catch (error) {
    console.error("Error al determinar categoría:", error)
    return null
  }
}

// Función para descargar el CSV desde una URL
async function descargarCSV(url: string): Promise<string> {
  try {
    console.log(`📥 Descargando CSV desde: ${url}`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error al descargar CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log(`✅ CSV descargado correctamente (${csvText.length} bytes)`)
    return csvText
  } catch (error) {
    console.error("Error al descargar CSV:", error)
    throw error
  }
}

// Función para parsear CSV manualmente
function parseCSV(csvText: string): GanadoCSV[] {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

  const records: GanadoCSV[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Parsear línea CSV considerando comillas
    const values: string[] = []
    let current = ""
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim()) // Agregar el último valor

    // Crear objeto del registro
    const record: any = {}
    headers.forEach((header, index) => {
      record[header] = values[index]?.replace(/"/g, "") || ""
    })

    records.push(record as GanadoCSV)
  }

  return records
}

// Función principal para migrar el ganado
async function migrarGanado(csvUrl: string, contestId: string, limpiarExistente = false) {
  try {
    console.log("🚀 Iniciando migración de ganado FONGAL...")

    // Verificar que el concurso existe
    const concurso = await prisma.contest.findUnique({
      where: { id: contestId },
    })

    if (!concurso) {
      throw new Error(`No se encontró el concurso con ID: ${contestId}`)
    }

    console.log(`📋 Concurso encontrado: ${concurso.nombre}`)

    // Limpiar ganado existente si se solicita
    if (limpiarExistente) {
      console.log("🧹 Limpiando ganado existente...")
      await prisma.ganado.deleteMany({
        where: { contestId },
      })
      console.log("✅ Ganado existente eliminado")
    }

    // Descargar el CSV
    const csvText = await descargarCSV(csvUrl)

    // Parsear el CSV
    const records = parseCSV(csvText)

    console.log(`📊 Registros encontrados en CSV: ${records.length}`)

    // Estadísticas
    let creados = 0
    let errores = 0
    let propietariosCreados = 0
    let establosCreados = 0

    // Procesar cada registro
    for (const [index, record] of records.entries()) {
      try {
        console.log(`\n🔄 Procesando registro ${index + 1}/${records.length}: ${record.name}`)

        // Normalizar datos
        const nombre = record.name.trim()
        const raza = normalizarRaza(record.raza)
        const sexo = determinarSexo(record.sexo)

        // Validar y parsear fecha de nacimiento
        let fechaNacimiento: Date | null = null
        if (record.nacimiento) {
          const parsedDate = new Date(record.nacimiento)
          if (!isNaN(parsedDate.getTime())) {
            // Check if the date is valid
            fechaNacimiento = parsedDate
          } else {
            console.warn(
              `⚠️ Fecha de nacimiento inválida para ${record.name}: '${record.nacimiento}'. Se establecerá como nula.`,
            )
          }
        }

        const puntaje = record.puntaje ? Number.parseFloat(record.puntaje) : null
        const enRemate = record.remate?.toLowerCase() === "true"
        const descripcion = record.descripcion || ""
        const imagenUrl = record.imageSrc || null

        // Calcular edad en meses para categorización
        let edadMeses = 0
        if (fechaNacimiento) {
          const hoy = new Date()
          const diffTime = Math.abs(hoy.getTime() - fechaNacimiento.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          edadMeses = Math.floor(diffDays / 30)
        } else if (record.diasNacida) {
          edadMeses = Math.floor(Number.parseInt(record.diasNacida) / 30)
        }

        // Determinar categoría basada en el nombre del CSV o por edad/sexo
        const categoriaId = await determinarCategoria(contestId, record.categoria, edadMeses, sexo)

        if (!categoriaId) {
          console.warn(`⚠️ No se pudo determinar la categoría para ${record.name}. Saltando este registro.`)
          errores++
          continue
        }

        // Crear o encontrar propietario
        let propietario = null
        if (record.propietario) {
          propietario = await prisma.propietario.findFirst({
            where: {
              nombreCompleto: record.propietario,
              companyId: concurso.companyId,
            },
          })

          if (!propietario) {
            propietario = await prisma.propietario.create({
              data: {
                nombreCompleto: record.propietario,
                companyId: concurso.companyId,
              },
            })
            propietariosCreados++
            console.log(`👤 Propietario creado: ${propietario.nombreCompleto}`)
          }
        }

        // Crear o encontrar establo
        let establo = null
        if (record.establo) {
          establo = await prisma.establo.findFirst({
            where: {
              nombre: record.establo,
              companyId: concurso.companyId,
            },
          })

          if (!establo) {
            establo = await prisma.establo.create({
              data: {
                nombre: record.establo,
                companyId: concurso.companyId,
              },
            })
            establosCreados++
            console.log(`🏠 Establo creado: ${establo.nombre}`)
          }
        }

        // Generar número de ficha único
        // Asegurarse de que el numeroFicha sea único para el concurso
        let numeroFicha = record.id || `F${(index + 1).toString().padStart(4, "0")}` // Use CSV ID if available, otherwise generate

        // Check for existing numeroFicha and generate a new one if duplicate
        let existingGanadoWithFicha = await prisma.ganado.findFirst({
          where: {
            contestId: contestId,
            numeroFicha: numeroFicha,
          },
        })

        let counter = 1
        while (existingGanadoWithFicha) {
          numeroFicha = `${record.id || "F"}${(index + 1 + counter).toString().padStart(4, "0")}`
          existingGanadoWithFicha = await prisma.ganado.findFirst({
            where: {
              contestId: contestId,
              numeroFicha: numeroFicha,
            },
          })
          counter++
        }

        // Crear el ganado
        const ganado = await prisma.ganado.create({
          data: {
            nombre,
            numeroFicha,
            raza,
            sexo,
            fechaNacimiento,
            descripcion,
            imagenUrl,
            enRemate,
            isDestacado: puntaje !== null && puntaje >= 90,
            puntaje,
            companyId: concurso.companyId,
            propietarioId: propietario?.id,
            establoId: establo?.id,
            contestId,
            contestCategoryId: categoriaId,
            createdById: concurso.createdById, // Assign the user who created the contest as the creator of the ganado
          },
        })

        console.log(`✅ Ganado creado: ${ganado.nombre} (${ganado.numeroFicha})`)
        creados++
      } catch (error) {
        console.error(`❌ Error procesando registro ${index + 1}: ${record.name}`, error)
        errores++
      }
    }

    // Actualizar contador de participantes
    await prisma.contest.update({
      where: { id: contestId },
      data: { participantCount: creados },
    })

    // Mostrar estadísticas finales
    console.log("\n📊 ESTADÍSTICAS DE MIGRACIÓN")
    console.log("=".repeat(50))
    console.log(`✅ Registros procesados: ${records.length}`)
    console.log(`✅ Ganado creado: ${creados}`)
    console.log(`✅ Propietarios creados: ${propietariosCreados}`)
    console.log(`✅ Establos creados: ${establosCreados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log("=".repeat(50))

    // Mostrar distribución por sexo
    const distribucionSexo = await prisma.ganado.groupBy({
      by: ["sexo"],
      where: { contestId },
      _count: true,
    })

    console.log("\n📊 DISTRIBUCIÓN POR SEXO")
    distribucionSexo.forEach((item) => {
      console.log(`${item.sexo}: ${item._count} (${Math.round((item._count / creados) * 100)}%)`)
    })

    // Mostrar distribución por raza
    const distribucionRaza = await prisma.ganado.groupBy({
      by: ["raza"],
      where: { contestId },
      _count: true,
    })

    console.log("\n📊 DISTRIBUCIÓN POR RAZA")
    distribucionRaza.forEach((item) => {
      console.log(`${item.raza || "Sin raza"}: ${item._count} (${Math.round((item._count / creados) * 100)}%)`)
    })

    console.log("\n✅ Migración completada exitosamente")
  } catch (error) {
    console.error("❌ Error durante la migración:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Función para encontrar el ID del concurso FONGAL
async function encontrarConcursoFongal(): Promise<string | null> {
  try {
    const concurso = await prisma.contest.findFirst({
      where: {
        OR: [{ slug: "fongal-2024" }, { nombre: { contains: "FONGAL", mode: "insensitive" } }],
      },
    })

    return concurso?.id || null
  } catch (error) {
    console.error("Error al buscar concurso FONGAL:", error)
    return null
  }
}

// Main execution logic for the script
async function main() {
  const args = process.argv.slice(2)
  const limpiarExistente = args.includes("--clean") || args.includes("-c")

  // Nueva URL del CSV proporcionada por el usuario
  const csvUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ganado-eGJaJDlxDAYA5HJOz16xKq35Zv5cHs.csv"

  try {
    const contestId = await encontrarConcursoFongal()
    if (!contestId) {
      console.error(
        "❌ No se encontró el concurso FONGAL. Asegúrate de que el concurso 'Fongal 2024' exista en tu base de datos.",
      )
      process.exit(1)
    }

    await migrarGanado(csvUrl, contestId, limpiarExistente)
    console.log("✅ Script completado exitosamente")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error ejecutando script:", error)
    process.exit(1)
  }
}

// Call the main function to execute the script
main()

export { migrarGanado, encontrarConcursoFongal }
