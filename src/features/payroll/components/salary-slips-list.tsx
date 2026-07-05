'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSlipsForRun, useUpdateSlip } from '@/features/payroll/hooks/use-payroll'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select'
import { Users, Printer } from 'lucide-react'
import { toast } from 'sonner'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
}

interface Props {
  payrollId: string | undefined
}

export function SalarySlipsList({ payrollId }: Props) {
  const { data: slips, isLoading } = useSlipsForRun(payrollId)
  const updateSlip = useUpdateSlip()
  const [deductionDrafts, setDeductionDrafts] = useState<Record<string, string>>({})

  async function handleStatusChange(id: string, paymentStatus: string) {
    try {
      await updateSlip.mutateAsync({ id, paymentStatus })
      toast.success('Payment status updated')
    } catch {
      toast.error('Failed to update payment status')
    }
  }

  async function handleSaveDeductions(id: string) {
    const draft = deductionDrafts[id]
    if (draft === undefined) return
    try {
      await updateSlip.mutateAsync({ id, deductions: Number(draft) })
      toast.success('Deductions updated')
    } catch {
      toast.error('Failed to update deductions')
    }
  }

  if (!payrollId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No payroll run selected</p>
          <p className="text-xs text-muted-foreground mt-1">Generate payroll for a month to see salary slips here.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    )
  }

  if (!slips || slips.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No slips in this run</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {slips.map((slip) => (
          <div key={slip.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="text-xs font-bold bg-[#0244C6] text-white">
                {initials(slip.profile?.full_name ?? '?')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-[160px]">
              <p className="text-sm font-semibold truncate">{slip.profile?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                Gross {inr(slip.gross_pay)} · LOP {slip.lop_days}d ({inr(slip.lop_amount)})
              </p>
            </div>
            <div className="w-28 shrink-0">
              <p className="text-[10px] text-muted-foreground">Deductions</p>
              <div className="flex gap-1">
                <Input
                  type="number"
                  className="h-8 text-xs"
                  defaultValue={slip.deductions}
                  onChange={(e) => setDeductionDrafts((d) => ({ ...d, [slip.id]: e.target.value }))}
                  onBlur={() => handleSaveDeductions(slip.id)}
                />
              </div>
            </div>
            <div className="text-right w-24 shrink-0">
              <p className="text-[10px] text-muted-foreground">Net Pay</p>
              <p className="text-sm font-bold">{inr(slip.net_pay)}</p>
            </div>
            <Select value={slip.payment_status} onValueChange={(v) => handleStatusChange(slip.id, v)}>
              <SelectTrigger className="h-8 w-[110px] shrink-0">
                <Badge className={`text-[10px] border-0 ${STATUS_CONFIG[slip.payment_status]?.className ?? ''}`}>
                  {STATUS_CONFIG[slip.payment_status]?.label ?? slip.payment_status}
                </Badge>
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild title="Print slip">
              <Link href={`/payroll/slips/${slip.id}`} target="_blank">
                <Printer className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

