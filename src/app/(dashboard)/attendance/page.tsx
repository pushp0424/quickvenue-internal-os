'use client'

import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useProfileIdsForTeam } from '@/features/attendance/hooks/use-attendance'
import { AttendanceCalendar } from '@/features/attendance/components/attendance-calendar'
import { TeamAttendanceList } from '@/features/attendance/components/team-attendance-list'
import { SectionHeader } from '@/components/shared/section-header'

export default function AttendancePage() {
  const { user } = useAuth()
  const roles = user?.roles ?? []

  const canViewAll = hasPermission(roles, 'MANAGE_HR')
  const isCityLead = !canViewAll && roles.includes('city_lead')
  const isTeamLead = !canViewAll && !isCityLead && roles.includes('team_lead')

  const { data: teamProfileIds } = useProfileIdsForTeam(isTeamLead ? (user?.profile.team ?? null) : null)

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Check in, check out, and track your attendance history</p>
      </div>

      <div>
        <SectionHeader title="My Attendance" subtitle="Your check-in/check-out history for the month" />
        <div className="mt-4">
          <AttendanceCalendar />
        </div>
      </div>

      {(canViewAll || isCityLead || isTeamLead) && (
        <div>
          <TeamAttendanceList
            scope={canViewAll ? 'all' : isCityLead ? 'city' : 'team'}
            fixedCityId={isCityLead ? (user?.profile.city_id ?? undefined) : undefined}
            teamProfileIds={isTeamLead ? (teamProfileIds ?? []) : undefined}
          />
        </div>
      )}
    </div>
  )
}
