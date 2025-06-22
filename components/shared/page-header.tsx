import React from "react"
import Link from "next/link" // Import Link for breadcrumbs

// Define a type for individual breadcrumb items
export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbItems?: BreadcrumbItem[] // Ensure this prop is defined
  children?: React.ReactNode // For action buttons etc.
}

export function PageHeader({ title, description, breadcrumbItems, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <nav aria-label="breadcrumb" className="mb-2 text-sm text-muted-foreground">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <span className="mx-1">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>
    </div>
  )
}
