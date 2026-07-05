'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { toLocalDateStr } from '@/lib/utils'
import { useTeamAttendance, useProfileIdsForTeam } from '@/features/attendance/hooks/use-attendance'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Printer } from 'lucide-react'

const WORK_MODE_LABELS: Record<string, string> = {
  office: 'Office', wfh: 'WFH', field_visit: 'Field Visit',
}

function formatTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export default function AttendanceReportPage() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') ?? toLocalDateStr(new Date())
  const { user } = useAuth()
  const roles = user?.roles ?? []

  const canViewAll = hasPermission(roles, 'MANAGE_HR')
  const isCityLead = !canViewAll && roles.includes('city_lead')
  const isTeamLead = !canViewAll && !isCityLead && roles.includes('team_lead')

  const { data: teamProfileIds } = useProfileIdsForTeam(isTeamLead ? (user?.profile.team ?? null) : null)
  const enabled = !isTeamLead || !!(teamProfileIds && teamProfileIds.length > 0)

  const { data: records, isLoading } = useTeamAttendance({
    cityId: isCityLead ? (user?.profile.city_id ?? undefined) : undefined,
    profileIds: isTeamLead ? (teamProfileIds ?? []) : undefined,
    monthStart: date,
    monthEnd: date,
  }, enabled)

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/attendance" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Attendance
        </Link>
        <Button className="gap-2 bg-[#0244C6] hover:bg-[#012775]" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Quick Venue OS</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Attendance Report — {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !records || records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance records for this day.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Check In</th>
                  <th className="py-2 font-medium">Check Out</th>
                  <th className="py-2 font-medium">Late</th>
                  <th className="py-2 font-medium">Work Mode</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2">{r.profile?.full_name}</td>
                    <td className="py-2">{formatTime(r.check_in_at)}</td>
                    <td className="py-2">{formatTime(r.check_out_at)}</td>
                    <td className="py-2">{r.is_late ? 'Yes' : 'No'}</td>
                    <td className="py-2">{WORK_MODE_LABELS[r.work_mode] ?? r.work_mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
