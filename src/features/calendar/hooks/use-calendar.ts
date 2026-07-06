'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEvents, createEvent, updateEvent, deleteEvent,
  getCRMFollowUps, getTaskDeadlines, getBirthdays, EventInput,
} from '@/services/supabase/calendar-services'

export function useEvents(rangeStart: string, rangeEndExclusive: string) {
  return useQuery({
    queryKey: ['calendar-events', rangeStart, rangeEndExclusive],
    queryFn: () => getEvents(rangeStart, rangeEndExclusive),
    enabled: !!rangeStart && !!rangeEndExclusive,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: EventInput) => createEvent(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-events'] }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) => updateEvent(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-events'] }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-events'] }),
  })
}

export function useCRMFollowUps(rangeStart: string, rangeEndExclusive: string) {
  return useQuery({
    queryKey: ['calendar-crm-followups', rangeStart, rangeEndExclusive],
    queryFn: () => getCRMFollowUps(rangeStart, rangeEndExclusive),
    enabled: !!rangeStart && !!rangeEndExclusive,
  })
}

export function useTaskDeadlines(rangeStart: string, rangeEndExclusive: string) {
  return useQuery({
    queryKey: ['calendar-task-deadlines', rangeStart, rangeEndExclusive],
    queryFn: () => getTaskDeadlines(rangeStart, rangeEndExclusive),
    enabled: !!rangeStart && !!rangeEndExclusive,
  })
}

export function useBirthdays(rangeStart: Date, rangeEndExclusive: Date) {
  return useQuery({
    queryKey: ['calendar-birthdays', rangeStart.toISOString(), rangeEndExclusive.toISOString()],
    queryFn: () => getBirthdays(rangeStart, rangeEndExclusive),
  })
}
