/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo } from 'react'
import { StatCard } from '@/components/shared/stat-card'
import { Users, Wallet, CheckCircle2, Clock } from 'lucide-react'

interface Props {
  slips: Record<string, any>[]
  loading?: boolean
}

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function PayrollSummaryCards({ slips, loading }: Props) {
  const stats = useMemo(() => {
    const totalGross = slips.reduce((s, r) => s + Number(r.gross_pay), 0)
    const totalNet = slips.reduce((s, r) => s + Number(r.net_pay), 0)
    const paid = slips.filter((r) => r.payment_status === 'paid').length
    const pending = slips.length - paid
    return { totalGross, totalNet, paid, pending, count: slips.length }
  }, [slips])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Employees" value={stats.count} icon={Users}
        iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={loading} />
      <StatCard label="Total Gross Pay" value={inr(stats.totalGross)} icon={Wallet}
        iconColor="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950" loading={loading} />
      <StatCard label="Total Net Pay" value={inr(stats.totalNet)} icon={Wallet}
        iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={loading} />
      <StatCard label="Paid / Pending" value={`${stats.paid} / ${stats.pending}`} icon={stats.pending === 0 ? CheckCircle2 : Clock}
        iconColor={stats.pending === 0 ? 'text-emerald-600' : 'text-amber-600'}
        iconBg={stats.pending === 0 ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-amber-50 dark:bg-amber-950'} loading={loading} />
    </div>
  )
}
