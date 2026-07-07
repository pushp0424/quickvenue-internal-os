/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'

export interface SystemStat {
  label: string
  table: string
  count: number
}

// Live row counts for the key domain tables, shown on the Developer page so it
// reflects real data instead of hardcoded values.
const TRACKED_TABLES: { label: string; table: string }[] = [
  { label: 'Team Members', table: 'profiles' },
  { label: 'B2B Leads', table: 'leads' },
  { label: 'B2C Leads', table: 'customer_leads' },
  { label: 'Venues', table: 'venues' },
  { label: 'Tasks', table: 'tasks' },
  { label: 'Goals', table: 'goals' },
  { label: 'Calendar Events', table: 'events' },
  { label: 'Chat Messages', table: 'messages' },
  { label: 'Invoices', table: 'invoices' },
  { label: 'Payroll Runs', table: 'payroll' },
]

export async function getSystemStats(): Promise<SystemStat[]> {
  const supabase = createClient()
  const results = await Promise.all(
    TRACKED_TABLES.map(async ({ label, table }) => {
      const { count } = await supabase.from(table as any).select('id', { count: 'exact', head: true })
      return { label, table, count: count ?? 0 }
    })
  )
  return results
}
