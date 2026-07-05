'use client'

import { useUpdateInvoiceStatus } from '@/features/finance/hooks/use-finance'
import { InvoiceStatusBadge, INVOICE_STATUSES, INVOICE_STATUS_CONFIG } from '@/features/finance/components/invoice-status-badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select'

interface Props {
  invoiceId: string
  status: string
}

export function InvoiceStatusSelect({ invoiceId, status }: Props) {
  const updateStatus = useUpdateInvoiceStatus()

  return (
    <Select
      value={status}
      onValueChange={(v) => updateStatus.mutate({ id: invoiceId, status: v })}
    >
      <SelectTrigger className="h-7 w-[130px] border border-input shadow-none px-1.5 cursor-pointer hover:border-ring transition-colors">
        <InvoiceStatusBadge status={status} />
      </SelectTrigger>
      <SelectContent position="popper">
        {INVOICE_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>{INVOICE_STATUS_CONFIG[s].label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
