import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  sent:      { label: 'Sent',      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  paid:      { label: 'Paid',      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  overdue:   { label: 'Overdue',   className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 line-through' },
}

export function InvoiceStatusBadge({ status }: { status: string | null }) {
  const config = status && status in INVOICE_STATUS_CONFIG ? INVOICE_STATUS_CONFIG[status as InvoiceStatus] : null
  return (
    <Badge className={cn('text-xs font-medium border-0', config?.className ?? INVOICE_STATUS_CONFIG.draft.className)}>
      {config?.label ?? 'Unknown'}
    </Badge>
  )
}
