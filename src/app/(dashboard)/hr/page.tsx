'use client'

import { useTeamStats, useTeamByRole, useTeamByCity } from '@/features/dashboard/hooks/use-dashboard-stats'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { RoleBreakdownCard } from '@/features/dashboard/components/role-breakdown-card'
import { CityBreakdownCard } from '@/features/dashboard/components/city-breakdown-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, UserCheck, UserX, Building } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function HRDashboard() {
  const { data: stats, isLoading } = useTeamStats()
  const { data: roles, isLoading: rolesLoading } = useTeamByRole()
  const { data: cities, isLoading: citiesLoading } = useTeamByCity()
  const { data: members, isLoading: membersLoading } = useTeamMembers()

  const inactive = (stats?.total ?? 0) - (stats?.active ?? 0)

  const recentMembers = (members ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Employee management and team overview
          </p>
        </div>
        <Button asChild className="bg-[#0244C6] hover:bg-[#012775]">
          <Link href="/admin/team">Manage Team</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Employees"
          value={stats?.total ?? 0}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950"
          loading={isLoading}
        />
        <StatCard
          label="Active"
          value={stats?.active ?? 0}
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950"
          loading={isLoading}
        />
        <StatCard
          label="Inactive"
          value={inactive}
          icon={UserX}
          iconColor="text-red-500"
          iconBg="bg-red-50 dark:bg-red-950"
          loading={isLoading}
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader
            title="Recent Joiners"
            subtitle="Latest 6 team members"
          />
          <Card className="mt-4">
            <CardContent className="p-0">
              {membersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-[#0244C6] text-white text-xs font-bold">
                      {initials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email}
                      {member.city && ` · ${member.city}`}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <div className="flex gap-1">
                      {member.roles.slice(0, 1).map((r) => (
                        <Badge key={r} variant="secondary" className="text-[10px]">
                          {r.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(member.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RoleBreakdownCard data={roles ?? {}} loading={rolesLoading} />
          <CityBreakdownCard data={cities ?? {}} loading={citiesLoading} />
        </div>
      </div>
    </div>
  )
}