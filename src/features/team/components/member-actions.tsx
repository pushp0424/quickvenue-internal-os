'use client'

import { useState } from 'react'
import { useDeactivateMember, useReactivateMember, useUpdateMemberRole } from '@/features/team/hooks/use-team'
import { TeamMember } from '@/services/supabase/team-queries'
import { RoleName } from '@/types/auth.types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, UserX, UserCheck, Shield } from 'lucide-react'
import { toast } from 'sonner'

const ASSIGNABLE_ROLES: { value: RoleName; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'city_lead', label: 'City Lead' },
  { value: 'sales_executive', label: 'Sales Executive' },
  { value: 'operations_executive', label: 'Operations Executive' },
  { value: 'venue_acquisition_executive', label: 'Venue Acquisition Exec' },
  { value: 'developer', label: 'Developer' },
  { value: 'hr', label: 'HR' },
]

interface Props {
  member: TeamMember
  currentUserId: string
}

export function MemberActions({ member, currentUserId }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deactivate = useDeactivateMember()
  const reactivate = useReactivateMember()
  const updateRole = useUpdateMemberRole()

  const isSelf = member.id === currentUserId

  async function handleDeactivate() {
    try {
      await deactivate.mutateAsync(member.id)
      toast.success(`${member.full_name} has been deactivated`)
    } catch {
      toast.error('Failed to deactivate member')
    }
  }

  async function handleReactivate() {
    try {
      await reactivate.mutateAsync(member.id)
      toast.success(`${member.full_name} has been reactivated`)
    } catch {
      toast.error('Failed to reactivate member')
    }
  }

  async function handleRoleChange(role: RoleName) {
    try {
      await updateRole.mutateAsync({ userId: member.id, role })
      toast.success(`Role updated to ${role.replace(/_/g, ' ')}`)
    } catch {
      toast.error('Failed to update role')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Change Role */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Shield className="h-4 w-4" />
              Change Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {ASSIGNABLE_ROLES.map((r) => (
                <DropdownMenuItem
                  key={r.value}
                  onClick={() => handleRoleChange(r.value)}
                  className="gap-2"
                  disabled={member.roles.includes(r.value)}
                >
                  {r.label}
                  {member.roles.includes(r.value) && (
                    <span className="ml-auto text-xs text-muted-foreground">current</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Activate / Deactivate */}
          {member.is_active ? (
            <DropdownMenuItem
              onClick={() => setConfirmOpen(true)}
              disabled={isSelf}
              className="gap-2 text-red-600 focus:text-red-600"
            >
              <UserX className="h-4 w-4" />
              Deactivate
              {isSelf && <span className="ml-auto text-xs text-muted-foreground">can't self</span>}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={handleReactivate}
              className="gap-2 text-emerald-600 focus:text-emerald-600"
            >
              <UserCheck className="h-4 w-4" />
              Reactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirm deactivate dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {member.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will immediately lose access to Quick Venue OS. You can reactivate them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}