import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { Receipt, UserRole } from '../../shared/types/domain'
import { useToast } from '../../shared/components/toast'
import { getPendingReviewReceipts, requestCorrection } from '../../shared/supabase/receipt-service'
import { EmptyState } from '../../shared/components/empty-state'
import { Loading } from '../../shared/components/loading'

interface Props {
  role: Extract<UserRole, 'dept' | 'muhasebe'>
}

const cardStyle: CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const actionBtnBase: CSSProperties = {
  flex: 1,
  minHeight: 'var(--touch-min)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--weight-medium)',
  cursor: 'pointer',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
}

export function ReviewerScreen({ role }: Props) {
  const { addToast } = useToast()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [correctionTarget, setCorrectionTarget] = useState<Receipt | null>(null)
  const [correctionNote, setCorrectionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    getPendingReviewReceipts(role)
      .then(setReceipts)
      .catch((e) => addToast((e as Error).message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [role])

  async function handleRequestCorrection() {
    if (!correctionTarget) return
    if (!correctionNote.trim()) {
      addToast('Not zorunlu', 'warning')
      return
    }
    setSubmitting(true)
    try {
      await requestCorrection(correctionTarget.id, correctionNote)
      addToast('Düzeltme istendi', 'success')
      setCorrectionTarget(null)
      setCorrectionNote('')
      load()
    } catch (e) {
      addToast((e as Error).message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  const pendingLabel = role === 'dept' ? 'dept_pending' : 'acc_pending'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
        Bekleyen ({receipts.length})
      </span>

      {receipts.length === 0 && (
        <EmptyState title="Bekleyen fiş yok" description={`${pendingLabel} durumunda fiş bulunmuyor`} />
      )}

      {receipts.map((r) => (
        <div key={r.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text)' }}>
              {r.vendor_name || '—'}
            </span>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
              {r.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
          </div>

          {r.description && (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{r.description}</span>
          )}

          {r.receipt_date && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{r.receipt_date}</span>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
            <button
              style={{ ...actionBtnBase }}
              onClick={() => {
                // TODO-SPEC: onay servisi (M2.3 — IS-KURALLARI.md §6)
                addToast('Onay yakında (M2.3)', 'info')
              }}
            >
              Onayla
            </button>
            <button
              style={{ ...actionBtnBase }}
              onClick={() => {
                // TODO-SPEC: red servisi (M2.3 — IS-KURALLARI.md §6)
                addToast('Red yakında (M2.3)', 'info')
              }}
            >
              Reddet
            </button>
            <button
              style={{ ...actionBtnBase, background: 'var(--color-warning-bg, #fff8e1)', borderColor: 'var(--color-warning, #f59e0b)', color: 'var(--color-warning-text, #92400e)' }}
              onClick={() => { setCorrectionTarget(r); setCorrectionNote('') }}
            >
              Düzeltme İste
            </button>
          </div>
        </div>
      ))}

      {/* Duzeltme not modalı */}
      {correctionTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 200,
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setCorrectionTarget(null) }}
        >
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            padding: 'var(--space-5)',
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
              Düzeltme notu
            </span>
            <textarea
              autoFocus
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              placeholder="Ne düzeltilmesi gerekiyor?"
              style={{
                width: '100%', boxSizing: 'border-box',
                minHeight: '100px', padding: 'var(--space-3)',
                background: 'var(--color-surface-2)', color: 'var(--color-text)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-md)', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                onClick={() => setCorrectionTarget(null)}
                style={{ flex: 1, minHeight: 'var(--touch-min)', background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-md)', cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                onClick={handleRequestCorrection}
                disabled={submitting}
                style={{ flex: 2, minHeight: 'var(--touch-min)', background: 'var(--color-warning, #f59e0b)', color: 'var(--color-warning-text, #92400e)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Gönderiliyor…' : 'Düzeltme İste'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
