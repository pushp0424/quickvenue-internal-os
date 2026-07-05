'use client'

import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useB2CStats } from '@/features/b2c/hooks/use-b2c-leads'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { B2CStageStatsBar } from '@/features/b2c/components/b2c-stage-stats-bar'
import { B2CCrmBoard } from '@/features/b2c/components/b2c-crm-board'
import { AddB2CLeadModal } from '@/features/b2c/components/add-b2c-lead-modal'
import { IndianRupee } from 'lucide-react'

export default function B2CDashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useB2CStats()

  const scoped = isCityScoped(user?.roles ?? [])
  const booked = (stats?.counts?.booked ?? 0) + (stats?.counts?.completed ?? 0)

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">B2C CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {scoped ? 'Customer sales pipeline for your city' : 'Customer sales pipeline across all cities'}
          </p>
        </div>
        <AddB2CLeadModal />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <div className="flex-1">
          <StatCard label="Pipeline Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
            sub={`${booked} booking${booked !== 1 ? 's' : ''} · Booked + Completed`}
            icon={IndianRupee} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={isLoading} />
        </div>
      </div>

      <B2CStageStatsBar />

      <div>
        <SectionHeader title="Leads" subtitle="All customer leads in the B2C sales pipeline" />
        <div className="mt-4">
          <B2CCrmBoard />
        </div>
      </div>
    </div>
  )
}
