'use client'

import { useAuth } from '@/context/auth-provider'
import { useB2BLeads } from '@/features/b2b/hooks/use-b2b-leads'
import { useB2CLeads } from '@/features/b2c/hooks/use-b2c-leads'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { B2BLeadsTable } from '@/features/b2b/components/b2b-leads-table'
import { B2CLeadsTable } from '@/features/b2c/components/b2c-leads-table'
import { AddB2BLeadModal } from '@/features/b2b/components/add-b2b-lead-modal'
import { AddB2CLeadModal } from '@/features/b2c/components/add-b2c-lead-modal'
import { Building2, Users, ListChecks, CheckCircle2 } from 'lucide-react'

const B2B_WON_STAGES = ['onboarded']
const B2C_WON_STAGES = ['booked', 'completed']

export default function MyCRMDashboard() {
  const { user } = useAuth()
  const userId = user?.profile.id

  const { data: myB2BLeads, isLoading: b2bLoading } = useB2BLeads(
    { assignedTo: userId },
    { enabled: !!userId }
  )
  const { data: myB2CLeads, isLoading: b2cLoading } = useB2CLeads(
    { assignedTo: userId },
    { enabled: !!userId }
  )

  const b2bTotal = myB2BLeads?.length ?? 0
  const b2cTotal = myB2CLeads?.length ?? 0
  const totalLeads = b2bTotal + b2cTotal

  const won =
    (myB2BLeads ?? []).filter((l) => B2B_WON_STAGES.includes(l.pipeline_stage)).length +
    (myB2CLeads ?? []).filter((l) => B2C_WON_STAGES.includes(l.pipeline_stage)).length

  const isLoading = b2bLoading || b2cLoading

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My CRM</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your assigned leads across the B2B and B2C pipelines
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="My Total Leads" value={totalLeads} icon={ListChecks}
          iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={isLoading} />
        <StatCard label="My B2B Leads" value={b2bTotal} icon={Building2}
          iconColor="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950" loading={isLoading} />
        <StatCard label="My B2C Leads" value={b2cTotal} icon={Users}
          iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" loading={isLoading} />
        <StatCard label="Won / Booked" value={won} icon={CheckCircle2}
          iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={isLoading} />
      </div>

      {/* B2B */}
      <div>
        <SectionHeader
          title="My B2B Leads"
          subtitle="Venue acquisition leads assigned to you"
          action={<AddB2BLeadModal />}
        />
        <div className="mt-4">
          <B2BLeadsTable assignedToMe />
        </div>
      </div>

      {/* B2C */}
      <div>
        <SectionHeader
          title="My B2C Leads"
          subtitle="Customer sales leads assigned to you"
          action={<AddB2CLeadModal />}
        />
        <div className="mt-4">
          <B2CLeadsTable assignedToMe />
        </div>
      </div>
    </div>
  )
}
