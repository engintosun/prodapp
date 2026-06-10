import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useToast } from '../../shared/components/toast'
import { openPeriod } from '../../shared/supabase/onboarding-service'

interface Props {
  projectId: string
  userId: string
  onDone: () => void
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

export function PeriodStep({ projectId, userId, onDone }: Props) {
  const { addToast } = useToast()
  const [name, setName] = useState('Dönem 1')
  const [submitting, setSubmitting] = useState(false)

  async function handleOpen() {
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      await openPeriod(projectId, trimmed, userId)
      onDone()
    } catch (e) {
      addToast((e as Error).message, 'error')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
        Dönem
      </span>

      <div>
        <label style={labelStyle}>Dönem adı *</label>
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dönem 1" />
      </div>

      <button
        onClick={handleOpen}
        disabled={submitting || name.trim() === ''}
        style={{
          minHeight: 'var(--touch-min)',
          background: 'var(--color-primary)',
          color: 'var(--color-primary-text)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-md)',
          fontWeight: 'var(--weight-bold)',
          cursor: submitting || name.trim() === '' ? 'default' : 'pointer',
          opacity: submitting || name.trim() === '' ? 0.6 : 1,
        }}
      >
        {submitting ? 'Açılıyor...' : 'Dönemi aç'}
      </button>
    </div>
  )
}
