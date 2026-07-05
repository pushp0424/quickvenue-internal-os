'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useMyAttendance } from '@/features/attendance/hooks/use-attendance'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, toLocalDateStr } from '@/lib/utils'

interface AttendanceRecord {
  date: string
  work_mode: string
  is_late: boolean
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_STYLES: Record<string, string> = {
  present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  wfh: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  field_visit: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  absent: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  weekend: 'text-muted-foreground/50',
  future: 'text-muted-foreground/30',
}

function statusFor(dateStr: string, dayDate: Date, todayStr: string, byDate: Map<string, AttendanceRecord>) {
  if (dateStr > todayStr) return { key: 'future', label: '' }
  const record = byDate.get(dateStr)
  if (record) {
    if (record.work_mode === 'wfh') return { key: 'wfh', label: 'WFH' }
    if (record.work_mode === 'field_visit') return { key: 'field_visit', label: 'Field' }
    if (record.is_late) return { key: 'late', label: 'Late' }
    return { key: 'present', label: 'Present' }
  }
  const day = dayDate.getDay()
  if (day === 0 || day === 6) return { key: 'weekend', label: '' }
  return { key: 'absent', label: 'Absent' }
}

export function AttendanceCalendar() {
  const { user } = useAuth()
  const profileId = user?.profile.id ?? ''
  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const monthStart = toLocalDateStr(viewedMonth)
  const monthEndDate = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0)
  const monthEnd = toLocalDateStr(monthEndDate)

  const { data: records, isLoading } = useMyAttendance(profileId, monthStart, monthEnd)

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>()
    ;(records ?? []).forEach((r) => map.set(r.date, r as AttendanceRecord))
    return map
  }, [records])

  const todayStr = toLocalDateStr(new Date())
  const firstWeekday = viewedMonth.getDay()
  const daysInMonth = monthEndDate.getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), i + 1)),
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">
            {viewedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewedMonth(new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1))}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewedMonth(new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1))}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w} className="text-center text-[11px] font-medium text-muted-foreground pb-1">{w}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`blank-${i}`} />
              const dateStr = toLocalDateStr(day)
              const status = statusFor(dateStr, day, todayStr, byDate)
              return (
                <div
                  key={dateStr}
                  className={cn('rounded-md aspect-square flex flex-col items-center justify-center text-xs font-medium', STATUS_STYLES[status.key])}
                  title={status.label}
                >
                  <span>{day.getDate()}</span>
                  {status.label && <span className="text-[9px] leading-tight">{status.label}</span>}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
