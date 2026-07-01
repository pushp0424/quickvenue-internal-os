import { Badge } from '@/components/ui/badge'
import { LeadStatus } from '@/types/database.types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new:         { label: 'New',         className: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' },
  contacted:   { label: 'Contacted',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  interested:  { label: 'Interested',  className: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' },
  negotiating: { label: 'Negotiating', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  won:         { label: 'Won',         className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  lost:        { label: 'Lost',        className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  on_hold:     { label: 'On Hold',     className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge className={cn('text-xs font-medium border-0', config.className)}>
      {config.label}
    </Badge>
  )
}