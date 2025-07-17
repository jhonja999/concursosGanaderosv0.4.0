import GanadoresPageClient from "./GanadoresPageClient"

export const metadata = {
  title: "Ganadores - Lo Mejor de Mi Tierra Cajamarca",
  description:
    "Conoce a los ganadores y campeones de los concursos ganaderos de Cajamarca. Salón de la fama con los mejores ejemplares y criadores de la región.",
  openGraph: {
    title: "Ganadores - Lo Mejor de Mi Tierra Cajamarca",
    description: "Salón de la fama de los concursos ganaderos de Cajamarca",
    type: "website",
  },
}

export default function GanadoresPage() {
  return <GanadoresPageClient />
}
