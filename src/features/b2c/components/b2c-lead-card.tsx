import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { B2CStageSelect } from '@/features/b2c/components/b2c-stage-select'
import { Users, Phone, MessageCircle, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface B2CLeadCardData {
  id: string
  customer_name: string
  customer_phone: string
  customer_whatsapp: string | null
  event_type: string | null
  event_date: string | null
  guest_count: number | null
  budget_min: number | null
  budget_max: number | null
  booking_amount: number | null
  pipeline_stage: string
  follow_up_date: string | null
  city?: { name: string } | null
  assignee?: { full_name: string; avatar_url: string | null } | null
}

function isOverdue(dateStr: string | null, stage: string) {
  if (!dateStr || ['booked', 'completed', 'lost'].includes(stage)) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function toWhatsAppLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/91${digits}`
}

interface Props {
  lead: B2CLeadCardData
  variant?: 'row' | 'kanban'
}

// Note: quick actions and the stage select are real interactive elements
// (anchors, a select trigger) — they must stay as siblings of the Link,
// never nested inside it, or the outer navigation fires alongside the
// inner click (invalid nested <a>).
export function B2CLeadCard({ lead, variant = 'row' }: Props) {
  const overdue = isOverdue(lead.follow_up_date, lead.pipeline_stage)
  const whatsappPhone = lead.customer_whatsapp || lead.customer_phone

  const quickActions = (
    <div className="flex items-center gap-1.5 shrink-0">
      <a
        href={toWhatsAppLink(whatsappPhone)}
        target="_blank"
        rel="noopener noreferrer"
        className="h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
        title="WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
      </a>
      <a
        href={`tel:${lead.customer_phone}`}
        className="h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
        title="Call"
      >
        <Phone className="h-3.5 w-3.5 text-[#0244C6]" />
      </a>
    </div>
  )

  const assigneeAvatar = lead.assignee && (
    <Avatar size="sm" title={lead.assignee.full_name}>
      <AvatarImage src={lead.assignee.avatar_url ?? undefined} alt={lead.assignee.full_name} />
      <AvatarFallback>{lead.assignee.full_name.charAt(0)}</AvatarFallback>
    </Avatar>
  )

  const eventTypeBadge = lead.event_type && (
    <Badge className="text-[10px] font-medium border-0 bg-muted text-muted-foreground capitalize">
      {String(lead.event_type).replace(/_/g, ' ')}
    </Badge>
  )

  const budgetRange = lead.budget_min && lead.budget_max
    ? `₹${lead.budget_min.toLocaleString('en-IN')}-${lead.budget_max.toLocaleString('en-IN')}`
    : null

  if (variant === 'kanban') {
    return (
      <div className="rounded-lg border bg-card p-3 space-y-2 hover:shadow-md hover:border-[#0244C6]/40 transition-all">
        <Link href={`/b2c/${lead.id}`} className="block space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold truncate flex-1">{lead.customer_name}</p>
            {eventTypeBadge}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {lead.guest_count && `${lead.guest_count} guests · `}
            {budgetRange ?? lead.city?.name}
          </p>
          {lead.booking_amount != null && lead.booking_amount > 0 && (
            <p className="text-xs font-semibold text-emerald-600">
              ₹{lead.booking_amount.toLocaleString('en-IN')}
            </p>
          )}
        </Link>
        <div className="flex items-center justify-between pt-1">
          {assigneeAvatar}
          {quickActions}
        </div>
        {lead.follow_up_date && (
          <div className={cn('flex items-center gap-1 text-[11px]', overdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
            {overdue && <AlertCircle className="h-3 w-3" />}
            Follow-up {formatDate(lead.follow_up_date)}
          </div>
        )}
        <div className="pt-1">
          <B2CStageSelect leadId={lead.id} stage={lead.pipeline_stage} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
      <Link href={`/b2c/${lead.id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-[#0244C6]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">{lead.customer_name}</p>
            {eventTypeBadge}
            {overdue && (
              <span className="flex items-center gap-1 text-[11px] text-red-500 font-medium shrink-0">
                <AlertCircle className="h-3 w-3" /> Overdue
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {lead.guest_count && `${lead.guest_count} guests · `}
            {budgetRange && `${budgetRange} · `}
            {lead.city?.name}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          {lead.customer_phone}
        </div>

        {lead.event_date && (
          <div className="hidden lg:flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(lead.event_date)}
          </div>
        )}

        {lead.booking_amount != null && lead.booking_amount > 0 && (
          <div className="hidden sm:block shrink-0 text-xs font-semibold text-emerald-600">
            ₹{lead.booking_amount.toLocaleString('en-IN')}
          </div>
        )}

        <div className="hidden sm:flex shrink-0">{assigneeAvatar}</div>
      </Link>

      {quickActions}

      <div className="shrink-0">
        <B2CStageSelect leadId={lead.id} stage={lead.pipeline_stage} />
      </div>
    </div>
  )
}
