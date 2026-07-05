'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useExpenses, useDeleteExpense } from '@/features/finance/hooks/use-finance'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Receipt, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function ExpenseList() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const scoped = isCityScoped(user?.roles ?? [])
  const cityId = scoped ? (user?.profile.city_id ?? undefined) : undefined

  const { data: expenses, isLoading } = useExpenses({ cityId, search: search || undefined })
  const deleteExpense = useDeleteExpense()

  async function handleRemove(id: string) {
    try {
      await deleteExpense.mutateAsync(id)
      toast.success('Expense removed')
    } catch {
      toast.error('Failed to remove expense')
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : !expenses || expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No expenses yet</p>
            <p className="text-xs text-muted-foreground mt-1">Track salaries, rent, marketing, and other costs.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-4 px-6 py-4">
                <div className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center shrink-0">
                  <Receipt className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {expense.category && `${String(expense.category).replace(/_/g, ' ')} · `}
                    {new Date(expense.expense_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {expense.city?.name && ` · ${expense.city.name}`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-red-600 shrink-0">
                  −₹{Number(expense.amount).toLocaleString('en-IN')}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 shrink-0"
                  onClick={() => handleRemove(expense.id)}
                  title="Remove expense"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
