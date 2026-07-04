import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const B2B_STAGES = [
  'prospect', 'contacted', 'meeting',
  'negotiation', 'agreement', 'onboarded',
] as const

export type B2BStage = (typeof B2B_STAGES)[number]

export const STAGE_CONFIG: Record<B2BStage, { label: string; className: string }> = {
  prospect:    { label: 'Prospect',    className: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' },
  contacted:   { label: 'Contacted',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  meeting:     { label: 'Meeting',     className: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' },
  negotiation: { label: 'Negotiation', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  agreement:   { label: 'Agreement',   className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  onboarded:   { label: 'Onboarded',   className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
}

export function B2BStageBadge({ stage }: { stage: string | null }) {
  const config = stage && stage in STAGE_CONFIG ? STAGE_CONFIG[stage as B2BStage] : null
  return (
    <Badge className={cn('text-xs font-medium border-0', config?.className ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
      {config?.label ?? 'Unknown'}
    </Badge>
  )
}
