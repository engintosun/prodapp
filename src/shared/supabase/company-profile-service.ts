import { supabase } from './client'

export interface CompanyProfile {
  userId: string
  companyName: string
  legalType: string | null
  kulturGirisimBelgeli: boolean
  kulturYatirimBelgeli: boolean
  sgkBorcuYok: boolean
}

interface CompanyProfileRow {
  user_id: string
  company_name: string
  legal_type: string | null
  kultur_girisim_belgeli: boolean
  kultur_yatirim_belgeli: boolean
  sgk_borcu_yok: boolean
}

function fromRow(row: CompanyProfileRow): CompanyProfile {
  return {
    userId: row.user_id,
    companyName: row.company_name,
    legalType: row.legal_type,
    kulturGirisimBelgeli: row.kultur_girisim_belgeli,
    kulturYatirimBelgeli: row.kultur_yatirim_belgeli,
    sgkBorcuYok: row.sgk_borcu_yok,
  }
}

export async function getOwnCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  const { data, error } = await supabase
    .from('company_profile')
    .select('user_id, company_name, legal_type, kultur_girisim_belgeli, kultur_yatirim_belgeli, sgk_borcu_yok')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? fromRow(data as unknown as CompanyProfileRow) : null
}

async function resolveProjectOwner(projectId: string): Promise<string> {
  const { data, error } = await supabase
    .from('projects')
    .select('created_by')
    .eq('id', projectId)
    .single()
  if (error) throw new Error(error.message)
  return data.created_by as string
}

// Davetli muhasebe kullanicisi da bu fonksiyonu cagirir - profil daima proje SAHIBININ
// (projects.created_by) satiridir, cagiranin kendi user_id'si degil (RLS company_profile_update
// bu esaslarla yazildi).
export async function getCompanyProfileForProject(projectId: string): Promise<CompanyProfile | null> {
  const ownerId = await resolveProjectOwner(projectId)
  return getOwnCompanyProfile(ownerId)
}

export interface CompanyProfileAnswers {
  legalType: string | null
  kulturGirisimBelgeli: boolean
  kulturYatirimBelgeli: boolean
  sgkBorcuYok: boolean
}

export async function updateCompanyProfileForProject(
  projectId: string,
  updatedBy: string,
  answers: CompanyProfileAnswers,
): Promise<void> {
  const ownerId = await resolveProjectOwner(projectId)
  const { error } = await supabase
    .from('company_profile')
    .update({
      legal_type: answers.legalType,
      kultur_girisim_belgeli: answers.kulturGirisimBelgeli,
      kultur_yatirim_belgeli: answers.kulturYatirimBelgeli,
      sgk_borcu_yok: answers.sgkBorcuYok,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    })
    .eq('user_id', ownerId)
  if (error) throw new Error(error.message)
}
