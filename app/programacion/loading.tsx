import { ImageGridSkeleton } from "@/components/shared/loading-skeleton"

export default function ProgramacionLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs skeleton */}
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Weather banner skeleton */}
        <div className="h-20 w-full bg-gray-200 rounded-lg animate-pulse mb-6" />

        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-10 w-80 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse hidden sm:block" />
        </div>

        {/* Info card skeleton */}
        <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse mb-8" />

        {/* Images grid skeleton */}
        <ImageGridSkeleton items={6} />
      </div>
    </div>
  )
}
