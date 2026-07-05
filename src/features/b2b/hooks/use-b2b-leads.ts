'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getB2BLeads, getB2BStats, createB2BLead,
  updateB2BLeadStage, getCities,
} from '@/services/supabase/crm-services'

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
    staleTime: 10 * 60 * 1000,
  })
}

export function useB2BLeads(filters?: {
  cityId?: string
  stage?: string
  search?: string
  assignedTo?: string
  priority?: string
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['b2b-leads', filters],
    queryFn: () => getB2BLeads(filters),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled,
  })
}

export function useB2BStats() {
  return useQuery({
    queryKey: ['b2b-stats'],
    queryFn: getB2BStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateB2BLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createB2BLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['b2b-leads'] })
      qc.invalidateQueries({ queryKey: ['b2b-stats'] })
    },
  })
}

export function useUpdateB2BLeadStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      updateB2BLeadStage(id, stage),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['b2b-leads'] })
      qc.invalidateQueries({ queryKey: ['b2b-stats'] })
      qc.invalidateQueries({ queryKey: ['b2b-lead', vars.id] })
    },
  })
}
