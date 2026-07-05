'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFinanceStats, getCityRevenueBreakdown, getBookedLeadsForInvoice,
  getExpenses, createExpense, deleteExpense,
  getInvoices, getInvoice, createInvoice, updateInvoiceStatus,
  getTransactions, createTransaction,
} from '@/services/supabase/finance-services'

export function useFinanceStats() {
  return useQuery({
    queryKey: ['finance-stats'],
    queryFn: getFinanceStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCityRevenueBreakdown() {
  return useQuery({
    queryKey: ['finance-city-revenue'],
    queryFn: getCityRevenueBreakdown,
    staleTime: 5 * 60 * 1000,
  })
}

export function useExpenses(filters?: { cityId?: string; search?: string }) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => getExpenses(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['finance-stats'] })
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['finance-stats'] })
    },
  })
}

export function useBookedLeadsForInvoice() {
  return useQuery({
    queryKey: ['booked-leads-for-invoice'],
    queryFn: getBookedLeadsForInvoice,
    staleTime: 2 * 60 * 1000,
  })
}

export function useInvoices(filters?: { cityId?: string; search?: string }) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => getInvoices(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateInvoiceStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoice'] })
    },
  })
}

export function useTransactions(filters?: { cityId?: string }) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getTransactions(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['finance-stats'] })
      qc.invalidateQueries({ queryKey: ['finance-city-revenue'] })
    },
  })
}
