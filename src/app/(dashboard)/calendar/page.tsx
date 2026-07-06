'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import {
  useEvents, useCRMFollowUps, useTaskDeadlines, useBirthdays,
} from '@/features/calendar/hooks/use-calendar'
import { EventModal } from '@/features/calendar/components/event-modal'
import { MonthView } from '@/features/calendar/components/month-view'
import { WeekView } from '@/features/calendar/components/week-view'
import { DayView } from '@/features/calendar/components/day-view'
import { DayDetailSheet } from '@/features/calendar/components/day-detail-sheet'
import { EVENT_TYPE_CONFIG } from '@/features/calendar/components/event-type-config'
import { CalendarEntry } from '@/services/supabase/calendar-services'
import { Button } from '@/components/ui/button'
import {
  getWeekStart, getMonthStart, getDayStart, getDayEnd, toLocalDateStr, cn,
} from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ViewMode = 'month' | 'week' | 'day'
type FilterMode = 'mine' | 'all'

export default function CalendarPage() {
  const { user } = useAuth()
  const myId = user?.profile.id ?? ''
  const [view, setView] = useState<ViewMode>('month')
  const [filter, setFilter] = useState<FilterMode>('mine')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const { rangeStart, rangeEndExclusive } = useMemo(() => {
    if (view === 'month') {
      const start = getMonthStart(anchorDate)
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
      return { rangeStart: start, rangeEndExclusive: end }
    }
    if (view === 'week') {
      const start = getWeekStart(anchorDate)
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)
      return { rangeStart: start, rangeEndExclusive: end }
    }
    const start = getDayStart(anchorDate)
    return { rangeStart: start, rangeEndExclusive: getDayEnd(start) }
  }, [view, anchorDate])

  const rangeStartISO = rangeStart.toISOString()
  const rangeEndISO = rangeEndExclusive.toISOString()
  const rangeStartDateStr = toLocalDateStr(rangeStart)
  const rangeEndDateStr = toLocalDateStr(rangeEndExclusive)

  const { data: events, isLoading: eventsLoading } = useEvents(rangeStartISO, rangeEndISO)
  const { data: followUps, isLoading: followUpsLoading } = useCRMFollowUps(rangeStartDateStr, rangeEndDateStr)
  const { data: deadlines, isLoading: deadlinesLoading } = useTaskDeadlines(rangeStartISO, rangeEndISO)
  const { data: birthdays, isLoading: birthdaysLoading } = useBirthdays(rangeStart, rangeEndExclusive)

  const isLoading = eventsLoading || followUpsLoading || deadlinesLoading || birthdaysLoading

  const allEntries = useMemo(() => {
    const merged: CalendarEntry[] = [
      ...(events ?? []), ...(followUps ?? []), ...(deadlines ?? []), ...(birthdays ?? []),
    ]
    if (filter === 'all') return merged
    return merged.filter((e) =>
      e.event_type === 'birthday' ||
      e.event_type === 'holiday' ||
      e.created_by === myId ||
      e.attendees.some((a) => a.profile?.id === myId)
    )
  }, [events, followUps, deadlines, birthdays, filter, myId])

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    allEntries.forEach((entry) => {
      const key = entry.start_at.length === 10 ? entry.start_at : toLocalDateStr(new Date(entry.start_at))
      const list = map.get(key) ?? []
      list.push(entry)
      map.set(key, list)
    })
    return map
  }, [allEntries])

  function navigate(direction: -1 | 1) {
    setAnchorDate((d) => {
      if (view === 'month') return new Date(d.getFullYear(), d.getMonth() + direction, 1)
      if (view === 'week') return new Date(d.getFullYear(), d.getMonth(), d.getDate() + direction * 7)
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + direction)
    })
  }

  const dayEntries = selectedDay ? entriesByDate.get(toLocalDateStr(selectedDay)) ?? [] : []
  const todayEntries = entriesByDate.get(toLocalDateStr(anchorDate)) ?? []

  const headerLabel = view === 'month'
    ? anchorDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : view === 'week'
      ? `Week of ${getWeekStart(anchorDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
      : anchorDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Meetings, deadlines, follow-ups, and reminders in one place</p>
        </div>
        <EventModal />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[160px] text-center">{headerLabel}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setAnchorDate(new Date())}>Today</Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
              <Button
                key={v} size="sm" variant={view === v ? 'default' : 'outline'}
                className={cn('h-8 capitalize', view === v && 'bg-[#0244C6] hover:bg-[#012775]')}
                onClick={() => setView(v)}
              >
                {v}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {(['mine', 'all'] as FilterMode[]).map((f) => (
              <Button
                key={f} size="sm" variant={filter === f ? 'default' : 'outline'}
                className={cn('h-8', filter === f && 'bg-[#0244C6] hover:bg-[#012775]')}
                onClick={() => setFilter(f)}
              >
                {f === 'mine' ? 'My Events' : 'All Events'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('h-2 w-2 rounded-full', config.dot)} />
            {config.label}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="h-96 rounded-xl bg-muted/40 animate-pulse" />
      ) : view === 'month' ? (
        <MonthView viewedMonth={anchorDate} entriesByDate={entriesByDate} onDayClick={setSelectedDay} />
      ) : view === 'week' ? (
        <WeekView weekStart={getWeekStart(anchorDate)} entriesByDate={entriesByDate} onDayClick={setSelectedDay} />
      ) : (
        <DayView entries={todayEntries} />
      )}

      <DayDetailSheet date={selectedDay} entries={dayEntries} onClose={() => setSelectedDay(null)} />
    </div>
  )
}
