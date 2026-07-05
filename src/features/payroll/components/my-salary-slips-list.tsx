'use client'

import Link from 'next/link'
import { useMySlips } from '@/features/payroll/hooks/use-payroll'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, Printer } from 'lucide-react'

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
}

interface Props {
  profileId: string
}

export function MySalarySlipsList({ profileId }: Props) {
  const { data: slips, isLoading } = useMySlips(profileId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    )
  }

  if (!slips || slips.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No salary slips yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {slips.map((slip) => (
          <div key={slip.id} className="flex items-center gap-4 px-6 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {slip.payroll?.month ? new Date(slip.payroll.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Gross {inr(slip.gross_pay)} · Net {inr(slip.net_pay)}
              </p>
            </div>
            <Badge className={`text-xs border-0 shrink-0 ${STATUS_CONFIG[slip.payment_status]?.className ?? ''}`}>
              {STATUS_CONFIG[slip.payment_status]?.label ?? slip.payment_status}
            </Badge>
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
