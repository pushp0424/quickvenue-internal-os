'use client'

import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { RecentTeamTable } from '@/features/dashboard/components/recent-team-table'
import { RoleBreakdownCard } from '@/features/dashboard/components/role-breakdown-card'
import { useTeamStats, useTeamByRole } from '@/features/dashboard/hooks/use-dashboard-stats'
import { Users, UserCheck, UserX, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useTeamStats()
  const { data: roles, isLoading: rolesLoading } = useTeamByRole()

  const inactive = (stats?.total ?? 0) - (stats?.active ?? 0)

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage users and operations</p>
        </div>
        <Button asChild className="bg-[#0244C6] hover:bg-[#012775]">
          <Link href="/admin/team">Manage Team</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={stats?.total ?? 0} icon={Users}
          iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={isLoading} />
        <StatCard label="Active Members" value={stats?.active ?? 0} icon={UserCheck}
          iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={isLoading} />
        <StatCard label="Inactive Members" value={inactive} icon={UserX}
          iconColor="text-red-500" iconBg="bg-red-50 dark:bg-red-950" loading={isLoading} />
        <StatCard label="Total Roles" value={Object.keys(roles ?? {}).length} icon={Shield}
          iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950" loading={rolesLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader title="Recent Team Members" />
          <div className="mt-4">
            <RecentTeamTable />
          </div>
        </div>
        <div>
          <RoleBreakdownCard data={roles ?? {}} loading={rolesLoading} />
        </div>
      </div>
    </div>
  )
}