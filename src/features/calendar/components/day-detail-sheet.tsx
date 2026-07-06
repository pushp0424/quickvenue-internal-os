'use client'

import { useRouter } from 'next/navigation'
import { CalendarEntry } from '@/services/supabase/calendar-services'
import { useDeleteEvent } from '@/features/calendar/hooks/use-calendar'
import { EVENT_TYPE_CONFIG } from '@/features/calendar/components/event-type-config'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MapPin, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  if (dateStr.length === 10) return 'All day'
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  date: Date | null
  entries: CalendarEntry[]
  onClose: () => void
}

export function DayDetailSheet({ date, entries, onClose }: Props) {
  const router = useRouter()
  const deleteEvent = useDeleteEvent()

  async function handleDelete(id: string) {
    try {
      await deleteEvent.mutateAsync(id)
      toast.success('Event removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove event')
    }
  }

  function handleClick(entry: CalendarEntry) {
    if (entry.link) {
      onClose()
      router.push(entry.link)
    }
  }

  return (
    <Sheet open={!!date} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-[440px] w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {date?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </SheetTitle>
          <SheetDescription>{entries.length} event{entries.length !== 1 ? 's' : ''}</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No events this day</p>
          ) : (
            entries.map((entry) => {
              const config = EVENT_TYPE_CONFIG[entry.event_type]
              const Icon = config.icon
              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${entry.link ? 'cursor-pointer hover:bg-muted/40' : ''}`}
                  onClick={() => handleClick(entry)}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${config.pill}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{entry.title}</p>
                      {!entry.isVirtual && (
                        <Button
                          variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-600 shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTime(entry.start_at)}</p>
                    {entry.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {entry.location}
                      </p>
                    )}
                    {entry.notes && <p className="text-xs text-muted-foreground">{entry.notes}</p>}
                    {entry.attendees.length > 0 && (
                      <div className="flex -space-x-2 pt-1">
                        {entry.attendees.slice(0, 5).map((a, i) => (
                          <Avatar key={a.profile?.id ?? i} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="bg-[#0244C6] text-white text-[9px] font-bold">
                              {a.profile?.full_name ? initials(a.profile.full_name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
