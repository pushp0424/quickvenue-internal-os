'use client'

import { useState } from 'react'
import { useCreateEvent } from '@/features/calendar/hooks/use-calendar'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { EventType } from '@/services/supabase/calendar-services'
import { EVENT_TYPE_CONFIG } from '@/features/calendar/components/event-type-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Plus, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const EVENT_TYPES = Object.keys(EVENT_TYPE_CONFIG) as EventType[]

const DURATIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
  { value: 'all_day', label: 'All day' },
]

interface Props {
  defaultDate?: string
}

export function EventModal({ defaultDate }: Props) {
  const { data: teamMembers } = useTeamMembers()
  const createEvent = useCreateEvent()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '', eventType: 'meeting' as EventType,
    startAt: defaultDate ?? '', duration: '60',
    location: '', attendeeIds: [] as string[], notes: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleAttendee(id: string) {
    setForm((f) => ({
      ...f,
      attendeeIds: f.attendeeIds.includes(id) ? f.attendeeIds.filter((a) => a !== id) : [...f.attendeeIds, id],
    }))
  }

  function reset() {
    setForm({ title: '', eventType: 'meeting', startAt: defaultDate ?? '', duration: '60', location: '', attendeeIds: [], notes: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.startAt) {
      toast.error('Title and start date/time are required')
      return
    }

    const start = new Date(form.startAt)
    let end: Date
    if (form.duration === 'all_day') {
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59)
    } else {
      end = new Date(start.getTime() + Number(form.duration) * 60 * 1000)
    }

    setLoading(true)
    try {
      await createEvent.mutateAsync({
        title: form.title.trim(),
        eventType: form.eventType,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        location: form.location || undefined,
        notes: form.notes || undefined,
        attendeeIds: form.attendeeIds,
      })
      toast.success('Event created')
      setOpen(false)
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const selectedNames = (teamMembers ?? [])
    .filter((m) => form.attendeeIds.includes(m.id))
    .map((m) => m.full_name)

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#0244C6] hover:bg-[#012775]">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
          <DialogDescription>Schedule a meeting, interview, or reminder.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">Title <span className="text-red-500">*</span></Label>
            <Input id="event-title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.eventType} onValueChange={(v) => set('eventType', v as EventType)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{EVENT_TYPE_CONFIG[t].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={form.duration} onValueChange={(v) => set('duration', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-start">Date & Time <span className="text-red-500">*</span></Label>
            <Input id="event-start" type="datetime-local" value={form.startAt} onChange={(e) => set('startAt', e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-location">Location</Label>
            <Input id="event-location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Office, Zoom, venue address" />
          </div>

          <div className="space-y-1.5">
            <Label>Attendees</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between font-normal">
                  <span className="truncate">{selectedNames.length > 0 ? selectedNames.join(', ') : 'Select attendees'}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto w-[--radix-dropdown-menu-trigger-width]">
                {(teamMembers ?? []).map((m) => (
                  <DropdownMenuCheckboxItem
                    key={m.id}
                    checked={form.attendeeIds.includes(m.id)}
                    onCheckedChange={() => toggleAttendee(m.id)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {m.full_name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-notes">Notes</Label>
            <Textarea id="event-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} className="min-h-16" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
