'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useInvoices, useDeleteInvoice } from '@/features/finance/hooks/use-finance'
import { InvoiceStatusSelect } from '@/features/finance/components/invoice-status-select'
import { ConfirmDeleteButton } from '@/components/shared/confirm-delete-button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'

export function InvoiceList() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const scoped = isCityScoped(user?.roles ?? [])
  const cityId = scoped ? (user?.profile.city_id ?? undefined) : undefined

  const { data: invoices, isLoading } = useInvoices({ cityId, search: search || undefined })
  const deleteInvoice = useDeleteInvoice()

  async function handleDelete(id: string) {
    try {
      await deleteInvoice.mutateAsync(id)
      toast.success('Invoice deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete invoice')
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : !invoices || invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No invoices yet</p>
            <p className="text-xs text-muted-foreground mt-1">Generate an invoice for a booked customer.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center gap-4 px-6 py-4">
                <div className="h-9 w-9 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-[#0244C6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{invoice.customer_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {invoice.invoice_number}
                    {invoice.due_date && ` · Due ${new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    {invoice.city?.name && ` · ${invoice.city.name}`}
                  </p>
                </div>
                <p className="text-sm font-semibold shrink-0">
                  ₹{Number(invoice.amount).toLocaleString('en-IN')}
                </p>
                <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0" asChild title="Print invoice">
                  <Link href={`/finance/invoices/${invoice.id}`}>
                    <Printer className="h-4 w-4" />
                  </Link>
                </Button>
                <ConfirmDeleteButton
                  iconOnly
                  className="h-8 w-8"
                  title="Delete invoice?"
                  description={`This permanently removes invoice ${invoice.invoice_number}. This cannot be undone.`}
                  onConfirm={() => handleDelete(invoice.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
