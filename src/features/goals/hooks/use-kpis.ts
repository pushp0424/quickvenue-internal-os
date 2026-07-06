'use client'

import { useQuery } from '@tanstack/react-query'
import { getSalesKPIs, getHRKPIs } from '@/services/supabase/kpi-services'

export function useSalesKPIs(userId: string, periodStart: string, periodEndExclusive: string) {
  return useQuery({
    queryKey: ['sales-kpis', userId, periodStart, periodEndExclusive],
    queryFn: () => getSalesKPIs(userId, periodStart, periodEndExclusive),
    enabled: !!userId,
  })
}

export function useHRKPIs(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: ['hr-kpis', periodStart, periodEnd],
    queryFn: () => getHRKPIs(periodStart, periodEnd),
    enabled: !!periodStart && !!periodEnd,
  })
}
