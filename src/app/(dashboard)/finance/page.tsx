'use client'

import {
  useFinanceStats, useCityRevenueBreakdown,
  useExpenses, useInvoices, useTransactions,
} from '@/features/finance/hooks/use-finance'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { ExpenseList } from '@/features/finance/components/expense-list'
import { AddExpenseModal } from '@/features/finance/components/add-expense-modal'
import { InvoiceList } from '@/features/finance/components/invoice-list'
import { AddInvoiceModal } from '@/features/finance/components/add-invoice-modal'
import { TransactionList } from '@/features/finance/components/transaction-list'
import { AddTransactionModal } from '@/features/finance/components/add-transaction-modal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/csv-export'
import {
  ShoppingBag, TrendingUp, Receipt, PiggyBank, Flame, MapPin, Download,
} from 'lucide-react'

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export default function FinanceDashboard() {
  const { data: stats, isLoading: statsLoading } = useFinanceStats()
  const { data: cityRevenue, isLoading: cityLoading } = useCityRevenueBreakdown()
  const { data: expenses } = useExpenses()
  const { data: invoices } = useInvoices()
  const { data: transactions } = useTransactions()

  const burnPositive = (stats?.burnRate ?? 0) <= 0

  function handleExport() {
    const rows = [
      ...(expenses ?? []).map((e) => ({ type: 'expense', date: e.expense_date, description: e.description, category: e.category, amount: -Number(e.amount) })),
      ...(invoices ?? []).map((i) => ({ type: 'invoice', date: i.issued_date, description: `${i.invoice_number} — ${i.customer_name}`, category: i.status, amount: Number(i.amount) })),
      ...(transactions ?? []).map((t) => ({ type: 'transaction', date: t.transaction_date, description: t.description, category: t.category, amount: t.type === 'income' ? Number(t.amount) : -Number(t.amount) })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    exportToCSV(
      rows,
      [
        { key: 'date', label: 'Date' },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount' },
      ],
      `finance-report-${new Date().toISOString().slice(0, 10)}.csv`
    )
  }

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground text-sm mt-1">Revenue, expenses, invoices, and profitability</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Booking Revenue (Month)" value={inr(stats?.bookingRevenue.month ?? 0)}
          sub={`Q: ${inr(stats?.bookingRevenue.quarter ?? 0)} · Y: ${inr(stats?.bookingRevenue.year ?? 0)}`}
          icon={ShoppingBag} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={statsLoading} />
        <StatCard label="Revenue (Month)" value={inr(stats?.revenue.month ?? 0)}
          sub={`Q: ${inr(stats?.revenue.quarter ?? 0)} · Y: ${inr(stats?.revenue.year ?? 0)}`}
          icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={statsLoading} />
        <StatCard label="Expenses (Month)" value={inr(stats?.expenses.month ?? 0)}
          sub={`Q: ${inr(stats?.expenses.quarter ?? 0)} · Y: ${inr(stats?.expenses.year ?? 0)}`}
          icon={Receipt} iconColor="text-red-600" iconBg="bg-red-50 dark:bg-red-950" loading={statsLoading} />
        <StatCard label="Profit (Month)" value={inr(stats?.profit.month ?? 0)}
          sub={`Q: ${inr(stats?.profit.quarter ?? 0)} · Y: ${inr(stats?.profit.year ?? 0)}`}
          icon={PiggyBank} iconColor="text-violet-600" iconBg="bg-violet-50 dark:bg-violet-950" loading={statsLoading} />
        <StatCard label="Burn Rate (Month)" value={inr(Math.abs(stats?.burnRate ?? 0))}
          sub={burnPositive ? 'Profitable this month' : 'Burning cash this month'}
          icon={Flame} iconColor={burnPositive ? 'text-emerald-600' : 'text-amber-600'}
          iconBg={burnPositive ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-amber-50 dark:bg-amber-950'} loading={statsLoading} />
      </div>

      {/* City-wise revenue breakdown */}
      <div>
        <SectionHeader title="City-wise Revenue" subtitle="Commission revenue by city" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cityLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !cityRevenue || cityRevenue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revenue recorded yet.</p>
          ) : (
            cityRevenue.map((c) => (
              <Card key={c.cityId}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#0244C6]" />
                    {c.cityName}
                  </div>
                  <p className="text-2xl font-bold tracking-tight mt-1">{inr(c.revenue)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <SectionHeader title="Invoices" subtitle="Generate and track payment status" action={<AddInvoiceModal />} />
        <div className="mt-4">
          <InvoiceList />
        </div>
      </div>

      {/* Expenses */}
      <div>
        <SectionHeader title="Expenses" subtitle="Track spend by category" action={<AddExpenseModal />} />
        <div className="mt-4">
          <ExpenseList />
        </div>
      </div>

      {/* Transactions ledger */}
      <div>
        <SectionHeader title="Transactions" subtitle="Misc income and expense entries" action={<AddTransactionModal />} />
        <div className="mt-4">
          <TransactionList />
        </div>
      </div>
    </div>
  )
}
