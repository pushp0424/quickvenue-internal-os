import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { B2BPriorityBadge } from '@/features/b2b/components/b2b-priority-badge'
import { B2BStageSelect } from '@/features/b2b/components/b2b-stage-select'
import { Building2, Phone, MessageCircle, MapPin, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface B2BLeadCardData {
  id: string
  venue_name: string | null
  venue_category: string | null
  venue_area: string | null
  owner_name: string | null
  owner_phone: string | null
  owner_whatsapp: string | null
  priority: string | null
  pipeline_stage: string | null
  follow_up_date: string | null
  updated_at: string | null
  city?: { name: string } | null
  assignee?: { full_name: string; avatar_url: string | null } | null
}

function isOverdue(dateStr: string | null, stage: string | null) {
  if (!dateStr || stage === 'onboarded') return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

function daysInStage(dateStr: string | null) {
  if (!dateStr) return null
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000))
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function toWhatsAppLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/91${digits}`
}

interface Props {
  lead: B2BLeadCardData
  variant?: 'row' | 'kanban'
}

// Note: quick actions and the stage select are real interactive elements
// (anchors, a select trigger) — they must stay as siblings of the Link,
// never nested inside it, or the outer navigation fires alongside the
// inner click (invalid nested <a>).
export function B2BLeadCard({ lead, variant = 'row' }: Props) {
  const overdue = isOverdue(lead.follow_up_date, lead.pipeline_stage)
  const days = daysInStage(lead.updated_at)
  const whatsappPhone = lead.owner_whatsapp || lead.owner_phone

  const quickActions = (
    <div className="flex items-center gap-1.5 shrink-0">
      {whatsappPhone && (
        <a
          href={toWhatsAppLink(whatsappPhone)}
          target="_blank"
          rel="noopener noreferrer"
          className="h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          title="WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
        </a>
      )}
      {lead.owner_phone && (
        <a
          href={`tel:${lead.owner_phone}`}
          className="h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          title="Call"
        >
          <Phone className="h-3.5 w-3.5 text-[#0244C6]" />
        </a>
      )}
    </div>
  )

  const assigneeAvatar = lead.assignee && (
    <Avatar size="sm" title={lead.assignee.full_name}>
      <AvatarImage src={lead.assignee.avatar_url ?? undefined} alt={lead.assignee.full_name} />
      <AvatarFallback>{lead.assignee.full_name.charAt(0)}</AvatarFallback>
    </Avatar>
  )

  if (variant === 'kanban') {
    return (
      <div className="rounded-lg border bg-card p-3 space-y-2 hover:shadow-md hover:border-[#0244C6]/40 transition-all">
        <Link href={`/b2b/${lead.id}`} className="block space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold truncate flex-1">{lead.venue_name ?? 'Unnamed Venue'}</p>
            <B2BPriorityBadge priority={lead.priority} />
          </div>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {lead.venue_area && `${lead.venue_area} · `}{lead.city?.name}
          </p>
          {lead.owner_name && (
            <p className="text-xs text-muted-foreground truncate">{lead.owner_name}</p>
          )}
        </Link>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {assigneeAvatar}
            {days != null && <span className="text-[10px] text-muted-foreground">{days}d in stage</span>}
          </div>
          {quickActions}
        </div>
        {lead.follow_up_date && (
          <div className={cn('flex items-center gap-1 text-[11px]', overdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
            {overdue && <AlertCircle className="h-3 w-3" />}
            Follow-up {formatDate(lead.follow_up_date)}
          </div>
        )}
        <div className="pt-1">
          <B2BStageSelect leadId={lead.id} stage={lead.pipeline_stage} size="sm" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
      <Link href={`/b2b/${lead.id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
          <Building2 className="h-4 w-4 text-[#0244C6]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">{lead.venue_name ?? 'Unnamed Venue'}</p>
            <B2BPriorityBadge priority={lead.priority} />
            {overdue && (
              <span className="flex items-center gap-1 text-[11px] text-red-500 font-medium shrink-0">
                <AlertCircle className="h-3 w-3" /> Overdue
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {lead.venue_area && `${lead.venue_area} · `}
            {lead.city?.name && `${lead.city.name} · `}
            {lead.venue_category && `${String(lead.venue_category).replace(/_/g, ' ')} · `}
            {lead.owner_name ?? 'No owner listed'}
          </p>
        </div>

        {lead.owner_phone && (
          <div className="hidden md:flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {lead.owner_phone}
          </div>
        )}

        {lead.follow_up_date && (
          <div className={cn('hidden lg:block shrink-0 text-xs', overdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
            {formatDate(lead.follow_up_date)}
          </div>
        )}

        <div className="hidden sm:flex shrink-0">{assigneeAvatar}</div>
      </Link>

      {quickActions}

      <div className="shrink-0">
        <B2BStageSelect leadId={lead.id} stage={lead.pipeline_stage} />
      </div>
    </div>
  )
}
