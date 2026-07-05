'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTodayAttendance, checkIn, checkOut,
  getMyAttendance, getTeamAttendance, getProfileIdsForTeam,
} from '@/services/supabase/attendance-services'

export function useTodayAttendance(profileId: string) {
  return useQuery({
    queryKey: ['today-attendance', profileId],
    queryFn: () => getTodayAttendance(profileId),
    enabled: !!profileId,
  })
}

export function useCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, workMode, cityId }: { profileId: string; workMode: string; cityId?: string | null }) =>
      checkIn(profileId, { workMode, cityId }),
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['today-attendance', profileId] })
      qc.invalidateQueries({ queryKey: ['my-attendance', profileId] })
      qc.invalidateQueries({ queryKey: ['team-attendance'] })
    },
  })
}

export function useCheckOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId }: { profileId: string }) => checkOut(profileId),
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['today-attendance', profileId] })
      qc.invalidateQueries({ queryKey: ['my-attendance', profileId] })
      qc.invalidateQueries({ queryKey: ['team-attendance'] })
    },
  })
}

export function useMyAttendance(profileId: string, monthStart: string, monthEnd: string) {
  return useQuery({
    queryKey: ['my-attendance', profileId, monthStart],
    queryFn: () => getMyAttendance(profileId, monthStart, monthEnd),
    enabled: !!profileId,
  })
}

export function useTeamAttendance(filters: {
  cityId?: string
  profileIds?: string[]
  monthStart: string
  monthEnd: string
}, enabled: boolean) {
  return useQuery({
    queryKey: ['team-attendance', filters],
    queryFn: () => getTeamAttendance(filters),
    enabled,
  })
}

export function useProfileIdsForTeam(team: string | null) {
  return useQuery({
    queryKey: ['team-profile-ids', team],
    queryFn: () => getProfileIdsForTeam(team as string),
    enabled: !!team,
  })
}
