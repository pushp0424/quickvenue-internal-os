import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const B2C_STAGES = [
  'new_lead', 'qualified', 'venue_shared', 'site_visit',
  'negotiation', 'booked', 'completed', 'lost',
] as const

export type B2CStage = (typeof B2C_STAGES)[number]

export const STAGE_CONFIG: Record<B2CStage, { label: string; className: string }> = {
  new_lead:     { label: 'New Lead',     className: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' },
  qualified:    { label: 'Qualified',    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  venue_shared: { label: 'Venue Shared', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
  site_visit:   { label: 'Site Visit',   className: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' },
  negotiation:  { label: 'Negotiation',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  booked:       { label: 'Booked',       className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  completed:    { label: 'Completed',    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
  lost:         { label: 'Lost',         className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

export function B2CStageBadge({ stage }: { stage: string | null }) {
  const config = stage && stage in STAGE_CONFIG ? STAGE_CONFIG[stage as B2CStage] : null
  return (
    <Badge className={cn('text-xs font-medium border-0', config?.className ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
      {config?.label ?? 'Unknown'}
    </Badge>
  )
}
