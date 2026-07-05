'use client'

import { use } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useSlip } from '@/features/payroll/hooks/use-payroll'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Printer } from 'lucide-react'

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export default function SalarySlipPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { data: slip, isLoading } = useSlip(id)

  const canView = !!slip && (slip.profile_id === user?.profile.id || hasPermission(user?.roles ?? [], 'MANAGE_HR'))

  if (isLoading) {
    return (
      <div className="max-w-[700px] mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!slip || !canView) return null

  const monthLabel = slip.payroll?.month
    ? new Date(slip.payroll.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/payroll" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Payroll
        </Link>
        <Button className="gap-2 bg-[#0244C6] hover:bg-[#012775]" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Quick Venue OS</h1>
              <p className="text-sm text-muted-foreground mt-1">Salary Slip — {monthLabel}</p>
            </div>
            <p className="text-sm font-semibold">{slip.profile?.full_name}</p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="flex justify-between px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground">
              <span>Earnings</span>
              <span>Amount</span>
            </div>
            {[
              ['Basic', slip.basic],
              ['HRA', slip.hra],
              ['DA', slip.da],
              ['Allowances', slip.allowances],
              ['Commission', slip.commission],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between px-4 py-2 text-sm border-t">
                <span>{label}</span>
                <span>{inr(Number(value))}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-2 text-sm border-t font-semibold">
              <span>Gross Pay</span>
              <span>{inr(slip.gross_pay)}</span>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="flex justify-between px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground">
              <span>Deductions</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between px-4 py-2 text-sm border-t">
              <span>Loss of Pay ({slip.lop_days} day{slip.lop_days !== 1 ? 's' : ''})</span>
              <span>{inr(slip.lop_amount)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 text-sm border-t">
              <span>Other Deductions</span>
              <span>{inr(slip.deductions)}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-56 flex justify-between text-base font-semibold border-t pt-3">
              <span>Net Pay</span>
              <span>{inr(slip.net_pay)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
