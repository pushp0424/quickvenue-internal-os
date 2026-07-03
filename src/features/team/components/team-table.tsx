'use client'

import { useState } from 'react'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { MemberActions } from '@/features/team/components/member-actions'
import { useAuth } from '@/context/auth-provider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Users } from 'lucide-react'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const ROLE_COLORS: Record<string, string> = {
  founder: 'bg-[#D4AF37]/20 text-[#92700a] dark:text-[#D4AF37]',
  admin: 'bg-[#0244C6]/10 text-[#0244C6]',
  city_lead: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  sales_executive: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  operations_executive: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  venue_acquisition_executive: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  developer: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  hr: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

export function TeamTable() {
  const { user } = useAuth()
  const { data: members, isLoading } = useTeamMembers()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const cities = [...new Set((members ?? []).map((m) => m.city).filter(Boolean))] as string[]

  const filtered = (members ?? []).filter((m) => {
    const matchSearch =
      !search ||
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.designation?.toLowerCase().includes(search.toLowerCase())

    const matchCity = cityFilter === 'all' || m.city === cityFilter
    const matchRole = roleFilter === 'all' || m.roles.includes(roleFilter as any)
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && m.is_active) ||
      (statusFilter === 'inactive' && !m.is_active)

    return matchSearch && matchCity && matchRole && matchStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="founder">Founder</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="city_lead">City Lead</SelectItem>
            <SelectItem value="sales_executive">Sales Executive</SelectItem>
            <SelectItem value="operations_executive">Operations Exec</SelectItem>
            <SelectItem value="venue_acquisition_executive">Venue Acq. Exec</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} member{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20 hidden sm:block" />
                <Skeleton className="h-6 w-16 hidden md:block" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No members found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filtered.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
              >
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback
                    className={`text-xs font-bold ${member.is_active ? 'bg-[#0244C6] text-white' : 'bg-muted text-muted-foreground'}`}
                  >
                    {initials(member.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{member.full_name}</p>
                    {!member.is_active && (
                      <Badge variant="outline" className="text-[10px] text-red-500 border-red-200 shrink-0">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  {member.designation && (
                    <p className="text-xs text-muted-foreground truncate">{member.designation}</p>
                  )}
                </div>

                {/* Roles */}
                <div className="hidden sm:flex gap-1 flex-wrap justify-end max-w-[180px] shrink-0">
                  {member.roles.length > 0 ? (
                    member.roles.map((role) => (
                      <Badge
                        key={role}
                        className={`text-[10px] border-0 ${ROLE_COLORS[role] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {formatRole(role)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      No role
                    </Badge>
                  )}
                </div>

                {/* City */}
                <div className="hidden md:block w-24 shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">{member.city ?? '—'}</p>
                </div>

                {/* Joined date */}
                <div className="hidden lg:block w-28 shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">{formatDate(member.created_at)}</p>
                </div>

                {/* Actions */}
                {user && (
                  <MemberActions
                    member={member}
                    currentUserId={user.profile.id}
                  />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}