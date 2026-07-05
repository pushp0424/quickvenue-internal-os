'use client'

import { useMemo, useState } from 'react'
import { useTeamLeaveCalendar } from '@/features/leave/hooks/use-leaves'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, toLocalDateStr } from '@/lib/utils'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  managerId?: string
}

export function TeamLeaveCalendar({ managerId }: Props) {
  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const monthStart = toLocalDateStr(viewedMonth)
  const monthEndDate = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0)
  const monthEnd = toLocalDateStr(monthEndDate)

  const { data: leaves, isLoading } = useTeamLeaveCalendar({ monthStart, monthEnd, managerId }, true)

  const namesByDate = useMemo(() => {
    const map = new Map<string, string[]>()
    ;(leaves ?? []).forEach((l) => {
      let cursor = new Date(l.start_date)
      const end = new Date(l.end_date)
      while (cursor <= end) {
        const key = toLocalDateStr(cursor)
        const names = map.get(key) ?? []
        names.push(l.profile?.full_name ?? 'Unknown')
        map.set(key, names)
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
      }
    })
    return map
  }, [leaves])

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
            Team Leave Calendar — {viewedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
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
              const names = namesByDate.get(dateStr) ?? []
              return (
                <div
                  key={dateStr}
                  className={cn(
                    'rounded-md aspect-square flex flex-col items-center justify-center text-xs font-medium border',
                    names.length > 0 ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300' : 'border-transparent'
                  )}
                  title={names.length > 0 ? names.join(', ') : undefined}
                >
                  <span>{day.getDate()}</span>
                  {names.length > 0 && <span className="text-[9px] leading-tight">{names.length} on leave</span>}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
