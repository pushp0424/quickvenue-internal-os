/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'

async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function startOfQuarter(d: Date) { return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1) }
function startOfYear(d: Date) { return new Date(d.getFullYear(), 0, 1) }

function sumInRange(rows: { date: Date; amount: number }[], from: Date) {
  return rows.reduce((sum, r) => (r.date >= from ? sum + r.amount : sum), 0)
}

// =========================================
// STATS
// =========================================
export async function getFinanceStats() {
  const supabase = createClient()

  const [leadsRes, expensesRes, transactionsRes] = await Promise.all([
    supabase.from('customer_leads' as any).select('pipeline_stage, booking_amount, commission_earned, event_date, created_at'),
    supabase.from('expenses' as any).select('amount, expense_date').eq('is_active', true),
    supabase.from('transactions' as any).select('type, amount, transaction_date'),
  ])
  if (leadsRes.error) throw leadsRes.error
  if (expensesRes.error) throw expensesRes.error
  if (transactionsRes.error) throw transactionsRes.error

  const bookedLeads = (leadsRes.data ?? []).filter((l: any) => ['booked', 'completed'].includes(l.pipeline_stage))
  const bookingRows = bookedLeads.map((l: any) => ({
    date: new Date(l.event_date ?? l.created_at ?? Date.now()),
    booking: Number(l.booking_amount ?? 0),
    commission: Number(l.commission_earned ?? 0),
  }))
  const expenseRows = (expensesRes.data ?? []).map((e: any) => ({ date: new Date(e.expense_date), amount: Number(e.amount ?? 0) }))
  const incomeTxRows = (transactionsRes.data ?? [])
    .filter((t: any) => t.type === 'income')
    .map((t: any) => ({ date: new Date(t.transaction_date), amount: Number(t.amount ?? 0) }))
  const expenseTxRows = (transactionsRes.data ?? [])
    .filter((t: any) => t.type === 'expense')
    .map((t: any) => ({ date: new Date(t.transaction_date), amount: Number(t.amount ?? 0) }))

  const now = new Date()
  const monthStart = startOfMonth(now)
  const quarterStart = startOfQuarter(now)
  const yearStart = startOfYear(now)

  const bookingRevenue = {
    month: sumInRange(bookingRows.map((r) => ({ date: r.date, amount: r.booking })), monthStart),
    quarter: sumInRange(bookingRows.map((r) => ({ date: r.date, amount: r.booking })), quarterStart),
    year: sumInRange(bookingRows.map((r) => ({ date: r.date, amount: r.booking })), yearStart),
  }

  const commissionByPeriod = (from: Date) =>
    sumInRange(bookingRows.map((r) => ({ date: r.date, amount: r.commission })), from) +
    sumInRange(incomeTxRows, from)

  const revenue = {
    month: commissionByPeriod(monthStart),
    quarter: commissionByPeriod(quarterStart),
    year: commissionByPeriod(yearStart),
  }

  const expensesByPeriod = (from: Date) =>
    sumInRange(expenseRows, from) + sumInRange(expenseTxRows, from)

  const expenses = {
    month: expensesByPeriod(monthStart),
    quarter: expensesByPeriod(quarterStart),
    year: expensesByPeriod(yearStart),
  }

  const profit = {
    month: revenue.month - expenses.month,
    quarter: revenue.quarter - expenses.quarter,
    year: revenue.year - expenses.year,
  }

  const burnRate = expenses.month - revenue.month

  return { bookingRevenue, revenue, expenses, profit, burnRate }
}

export async function getCityRevenueBreakdown() {
  const supabase = createClient()
  const [leadsRes, citiesRes, txRes] = await Promise.all([
    supabase.from('customer_leads' as any).select('pipeline_stage, commission_earned, city_id'),
    supabase.from('cities' as any).select('id, name').eq('is_active', true),
    supabase.from('transactions' as any).select('type, amount, city_id').eq('type', 'income'),
  ])
  if (leadsRes.error) throw leadsRes.error
  if (citiesRes.error) throw citiesRes.error
  if (txRes.error) throw txRes.error

  const cityNames = new Map<string, string>((citiesRes.data ?? []).map((c: any) => [c.id, c.name]))
  const totals = new Map<string, number>()

  ;(leadsRes.data ?? [])
    .filter((l: any) => ['booked', 'completed'].includes(l.pipeline_stage))
    .forEach((l: any) => {
      const key = l.city_id ?? 'unknown'
      totals.set(key, (totals.get(key) ?? 0) + Number(l.commission_earned ?? 0))
    })
  ;(txRes.data ?? []).forEach((t: any) => {
    const key = t.city_id ?? 'unknown'
    totals.set(key, (totals.get(key) ?? 0) + Number(t.amount ?? 0))
  })

  return Array.from(totals.entries())
    .map(([cityId, revenue]) => ({ cityId, cityName: cityNames.get(cityId) ?? 'Unknown', revenue }))
    .sort((a, b) => b.revenue - a.revenue)
}

export async function getBookedLeadsForInvoice(): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('customer_leads' as any)
    .select('id, customer_name, booking_amount, city_id')
    .in('pipeline_stage', ['booked', 'completed'])
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

// =========================================
// EXPENSES
// =========================================
export async function getExpenses(filters?: { cityId?: string; search?: string }): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('expenses' as any)
    .select('*, city:cities(id, name)')
    .eq('is_active', true)
    .order('expense_date', { ascending: false })

  if (filters?.cityId) q = q.eq('city_id', filters.cityId)
  if (filters?.search) q = q.ilike('description', `%${filters.search}%`)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}

export async function createExpense(input: Record<string, any>) {
  const supabase = createClient()
  const session = await getSession()
  const { data, error } = await supabase
    .from('expenses' as any)
    .insert({ ...input, created_by: session?.user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExpense(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('expenses' as any).update({ is_active: false }).eq('id', id)
  if (error) throw error
}

// =========================================
// INVOICES
// =========================================
export async function getInvoices(filters?: { cityId?: string; search?: string }): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('invoices' as any)
    .select('*, city:cities(id, name)')
    .order('created_at', { ascending: false })

  if (filters?.cityId) q = q.eq('city_id', filters.cityId)
  if (filters?.search) q = q.or(`customer_name.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}

export async function getInvoice(id: string): Promise<Record<string, any> | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('invoices' as any)
    .select('*, city:cities(id, name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createInvoice(input: Record<string, any>) {
  const supabase = createClient()
  const session = await getSession()
  const invoiceNumber = `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const { data, error } = await supabase
    .from('invoices' as any)
    .insert({ ...input, invoice_number: invoiceNumber, created_by: session?.user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('invoices' as any)
    .update({ status, paid_date: status === 'paid' ? new Date().toISOString().slice(0, 10) : null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// =========================================
// TRANSACTIONS (misc ledger entries)
// =========================================
export async function getTransactions(filters?: { cityId?: string }): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('transactions' as any)
    .select('*, city:cities(id, name)')
    .order('transaction_date', { ascending: false })
    .limit(50)

  if (filters?.cityId) q = q.eq('city_id', filters.cityId)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}

export async function createTransaction(input: Record<string, any>) {
  const supabase = createClient()
  const session = await getSession()
  const { data, error } = await supabase
    .from('transactions' as any)
    .insert({ ...input, created_by: session?.user.id })
    .select()
    .single()
  if (error) throw error
  return data
}
