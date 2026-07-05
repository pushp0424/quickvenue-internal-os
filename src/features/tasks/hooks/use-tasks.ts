'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTasks, getTaskById, createTask, updateTask, markTaskComplete, TaskInput,
  getTaskComments, addTaskComment,
  getTaskAttachments, uploadTaskAttachment, getTaskAttachmentSignedUrl, deleteTaskAttachment,
} from '@/services/supabase/tasks-services'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskInput) => createTask(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch, notifyProfileIds }: { id: string; patch: Record<string, unknown>; notifyProfileIds?: string[] }) =>
      updateTask(id, patch, notifyProfileIds),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['task', id] })
    },
  })
}

export function useMarkTaskComplete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notifyProfileIds }: { id: string; notifyProfileIds?: string[] }) =>
      markTaskComplete(id, notifyProfileIds),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['task', id] })
    },
  })
}

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => getTaskComments(taskId),
    enabled: !!taskId,
  })
}

export function useAddTaskComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: string }) => addTaskComment(taskId, body),
    onSuccess: (_data, { taskId }) => qc.invalidateQueries({ queryKey: ['task-comments', taskId] }),
  })
}

export function useTaskAttachments(taskId: string) {
  return useQuery({
    queryKey: ['task-attachments', taskId],
    queryFn: () => getTaskAttachments(taskId),
    enabled: !!taskId,
  })
}

export function useUploadTaskAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) => uploadTaskAttachment(taskId, file),
    onSuccess: (_data, { taskId }) => qc.invalidateQueries({ queryKey: ['task-attachments', taskId] }),
  })
}

export function useTaskAttachmentSignedUrl() {
  return useMutation({
    mutationFn: (filePath: string) => getTaskAttachmentSignedUrl(filePath),
  })
}

export function useDeleteTaskAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string; taskId: string }) => deleteTaskAttachment(id, filePath),
    onSuccess: (_data, { taskId }) => qc.invalidateQueries({ queryKey: ['task-attachments', taskId] }),
  })
}
