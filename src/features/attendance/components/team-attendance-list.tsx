'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTeamAttendance } from '@/features/attendance/hooks/use-attendance'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { exportToCSV } from '@/lib/csv-export'
import { toLocalDateStr } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Users, Download, Printer } from 'lucide-react'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

const WORK_MODE_LABELS: Record<string, string> = {
  office: 'Office', wfh: 'WFH', field_visit: 'Field Visit',
}

interface Props {
  scope: 'all' | 'city' | 'team'
  fixedCityId?: string
  teamProfileIds?: string[]
}

export function TeamAttendanceList({ scope, fixedCityId, teamProfileIds }: Props) {
  const [date, setDate] = useState(() => toLocalDateStr(new Date()))
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const { data: cities } = useCities()

  const cityId = scope === 'city' ? fixedCityId : (scope === 'all' && cityFilter !== 'all' ? cityFilter : undefined)
  const enabled = scope !== 'team' || !!(teamProfileIds && teamProfileIds.length > 0)

  const { data: records, isLoading } = useTeamAttendance({
    cityId,
    profileIds: scope === 'team' ? teamProfileIds : undefined,
    monthStart: date,
    monthEnd: date,
  }, enabled)

  const filtered = (records ?? []).filter((r) =>
    !search || r.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  function handleExport() {
    exportToCSV(
      filtered.map((r) => ({
        name: r.profile?.full_name,
        date: r.date,
        check_in: formatTime(r.check_in_at),
        check_out: formatTime(r.check_out_at),
        late: r.is_late ? 'Yes' : 'No',
        work_mode: WORK_MODE_LABELS[r.work_mode] ?? r.work_mode,
      })),
      [
        { key: 'name', label: 'Name' },
        { key: 'date', label: 'Date' },
        { key: 'check_in', label: 'Check In' },
        { key: 'check_out', label: 'Check Out' },
        { key: 'late', label: 'Late' },
        { key: 'work_mode', label: 'Work Mode' },
      ],
      `attendance-${date}.csv`
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Team Attendance</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={`/attendance/report?date=${date}`} target="_blank">
                <Printer className="h-3.5 w-3.5" />
                Print
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-[160px]" />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {scope === 'all' && (
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All cities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {(cities ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No attendance records for this day</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs font-bold bg-[#0244C6] text-white">
                    {initials(r.profile?.full_name ?? '?')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    In {formatTime(r.check_in_at)} · Out {formatTime(r.check_out_at)}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {WORK_MODE_LABELS[r.work_mode] ?? r.work_mode}
                </Badge>
                {r.is_late && (
                  <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 shrink-0">
                    Late
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
