import { WinnerGridSkeleton } from "@/components/shared/loading-skeleton"
import { Logo } from "@/components/shared/logo"
import { Trophy } from "lucide-react"

export default function GanadoresLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Logo className="text-white" size="lg" href={null} />
            </div>
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Trophy className="h-16 w-16 text-yellow-200" />
              </div>
            </div>
            <div className="h-12 w-96 bg-white/20 rounded animate-pulse mx-auto mb-4" />
            <div className="h-8 w-80 bg-white/20 rounded animate-pulse mx-auto mb-8" />
            <div className="h-20 w-full max-w-2xl bg-white/10 rounded-lg animate-pulse mx-auto" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumbs skeleton */}
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Weather banner skeleton */}
        <div className="h-20 w-full bg-gray-200 rounded-lg animate-pulse mb-8" />

        {/* Winners grid skeleton */}
        <WinnerGridSkeleton items={6} />
      </div>
    </div>
  )
}
