'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEmployeeProfile, updateEmployeeProfile, uploadAvatar, getDepartments,
  getSkills, addSkill, deleteSkill,
  getPerformanceNotes, addPerformanceNote,
  getFinancialDetails, upsertFinancialDetails,
  getEmployeeDocuments, uploadEmployeeDocument, getDocumentSignedUrl, deleteEmployeeDocument,
} from '@/services/supabase/employee-profile-services'

export function useEmployeeProfile(id: string) {
  return useQuery({
    queryKey: ['employee-profile', id],
    queryFn: () => getEmployeeProfile(id),
    enabled: !!id,
  })
}

export function useUpdateEmployeeProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) => updateEmployeeProfile(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['employee-profile', id] })
      qc.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, file }: { profileId: string; file: File }) => uploadAvatar(profileId, file),
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['employee-profile', profileId] })
      qc.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: 10 * 60 * 1000,
  })
}

export function useSkills(profileId: string) {
  return useQuery({
    queryKey: ['skills', profileId],
    queryFn: () => getSkills(profileId),
    enabled: !!profileId,
  })
}

export function useAddSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, skillName, proficiency }: { profileId: string; skillName: string; proficiency?: string }) =>
      addSkill(profileId, skillName, proficiency),
    onSuccess: (_data, { profileId }) => qc.invalidateQueries({ queryKey: ['skills', profileId] }),
  })
}

export function useDeleteSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; profileId: string }) => deleteSkill(id),
    onSuccess: (_data, { profileId }) => qc.invalidateQueries({ queryKey: ['skills', profileId] }),
  })
}

export function usePerformanceNotes(profileId: string) {
  return useQuery({
    queryKey: ['performance-notes', profileId],
    queryFn: () => getPerformanceNotes(profileId),
    enabled: !!profileId,
  })
}

export function useAddPerformanceNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, note }: { profileId: string; note: string }) => addPerformanceNote(profileId, note),
    onSuccess: (_data, { profileId }) => qc.invalidateQueries({ queryKey: ['performance-notes', profileId] }),
  })
}

export function useFinancialDetails(profileId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['financial-details', profileId],
    queryFn: () => getFinancialDetails(profileId),
    enabled: enabled && !!profileId,
  })
}

export function useUpsertFinancialDetails() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, input }: { profileId: string; input: Record<string, unknown> }) =>
      upsertFinancialDetails(profileId, input),
    onSuccess: (_data, { profileId }) => qc.invalidateQueries({ queryKey: ['financial-details', profileId] }),
  })
}

export function useEmployeeDocuments(profileId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['employee-documents', profileId],
    queryFn: () => getEmployeeDocuments(profileId),
    enabled: enabled && !!profileId,
  })
}

export function useUploadEmployeeDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, documentType, file }: { profileId: string; documentType: string; file: File }) =>
      uploadEmployeeDocument(profileId, documentType, file),
    onSuccess: (_data, { profileId }) => qc.invalidateQueries({ queryKey: ['employee-documents', profileId] }),
  })
}

export function useDocumentSignedUrl() {
  return useMutation({
    mutationFn: (filePath: string) => getDocumentSignedUrl(filePath),
  })
}

export function useDeleteEmployeeDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string; profileId: string }) => deleteEmployeeDocument(id, filePath),
    onSuccess: (_data, { profileId }) => qc.invalidateQueries({ queryKey: ['employee-documents', profileId] }),
  })
}
