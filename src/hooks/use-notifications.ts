'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications, getUnreadNotificationCount,
  markNotificationRead, markAllNotificationsRead,
} from '@/services/supabase/notifications-services'

const POLL_INTERVAL = 30 * 1000

export function useNotifications(recipientId: string) {
  return useQuery({
    queryKey: ['notifications', recipientId],
    queryFn: () => getNotifications(recipientId),
    enabled: !!recipientId,
    refetchInterval: POLL_INTERVAL,
  })
}

export function useUnreadNotificationCount(recipientId: string) {
  return useQuery({
    queryKey: ['unread-notification-count', recipientId],
    queryFn: () => getUnreadNotificationCount(recipientId),
    enabled: !!recipientId,
    refetchInterval: POLL_INTERVAL,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; recipientId: string }) => markNotificationRead(id),
    onSuccess: (_data, { recipientId }) => {
      qc.invalidateQueries({ queryKey: ['notifications', recipientId] })
      qc.invalidateQueries({ queryKey: ['unread-notification-count', recipientId] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (recipientId: string) => markAllNotificationsRead(recipientId),
    onSuccess: (_data, recipientId) => {
      qc.invalidateQueries({ queryKey: ['notifications', recipientId] })
      qc.invalidateQueries({ queryKey: ['unread-notification-count', recipientId] })
    },
  })
}
