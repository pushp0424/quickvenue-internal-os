'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getTeamStats,
  getTeamByRole,
  getTeamByCity,
  getRecentTeamMembers,
} from '@/services/supabase/queries'

export function useTeamStats() {
  return useQuery({
    queryKey: ['team-stats'],
    queryFn: getTeamStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeamByRole() {
  return useQuery({
    queryKey: ['team-by-role'],
    queryFn: getTeamByRole,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeamByCity() {
  return useQuery({
    queryKey: ['team-by-city'],
    queryFn: getTeamByCity,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecentTeamMembers(limit = 5) {
  return useQuery({
    queryKey: ['recent-team-members', limit],
    queryFn: () => getRecentTeamMembers(limit),
    staleTime: 2 * 60 * 1000,
  })
}
import { getCRMSummary } from '@/services/supabase/queries'

export function useCRMSummary() {
  return useQuery({
    queryKey: ['crm-summary'],
    queryFn: getCRMSummary,
    staleTime: 5 * 60 * 1000,
  })
}