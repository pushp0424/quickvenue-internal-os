'use client'

import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useB2BStats } from '@/features/b2b/hooks/use-b2b-leads'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { B2BLeadsTable } from '@/features/b2b/components/b2b-leads-table'
import { AddB2BLeadModal } from '@/features/b2b/components/add-b2b-lead-modal'
import { Building2, Handshake, CheckCircle2, MessageSquare } from 'lucide-react'

export default function B2BDashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useB2BStats()

  const scoped = isCityScoped(user?.roles ?? [])

  const prospects = (stats?.prospect ?? 0) + (stats?.contacted ?? 0)
  const inProgress = (stats?.meeting ?? 0) + (stats?.negotiation ?? 0) + (stats?.agreement ?? 0)
  const onboarded = stats?.onboarded ?? 0
  const total = Object.values(stats ?? {}).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">B2B CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {scoped ? 'Venue acquisition pipeline for your city' : 'Venue acquisition pipeline across all cities'}
          </p>
        </div>
        <AddB2BLeadModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={total} icon={Building2}
          iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={isLoading} />
        <StatCard label="New / Contacted" value={prospects} icon={MessageSquare}
          iconColor="text-sky-600" iconBg="bg-sky-50 dark:bg-sky-950" loading={isLoading} />
        <StatCard label="In Progress" value={inProgress} icon={Handshake}
          iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" loading={isLoading} />
        <StatCard label="Onboarded" value={onboarded} icon={CheckCircle2}
          iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={isLoading} />
      </div>

      {/* Leads */}
      <div>
        <SectionHeader title="Leads" subtitle="All venue leads in the B2B acquisition pipeline" />
        <div className="mt-4">
          <B2BLeadsTable />
        </div>
      </div>
    </div>
  )
}
