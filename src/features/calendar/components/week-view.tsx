'use client'

import { CalendarEntry } from '@/services/supabase/calendar-services'
import { EVENT_TYPE_CONFIG } from '@/features/calendar/components/event-type-config'
import { cn, toLocalDateStr } from '@/lib/utils'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime(dateStr: string) {
  if (dateStr.length === 10) return 'All day'
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  weekStart: Date
  entriesByDate: Map<string, CalendarEntry[]>
  onDayClick: (day: Date) => void
}

export function WeekView({ weekStart, entriesByDate, onDayClick }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i))
  const todayStr = toLocalDateStr(new Date())

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, i) => {
        const dateStr = toLocalDateStr(day)
        const entries = entriesByDate.get(dateStr) ?? []
        const isToday = dateStr === todayStr
        return (
          <div key={dateStr} className="space-y-1.5">
            <button
              onClick={() => onDayClick(day)}
              className={cn(
                'w-full text-center rounded-md py-1.5 border',
                isToday ? 'border-[#0244C6] bg-[#0244C6]/10' : 'border-transparent hover:bg-muted/40'
              )}
            >
              <p className="text-[11px] font-medium text-muted-foreground">{WEEKDAY_LABELS[i]}</p>
              <p className={cn('text-sm font-semibold', isToday && 'text-[#0244C6]')}>{day.getDate()}</p>
            </button>
            <div className="space-y-1 min-h-24">
              {entries.map((entry) => {
                const config = EVENT_TYPE_CONFIG[entry.event_type]
                return (
                  <div key={entry.id} className={cn('text-[10px] px-1.5 py-1 rounded', config.pill)}>
                    <p className="truncate font-medium">{entry.title}</p>
                    <p className="opacity-75">{formatTime(entry.start_at)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
