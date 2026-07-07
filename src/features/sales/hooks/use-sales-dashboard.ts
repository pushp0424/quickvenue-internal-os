'use client'

import { useQuery } from '@tanstack/react-query'
import { getSalesDashboardData } from '@/services/supabase/sales-dashboard-services'

export function useSalesDashboard() {
  return useQuery({
    queryKey: ['sales-dashboard'],
    queryFn: () => getSalesDashboardData(),
    staleTime: 2 * 60 * 1000,
  })
}
