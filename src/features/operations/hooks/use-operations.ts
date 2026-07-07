'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOperationsVenues, getOperationsStats, getOperationsBreakdowns, updateVenueOperations,
  createVenueOperations, deleteVenueOperations,
  getVendors, createVendor, updateVendor, deleteVendor,
} from '@/services/supabase/operations-services'

function invalidateVenueQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['operations-venues'] })
  qc.invalidateQueries({ queryKey: ['operations-stats'] })
  qc.invalidateQueries({ queryKey: ['operations-breakdowns'] })
  qc.invalidateQueries({ queryKey: ['venues'] })
  qc.invalidateQueries({ queryKey: ['venue-stats'] })
  qc.invalidateQueries({ queryKey: ['city-overview'] })
  qc.invalidateQueries({ queryKey: ['all-cities-overview'] })
}

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

export function useOperationsBreakdowns() {
  return useQuery({
    queryKey: ['operations-breakdowns'],
    queryFn: getOperationsBreakdowns,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateVenueOperations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      updateVenueOperations(id, input),
    onSuccess: () => invalidateVenueQueries(qc),
  })
}

export function useCreateVenueOperations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVenueOperations,
    onSuccess: () => invalidateVenueQueries(qc),
  })
}

export function useDeleteVenueOperations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteVenueOperations,
    onSuccess: () => invalidateVenueQueries(qc),
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
