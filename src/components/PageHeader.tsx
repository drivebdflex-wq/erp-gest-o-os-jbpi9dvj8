import { Fragment, ReactNode } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs: { label: string; href?: string }[]
  action?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="space-y-1">
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            {breadcrumbs.map((bc, i) => (
              <Fragment key={i}>
                <BreadcrumbItem>
                  {bc.href ? (
                    <BreadcrumbLink href={bc.href}>{bc.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
