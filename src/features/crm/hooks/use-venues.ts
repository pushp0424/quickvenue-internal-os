'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVenues, getVenueStats, createVenue, updateVenue } from '@/services/supabase/crm-queries'
import { VenueStatus } from '@/types/database.types'

export function useVenues(filters?: {
  city?: string
  status?: VenueStatus
  category?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: () => getVenues(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useVenueStats() {
  return useQuery({
    queryKey: ['venue-stats'],
    queryFn: getVenueStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateVenue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVenue,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venues'] })
      qc.invalidateQueries({ queryKey: ['venue-stats'] })
    },
  })
}

export function useUpdateVenue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVenue(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venues'] })
      qc.invalidateQueries({ queryKey: ['venue-stats'] })
    },
  })
}