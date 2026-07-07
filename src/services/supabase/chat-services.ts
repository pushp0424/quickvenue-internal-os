/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import { createNotifications } from '@/services/supabase/notifications-services'

async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export type ChannelType = 'direct' | 'team' | 'department' | 'city' | 'announcement'

export interface ChannelProfileSummary {
  id: string
  full_name: string
  avatar_url: string | null
}

export interface ChatChannel {
  id: string
  type: ChannelType
  name: string
  scope_value: string | null
  created_at: string
  lastMessageBody: string | null
  lastMessageAt: string | null
  hasUnread: boolean
  otherMember: ChannelProfileSummary | null
}

export interface ChatMessage {
  id: string
  channel_id: string
  sender_id: string | null
  sender: ChannelProfileSummary | null
  body: string | null
  file_path: string | null
  file_name: string | null
  created_at: string
  reactions: { emoji: string; profile_id: string }[]
}

// =========================================
// CHANNEL CREATION / DISCOVERY
// =========================================
export async function getOrCreateScopedChannel(type: ChannelType, scopeValue: string | null, name: string): Promise<string> {
  const supabase = createClient()
  const session = await getSession()
  const myId = session?.user.id
  if (!myId) throw new Error('Not authenticated')

  let query = supabase.from('channels' as any).select('id').eq('type', type)
  query = scopeValue === null ? query.is('scope_value', null) : query.eq('scope_value', scopeValue)
  const { data: existing, error: findError } = await query.maybeSingle()
  if (findError) throw findError

  let channelId = (existing as any)?.id as string | undefined

  if (!channelId) {
    // Generate the id client-side and skip a chained .select() on insert:
    // the channels SELECT policy (can_access_channel) can't yet see a brand
    // new channel before the creator's channel_members row exists, so
    // insert().select().single() would fail RLS on the RETURNING clause.
    channelId = crypto.randomUUID()
    const { error: createError } = await supabase
      .from('channels' as any)
      .insert({ id: channelId, type, scope_value: scopeValue, name })
    if (createError) throw createError
  }

  await supabase
    .from('channel_members' as any)
    .upsert({ channel_id: channelId, profile_id: myId }, { onConflict: 'channel_id,profile_id', ignoreDuplicates: true })

  return channelId as string
}

export async function getOrCreateDirectChannel(otherProfileId: string): Promise<string> {
  const supabase = createClient()
  const session = await getSession()
  const myId = session?.user.id
  if (!myId) throw new Error('Not authenticated')

  const pairKey = [myId, otherProfileId].sort().join(':')
  const { data: existing, error: findError } = await supabase
    .from('channels' as any)
    .select('id')
    .eq('type', 'direct')
    .eq('scope_value', pairKey)
    .maybeSingle()
  if (findError) throw findError

  let channelId = (existing as any)?.id as string | undefined

  if (!channelId) {
    // See getOrCreateScopedChannel for why this skips insert().select().single().
    channelId = crypto.randomUUID()
    const { error: createError } = await supabase
      .from('channels' as any)
      .insert({ id: channelId, type: 'direct', scope_value: pairKey, name: 'Direct' })
    if (createError) throw createError

    const { error: selfJoinError } = await supabase
      .from('channel_members' as any)
      .insert({ channel_id: channelId, profile_id: myId })
    if (selfJoinError) throw selfJoinError

    const { error: otherJoinError } = await supabase
      .from('channel_members' as any)
      .insert({ channel_id: channelId, profile_id: otherProfileId })
    if (otherJoinError) throw otherJoinError
  }

  return channelId as string
}

// =========================================
// CHANNEL LIST
// =========================================
async function getMyChannelsInternal(): Promise<ChatChannel[]> {
  const supabase = createClient()
  const session = await getSession()
  const myId = session?.user.id
  if (!myId) return []

  const { data: memberships, error } = await supabase
    .from('channel_members' as any)
    .select('last_read_at, channel:channels(*)')
    .eq('profile_id', myId)
  if (error) throw error

  const rows = (memberships ?? []) as any[]
  const channelIds = rows.map((m) => m.channel?.id).filter(Boolean)
  if (channelIds.length === 0) return []

  const [{ data: lastMessages, error: msgError }, { data: directMembers, error: dmError }] = await Promise.all([
    supabase
      .from('messages' as any)
      .select('channel_id, body, created_at')
      .in('channel_id', channelIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('channel_members' as any)
      .select('channel_id, profile:profiles(id, full_name, avatar_url)')
      .in('channel_id', channelIds)
      .neq('profile_id', myId),
  ])
  if (msgError) throw msgError
  if (dmError) throw dmError

  const latestByChannel = new Map<string, any>()
  ;(lastMessages ?? []).forEach((m: any) => {
    if (!latestByChannel.has(m.channel_id)) latestByChannel.set(m.channel_id, m)
  })
  const otherMemberByChannel = new Map<string, any>()
  ;(directMembers ?? []).forEach((cm: any) => {
    if (!otherMemberByChannel.has(cm.channel_id)) otherMemberByChannel.set(cm.channel_id, cm.profile)
  })

  return rows
    .map((m) => {
      const channel = m.channel
      const last = latestByChannel.get(channel.id)
      const hasUnread = !!last && (!m.last_read_at || new Date(last.created_at) > new Date(m.last_read_at))
      return {
        ...channel,
        lastMessageBody: last?.body ?? null,
        lastMessageAt: last?.created_at ?? null,
        hasUnread,
        otherMember: channel.type === 'direct' ? (otherMemberByChannel.get(channel.id) ?? null) : null,
      } as ChatChannel
    })
    .sort((a, b) => new Date(b.lastMessageAt ?? b.created_at).getTime() - new Date(a.lastMessageAt ?? a.created_at).getTime())
}

export async function getMyChannels(): Promise<ChatChannel[]> {
  return getMyChannelsInternal()
}

export async function getUnreadChannelCount(): Promise<number> {
  const channels = await getMyChannelsInternal()
  return channels.filter((c) => c.hasUnread).length
}

export async function getChannelMembers(channelId: string): Promise<ChannelProfileSummary[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('channel_members' as any)
    .select('profile:profiles(id, full_name, avatar_url)')
    .eq('channel_id', channelId)
  if (error) throw error
  return ((data ?? []) as any[]).map((r) => r.profile).filter(Boolean)
}

// =========================================
// MESSAGES
// =========================================
const MESSAGE_SELECT = '*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url), reactions:message_reactions(emoji, profile_id)'

export async function getMessages(channelId: string): Promise<ChatMessage[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages' as any)
    .select(MESSAGE_SELECT)
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as any
}

export async function sendMessage(input: {
  channelId: string
  body?: string
  filePath?: string
  fileName?: string
  mentionedProfileIds?: string[]
}) {
  const supabase = createClient()
  const session = await getSession()
  const myId = session?.user.id

  const { data, error } = await supabase
    .from('messages' as any)
    .insert({
      channel_id: input.channelId,
      sender_id: myId,
      body: input.body ?? null,
      file_path: input.filePath ?? null,
      file_name: input.fileName ?? null,
    })
    .select(MESSAGE_SELECT)
    .single()
  if (error) throw error

  const mentioned = (input.mentionedProfileIds ?? []).filter((id) => id !== myId)
  if (mentioned.length > 0) {
    await createNotifications(
      mentioned.map((profileId) => ({
        recipientId: profileId,
        type: 'chat_mention',
        title: 'You were mentioned in chat',
        body: input.body ?? undefined,
        link: `/chat?channel=${input.channelId}`,
      }))
    )
  }

  return data as any
}

export async function markChannelRead(channelId: string) {
  const supabase = createClient()
  const session = await getSession()
  const myId = session?.user.id
  if (!myId) return
  const { error } = await supabase
    .from('channel_members' as any)
    .update({ last_read_at: new Date().toISOString() })
    .eq('channel_id', channelId)
    .eq('profile_id', myId)
  if (error) throw error
}

export async function uploadChatAttachment(channelId: string, file: File): Promise<{ filePath: string; fileName: string }> {
  const supabase = createClient()
  const path = `${channelId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('chat-attachments').upload(path, file)
  if (error) throw error
  return { filePath: path, fileName: file.name }
}

export async function getChatAttachmentSignedUrl(filePath: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from('chat-attachments').createSignedUrl(filePath, 60)
  if (error) throw error
  return data.signedUrl
}

// =========================================
// REACTIONS
// =========================================
export async function toggleReaction(messageId: string, emoji: string) {
  const supabase = createClient()
  const session = await getSession()
  const myId = session?.user.id
  if (!myId) return

  const { data: existing, error: findError } = await supabase
    .from('message_reactions' as any)
    .select('*')
    .eq('message_id', messageId)
    .eq('profile_id', myId)
    .eq('emoji', emoji)
    .maybeSingle()
  if (findError) throw findError

  if (existing) {
    const { error } = await supabase
      .from('message_reactions' as any)
      .delete()
      .eq('message_id', messageId)
      .eq('profile_id', myId)
      .eq('emoji', emoji)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('message_reactions' as any)
      .insert({ message_id: messageId, profile_id: myId, emoji })
    if (error) throw error
  }
}

export async function deleteMessage(messageId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('messages' as any).delete().eq('id', messageId)
  if (error) throw error
}

// =========================================
// SEARCH
// =========================================
export interface MessageSearchResult {
  id: string
  channel_id: string
  body: string | null
  created_at: string
  sender: ChannelProfileSummary | null
  channel: { id: string; type: ChannelType; name: string }
}

export async function searchMessages(query: string): Promise<MessageSearchResult[]> {
  if (!query.trim()) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages' as any)
    .select('id, channel_id, body, created_at, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url), channel:channels(id, type, name)')
    .ilike('body', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return (data ?? []) as any
}
