'use client'

import { useTeamMembers } from '@/features/team/hooks/use-team'
import { TeamTable } from '@/features/team/components/team-table'
import { AddMemberModal } from '@/features/team/components/add-member-modal'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { useTeamStats } from '@/features/dashboard/hooks/use-dashboard-stats'
import { Users, UserCheck, UserX, Shield } from 'lucide-react'
import { Toaster } from 'sonner'

export default function TeamManagementPage() {
  const { data: stats, isLoading: statsLoading } = useTeamStats()
  const { data: members } = useTeamMembers()

  const inactive = (stats?.total ?? 0) - (stats?.active ?? 0)
  const cities = new Set(
    (members ?? []).map((m) => m.city).filter(Boolean)
  ).size

  return (
    <div className="space-y-8 max-w-[1400px]">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add, manage, and control access for your team members
          </p>
        </div>
        <AddMemberModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={stats?.total ?? 0}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950"
          loading={statsLoading}
        />
        <StatCard
          label="Active Members"
          value={stats?.active ?? 0}
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950"
          loading={statsLoading}
        />
        <StatCard
          label="Inactive Members"
          value={inactive}
          icon={UserX}
          iconColor="text-red-500"
          iconBg="bg-red-50 dark:bg-red-950"
          loading={statsLoading}
        />
        <StatCard
          label="Cities Covered"
          value={cities}
          icon={Shield}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 dark:bg-purple-950"
          loading={statsLoading}
        />
      </div>

      {/* Team Table */}
      <div>
        <SectionHeader
          title="All Team Members"
          subtitle="Search, filter, manage roles and access"
        />
        <div className="mt-4">
          <TeamTable />
        </div>
      </div>
    </div>
  )
}