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

    // Simulamos las categorías base hasta que tengamos las tablas
    const categorias = [
      {
        id: "bovinos_dientes_leche",
        nombre: "A - Dientes de Leche",
        descripcion: "Animales jóvenes con dentición de leche",
        tipo_categoria: "EDAD",
        es_predefinida: true,
        subcategorias_count: 14,
        uso_en_concursos: 25,
      },
      {
        id: "bovinos_dos_dientes_seca",
        nombre: "B - Dos Dientes (Sin haber parido)",
        descripcion: "Hembras con dos dientes permanentes, sin historial reproductivo",
        tipo_categoria: "EDAD",
        es_predefinida: true,
        subcategorias_count: 14,
        uso_en_concursos: 18,
      },
      {
        id: "bovinos_por_raza",
        nombre: "Categorías por Raza Específica",
        descripcion: "Competencia específica por raza",
        tipo_categoria: "RAZA",
        es_predefinida: true,
        subcategorias_count: 84, // 14 razas x 6 subcategorías promedio
        uso_en_concursos: 45,
      },
      {
        id: "bovinos_mejor_ubre",
        nombre: "Mejor Ubre del Concurso",
        descripcion: "Evaluación específica de conformación de ubre",
        tipo_categoria: "CALIDAD",
        es_predefinida: true,
        subcategorias_count: 0,
        uso_en_concursos: 12,
      },
      {
        id: "lacteos_quesos_frescos",
        nombre: "Quesos Frescos",
        descripcion: "Categoría para quesos frescos artesanales",
        tipo_categoria: "PRODUCTO",
        es_predefinida: true,
        subcategorias_count: 8,
        uso_en_concursos: 15,
      },
      {
        id: "cafetero_arabica",
        nombre: "Café Arábica",
        descripcion: "Concurso específico de café arábica",
        tipo_categoria: "VARIEDAD",
        es_predefinida: true,
        subcategorias_count: 5,
        uso_en_concursos: 8,
      },
    ]

    return NextResponse.json({ categorias })
  } catch (error) {
    console.error("Error fetching categorias:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
