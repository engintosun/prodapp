import { supabase } from './client'

export interface ProfileWithProject {
  project_id: string
  role: string
  dept_id: string | null
  projects: { name: string }
}

export async function getOwnProfiles(): Promise<ProfileWithProject[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('project_id, role, dept_id, projects(name)')
    .eq('membership_status', 'active')

  if (error) throw new Error(error.message)
  return data as unknown as ProfileWithProject[]
}

export async function setClaims(projectId: string): Promise<void> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !sessionData.session) {
    throw new Error('Oturum bulunamadı, tekrar giriş yapın')
  }

  const response = await fetch(
    import.meta.env.VITE_SUPABASE_URL + '/functions/v1/set-claims',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + sessionData.session.access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project_id: projectId }),
    }
  )

  const json = await response.json().catch(() => ({}))

  if (!response.ok || json.error) {
    throw new Error(json.error ?? 'Proje seçimi başarısız, tekrar deneyin')
  }

  const { error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError) throw new Error('Oturum yenilenemedi: ' + refreshError.message)
}

export async function signOut(): Promise<void> {
  try {
    await supabase.functions.invoke('clear-claims', { body: {} })
  } catch (_e) {
    // best-effort: clear-claims basarisiz olsa bile signOut'a devam et
  }
  await supabase.auth.signOut()
}
