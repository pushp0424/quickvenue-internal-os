'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, MapPin, TrendingUp, Settings } from 'lucide-react'

const actions = [
  {
    label: 'Add Team Member',
    icon: UserPlus,
    href: '/admin/team',
    color: 'text-blue-600',
    bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900',
  },
  {
    label: 'View City Data',
    icon: MapPin,
    href: '/city',
    color: 'text-purple-600',
    bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900',
  },
  {
    label: 'Sales Dashboard',
    icon: TrendingUp,
    href: '/sales',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-600',
    bg: 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800',
  },
]

export function QuickActionsCard() {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-center transition-colors cursor-pointer ${action.bg}`}
            >
              <Icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs font-medium leading-tight">{action.label}</span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}