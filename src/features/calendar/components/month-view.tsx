'use client'

import { CalendarEntry } from '@/services/supabase/calendar-services'
import { EVENT_TYPE_CONFIG } from '@/features/calendar/components/event-type-config'
import { cn, toLocalDateStr } from '@/lib/utils'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_PILLS = 3

interface Props {
  viewedMonth: Date
  entriesByDate: Map<string, CalendarEntry[]>
  onDayClick: (day: Date) => void
}

export function MonthView({ viewedMonth, entriesByDate, onDayClick }: Props) {
  const monthEndDate = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0)
  const firstWeekday = viewedMonth.getDay()
  const daysInMonth = monthEndDate.getDate()
  const todayStr = toLocalDateStr(new Date())

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), i + 1)),
  ]

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {WEEKDAY_LABELS.map((w) => (
        <div key={w} className="text-center text-[11px] font-medium text-muted-foreground pb-1">{w}</div>
      ))}
      {cells.map((day, i) => {
        if (!day) return <div key={`blank-${i}`} />
        const dateStr = toLocalDateStr(day)
        const entries = entriesByDate.get(dateStr) ?? []
        const isToday = dateStr === todayStr
        return (
          <button
            key={dateStr}
            onClick={() => onDayClick(day)}
            className={cn(
              'rounded-md border p-1.5 min-h-20 flex flex-col items-start text-left hover:bg-muted/40 transition-colors',
              isToday ? 'border-[#0244C6]' : 'border-transparent'
            )}
          >
            <span className={cn('text-xs font-medium mb-1', isToday && 'text-[#0244C6] font-bold')}>{day.getDate()}</span>
            <div className="space-y-0.5 w-full">
              {entries.slice(0, MAX_PILLS).map((entry) => {
                const config = EVENT_TYPE_CONFIG[entry.event_type]
                return (
                  <div key={entry.id} className={cn('text-[10px] px-1 py-0.5 rounded truncate w-full', config.pill)}>
                    {entry.title}
                  </div>
                )
              })}
              {entries.length > MAX_PILLS && (
                <div className="text-[10px] text-muted-foreground px-1">+{entries.length - MAX_PILLS} more</div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
