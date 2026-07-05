/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'

async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// =========================================
// PROFILE
// =========================================
export async function getEmployeeProfile(id: string): Promise<Record<string, any> | null> {
  const supabase = createClient()
  const [{ data: profile, error }, { data: userRoles }] = await Promise.all([
    supabase
      .from('profiles' as any)
      .select('*, city_ref:cities!profiles_city_id_fkey(id, name), department:departments!profiles_department_id_fkey(id, name), reporting_manager:profiles!reporting_manager_id(id, full_name)')
      .eq('id', id)
      .single(),
    supabase.from('user_roles' as any).select('roles(name)').eq('user_id', id),
  ])
  if (error) throw error
  if (!profile) return null
  const roles = (userRoles ?? []).map((r: any) => r.roles?.name).filter(Boolean)
  return { ...(profile as any), roles }
}

export async function updateEmployeeProfile(id: string, input: Record<string, any>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles' as any)
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadAvatar(profileId: string, file: File) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${profileId}/avatar-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
  const { error } = await supabase.from('profiles' as any).update({ avatar_url: publicUrl }).eq('id', profileId)
  if (error) throw error
  return publicUrl
}

export async function getDepartments(): Promise<{ id: string; name: string }[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('departments' as any).select('id, name').order('name')
  if (error) throw error
  return (data ?? []) as any
}

// =========================================
// SKILLS
// =========================================
export async function getSkills(profileId: string): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('skills' as any)
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function addSkill(profileId: string, skillName: string, proficiency?: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('skills' as any)
    .insert({ profile_id: profileId, skill_name: skillName, proficiency: proficiency ?? null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSkill(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('skills' as any).delete().eq('id', id)
  if (error) throw error
}

// =========================================
// PERFORMANCE NOTES
// =========================================
export async function getPerformanceNotes(profileId: string): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('performance_notes' as any)
    .select('*, author:profiles!performance_notes_created_by_fkey(id, full_name)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function addPerformanceNote(profileId: string, note: string) {
  const supabase = createClient()
  const session = await getSession()
  const { data, error } = await supabase
    .from('performance_notes' as any)
    .insert({ profile_id: profileId, note, created_by: session?.user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

// =========================================
// FINANCIAL DETAILS (salary + bank — RLS restricted)
// =========================================
export async function getFinancialDetails(profileId: string): Promise<Record<string, any> | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employee_financial_details' as any)
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertFinancialDetails(profileId: string, input: Record<string, any>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employee_financial_details' as any)
    .upsert({ profile_id: profileId, ...input, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

// =========================================
// DOCUMENTS (RLS restricted)
// =========================================
export async function getEmployeeDocuments(profileId: string): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employee_documents' as any)
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function uploadEmployeeDocument(profileId: string, documentType: string, file: File) {
  const supabase = createClient()
  const session = await getSession()
  const path = `${profileId}/${documentType}-${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('employee-documents').upload(path, file)
  if (uploadError) throw uploadError
  const { data, error } = await supabase
    .from('employee_documents' as any)
    .insert({
      profile_id: profileId,
      document_type: documentType,
      file_path: path,
      file_name: file.name,
      uploaded_by: session?.user.id,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDocumentSignedUrl(filePath: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from('employee-documents').createSignedUrl(filePath, 60)
  if (error) throw error
  return data.signedUrl
}

export async function deleteEmployeeDocument(id: string, filePath: string) {
  const supabase = createClient()
  const { error: storageError } = await supabase.storage.from('employee-documents').remove([filePath])
  if (storageError) throw storageError
  const { error } = await supabase.from('employee_documents' as any).delete().eq('id', id)
  if (error) throw error
}
