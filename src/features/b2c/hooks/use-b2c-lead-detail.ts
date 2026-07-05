'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getB2CLeadById, updateB2CLead,
  getB2CLeadActivities, logB2CLeadActivity, deleteB2CLead,
} from '@/services/supabase/crm-services'

export function useB2CLead(id: string) {
  return useQuery({
    queryKey: ['b2c-lead', id],
    queryFn: () => getB2CLeadById(id),
    enabled: !!id,
  })
}

export function useUpdateB2CLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      updateB2CLead(id, input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['b2c-lead', vars.id] })
      qc.invalidateQueries({ queryKey: ['b2c-leads'] })
      qc.invalidateQueries({ queryKey: ['b2c-stats'] })
    },
  })
}

export function useB2CLeadActivities(customerLeadId: string) {
  return useQuery({
    queryKey: ['b2c-lead-activities', customerLeadId],
    queryFn: () => getB2CLeadActivities(customerLeadId),
    enabled: !!customerLeadId,
  })
}

export function useLogB2CLeadActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: logB2CLeadActivity,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['b2c-lead-activities', vars.customerLeadId] })
    },
  })
}

export function useDeleteB2CLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteB2CLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['b2c-leads'] })
      qc.invalidateQueries({ queryKey: ['b2c-stats'] })
    },
  })
}
