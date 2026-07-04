import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const B2B_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type B2BPriority = (typeof B2B_PRIORITIES)[number]

const PRIORITY_CONFIG: Record<B2BPriority, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  high:   { label: 'High',   className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  low:    { label: 'Low',    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

export function B2BPriorityBadge({ priority }: { priority: string | null }) {
  const config = priority && priority in PRIORITY_CONFIG ? PRIORITY_CONFIG[priority as B2BPriority] : null
  if (!config) return null
  return (
    <Badge className={cn('text-[10px] font-medium border-0', config.className)}>
      {config.label}
    </Badge>
  )
}
