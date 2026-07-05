/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import { createNotifications } from '@/services/supabase/notifications-services'

async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

const TASK_SELECT = '*, assigned_by_profile:profiles!tasks_assigned_by_fkey(id, full_name), assignees:task_assignees(profile:profiles(id, full_name, avatar_url))'

export interface TaskInput {
  title: string
  description?: string
  assigneeIds: string[]
  team?: string
  department?: string
  city?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: string
}

export interface TaskProfileSummary {
  id: string
  full_name: string
  avatar_url?: string | null
}

export interface Task {
  id: string
  title: string
  description: string | null
  assigned_by: string | null
  assigned_by_profile: TaskProfileSummary | null
  team: string | null
  department: string | null
  city: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
  completed_at: string | null
  created_at: string
  updated_at: string
  assignees: { profile: TaskProfileSummary | null }[]
}

export interface TaskComment {
  id: string
  task_id: string
  author_id: string | null
  author: TaskProfileSummary | null
  body: string
  created_at: string
}

export interface TaskAttachment {
  id: string
  task_id: string
  file_path: string
  file_name: string
  uploaded_by: string | null
  created_at: string
}

// =========================================
// TASKS
// =========================================
export async function getTasks(): Promise<Task[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks' as any)
    .select(TASK_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks' as any)
    .select(TASK_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as any
}

export async function createTask(input: TaskInput) {
  const supabase = createClient()
  const session = await getSession()
  const { data: task, error } = await supabase
    .from('tasks' as any)
    .insert({
      title: input.title,
      description: input.description ?? null,
      assigned_by: session?.user.id,
      team: input.team ?? null,
      department: input.department ?? null,
      city: input.city ?? null,
      priority: input.priority,
      deadline: input.deadline ?? null,
    })
    .select()
    .single()
  if (error) throw error

  if (input.assigneeIds.length > 0) {
    const { error: assigneeError } = await supabase
      .from('task_assignees' as any)
      .insert(input.assigneeIds.map((profileId) => ({ task_id: (task as any).id, profile_id: profileId })))
    if (assigneeError) throw assigneeError

    await createNotifications(
      input.assigneeIds.map((profileId) => ({
        recipientId: profileId,
        type: 'task_assigned',
        title: 'New task assigned to you',
        body: input.title,
        link: `/tasks?id=${(task as any).id}`,
      }))
    )
  }

  return task
}

export async function updateTask(id: string, patch: Record<string, any>, notifyProfileIds: string[] = []) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks' as any)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  if (notifyProfileIds.length > 0) {
    await createNotifications(
      notifyProfileIds.map((profileId) => ({
        recipientId: profileId,
        type: 'task_updated',
        title: 'Task updated',
        body: (data as any)?.title,
        link: `/tasks?id=${id}`,
      }))
    )
  }

  return data
}

export async function markTaskComplete(id: string, notifyProfileIds: string[] = []) {
  return updateTask(id, { status: 'done', completed_at: new Date().toISOString() }, notifyProfileIds)
}

// =========================================
// COMMENTS
// =========================================
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('task_comments' as any)
    .select('*, author:profiles(id, full_name, avatar_url)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as any
}

export async function addTaskComment(taskId: string, body: string) {
  const supabase = createClient()
  const session = await getSession()
  const { data, error } = await supabase
    .from('task_comments' as any)
    .insert({ task_id: taskId, author_id: session?.user.id, body })
    .select('*, author:profiles(id, full_name, avatar_url)')
    .single()
  if (error) throw error
  return data
}

// =========================================
// ATTACHMENTS
// =========================================
export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('task_attachments' as any)
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function uploadTaskAttachment(taskId: string, file: File) {
  const supabase = createClient()
  const session = await getSession()
  const path = `${taskId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('task-attachments').upload(path, file)
  if (uploadError) throw uploadError
  const { data, error } = await supabase
    .from('task_attachments' as any)
    .insert({ task_id: taskId, file_path: path, file_name: file.name, uploaded_by: session?.user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTaskAttachmentSignedUrl(filePath: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from('task-attachments').createSignedUrl(filePath, 60)
  if (error) throw error
  return data.signedUrl
}

export async function deleteTaskAttachment(id: string, filePath: string) {
  const supabase = createClient()
  const { error: storageError } = await supabase.storage.from('task-attachments').remove([filePath])
  if (storageError) throw storageError
  const { error } = await supabase.from('task_attachments' as any).delete().eq('id', id)
  if (error) throw error
}
