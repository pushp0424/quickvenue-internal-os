'use client'

import { useRecentTeamMembers } from '@/features/dashboard/hooks/use-dashboard-stats'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function initials(name: string) {
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export function RecentTeamTable() {
    const { data: members, isLoading } = useRecentTeamMembers(5)

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (!members || members.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                    No team members yet. Add your first team member from Team Management.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-0">
                {members.map((member, i) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
                    >
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="bg-[#0244C6] text-white text-xs font-bold">
                                {initials(member.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                            <Badge variant={member.is_active ? 'default' : 'secondary'} className="text-[10px]">
                                {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{formatDate(member.created_at)}</span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}