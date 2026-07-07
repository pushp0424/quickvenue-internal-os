'use client'

import { useQuery } from '@tanstack/react-query'
import { getSystemStats } from '@/services/supabase/system-services'

export function useSystemStats() {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: getSystemStats,
    staleTime: 60 * 1000,
  })
}
