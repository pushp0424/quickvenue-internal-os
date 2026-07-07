'use client'

import { useRef, useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import {
  useTask, useUpdateTask, useDeleteTask,
  useTaskComments, useAddTaskComment, useDeleteTaskComment,
  useTaskAttachments, useUploadTaskAttachment, useTaskAttachmentSignedUrl, useDeleteTaskAttachment,
} from '@/features/tasks/hooks/use-tasks'
import { hasPermission } from '@/lib/permissions'
import { ConfirmDeleteButton } from '@/components/shared/confirm-delete-button'
import { TaskPriorityBadge } from '@/features/tasks/components/task-priority-badge'
import { TaskStatusBadge } from '@/features/tasks/components/task-status-badge'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FileText, Download, Trash2, Upload, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

interface Props {
  taskId: string | null
  onClose: () => void
}

export function TaskDetailPanel({ taskId, onClose }: Props) {
  const { user } = useAuth()
  const { data: task, isLoading } = useTask(taskId ?? '')
  const updateTask = useUpdateTask()
  const { data: comments } = useTaskComments(taskId ?? '')
  const addComment = useAddTaskComment()
  const { data: attachments } = useTaskAttachments(taskId ?? '')
  const uploadAttachment = useUploadTaskAttachment()
  const getSignedUrl = useTaskAttachmentSignedUrl()
  const deleteAttachment = useDeleteTaskAttachment()
  const deleteTask = useDeleteTask()
  const deleteComment = useDeleteTaskComment()

  const myId = user?.profile.id
  const isAdmin = hasPermission(user?.roles ?? [], 'MANAGE_USERS')
  const canManageTask = isAdmin || task?.assigned_by === myId

  const [commentBody, setCommentBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function watcherIds(): string[] {
    if (!task) return []
    const ids = new Set<string>()
    if (task.assigned_by) ids.add(task.assigned_by)
    ;(task.assignees ?? []).forEach((a) => a.profile?.id && ids.add(a.profile.id))
    if (user?.profile.id) ids.delete(user.profile.id)
    return Array.from(ids)
  }

  async function handleStatusChange(status: string) {
    if (!taskId) return
    try {
      await updateTask.mutateAsync({
        id: taskId,
        patch: { status, completed_at: status === 'done' ? new Date().toISOString() : null },
        notifyProfileIds: watcherIds(),
      })
      toast.success('Task updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!taskId || !commentBody.trim()) return
    setPosting(true)
    try {
      await addComment.mutateAsync({ taskId, body: commentBody.trim() })
      setCommentBody('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setPosting(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !taskId) return
    setUploading(true)
    try {
      await uploadAttachment.mutateAsync({ taskId, file })
      toast.success('Attachment uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload attachment')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDownload(filePath: string) {
    try {
      const url = await getSignedUrl.mutateAsync(filePath)
      window.open(url, '_blank')
    } catch {
      toast.error('Failed to generate download link')
    }
  }

  async function handleDeleteAttachment(id: string, filePath: string) {
    if (!taskId) return
    try {
      await deleteAttachment.mutateAsync({ id, filePath, taskId })
      toast.success('Attachment removed')
    } catch {
      toast.error('Failed to remove attachment')
    }
  }

  async function handleDeleteTask() {
    if (!taskId) return
    try {
      await deleteTask.mutateAsync(taskId)
      toast.success('Task deleted')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  async function handleDeleteComment(id: string) {
    if (!taskId) return
    try {
      await deleteComment.mutateAsync({ id, taskId })
      toast.success('Comment deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete comment')
    }
  }

  return (
    <Sheet open={!!taskId} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-[520px] w-full overflow-y-auto">
        {isLoading || !task ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="pr-8">{task.title}</SheetTitle>
              {task.description && <SheetDescription>{task.description}</SheetDescription>}
            </SheetHeader>

            <div className="px-4 space-y-6 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <TaskPriorityBadge priority={task.priority} />
                <TaskStatusBadge status={task.status} />
                {task.deadline && (
                  <span className="text-xs text-muted-foreground">Due {formatDateTime(task.deadline)}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Assigned to</span>
                <div className="flex -space-x-2">
                  {(task.assignees ?? []).map((a) => (
                    <Avatar key={a.profile?.id} className="h-7 w-7 border-2 border-background" title={a.profile?.full_name}>
                      <AvatarFallback className="bg-[#0244C6] text-white text-[10px] font-bold">
                        {a.profile?.full_name ? initials(a.profile.full_name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {(task.assignees ?? []).length === 0 && <span className="text-xs text-muted-foreground">Unassigned</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Attachments</h3>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => inputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Upload
                  </Button>
                  <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
                </div>
                {!attachments || attachments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No attachments yet.</p>
                ) : (
                  <div className="divide-y rounded-lg border">
                    {attachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-2 px-3 py-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 min-w-0 truncate text-sm">{att.file_name}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(att.file_path)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600" onClick={() => handleDeleteAttachment(att.id, att.file_path)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Comments</h3>
                <div className="space-y-3">
                  {(comments ?? []).map((c) => (
                    <div key={c.id} className="flex gap-2.5 group">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-[#0244C6] text-white text-[10px] font-bold">
                          {c.author?.full_name ? initials(c.author.full_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">{c.author?.full_name ?? 'Unknown'}</span>
                          <span className="text-[11px] text-muted-foreground">{formatDateTime(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.body}</p>
                      </div>
                      {(isAdmin || c.author_id === myId) && (
                        <ConfirmDeleteButton
                          iconOnly
                          className="opacity-0 group-hover:opacity-100 shrink-0"
                          title="Delete comment?"
                          description="This permanently removes the comment."
                          onConfirm={() => handleDeleteComment(c.id)}
                        />
                      )}
                    </div>
                  ))}
                  {(!comments || comments.length === 0) && (
                    <p className="text-xs text-muted-foreground">No comments yet.</p>
                  )}
                </div>
                <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                  <Textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Add a comment..."
                    className="min-h-9 flex-1 resize-none"
                  />
                  <Button type="submit" size="icon" disabled={posting || !commentBody.trim()} className="bg-[#0244C6] hover:bg-[#012775] shrink-0">
                    {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>

              {canManageTask && (
                <div className="border-t pt-4">
                  <ConfirmDeleteButton
                    label="Delete Task"
                    title="Delete this task?"
                    description="This permanently removes the task and all its comments and attachments. This cannot be undone."
                    onConfirm={handleDeleteTask}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
