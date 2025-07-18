import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { HomeNavbar } from "@/components/shared/HomeNavbar"
import { SiteFooter } from "@/components/shared/site-footer"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lo Mejor de Mi Tierra - Concursos Ganaderos",
  description:
    "Plataforma líder para concursos ganaderos en Cajamarca. Reconocemos tu dedicación y pasión por tus animales.",
  keywords: "concursos ganaderos, ganado, Cajamarca, agricultura, ganadería, concursos, animales",
  authors: [{ name: "Lo Mejor de Mi Tierra" }],
  creator: "Lo Mejor de Mi Tierra",
  publisher: "Lo Mejor de Mi Tierra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lo Mejor de Mi Tierra - Concursos Ganaderos",
    description:
      "Plataforma líder para concursos ganaderos en Cajamarca. Reconocemos tu dedicación y pasión por tus animales.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Lo Mejor de Mi Tierra",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lo Mejor de Mi Tierra - Concursos Ganaderos",
    description:
      "Plataforma líder para concursos ganaderos en Cajamarca. Reconocemos tu dedicación y pasión por tus animales.",
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
    google: "your-google-verification-code",
  },
}

async function getUserSession() {
  try {
    const headersList = await headers()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/me`, {
      headers: {
        Cookie: headersList.get("cookie") || "",
      },
      cache: "no-store",
    })

    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error("Error fetching user session:", error)
  }
  return null
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const isAdminRoute = pathname.startsWith("/admin")

  // Get user session for navbar
  const user = await getUserSession()

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {!isAdminRoute && <HomeNavbar user={user} />}
          {children}
          {!isAdminRoute && <SiteFooter />}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
