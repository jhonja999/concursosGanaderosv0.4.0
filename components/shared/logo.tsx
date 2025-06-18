import Link from "next/link"
import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "default" | "compact" | "text-only"
  size?: "sm" | "md" | "lg"
  href?: string
  className?: string
  showText?: boolean
}

export function Logo({ variant = "default", size = "md", href = "/", className, showText = true }: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: "size-6",
      text: "text-lg",
      container: "gap-2",
    },
    md: {
      icon: "size-8",
      text: "text-xl",
      container: "gap-3",
    },
    lg: {
      icon: "size-10",
      text: "text-2xl",
      container: "gap-4",
    },
  }

  const currentSize = sizeClasses[size]

  const LogoContent = () => (
    <div className={cn("flex items-center font-bold text-viridian", currentSize.container, className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-viridian text-white",
          currentSize.icon,
          variant === "compact" && "rounded-full",
        )}
      >
        <Crown className={cn(variant === "compact" ? "size-3" : "size-4")} />
      </div>

      {showText && variant !== "compact" && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-bold", currentSize.text)}>Lo Mejor de Mi Tierra</span>
          {variant === "default" && size !== "sm" && (
            <span className="text-xs text-muted-foreground font-normal">Concursos Ganaderos</span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}

// Variantes específicas para casos comunes
export function LogoCompact({ className, ...props }: Omit<LogoProps, "variant">) {
  return <Logo variant="compact" showText={false} className={className} {...props} />
}

export function LogoText({ className, ...props }: Omit<LogoProps, "variant">) {
  return <Logo variant="text-only" className={className} {...props} />
}
