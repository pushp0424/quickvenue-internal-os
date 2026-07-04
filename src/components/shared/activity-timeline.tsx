'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  StickyNote, Phone, MapPin, Mail, MessageCircle, RefreshCw, CalendarClock, Loader2,
} from 'lucide-react'
import { ActivityType } from '@/types/database.types'

const ACTIVITY_ICONS: Record<ActivityType, typeof StickyNote> = {
  note: StickyNote,
  call: Phone,
  visit: MapPin,
  email: Mail,
  whatsapp: MessageCircle,
  status_change: RefreshCw,
  follow_up_set: CalendarClock,
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  note: 'Note',
  call: 'Call',
  visit: 'Visit',
  email: 'Email',
  whatsapp: 'WhatsApp',
  status_change: 'Status Change',
  follow_up_set: 'Follow-up Set',
}

export interface Activity {
  id: string
  activity_type: string
  content: string
  created_at: string | null
  performer?: { full_name: string } | null
}

interface Props {
  activities: Activity[] | undefined
  isLoading: boolean
  onLog: (input: { activityType: ActivityType; content: string }) => Promise<void>
  isLogging: boolean
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

export function ActivityTimeline({ activities, isLoading, onLog, isLogging }: Props) {
  const [activityType, setActivityType] = useState<ActivityType>('note')
  const [content, setContent] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    await onLog({ activityType, content: content.trim() })
    setContent('')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
                <SelectTrigger className="w-[150px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((t) => (
                    <SelectItem key={t} value={t}>{ACTIVITY_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Log a call, note, visit, or update..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 min-h-9"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isLogging || !content.trim()} className="bg-[#0244C6] hover:bg-[#012775]">
                {isLogging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Log Activity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : !activities || activities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activity logged yet.
            </p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = (activity.activity_type in ACTIVITY_ICONS)
                    ? ACTIVITY_ICONS[activity.activity_type as ActivityType]
                    : StickyNote
                  return (
                    <div key={activity.id} className="flex gap-4 relative">
                      <div className="h-8 w-8 rounded-full bg-[#0244C6]/10 border-2 border-background flex items-center justify-center shrink-0 z-10">
                        <Icon className="h-3.5 w-3.5 text-[#0244C6]" />
                      </div>
                      <div className="flex-1 pt-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.performer?.full_name ?? 'Someone'}</span>
                          <span className="text-muted-foreground"> logged a {(ACTIVITY_LABELS[activity.activity_type as ActivityType] ?? activity.activity_type).toLowerCase()}</span>
                        </p>
                        <p className="text-sm mt-1">{activity.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(activity.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
