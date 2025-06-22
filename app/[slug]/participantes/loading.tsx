import { LoadingSpinner } from "@/components/shared/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
