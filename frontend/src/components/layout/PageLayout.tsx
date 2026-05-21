import type { LucideIcon } from '../../lib/icons'
import type { ReactNode } from 'react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn } from '../../lib/utils'

type PageShellProps = {
  children: ReactNode
  className?: string
}

type PageHeaderProps = {
  actions?: ReactNode
  badges?: ReactNode
  description?: ReactNode
  kicker?: string
  title: string
}

type SummaryCardItem = {
  icon: LucideIcon
  label: string
  value: ReactNode
  detail?: ReactNode
}

type SummaryCardGridProps = {
  items: SummaryCardItem[]
}

type DataTableCardProps = {
  badge?: ReactNode
  children: ReactNode
  kicker?: string
  title: string
}

type FilterToolbarProps = {
  actions?: ReactNode
  children: ReactNode
  search?: ReactNode
}

type FormModalLayoutProps = {
  actions: ReactNode
  children: ReactNode
}

type DetailsPanelProps = {
  children: ReactNode
  className?: string
}

function PageShell({ children, className }: PageShellProps) {
  return <div className={cn('page-shell', className)}>{children}</div>
}

function PageHeader({ actions, badges, description, kicker, title }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {kicker ? <p className="section-kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {badges ? <div className="page-header-badges">{badges}</div> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  )
}

function SummaryCardGrid({ items }: SummaryCardGridProps) {
  return (
    <div className="summary-card-grid">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <Card className="summary-card" key={item.label}>
            <CardContent>
              <span className="stat-icon">
                <Icon aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="metric-label">{item.label}</p>
                <p className="stat-value">{item.value}</p>
                {item.detail ? <p className="stat-detail">{item.detail}</p> : null}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function DataTableCard({ badge, children, kicker, title }: DataTableCardProps) {
  return (
    <Card className="data-table-card">
      <CardHeader>
        <div>
          {kicker ? <p className="section-kicker">{kicker}</p> : null}
          <CardTitle>{title}</CardTitle>
        </div>
        {typeof badge === 'string' ? <Badge variant="secondary">{badge}</Badge> : badge}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function FilterToolbar({ actions, children, search }: FilterToolbarProps) {
  return (
    <Card className="filter-toolbar-card">
      <CardContent>
        <div className="filter-toolbar">
          {search ? <div className="filter-toolbar-search">{search}</div> : null}
          <div className="filter-toolbar-fields">{children}</div>
          {actions ? <div className="filter-toolbar-actions">{actions}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}

function FormModalLayout({ actions, children }: FormModalLayoutProps) {
  return (
    <div className="form-modal-layout">
      <div className="form-modal-body">{children}</div>
      <div className="modal-actions">{actions}</div>
    </div>
  )
}

function DetailsPanel({ children, className }: DetailsPanelProps) {
  return (
    <aside className={cn('details-panel', className)}>
      <div className="details-panel-inner">{children}</div>
    </aside>
  )
}

export {
  DataTableCard,
  DetailsPanel,
  FilterToolbar,
  FormModalLayout,
  PageHeader,
  PageShell,
  SummaryCardGrid,
}
