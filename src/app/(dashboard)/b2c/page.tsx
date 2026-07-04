'use client'

import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useB2CStats } from '@/features/b2c/hooks/use-b2c-leads'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { B2CLeadsTable } from '@/features/b2c/components/b2c-leads-table'
import { AddB2CLeadModal } from '@/features/b2c/components/add-b2c-lead-modal'
import { Users, Handshake, CalendarCheck, IndianRupee } from 'lucide-react'

export default function B2CDashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useB2CStats()

  const scoped = isCityScoped(user?.roles ?? [])
  const counts = stats?.counts ?? {}

  const newLeads = (counts.new_lead ?? 0) + (counts.qualified ?? 0)
  const inProgress = (counts.venue_shared ?? 0) + (counts.site_visit ?? 0) + (counts.negotiation ?? 0)
  const booked = (counts.booked ?? 0) + (counts.completed ?? 0)

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats?.total ?? 0} icon={Users}
          iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={isLoading} />
        <StatCard label="New / Qualified" value={newLeads} icon={CalendarCheck}
          iconColor="text-sky-600" iconBg="bg-sky-50 dark:bg-sky-950" loading={isLoading} />
        <StatCard label="In Progress" value={inProgress} icon={Handshake}
          iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" loading={isLoading} />
        <StatCard label="Booked Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
          sub={`${booked} booking${booked !== 1 ? 's' : ''}`}
          icon={IndianRupee} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={isLoading} />
      </div>

      {/* Leads */}
      <div>
        <SectionHeader title="Leads" subtitle="All customer leads in the B2C sales pipeline" />
        <div className="mt-4">
          <B2CLeadsTable />
        </div>
      </div>
    </div>
  )
}
