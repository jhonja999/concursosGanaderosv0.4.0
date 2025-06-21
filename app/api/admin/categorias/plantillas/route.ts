import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Simulamos las plantillas hasta que tengamos las tablas creadas
    const plantillas = [
      // Bovinos - Categorías Estandarizadas Corregidas
      {
        id: "bovinos_dientes_leche",
        nombre: "A - Dientes de Leche",
        descripcion: "Animales jóvenes con dentición de leche",
        tipo_categoria: "EDAD",
        tipo_concurso: "Bovinos",
        es_estandar: true,
        uso_estimado: 45,
      },
      {
        id: "bovinos_adulto_senior",
        nombre: "Adulto o Senior (desde 2 años adelante)",
        descripcion: "Animales adultos de 2 años en adelante",
        tipo_categoria: "EDAD",
        tipo_concurso: "Bovinos",
        es_estandar: true,
        uso_estimado: 38,
      },
      {
        id: "bovinos_dos_dientes_seca",
        nombre: "B - Dos Dientes (Sin haber parido)",
        descripcion: "Hembras con dos dientes permanentes, sin historial reproductivo",
        tipo_categoria: "EDAD",
        tipo_concurso: "Bovinos",
        es_estandar: true,
        uso_estimado: 42,
      },
      {
        id: "bovinos_vaca_adulta_lactacion",
        nombre: "Vaca Adulta en lactación",
        descripcion: "Vacas adultas en período de lactación",
        tipo_categoria: "EDAD",
        tipo_concurso: "Bovinos",
        es_estandar: true,
        uso_estimado: 35,
      },
      {
        id: "bovinos_vacas_seca_unica",
        nombre: "Vacas en seca (Categoría Única)",
        descripcion: "Vacas que no están en período de lactación",
        tipo_categoria: "EDAD",
        tipo_concurso: "Bovinos",
        es_estandar: true,
        uso_estimado: 28,
      },

      // Ovinos
      {
        id: "ovinos_corderos_machos",
        nombre: "Corderos Machos",
        descripcion: "Corderos machos hasta 12 meses",
        tipo_categoria: "EDAD",
        tipo_concurso: "Ovinos",
        es_estandar: true,
        uso_estimado: 22,
      },
      {
        id: "ovinos_ovejas_adultas",
        nombre: "Ovejas Adultas",
        descripcion: "Ovejas adultas reproductoras",
        tipo_categoria: "EDAD",
        tipo_concurso: "Ovinos",
        es_estandar: true,
        uso_estimado: 18,
      },

      // Cuyes
      {
        id: "cuyes_reproductores_machos",
        nombre: "Reproductores Machos",
        descripcion: "Cuyes machos reproductores",
        tipo_categoria: "PESO",
        tipo_concurso: "Cuyes",
        es_estandar: true,
        uso_estimado: 15,
      },
      {
        id: "cuyes_pelaje_liso",
        nombre: "Pelaje Liso",
        descripcion: "Cuyes con pelaje liso",
        tipo_categoria: "CALIDAD",
        tipo_concurso: "Cuyes",
        es_estandar: true,
        uso_estimado: 12,
      },

      // Productos Lácteos
      {
        id: "lacteos_quesos_frescos",
        nombre: "Quesos Frescos",
        descripcion: "Quesos frescos artesanales",
        tipo_categoria: "PRODUCTO",
        tipo_concurso: "Lácteos",
        es_estandar: true,
        uso_estimado: 25,
      },
      {
        id: "lacteos_quesos_madurados",
        nombre: "Quesos Madurados",
        descripcion: "Quesos con proceso de maduración",
        tipo_categoria: "PRODUCTO",
        tipo_concurso: "Lácteos",
        es_estandar: true,
        uso_estimado: 20,
      },

      // Café
      {
        id: "cafe_arabica_especial",
        nombre: "Café Arábica Especial",
        descripcion: "Café arábica de calidad especial",
        tipo_categoria: "VARIEDAD",
        tipo_concurso: "Cafetero",
        es_estandar: true,
        uso_estimado: 18,
      },
      {
        id: "cafe_organico",
        nombre: "Café Orgánico",
        descripcion: "Café con certificación orgánica",
        tipo_categoria: "CALIDAD",
        tipo_concurso: "Cafetero",
        es_estandar: true,
        uso_estimado: 14,
      },
    ]

    return NextResponse.json({ plantillas })
  } catch (error) {
    console.error("Error fetching plantillas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
