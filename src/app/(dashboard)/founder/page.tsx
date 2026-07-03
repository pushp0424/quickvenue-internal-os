'use client'

import { useAuth } from '@/context/auth-provider'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { RecentTeamTable } from '@/features/dashboard/components/recent-team-table'
import { RoleBreakdownCard } from '@/features/dashboard/components/role-breakdown-card'
import { CityBreakdownCard } from '@/features/dashboard/components/city-breakdown-card'
import { QuickActionsCard } from '@/features/dashboard/components/quick-actions-card'
import { ActivityFeed } from '@/features/dashboard/components/activity-feed'
import {
  useTeamStats,
  useTeamByRole,
  useTeamByCity,
  useCRMSummary,
} from '@/features/dashboard/hooks/use-dashboard-stats'
import { Users, Building2, MapPin, TrendingUp } from 'lucide-react'

export default function FounderDashboard() {
  const { user } = useAuth()
  const { data: teamStats, isLoading: statsLoading } = useTeamStats()
  const { data: roleBreakdown, isLoading: roleLoading } = useTeamByRole()
  const { data: cityBreakdown, isLoading: cityLoading } = useTeamByCity()
  const { data: crmSummary, isLoading: crmLoading } = useCRMSummary()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.profile.full_name.split(' ')[0] ?? 'Founder'

  return (
    <div className="space-y-8 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here's what's happening at Quick Venue today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full w-fit">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          System operational
        </div>
      </div>

      {/* KPI Stats */}
      <div>
        <SectionHeader
          title="Overview"
          subtitle="Key metrics across your organisation"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
          <StatCard
            label="Total Team Members"
            value={teamStats?.total ?? 0}
            sub={`${teamStats?.active ?? 0} currently active`}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50 dark:bg-blue-950"
            loading={statsLoading}
          />
          <StatCard
            label="Total Venues"
            value={crmSummary?.totalVenues ?? 0}
            sub={`${crmSummary?.onboardedVenues ?? 0} onboarded`}
            icon={Building2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50 dark:bg-emerald-950"
            loading={crmLoading}
          />
          <StatCard
            label="Active Cities"
            value={Object.keys(cityBreakdown ?? {}).length}
            sub="Operational locations"
            icon={MapPin}
            iconColor="text-purple-600"
            iconBg="bg-purple-50 dark:bg-purple-950"
            loading={cityLoading}
          />
          <StatCard
            label="Total Leads"
            value={crmSummary?.totalLeads ?? 0}
            sub={`${crmSummary?.wonLeads ?? 0} won`}
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBg="bg-amber-50 dark:bg-amber-950"
            loading={crmLoading}
          />
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <SectionHeader
              title="Recent Team Members"
              subtitle="Last 5 people added to the platform"
            />
            <div className="mt-4">
              <RecentTeamTable />
            </div>
          </div>
          <div>
            <SectionHeader
              title="Activity Feed"
              subtitle="Recent actions across the system"
            />
            <div className="mt-4">
              <ActivityFeed />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActionsCard />
          <RoleBreakdownCard data={roleBreakdown ?? {}} loading={roleLoading} />
          <CityBreakdownCard data={cityBreakdown ?? {}} loading={cityLoading} />
        </div>
      </div>

    </div>
  )
}