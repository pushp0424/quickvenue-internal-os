'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getB2CLeads, getB2CStats, createB2CLead, updateB2CLeadStage, getVenuesForMatch,
} from '@/services/supabase/crm-services'

export function useVenuesForMatch() {
  return useQuery({
    queryKey: ['venues-for-match'],
    queryFn: getVenuesForMatch,
    staleTime: 5 * 60 * 1000,
  })
}

export function useB2CLeads(filters?: {
  cityId?: string
  stage?: string
  search?: string
  assignedTo?: string
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['b2c-leads', filters],
    queryFn: () => getB2CLeads(filters),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled,
  })
}

export function useB2CStats() {
  return useQuery({
    queryKey: ['b2c-stats'],
    queryFn: getB2CStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateB2CLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createB2CLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['b2c-leads'] })
      qc.invalidateQueries({ queryKey: ['b2c-stats'] })
    },
  })
}

export function useUpdateB2CLeadStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage, extra }: { id: string; stage: string; extra?: Record<string, unknown> }) =>
      updateB2CLeadStage(id, stage, extra),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['b2c-leads'] })
      qc.invalidateQueries({ queryKey: ['b2c-stats'] })
      qc.invalidateQueries({ queryKey: ['b2c-lead', vars.id] })
    },
  })
}
