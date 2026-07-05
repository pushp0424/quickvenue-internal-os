'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OnboardingChecklistVenue {
  agreement_status: string | null
  images: string[] | null
  price_per_day: number | null
  price_per_hour: number | null
  listed_on_platform: boolean
  test_booking_done: boolean
}

interface Props {
  venue: OnboardingChecklistVenue
  onToggle: (field: 'listed_on_platform' | 'test_booking_done', value: boolean) => void
  disabled?: boolean
}

export function OnboardingChecklist({ venue, onToggle, disabled }: Props) {
  const items = [
    { key: 'agreement', label: 'Agreement signed', done: venue.agreement_status === 'signed', editable: false as const },
    { key: 'photos', label: 'Photos uploaded', done: (venue.images?.length ?? 0) > 0, editable: false as const },
    { key: 'pricing', label: 'Pricing confirmed', done: venue.price_per_day != null || venue.price_per_hour != null, editable: false as const },
    { key: 'listed', label: 'Listed on platform', done: venue.listed_on_platform, editable: true as const, field: 'listed_on_platform' as const },
    { key: 'test_booking', label: 'Test booking done', done: venue.test_booking_done, editable: true as const, field: 'test_booking_done' as const },
  ]
  const doneCount = items.filter((i) => i.done).length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Onboarding checklist</span>
        <span className="font-medium">{doneCount}/{items.length}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', doneCount === items.length ? 'bg-emerald-500' : 'bg-[#0244C6]')}
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>
      <div className="space-y-1.5 pt-1">
        {items.map((item) => (
          <label
            key={item.key}
            className={cn('flex items-center gap-2 text-xs', item.editable && !disabled ? 'cursor-pointer' : '')}
          >
            {item.editable ? (
              <Checkbox
                checked={item.done}
                disabled={disabled}
                onCheckedChange={(checked) => onToggle(item.field, checked === true)}
                className="h-3.5 w-3.5"
              />
            ) : (
              <span className={cn(
                'h-3.5 w-3.5 rounded-sm border flex items-center justify-center shrink-0',
                item.done ? 'bg-emerald-500 border-emerald-500' : 'border-input'
              )}>
                {item.done && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
            )}
            <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
