import { supabase } from './client'
import type { Department, Invitation, UserRole } from '../types/domain'

async function getIdentity(): Promise<{ projectId: string; invitedBy: string }> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Oturum bulunamadi, tekrar giris yapin')
  const projectId = data.user.app_metadata?.project_id as string | undefined
  if (!projectId) throw new Error('Aktif proje bulunamadi')
  return { projectId, invitedBy: data.user.id }
}

export async function getDepartments(): Promise<Department[]> {
  const { projectId } = await getIdentity()
  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .eq('project_id', projectId)
    .order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Department[]
}

export interface CreateInvitationInput {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  deptId: string | null
}

export async function createInvitation(input: CreateInvitationInput): Promise<Invitation> {
  const { projectId, invitedBy } = await getIdentity()
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      project_id: projectId,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      role: input.role,
      dept_id: input.role === 'muhasebe' ? null : input.deptId,
      token,
      invited_by: invitedBy,
      expires_at: expiresAt,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Invitation
}
