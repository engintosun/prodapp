import { useEffect, useState } from 'react'
import { getOwnProfiles, setClaims } from '../../shared/supabase/auth-service'
import type { ProfileWithProject } from '../../shared/supabase/auth-service'

const ROLE_LABELS: Record<string, string> = {
  saha: 'Saha',
  dept: 'Departman',
  muhasebe: 'Muhasebe',
}

export function ProjectSelectionPage() {
  const [profiles, setProfiles] = useState<ProfileWithProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    getOwnProfiles()
      .then(async (data) => {
        if (data.length === 1) {
          await setClaims(data[0].project_id)
          // onAuthStateChange will pick up the new session — no state update needed
        } else {
          setProfiles(data)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
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

  if (loading) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <h1 style={{ margin: 0 }}>KAAPA</h1>
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
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
      </div>
    </div>
  )
}
