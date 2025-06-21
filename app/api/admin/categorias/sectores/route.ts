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

    // Simulamos los datos hasta que tengamos las tablas creadas
    const sectores = [
      {
        id: "ganadero",
        nombre: "Sector Ganadero",
        descripcion: "Concursos de ganado y animales de granja",
        icono: "🐄",
        tipos_concurso: [
          {
            id: "bovinos",
            nombre: "Concursos Bovinos",
            descripcion: "Concursos de ganado bovino por razas y categorías",
            permite_categorias_personalizadas: true,
            categorias_count: 13,
            razas_count: 14,
          },
          {
            id: "ovinos",
            nombre: "Concursos Ovinos",
            descripcion: "Concursos de ganado ovino",
            permite_categorias_personalizadas: true,
            categorias_count: 8,
            razas_count: 7,
          },
          {
            id: "equinos",
            nombre: "Concursos Equinos",
            descripcion: "Concursos de caballos y equinos",
            permite_categorias_personalizadas: true,
            categorias_count: 6,
            razas_count: 6,
          },
          {
            id: "cuyes",
            nombre: "Concursos de Cuyes",
            descripcion: "Concursos de cuyes con categorías flexibles",
            permite_categorias_personalizadas: true,
            categorias_count: 12,
            razas_count: 3,
          },
        ],
      },
      {
        id: "productos",
        nombre: "Sector Productos",
        descripcion: "Concursos de productos agropecuarios",
        icono: "🥛",
        tipos_concurso: [
          {
            id: "lacteos",
            nombre: "Productos Lácteos",
            descripcion: "Concursos de quesos, yogurt, mantequilla",
            permite_categorias_personalizadas: true,
            categorias_count: 15,
            razas_count: 0,
          },
          {
            id: "cafetero",
            nombre: "Concurso Cafetero",
            descripcion: "Concursos de café por región y calidad",
            permite_categorias_personalizadas: true,
            categorias_count: 8,
            razas_count: 2,
          },
        ],
      },
      {
        id: "artesanal",
        nombre: "Sector Artesanal",
        descripcion: "Productos artesanales y tradicionales",
        icono: "🧀",
        tipos_concurso: [
          {
            id: "textiles",
            nombre: "Productos Textiles",
            descripcion: "Artesanías textiles tradicionales",
            permite_categorias_personalizadas: true,
            categorias_count: 6,
            razas_count: 0,
          },
        ],
      },
    ]

    return NextResponse.json({ sectores })
  } catch (error) {
    console.error("Error fetching sectores:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
