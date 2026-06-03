import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { UserRole, Department } from '../../shared/types/domain'
import { useToast } from '../../shared/components/toast'
import { getDepartments, createInvitation } from '../../shared/supabase/invitation-service'

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

// Rol Turkce etiketleri: Saha + Muhasebe = GLOSSARY; Dept = GLOSSARY'de kayit yok.
// TODO-SPEC: Dept Turkce display etiketi docs/GLOSSARY.md'de eksik
const ROLE_LABELS: Record<UserRole, string> = {
  saha: 'Saha',
  dept: 'Dept',
  muhasebe: 'Muhasebe',
}

export function InviteScreen() {
  const { addToast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [deptId, setDeptId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((e) => addToast((e as Error).message, 'error'))
  }, [])

  async function handleCreate() {
    if (!firstName.trim()) { addToast('Ad zorunlu', 'warning'); return }
    if (!lastName.trim()) { addToast('Soyad zorunlu', 'warning'); return }
    if (!email.includes('@')) { addToast('Gecerli bir e-posta adresi girin', 'warning'); return }
    if (!role) { addToast('Rol secin', 'warning'); return }
    if (role !== 'muhasebe' && !deptId) { addToast('Departman secin', 'warning'); return }

    setSubmitting(true)
    try {
      const inv = await createInvitation({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
        deptId: role === 'muhasebe' ? null : deptId || null,
      })
      setInviteLink(`${window.location.origin}/?invite=${inv.token}`)
    } catch (e) {
      addToast((e as Error).message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCopy() {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      addToast('Link kopyalandi', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch (_err) {
      addToast('Kopyalanamadi, linki elle kopyalayin', 'error')
    }
  }

  function handleNewInvite() {
    setFirstName('')
    setLastName('')
    setEmail('')
    setRole('')
    setDeptId('')
    setInviteLink(null)
    setCopied(false)
  }

  if (inviteLink) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
          Davet Olusturuldu
        </span>
        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Davet linki (7 gun gecerli)
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', wordBreak: 'break-all' }}>
            {inviteLink}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            minHeight: 'var(--touch-min)',
            background: 'var(--color-primary)',
            color: 'var(--color-primary-text)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--weight-bold)',
            cursor: 'pointer',
          }}
        >
          {copied ? 'Kopyalandi' : 'Kopyala'}
        </button>
        <button
          onClick={handleNewInvite}
          style={{
            minHeight: 'var(--touch-min)',
            background: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-md)',
            cursor: 'pointer',
          }}
        >
          Yeni Davet
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
        Davet Et
      </span>

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

      <div>
        <label style={labelStyle}>E-posta *</label>
        <input
          style={inputStyle}
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@sirket.com"
        />
      </div>

      <div>
        <label style={labelStyle}>Rol *</label>
        <select
          style={inputStyle}
          value={role}
          onChange={(e) => { setRole(e.target.value as UserRole | ''); setDeptId('') }}
        >
          <option value="">Secin</option>
          {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
      </div>

      {role !== 'muhasebe' && (
        <div>
          <label style={labelStyle}>Departman{role !== '' ? ' *' : ''}</label>
          <select
            style={inputStyle}
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
            disabled={role === ''}
          >
            <option value="">Secin</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={submitting}
        style={{
          marginTop: 'var(--space-2)',
          minHeight: 'var(--touch-min)',
          background: 'var(--color-primary)',
          color: 'var(--color-primary-text)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-md)',
          fontWeight: 'var(--weight-bold)',
          cursor: submitting ? 'default' : 'pointer',
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? 'Olusturuluyor...' : 'Davet Olustur'}
      </button>
    </div>
  )
}
