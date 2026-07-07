'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/services/supabase/client'
import {
  getOrCreateScopedChannel, getOrCreateDirectChannel,
  getMyChannels, getUnreadChannelCount, getChannelMembers,
  getMessages, sendMessage, markChannelRead, deleteMessage,
  uploadChatAttachment, getChatAttachmentSignedUrl,
  toggleReaction, searchMessages, ChannelType,
} from '@/services/supabase/chat-services'

export function useMyChannels() {
  return useQuery({
    queryKey: ['chat-channels'],
    queryFn: getMyChannels,
    refetchInterval: 20 * 1000,
  })
}

export function useUnreadChannelCount() {
  return useQuery({
    queryKey: ['chat-unread-count'],
    queryFn: getUnreadChannelCount,
    refetchInterval: 20 * 1000,
  })
}

export function useEnsureScopedChannels(
  profile: { team: string | null; department_id: string | null; city_id: string | null } | undefined,
  labels: { departmentName?: string; cityName?: string } = {}
) {
  const qc = useQueryClient()
  useEffect(() => {
    if (!profile) return
    let cancelled = false
    async function run() {
      const jobs: Promise<unknown>[] = [
        getOrCreateScopedChannel('announcement', null, 'Announcements'),
      ]
      if (profile!.team) jobs.push(getOrCreateScopedChannel('team', profile!.team, `Team: ${profile!.team}`))
      if (profile!.department_id) jobs.push(getOrCreateScopedChannel('department', profile!.department_id, labels.departmentName ? `Department: ${labels.departmentName}` : 'Department'))
      if (profile!.city_id) jobs.push(getOrCreateScopedChannel('city', profile!.city_id, labels.cityName ? `City: ${labels.cityName}` : 'City'))
      await Promise.all(jobs)
      if (!cancelled) qc.invalidateQueries({ queryKey: ['chat-channels'] })
    }
    run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.team, profile?.department_id, profile?.city_id, labels.departmentName, labels.cityName, qc])
}

export function useStartDirectChannel() {
  return useMutation({
    mutationFn: (otherProfileId: string) => getOrCreateDirectChannel(otherProfileId),
  })
}

export function useChannelMembers(channelId: string | null) {
  return useQuery({
    queryKey: ['chat-channel-members', channelId],
    queryFn: () => getChannelMembers(channelId as string),
    enabled: !!channelId,
  })
}

export function useMessages(channelId: string | null) {
  return useQuery({
    queryKey: ['chat-messages', channelId],
    queryFn: () => getMessages(channelId as string),
    enabled: !!channelId,
  })
}

export function useRealtimeMessages(channelId: string | null) {
  const qc = useQueryClient()
  useEffect(() => {
    if (!channelId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ['chat-messages', channelId] })
        qc.invalidateQueries({ queryKey: ['chat-channels'] })
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'message_reactions',
      }, () => {
        qc.invalidateQueries({ queryKey: ['chat-messages', channelId] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, qc])
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: async (_data, input) => {
      // Sending a message shouldn't leave the channel looking unread to the sender.
      await markChannelRead(input.channelId)
      qc.invalidateQueries({ queryKey: ['chat-messages', input.channelId] })
      qc.invalidateQueries({ queryKey: ['chat-channels'] })
      qc.invalidateQueries({ queryKey: ['chat-unread-count'] })
    },
  })
}

export function useMarkChannelRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (channelId: string) => markChannelRead(channelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat-channels'] })
      qc.invalidateQueries({ queryKey: ['chat-unread-count'] })
    },
  })
}

export function useDeleteMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId }: { messageId: string; channelId: string }) => deleteMessage(messageId),
    onSuccess: (_data, { channelId }) => {
      qc.invalidateQueries({ queryKey: ['chat-messages', channelId] })
      qc.invalidateQueries({ queryKey: ['chat-channels'] })
    },
  })
}

export function useUploadChatAttachment() {
  return useMutation({
    mutationFn: ({ channelId, file }: { channelId: string; file: File }) => uploadChatAttachment(channelId, file),
  })
}

export function useChatAttachmentSignedUrl() {
  return useMutation({
    mutationFn: (filePath: string) => getChatAttachmentSignedUrl(filePath),
  })
}

export function useToggleReaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string; channelId: string }) =>
      toggleReaction(messageId, emoji),
    onSuccess: (_data, { channelId }) => {
      qc.invalidateQueries({ queryKey: ['chat-messages', channelId] })
    },
  })
}

export function useSearchMessages(query: string) {
  return useQuery({
    queryKey: ['chat-search', query],
    queryFn: () => searchMessages(query),
    enabled: query.trim().length > 1,
  })
}

export type { ChannelType }
