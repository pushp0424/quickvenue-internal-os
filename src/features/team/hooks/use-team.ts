'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllTeamMembers,
  deactivateMember,
  reactivateMember,
  updateMemberRole,
} from '@/services/supabase/team-queries'
import { RoleName } from '@/types/auth.types'

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: getAllTeamMembers,
    staleTime: 2 * 60 * 1000,
  })
}

export function useDeactivateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] })
      qc.invalidateQueries({ queryKey: ['team-stats'] })
    },
  })
}

export function useReactivateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reactivateMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] })
      qc.invalidateQueries({ queryKey: ['team-stats'] })
    },
  })
}

export function useUpdateMemberRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: RoleName }) =>
      updateMemberRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}