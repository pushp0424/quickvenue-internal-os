/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import { toLocalDateStr } from '@/lib/utils'

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function isWeekday(d: Date) {
  const day = d.getDay()
  return day !== 0 && day !== 6
}

// =========================================
// LOP (LOSS OF PAY) CALCULATION
// =========================================
export async function computeLOPDays(profileId: string, monthStart: string, monthEnd: string): Promise<number> {
  const supabase = createClient()

  const [{ data: attendanceRows, error: attError }, { data: leaveRows, error: leaveError }] = await Promise.all([
    supabase.from('attendance' as any).select('date').eq('profile_id', profileId).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('leaves' as any)
      .select('start_date, end_date, leave_type:leave_types(name)')
      .eq('profile_id', profileId)
      .eq('status', 'approved')
      .lte('start_date', monthEnd)
      .gte('end_date', monthStart),
  ])
  if (attError) throw attError
  if (leaveError) throw leaveError

  const attendedDates = new Set((attendanceRows ?? []).map((r: any) => r.date))

  const leaveByDate = new Map<string, boolean>() // date -> isUnpaid
  ;(leaveRows ?? []).forEach((l: any) => {
    const isUnpaid = l.leave_type?.name === 'Unpaid Leave'
    let cursor = new Date(l.start_date)
    const end = new Date(l.end_date)
    while (cursor <= end) {
      const key = toLocalDateStr(cursor)
      if (!leaveByDate.has(key) || isUnpaid) leaveByDate.set(key, isUnpaid)
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
    }
  })

  let lopDays = 0
  let cursor = new Date(monthStart)
  const end = new Date(monthEnd)
  while (cursor <= end) {
    if (isWeekday(cursor)) {
      const key = toLocalDateStr(cursor)
      if (!attendedDates.has(key)) {
        const leaveStatus = leaveByDate.get(key)
        if (leaveStatus === undefined || leaveStatus === true) {
          lopDays++
        }
      }
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
  }
  return lopDays
}

// =========================================
// GENERATION
// =========================================
export async function generatePayroll(month: string, generatedById: string) {
  const supabase = createClient()
  const monthDate = new Date(month)
  const monthStart = toLocalDateStr(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1))
  const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  const monthEnd = toLocalDateStr(monthEndDate)
  const totalDays = daysInMonth(monthDate.getFullYear(), monthDate.getMonth())

  const { data: payrollRow, error: payrollError } = await supabase
    .from('payroll' as any)
    .upsert({ month: monthStart, status: 'completed', generated_by: generatedById, generated_at: new Date().toISOString() }, { onConflict: 'month' })
    .select()
    .single()
  if (payrollError) throw payrollError
  const payrollId = (payrollRow as any).id

  const { data: financialRows, error: financialError } = await supabase
    .from('employee_financial_details' as any)
    .select('profile_id, salary_basic, salary_hra, salary_da, salary_allowances, profile:profiles!inner(is_active)')
    .eq('profile.is_active', true)
  if (financialError) throw financialError

  for (const row of (financialRows ?? []) as any[]) {
    const profileId = row.profile_id
    const basic = Number(row.salary_basic ?? 0)
    const hra = Number(row.salary_hra ?? 0)
    const da = Number(row.salary_da ?? 0)
    const allowances = Number(row.salary_allowances ?? 0)

    const [commissionRes, lopDays] = await Promise.all([
      supabase
        .from('customer_leads' as any)
        .select('commission_earned, event_date, created_at')
        .eq('assigned_to', profileId)
        .in('pipeline_stage', ['booked', 'completed']),
      computeLOPDays(profileId, monthStart, monthEnd),
    ])
    if (commissionRes.error) throw commissionRes.error

    const commission = (commissionRes.data ?? []).reduce((sum: number, l: any) => {
      const date = l.event_date ?? l.created_at
      if (!date) return sum
      const dateStr = toLocalDateStr(new Date(date))
      if (dateStr >= monthStart && dateStr <= monthEnd) return sum + Number(l.commission_earned ?? 0)
      return sum
    }, 0)

    const grossPay = basic + hra + da + allowances + commission
    const lopAmount = totalDays > 0 ? (grossPay / totalDays) * lopDays : 0
    const deductions = 0
    const netPay = grossPay - lopAmount - deductions

    const { error: slipError } = await supabase
      .from('salary_slips' as any)
      .upsert({
        payroll_id: payrollId,
        profile_id: profileId,
        basic, hra, da, allowances, commission,
        lop_days: lopDays,
        lop_amount: lopAmount,
        deductions,
        gross_pay: grossPay,
        net_pay: netPay,
      }, { onConflict: 'payroll_id,profile_id' })
    if (slipError) throw slipError
  }

  return payrollRow
}

// =========================================
// READS
// =========================================
export async function getPayrollRuns(): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('payroll' as any).select('*').order('month', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function getSlipsForRun(payrollId: string): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('salary_slips' as any)
    .select('*, profile:profiles(id, full_name, avatar_url)')
    .eq('payroll_id', payrollId)
    .order('created_at')
  if (error) throw error
  return (data ?? []) as any
}

export async function getMySlips(profileId: string): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('salary_slips' as any)
    .select('*, payroll:payroll(month)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function getSlip(id: string): Promise<Record<string, any> | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('salary_slips' as any)
    .select('*, profile:profiles(id, full_name), payroll:payroll(month)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// =========================================
// UPDATE
// =========================================
export async function updateSlip(id: string, input: { deductions?: number; paymentStatus?: string }) {
  const supabase = createClient()
  const { data: current, error: fetchError } = await supabase
    .from('salary_slips' as any)
    .select('gross_pay, lop_amount')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  const update: Record<string, any> = {}
  if (input.deductions !== undefined) {
    update.deductions = input.deductions
    update.net_pay = Number((current as any).gross_pay) - Number((current as any).lop_amount) - input.deductions
  }
  if (input.paymentStatus !== undefined) {
    update.payment_status = input.paymentStatus
    update.paid_at = input.paymentStatus === 'paid' ? new Date().toISOString() : null
  }

  const { data, error } = await supabase.from('salary_slips' as any).update(update).eq('id', id).select().single()
  if (error) throw error
  return data
}
