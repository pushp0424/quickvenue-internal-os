'use client'

import { useQuery } from '@tanstack/react-query'
import { getAllCitiesOverview, getCityOverview } from '@/services/supabase/city-services'

export function useAllCitiesOverview() {
  return useQuery({
    queryKey: ['all-cities-overview'],
    queryFn: getAllCitiesOverview,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCityOverview(cityId: string | undefined) {
  return useQuery({
    queryKey: ['city-overview', cityId],
    queryFn: () => getCityOverview(cityId as string),
    enabled: !!cityId,
    staleTime: 2 * 60 * 1000,
  })
}
