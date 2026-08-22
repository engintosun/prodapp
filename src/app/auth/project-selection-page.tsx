import { useEffect, useState } from 'react'
import { getOwnProfiles, setClaims, signOut } from '../../shared/supabase/auth-service'
import type { ProfileWithProject } from '../../shared/supabase/auth-service'
import { supabase } from '../../shared/supabase/client'
import { CreateProjectPage } from './create-project-page'
import { archiveProject, restoreProject, deleteProject } from '../../shared/supabase/onboarding-service'
import { ConfirmDialog } from '../../shared/components/confirm-dialog'

const ROLE_LABELS: Record<string, string> = {
  saha: 'Saha',
  dept: 'Departman',
  muhasebe: 'Muhasebe',
}

interface ConfirmAction {
  type: 'archive' | 'restore' | 'delete'
  projectId: string
  projectName: string
}

export function ProjectSelectionPage() {
  const [profiles, setProfiles] = useState<ProfileWithProject[]>([])
  const [canCreate, setCanCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mode, setMode] = useState<'list' | 'create'>('list')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [acting, setActing] = useState(false)

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
        if (data.length === 1 && !userCanCreate && data[0].projects.status === 'active') {
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

  async function reloadProfiles() {
    const data = await getOwnProfiles()
    setProfiles(data)
  }

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

  function openArchiveConfirm(profile: ProfileWithProject) {
    setConfirmAction({ type: 'archive', projectId: profile.project_id, projectName: profile.projects.name })
  }

  function openRestoreConfirm(profile: ProfileWithProject) {
    setConfirmAction({ type: 'restore', projectId: profile.project_id, projectName: profile.projects.name })
  }

  function openDeleteConfirm(profile: ProfileWithProject) {
    setConfirmAction({ type: 'delete', projectId: profile.project_id, projectName: profile.projects.name })
  }

  async function handleConfirmAction(reason: string) {
    if (!confirmAction) return
    const action = confirmAction
    setConfirmAction(null)
    setActing(true)
    setError(null)
    try {
      if (action.type === 'archive') {
        await archiveProject(action.projectId, reason)
      } else if (action.type === 'restore') {
        await restoreProject(action.projectId, reason)
      } else {
        await deleteProject(action.projectId, reason)
      }
      await reloadProfiles()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setActing(false)
    }
  }

  if (loading) return null

  if (mode === 'create') {
    return <CreateProjectPage onBack={() => setMode('list')} />
  }

  const activeProfiles = profiles.filter((p) => p.projects.status === 'active')
  const archivedProfiles = profiles.filter((p) => p.projects.status !== 'active')

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

        {activeProfiles.length > 0 && (
          <>
            <p style={{ margin: 0, color: '#666' }}>Proje seçin</p>
            {activeProfiles.map((profile) => (
              <div
                key={profile.project_id}
                role="button"
                tabIndex={selecting !== null ? -1 : 0}
                onClick={() => selecting === null && handleSelect(profile.project_id)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && selecting === null) {
                    e.preventDefault()
                    handleSelect(profile.project_id)
                  }
                }}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{profile.projects.name}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                    {ROLE_LABELS[profile.role] ?? profile.role}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openArchiveConfirm(profile)
                  }}
                  disabled={acting}
                  style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    textDecoration: 'underline',
                    cursor: acting ? 'not-allowed' : 'pointer',
                    padding: 0,
                    fontSize: '13px',
                  }}
                >
                  Arşivle
                </button>
              </div>
            ))}
          </>
        )}

        {archivedProfiles.length > 0 && (
          <>
            <p style={{ margin: 0, color: '#666' }}>Arşiv</p>
            {archivedProfiles.map((profile) => (
              <div
                key={profile.project_id}
                style={{
                  padding: '12px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  background: '#fafafa',
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{profile.projects.name}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                    {ROLE_LABELS[profile.role] ?? profile.role}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => openRestoreConfirm(profile)}
                    disabled={acting}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      textDecoration: 'underline',
                      cursor: acting ? 'not-allowed' : 'pointer',
                      padding: 0,
                      fontSize: '13px',
                    }}
                  >
                    Geri al
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(profile)}
                    disabled={acting}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'red',
                      textDecoration: 'underline',
                      cursor: acting ? 'not-allowed' : 'pointer',
                      padding: 0,
                      fontSize: '13px',
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
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

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction
            ? confirmAction.type === 'archive'
              ? `"${confirmAction.projectName}" projesini arşivle`
              : confirmAction.type === 'restore'
                ? `"${confirmAction.projectName}" projesini geri al`
                : `"${confirmAction.projectName}" projesini sil`
            : ''
        }
        message={
          confirmAction?.type === 'archive'
            ? 'Proje aktif listeden düşecek, Arşiv bölümünde durmaya devam edecek; istendiğinde geri alınabilecek.'
            : confirmAction?.type === 'delete'
              ? 'Proje ve içindeki bütçe kalıcı olarak silinecek. Bu işlem geri alınamaz.'
              : undefined
        }
        reasonLabel="Gerekçe"
        confirmLabel={
          confirmAction?.type === 'archive' ? 'Arşivle' : confirmAction?.type === 'restore' ? 'Geri al' : 'Sil'
        }
        danger={confirmAction?.type === 'archive' || confirmAction?.type === 'delete'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
