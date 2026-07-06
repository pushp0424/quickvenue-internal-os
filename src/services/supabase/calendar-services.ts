/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import { toLocalDateStr } from '@/lib/utils'

async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export type EventType = 'meeting' | 'interview' | 'venue_visit' | 'follow_up' | 'deadline' | 'birthday' | 'holiday'

export interface EventProfileSummary {
  id: string
  full_name: string
  avatar_url: string | null
}

export interface CalendarEntry {
  id: string
  title: string
  event_type: EventType
  start_at: string
  end_at: string | null
  location: string | null
  notes: string | null
  isVirtual: boolean
  link?: string
  created_by?: string | null
  attendees: { profile: EventProfileSummary | null }[]
}

export interface EventInput {
  title: string
  eventType: EventType
  startAt: string
  endAt?: string
  location?: string
  notes?: string
  attendeeIds: string[]
}

const EVENT_SELECT = '*, attendees:event_attendees(profile:profiles(id, full_name, avatar_url))'

// =========================================
// REAL EVENTS
// =========================================
export async function getEvents(rangeStart: string, rangeEndExclusive: string): Promise<CalendarEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events' as any)
    .select(EVENT_SELECT)
    .gte('start_at', rangeStart)
    .lt('start_at', rangeEndExclusive)
    .order('start_at', { ascending: true })
  if (error) throw error
  return ((data ?? []) as any[]).map((e) => ({ ...e, isVirtual: false }))
}

export async function createEvent(input: EventInput) {
  const supabase = createClient()
  const session = await getSession()
  const { data: event, error } = await supabase
    .from('events' as any)
    .insert({
      title: input.title,
      event_type: input.eventType,
      start_at: input.startAt,
      end_at: input.endAt ?? null,
      location: input.location ?? null,
      notes: input.notes ?? null,
      created_by: session?.user.id,
    })
    .select()
    .single()
  if (error) throw error

  if (input.attendeeIds.length > 0) {
    const { error: attendeeError } = await supabase
      .from('event_attendees' as any)
      .insert(input.attendeeIds.map((profileId) => ({ event_id: (event as any).id, profile_id: profileId })))
    if (attendeeError) throw attendeeError
  }

  return event
}

export async function updateEvent(id: string, patch: Record<string, any>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events' as any)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEvent(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('events' as any).delete().eq('id', id)
  if (error) throw error
}

// =========================================
// VIRTUAL — CRM FOLLOW-UPS
// =========================================
export async function getCRMFollowUps(rangeStart: string, rangeEndExclusive: string): Promise<CalendarEntry[]> {
  const supabase = createClient()
  const [b2bRes, b2cRes] = await Promise.all([
    supabase
      .from('leads' as any)
      .select('id, venue_name, follow_up_date, assigned_to, assignee:profiles!leads_assigned_to_fkey(id, full_name, avatar_url)')
      .eq('lead_type', 'b2b')
      .gte('follow_up_date', rangeStart)
      .lt('follow_up_date', rangeEndExclusive),
    supabase
      .from('customer_leads' as any)
      .select('id, customer_name, follow_up_date, assigned_to, assignee:profiles!customer_leads_assigned_to_fkey(id, full_name, avatar_url)')
      .gte('follow_up_date', rangeStart)
      .lt('follow_up_date', rangeEndExclusive),
  ])
  if (b2bRes.error) throw b2bRes.error
  if (b2cRes.error) throw b2cRes.error

  const b2b: CalendarEntry[] = ((b2bRes.data ?? []) as any[]).map((l) => ({
    id: `b2b-${l.id}`,
    title: `Follow up: ${l.venue_name || 'Untitled venue'}`,
    event_type: 'follow_up',
    start_at: l.follow_up_date,
    end_at: null,
    location: null,
    notes: null,
    isVirtual: true,
    link: `/b2b?id=${l.id}`,
    attendees: l.assignee ? [{ profile: l.assignee }] : [],
  }))
  const b2c: CalendarEntry[] = ((b2cRes.data ?? []) as any[]).map((l) => ({
    id: `b2c-${l.id}`,
    title: `Follow up: ${l.customer_name}`,
    event_type: 'follow_up',
    start_at: l.follow_up_date,
    end_at: null,
    location: null,
    notes: null,
    isVirtual: true,
    link: `/b2c?id=${l.id}`,
    attendees: l.assignee ? [{ profile: l.assignee }] : [],
  }))

  return [...b2b, ...b2c]
}

// =========================================
// VIRTUAL — TASK DEADLINES
// =========================================
export async function getTaskDeadlines(rangeStart: string, rangeEndExclusive: string): Promise<CalendarEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks' as any)
    .select('id, title, deadline, status, assignees:task_assignees(profile:profiles(id, full_name, avatar_url))')
    .not('deadline', 'is', null)
    .gte('deadline', rangeStart)
    .lt('deadline', rangeEndExclusive)
  if (error) throw error

  return ((data ?? []) as any[]).map((t) => ({
    id: `task-${t.id}`,
    title: t.status === 'done' ? `✓ ${t.title}` : t.title,
    event_type: 'deadline' as EventType,
    start_at: t.deadline,
    end_at: null,
    location: null,
    notes: null,
    isVirtual: true,
    link: `/tasks?id=${t.id}`,
    attendees: t.assignees ?? [],
  }))
}

// =========================================
// VIRTUAL — BIRTHDAYS (recurring, year-agnostic)
// =========================================
export async function getBirthdays(rangeStart: Date, rangeEndExclusive: Date): Promise<CalendarEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles' as any)
    .select('id, full_name, avatar_url, date_of_birth')
    .not('date_of_birth', 'is', null)
  if (error) throw error

  const profiles = (data ?? []) as any[]
  const entries: CalendarEntry[] = []

  for (const cursor = new Date(rangeStart); cursor < rangeEndExclusive; cursor.setDate(cursor.getDate() + 1)) {
    const day = cursor.getDate()
    const month = cursor.getMonth()
    for (const p of profiles) {
      const dob = new Date(p.date_of_birth)
      if (dob.getMonth() === month && dob.getDate() === day) {
        entries.push({
          id: `bday-${p.id}-${toLocalDateStr(cursor)}`,
          title: `${p.full_name}'s birthday`,
          event_type: 'birthday',
          start_at: toLocalDateStr(cursor),
          end_at: null,
          location: null,
          notes: null,
          isVirtual: true,
          attendees: [{ profile: { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url } }],
        })
      }
    }
  }

  return entries
}
