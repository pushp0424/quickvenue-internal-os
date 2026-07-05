'use client'

import { use } from 'react'
import Link from 'next/link'
import { useInvoice } from '@/features/finance/hooks/use-finance'
import { InvoiceStatusBadge } from '@/features/finance/components/invoice-status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Printer } from 'lucide-react'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: invoice, isLoading } = useInvoice(id)

  if (isLoading) {
    return (
      <div className="max-w-[700px] mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!invoice) return null

  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/finance" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Finance
        </Link>
        <Button className="gap-2 bg-[#0244C6] hover:bg-[#012775]" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Quick Venue OS</h1>
              <p className="text-sm text-muted-foreground mt-1">Invoice</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{invoice.invoice_number}</p>
              <div className="mt-1"><InvoiceStatusBadge status={invoice.status} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Billed To</p>
              <p className="font-medium mt-1">{invoice.customer_name}</p>
              {invoice.city?.name && <p className="text-muted-foreground">{invoice.city.name}</p>}
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Issued: <span className="text-foreground">{formatDate(invoice.issued_date)}</span></p>
              <p className="text-muted-foreground">Due: <span className="text-foreground">{formatDate(invoice.due_date)}</span></p>
              {invoice.status === 'paid' && (
                <p className="text-muted-foreground">Paid: <span className="text-foreground">{formatDate(invoice.paid_date)}</span></p>
              )}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="flex justify-between px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between px-4 py-4 text-sm">
              <span>Booking / service invoice</span>
              <span className="font-medium">₹{Number(invoice.amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-56 flex justify-between text-base font-semibold border-t pt-3">
              <span>Total</span>
              <span>₹{Number(invoice.amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground">Notes</p>
              <p className="mt-1">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
