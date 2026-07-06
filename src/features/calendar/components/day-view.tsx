'use client'

import { CalendarEntry } from '@/services/supabase/calendar-services'
import { EVENT_TYPE_CONFIG } from '@/features/calendar/components/event-type-config'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, CalendarX2 } from 'lucide-react'

function formatTime(dateStr: string) {
  if (dateStr.length === 10) return 'All day'
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  entries: CalendarEntry[]
}

export function DayView({ entries }: Props) {
  const sorted = [...entries].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarX2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No events this day</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((entry) => {
        const config = EVENT_TYPE_CONFIG[entry.event_type]
        const Icon = config.icon
        return (
          <Card key={entry.id}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${config.pill}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{entry.title}</p>
                <p className="text-xs text-muted-foreground">{formatTime(entry.start_at)}</p>
                {entry.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {entry.location}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
