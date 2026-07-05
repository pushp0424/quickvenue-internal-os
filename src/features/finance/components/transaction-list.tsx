'use client'

import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useTransactions } from '@/features/finance/hooks/use-finance'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TransactionList() {
  const { user } = useAuth()
  const scoped = isCityScoped(user?.roles ?? [])
  const cityId = scoped ? (user?.profile.city_id ?? undefined) : undefined

  const { data: transactions, isLoading } = useTransactions({ cityId })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No transactions logged</p>
          <p className="text-xs text-muted-foreground mt-1">One-off income or expense entries will show up here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income'
          return (
            <div key={tx.id} className="flex items-center gap-4 px-6 py-3">
              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                isIncome ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-red-50 dark:bg-red-950')}>
                {isIncome
                  ? <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  : <ArrowDownRight className="h-4 w-4 text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description || (tx.category ? tx.category.replace(/_/g, ' ') : 'Transaction')}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {tx.city?.name && ` · ${tx.city.name}`}
                </p>
              </div>
              <p className={cn('text-sm font-semibold shrink-0', isIncome ? 'text-emerald-600' : 'text-red-600')}>
                {isIncome ? '+' : '−'}₹{Number(tx.amount).toLocaleString('en-IN')}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
