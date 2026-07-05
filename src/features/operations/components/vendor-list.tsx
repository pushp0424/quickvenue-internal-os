'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useVendors, useDeleteVendor } from '@/features/operations/hooks/use-operations'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Truck, Phone, Mail, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function VendorList() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const scoped = isCityScoped(user?.roles ?? [])
  const cityId = scoped ? (user?.profile.city_id ?? undefined) : undefined

  const { data: vendors, isLoading } = useVendors({ cityId, search: search || undefined })
  const deleteVendor = useDeleteVendor()

  async function handleRemove(id: string, name: string) {
    try {
      await deleteVendor.mutateAsync(id)
      toast.success(`${name} removed`)
    } catch {
      toast.error('Failed to remove vendor')
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : !vendors || vendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No vendors yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your catering, decor, and other event vendors.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center gap-4 px-6 py-4">
                <div className="h-9 w-9 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4 text-[#0244C6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {vendor.category && `${String(vendor.category).replace(/_/g, ' ')} · `}
                    {vendor.contact_name}
                    {vendor.city?.name && ` · ${vendor.city.name}`}
                  </p>
                </div>
                {vendor.phone && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Phone className="h-3.5 w-3.5" />{vendor.phone}
                  </div>
                )}
                {vendor.email && (
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Mail className="h-3.5 w-3.5" />{vendor.email}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 shrink-0"
                  onClick={() => handleRemove(vendor.id, vendor.name)}
                  title="Remove vendor"
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
