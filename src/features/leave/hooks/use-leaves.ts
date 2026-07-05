'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeaveTypes, getMyLeaves, applyForLeave,
  getPendingApprovals, decideLeave, getTeamLeaveCalendar, getDirectReportIds,
} from '@/services/supabase/leave-services'

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: getLeaveTypes,
    staleTime: 10 * 60 * 1000,
  })
}

export function useMyLeaves(profileId: string) {
  return useQuery({
    queryKey: ['my-leaves', profileId],
    queryFn: () => getMyLeaves(profileId),
    enabled: !!profileId,
  })
}

export function useApplyForLeave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: applyForLeave,
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ['my-leaves', input.profileId] })
      qc.invalidateQueries({ queryKey: ['pending-approvals'] })
    },
  })
}

export function usePendingApprovals(filters: { managerId?: string; isHR: boolean }) {
  return useQuery({
    queryKey: ['pending-approvals', filters],
    queryFn: () => getPendingApprovals(filters),
    enabled: filters.isHR || !!filters.managerId,
  })
}

export function useDecideLeave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; decision: 'approve' | 'reject'; actingAsHR: boolean; actingUserId: string; rejectionReason?: string }) =>
      decideLeave(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-approvals'] })
      qc.invalidateQueries({ queryKey: ['my-leaves'] })
      qc.invalidateQueries({ queryKey: ['team-leave-calendar'] })
    },
  })
}

export function useTeamLeaveCalendar(filters: { monthStart: string; monthEnd: string; managerId?: string }, enabled: boolean) {
  return useQuery({
    queryKey: ['team-leave-calendar', filters],
    queryFn: () => getTeamLeaveCalendar(filters),
    enabled,
  })
}

export function useDirectReportIds(managerId?: string) {
  return useQuery({
    queryKey: ['direct-report-ids', managerId],
    queryFn: () => getDirectReportIds(managerId as string),
    enabled: !!managerId,
  })
}
