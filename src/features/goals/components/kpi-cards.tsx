'use client'

import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useSalesKPIs, useHRKPIs } from '@/features/goals/hooks/use-kpis'
import { StatCard } from '@/components/shared/stat-card'
import { getWeekStart, getWeekEnd, toLocalDateStr } from '@/lib/utils'
import { Phone, UserPlus, FileCheck2, CalendarCheck, UserCog } from 'lucide-react'

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return toLocalDateStr(d)
}

export function KPICards() {
  const { user } = useAuth()
  const roles = user?.roles ?? []
  const profileId = user?.profile.id ?? ''
  const isSales = hasPermission(roles, 'ADD_LEADS')
  const isHR = hasPermission(roles, 'MANAGE_HR')

  const weekStart = toLocalDateStr(getWeekStart(new Date()))
  const weekEnd = toLocalDateStr(getWeekEnd(new Date()))
  const weekEndExclusive = addDays(weekEnd, 1)

  const { data: salesKPIs, isLoading: salesLoading } = useSalesKPIs(profileId, weekStart, weekEndExclusive)
  const { data: hrKPIs, isLoading: hrLoading } = useHRKPIs(weekStart, weekEnd)

  if (!isSales && !isHR) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {isSales && (
        <>
          <StatCard
            label="Calls Made"
            value={salesKPIs?.callsMade ?? 0}
            sub="This week"
            icon={Phone}
            iconColor="text-blue-600"
            iconBg="bg-blue-50 dark:bg-blue-950"
            loading={salesLoading}
          />
          <StatCard
            label="Leads Added"
            value={salesKPIs?.leadsAdded ?? 0}
            sub="This week"
            icon={UserPlus}
            iconColor="text-purple-600"
            iconBg="bg-purple-50 dark:bg-purple-950"
            loading={salesLoading}
          />
          <StatCard
            label="Agreements Signed"
            value={salesKPIs?.agreementsSigned ?? 0}
            sub="This week"
            icon={FileCheck2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50 dark:bg-emerald-950"
            loading={salesLoading}
          />
        </>
      )}
      {isHR && (
        <>
          <StatCard
            label="Attendance %"
            value={`${hrKPIs?.attendancePct ?? 0}%`}
            sub="This week, org-wide"
            icon={CalendarCheck}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50 dark:bg-emerald-950"
            loading={hrLoading}
          />
          <StatCard
            label="Hiring Done"
            value={hrKPIs?.hiringDone ?? 0}
            sub="Joined this week"
            icon={UserCog}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50 dark:bg-indigo-950"
            loading={hrLoading}
          />
        </>
      )}
    </div>
  )
}
