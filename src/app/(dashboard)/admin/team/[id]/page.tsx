'use client'

import { use } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useEmployeeProfile } from '@/features/employee-profile/hooks/use-employee-profile'
import { AvatarUpload } from '@/features/employee-profile/components/avatar-upload'
import { PersonalDetailsForm } from '@/features/employee-profile/components/personal-details-form'
import { OfficialDetailsForm } from '@/features/employee-profile/components/official-details-form'
import { SkillsList } from '@/features/employee-profile/components/skills-list'
import { PerformanceNotes } from '@/features/employee-profile/components/performance-notes'
import { FinancialDetailsForm } from '@/features/employee-profile/components/financial-details-form'
import { DocumentsList } from '@/features/employee-profile/components/documents-list'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { data: profile, isLoading } = useEmployeeProfile(id)

  const isSelf = user?.profile.id === id
  const canManageHR = hasPermission(user?.roles ?? [], 'MANAGE_HR')
  const canViewSensitive = isSelf || hasPermission(user?.roles ?? [], 'VIEW_SALARY')
  const canEditSalary = hasPermission(user?.roles ?? [], 'VIEW_SALARY')
  const canEditBank = isSelf || hasPermission(user?.roles ?? [], 'VIEW_BANK_DETAILS')

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px]">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="space-y-6 max-w-[1400px]">
      <Link href="/admin/team" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Team Management
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AvatarUpload
              profileId={id}
              fullName={profile.full_name}
              avatarUrl={profile.avatar_url}
              editable={isSelf || canManageHR}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">{profile.full_name}</h1>
                {!profile.is_active && (
                  <Badge variant="outline" className="text-red-500 border-red-200">Inactive</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {profile.designation && `${profile.designation} · `}
                {profile.city_ref?.name ?? profile.city}
              </p>
              <div className="flex gap-1.5 flex-wrap mt-2">
                {(profile.roles ?? []).map((role: string) => (
                  <Badge key={role} className="text-[10px] bg-[#0244C6]/10 text-[#0244C6] border-0">
                    {formatRole(role)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalDetailsForm
          profileId={id}
          profile={profile as any}
          editable={isSelf || canManageHR}
        />
        <OfficialDetailsForm
          profileId={id}
          profile={profile as any}
          editable={canManageHR}
        />
      </div>

      <SkillsList profileId={id} editable={isSelf || canManageHR} />

      <PerformanceNotes profileId={id} canAdd={canManageHR} />

      {canViewSensitive && (
        <>
          <FinancialDetailsForm profileId={id} canEditSalary={canEditSalary} canEditBank={canEditBank} />
          <DocumentsList profileId={id} canManage={canViewSensitive} />
        </>
      )}
    </div>
  )
}
