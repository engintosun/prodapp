import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { createProject } from '../../shared/supabase/onboarding-service'
import { setClaims } from '../../shared/supabase/auth-service'
import { supabase } from '../../shared/supabase/client'
import { getOwnCompanyProfile } from '../../shared/supabase/company-profile-service'
import { useToast } from '../../shared/components/toast'

interface Props {
  onBack: () => void
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-1)',
}
const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 'var(--touch-min)',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '0 var(--space-3)',
  fontSize: 'var(--text-md)',
}

export function CreateProjectPage({ onBack }: Props) {
  const { addToast } = useToast()
  const [projectName, setProjectName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    projectName.trim() !== '' &&
    companyName.trim() !== '' &&
    firstName.trim() !== '' &&
    lastName.trim() !== ''

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user.id
      if (!uid) return
      getOwnCompanyProfile(uid)
        .then((profile) => {
          if (!cancelled && profile) setCompanyName(profile.companyName)
        })
        .catch((e) => {
          if (!cancelled) addToast((e as Error).message, 'error')
        })
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const projectId = await createProject(
        projectName.trim(),
        companyName.trim(),
        firstName.trim(),
        lastName.trim()
      )
      await setClaims(projectId)
      // onAuthStateChange handles the transition to AuthenticatedShell
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '320px' }}>
        <button
          onClick={onBack}
          disabled={submitting}
          style={{
            alignSelf: 'flex-start',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
            cursor: submitting ? 'default' : 'pointer',
            padding: 0,
          }}
        >
          Geri
        </button>

        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
          Yeni Proje Aç
        </span>

        <div>
          <label style={labelStyle}>Proje adı *</label>
          <input style={inputStyle} value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Proje adı" />
        </div>

        <div>
          <label style={labelStyle}>Yapım şirketi *</label>
          <input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Yapım şirketi" />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Ad *</label>
            <input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ad" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Soyad *</label>
            <input style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Soyad" />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          style={{
            marginTop: 'var(--space-2)',
            minHeight: 'var(--touch-min)',
            background: 'var(--color-primary)',
            color: 'var(--color-primary-text)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--weight-bold)',
            cursor: !canSubmit || submitting ? 'default' : 'pointer',
            opacity: !canSubmit || submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Açılıyor...' : 'Projeyi aç'}
        </button>

        {error && <p style={{ color: 'var(--color-danger)', margin: 0, fontSize: 'var(--text-sm)' }}>{error}</p>}
      </div>
    </div>
  )
}
