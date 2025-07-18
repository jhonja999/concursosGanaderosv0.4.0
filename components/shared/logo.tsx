import Link from "next/link"
import { cn } from "@/lib/utils"
import { Crown } from "lucide-react"

export interface LogoProps {
  variant?: "default" | "compact"
  size?: "sm" | "md" | "lg"
  href?: string | null
  className?: string
}

export function Logo({ variant = "default", size = "md", href = "/", className }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  const logoContent = (
    <div className={cn("font-bold text-emerald-600 flex items-center gap-2", sizeClasses[size], className)}>
      <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
        <Crown className="text-emerald-600" size={24} />
      </div>
      {variant === "default" && <span className="hidden sm:inline">Lo Mejor de Mi Tierra</span>}
      {variant === "compact" && <span className="hidden sm:inline">LMMT</span>}
    </div>
  )

  if (href === null) {
    return logoContent
  }

  return (
    <Link href={href} className="no-underline">
      {logoContent}
    </Link>
  )
}
