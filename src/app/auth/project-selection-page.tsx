import { useEffect, useState } from 'react'
import { getOwnProfiles, setClaims, signOut } from '../../shared/supabase/auth-service'
import type { ProfileWithProject } from '../../shared/supabase/auth-service'
import { supabase } from '../../shared/supabase/client'
import { CreateProjectPage } from './create-project-page'

const ROLE_LABELS: Record<string, string> = {
  saha: 'Saha',
  dept: 'Departman',
  muhasebe: 'Muhasebe',
}

export function ProjectSelectionPage() {
  const [profiles, setProfiles] = useState<ProfileWithProject[]>([])
  const [canCreate, setCanCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mode, setMode] = useState<'list' | 'create'>('list')

  useEffect(() => {
    async function init() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session) {
        setError('Oturum bulunamadı, tekrar giriş yapın')
        setLoading(false)
        return
      }
      const userCanCreate = sessionData.session.user.app_metadata?.can_create_projects === true
      setCanCreate(userCanCreate)

      try {
        const data = await getOwnProfiles()
        if (data.length === 1 && !userCanCreate) {
          await setClaims(data[0].project_id)
          // onAuthStateChange will pick up the new session — no state update needed
          return
        }
        setProfiles(data)
        setLoading(false)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu')
        setLoading(false)
      }
    }
    init()
  }, [])

  async function handleSelect(projectId: string) {
    setSelecting(projectId)
    setError(null)
    try {
      await setClaims(projectId)
      // onAuthStateChange handles the transition to AuthenticatedShell
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      setSelecting(null)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch (_e) {
      setError('Çıkış hatası, tekrar deneyin')
    }
  }

  if (loading) return null

  if (mode === 'create') {
    return <CreateProjectPage onBack={() => setMode('list')} />
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <h1 style={{ margin: 0 }}>KAAPA</h1>

        {profiles.length === 0 && !canCreate && (
          <>
            <p style={{ margin: 0, color: '#666' }}>Henüz bir projeye davet edilmediniz</p>
            <button
              onClick={handleSignOut}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                color: '#666',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                fontSize: '14px',
              }}
            >
              Çıkış yap
            </button>
          </>
        )}

        {profiles.length === 0 && canCreate && (
          <p style={{ margin: 0, color: '#666' }}>Henüz projeniz yok. İlk projenizi açın.</p>
        )}

        {profiles.length > 0 && (
          <>
            <p style={{ margin: 0, color: '#666' }}>Proje seçin</p>
            {profiles.map((profile) => (
              <button
                key={profile.project_id}
                disabled={selecting !== null}
                onClick={() => handleSelect(profile.project_id)}
                onMouseEnter={() => setHoveredId(profile.project_id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: selecting !== null ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  background: hoveredId === profile.project_id ? '#f5f5f5' : '#fff',
                  opacity: selecting !== null && selecting !== profile.project_id ? 0.5 : 1,
                }}
              >
                <div style={{ fontWeight: 600 }}>{profile.projects.name}</div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </div>
              </button>
            ))}
          </>
        )}

        {canCreate && (
          <button
            onClick={() => setMode('create')}
            style={{
              padding: '12px',
              border: '1px dashed #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: 600,
              background: '#fff',
            }}
          >
            Yeni proje aç
          </button>
        )}

        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
      </div>
    </div>
  )
}
