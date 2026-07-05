/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'

export interface NotificationInput {
  recipientId: string
  type: string
  title: string
  body?: string
  link?: string
}

export interface Notification {
  id: string
  recipient_id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

export async function getNotifications(recipientId: string): Promise<Notification[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications' as any)
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return (data ?? []) as any
}

export async function getUnreadNotificationCount(recipientId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('notifications' as any)
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .is('read_at', null)
  if (error) throw error
  return count ?? 0
}

export async function markNotificationRead(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications' as any)
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(recipientId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications' as any)
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', recipientId)
    .is('read_at', null)
  if (error) throw error
}

export async function createNotification(input: NotificationInput) {
  const supabase = createClient()
  const { error } = await supabase.from('notifications' as any).insert({
    recipient_id: input.recipientId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  })
  if (error) throw error
}

export async function createNotifications(inputs: NotificationInput[]) {
  if (inputs.length === 0) return
  const supabase = createClient()
  const { error } = await supabase.from('notifications' as any).insert(
    inputs.map((input) => ({
      recipient_id: input.recipientId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    }))
  )
  if (error) throw error
}
