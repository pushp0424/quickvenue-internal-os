'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOperationsVenues, getOperationsStats, updateVenueOperations,
  getVendors, createVendor, updateVendor, deleteVendor,
} from '@/services/supabase/operations-services'

export function useOperationsVenues(filters?: { cityId?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['operations-venues', filters],
    queryFn: () => getOperationsVenues(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useOperationsStats() {
  return useQuery({
    queryKey: ['operations-stats'],
    queryFn: getOperationsStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateVenueOperations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      updateVenueOperations(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operations-venues'] })
      qc.invalidateQueries({ queryKey: ['operations-stats'] })
    },
  })
}

export function useVendors(filters?: { cityId?: string; search?: string }) {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: () => getVendors(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })
}

export function useUpdateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      updateVendor(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })
}

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })
}
