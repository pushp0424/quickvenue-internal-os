'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getB2BLeadById, updateB2BLead,
  getB2BLeadActivities, logB2BLeadActivity,
} from '@/services/supabase/crm-services'

export function useB2BLead(id: string) {
  return useQuery({
    queryKey: ['b2b-lead', id],
    queryFn: () => getB2BLeadById(id),
    enabled: !!id,
  })
}

export function useUpdateB2BLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      updateB2BLead(id, input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['b2b-lead', vars.id] })
      qc.invalidateQueries({ queryKey: ['b2b-leads'] })
      qc.invalidateQueries({ queryKey: ['b2b-stats'] })
    },
  })
}

export function useB2BLeadActivities(leadId: string) {
  return useQuery({
    queryKey: ['b2b-lead-activities', leadId],
    queryFn: () => getB2BLeadActivities(leadId),
    enabled: !!leadId,
  })
}

export function useLogB2BLeadActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: logB2BLeadActivity,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['b2b-lead-activities', vars.leadId] })
    },
  })
}
