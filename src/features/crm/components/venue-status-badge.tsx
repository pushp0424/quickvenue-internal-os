import { Badge } from '@/components/ui/badge'
import { VenueStatus } from '@/types/database.types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<VenueStatus, { label: string; className: string }> = {
  prospect:    { label: 'Prospect',    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  contacted:   { label: 'Contacted',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  negotiating: { label: 'Negotiating', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  onboarded:   { label: 'Onboarded',   className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  inactive:    { label: 'Inactive',    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

export function VenueStatusBadge({ status }: { status: VenueStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge className={cn('text-xs font-medium border-0', config.className)}>
      {config.label}
    </Badge>
  )
}