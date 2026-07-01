'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeads, getLeadStats, createLead,
  updateLeadStatus, getLeadActivities, logLeadActivity,
} from '@/services/supabase/crm-queries'
import { LeadStatus } from '@/types/database.types'

export function useLeads(filters?: {
  status?: LeadStatus
  assignedTo?: string
}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => getLeads(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useLeadStats() {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: getLeadStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: LeadStatus; notes?: string }) =>
      updateLeadStatus(id, status, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['lead-stats'] })
    },
  })
}

export function useLeadActivities(leadId: string) {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: () => getLeadActivities(leadId),
    enabled: !!leadId,
  })
}

export function useLogLeadActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: logLeadActivity,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['lead-activities', vars.leadId] })
    },
  })
}