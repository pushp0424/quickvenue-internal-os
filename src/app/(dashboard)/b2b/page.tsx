'use client'

import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { SectionHeader } from '@/components/shared/section-header'
import { B2BStageStatsBar } from '@/features/b2b/components/b2b-stage-stats-bar'
import { B2BCrmBoard } from '@/features/b2b/components/b2b-crm-board'
import { AddB2BLeadModal } from '@/features/b2b/components/add-b2b-lead-modal'

export default function B2BDashboard() {
  const { user } = useAuth()
  const scoped = isCityScoped(user?.roles ?? [])

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

      <B2BStageStatsBar />

      <div>
        <SectionHeader title="Leads" subtitle="All venue leads in the B2B acquisition pipeline" />
        <div className="mt-4">
          <B2BCrmBoard />
        </div>
      </div>
    </div>
  )
}
