import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SiteHeader } from "@/components/shared/site-header"
import { SiteFooter } from "@/components/shared/site-footer"

export const metadata: Metadata = {
  title: "Lo Mejor de Mi Tierra - Concursos Ganaderos Cajamarca",
  description:
    "Plataforma para la gestión de concursos ganaderos en Cajamarca, Perú. Registro de participantes, resultados y eventos ganaderos.",
  keywords: "concursos, ganadería, ganado, bovinos, equinos, porcinos, caprinos, ovinos, fongal, cajamarca, perú",
  authors: [{ name: "Lo Mejor de Mi Tierra" }],
  creator: "Lo Mejor de Mi Tierra",
  publisher: "Lo Mejor de Mi Tierra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Lo Mejor de Mi Tierra - Concursos Ganaderos Cajamarca",
    description:
      "Los mejores concursos ganaderos de Cajamarca, Perú. Participa y conoce a los mejores criadores de la región.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Lo Mejor de Mi Tierra",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lo Mejor de Mi Tierra - Concursos Ganaderos Cajamarca",
    description: "Los mejores concursos ganaderos de Cajamarca, Perú",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-nunito antialiased min-h-screen bg-gray-50">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="lomejordemitierra-theme"
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
