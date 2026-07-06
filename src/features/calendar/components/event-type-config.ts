import {
  Users, UserCheck, MapPin, PhoneCall, ListTodo, Cake, PartyPopper, LucideIcon,
} from 'lucide-react'
import { EventType } from '@/services/supabase/calendar-services'

export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; icon: LucideIcon; dot: string; pill: string }> = {
  meeting: { label: 'Meeting', icon: Users, dot: 'bg-blue-500', pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  interview: { label: 'Interview', icon: UserCheck, dot: 'bg-purple-500', pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  venue_visit: { label: 'Venue Visit', icon: MapPin, dot: 'bg-cyan-500', pill: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  follow_up: { label: 'Follow-up', icon: PhoneCall, dot: 'bg-amber-500', pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  deadline: { label: 'Deadline', icon: ListTodo, dot: 'bg-red-500', pill: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  birthday: { label: 'Birthday', icon: Cake, dot: 'bg-pink-500', pill: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  holiday: { label: 'Holiday', icon: PartyPopper, dot: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
}
