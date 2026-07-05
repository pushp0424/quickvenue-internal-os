'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  generatePayroll, getPayrollRuns, getSlipsForRun,
  getMySlips, getSlip, updateSlip,
} from '@/services/supabase/payroll-services'

export function usePayrollRuns() {
  return useQuery({
    queryKey: ['payroll-runs'],
    queryFn: getPayrollRuns,
    staleTime: 2 * 60 * 1000,
  })
}

export function useGeneratePayroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ month, generatedById }: { month: string; generatedById: string }) => generatePayroll(month, generatedById),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-runs'] })
      qc.invalidateQueries({ queryKey: ['payroll-slips'] })
      qc.invalidateQueries({ queryKey: ['my-slips'] })
    },
  })
}

export function useSlipsForRun(payrollId: string | undefined) {
  return useQuery({
    queryKey: ['payroll-slips', payrollId],
    queryFn: () => getSlipsForRun(payrollId as string),
    enabled: !!payrollId,
  })
}

export function useMySlips(profileId: string) {
  return useQuery({
    queryKey: ['my-slips', profileId],
    queryFn: () => getMySlips(profileId),
    enabled: !!profileId,
  })
}

export function useSlip(id: string) {
  return useQuery({
    queryKey: ['slip', id],
    queryFn: () => getSlip(id),
    enabled: !!id,
  })
}

export function useUpdateSlip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; deductions?: number; paymentStatus?: string }) => updateSlip(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-slips'] })
      qc.invalidateQueries({ queryKey: ['my-slips'] })
      qc.invalidateQueries({ queryKey: ['slip'] })
    },
  })
}
