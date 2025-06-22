"use client"

import type React from "react"
import type { LucideProps } from "lucide-react"
import { Button } from "@/components/ui/button" // Assuming Button is used internally

export interface EmptyStateProps {
  icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined
    icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
  }
}

export function EmptyState({ icon: IconComponent, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center min-h-[300px]">
      {IconComponent && <IconComponent className="w-16 h-16 mb-4 text-muted-foreground" />}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant={action.variant || "default"}>
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
