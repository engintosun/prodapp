import { useState } from 'react'
import type { CSSProperties } from 'react'

interface Props {
  open: boolean
  title: string
  message?: string
  reasonLabel?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
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

export function ConfirmDialog({
  open,
  title,
  message,
  reasonLabel,
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const [reason, setReason] = useState('')

  if (!open) return null

  const trimmedReason = reason.trim()
  const confirmDisabled = Boolean(reasonLabel) && trimmedReason === ''

  function handleCancel() {
    setReason('')
    onCancel()
  }

  function handleConfirm() {
    if (confirmDisabled) return
    onConfirm(reasonLabel ? trimmedReason : '')
    setReason('')
  }

  return (
    <div
      onClick={handleCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '360px',
          width: '100%',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <span style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--color-text)',
        }}>
          {title}
        </span>
        {message && (
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}>
            {message}
          </span>
        )}
        {reasonLabel && (
          <div>
            <label style={labelStyle}>{reasonLabel}</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            style={{
              minHeight: 'var(--touch-min)',
              padding: '0 var(--space-4)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmDisabled}
            style={{
              minHeight: 'var(--touch-min)',
              padding: '0 var(--space-4)',
              background: danger ? 'var(--color-danger)' : 'var(--color-primary)',
              color: 'var(--color-primary-text)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              cursor: confirmDisabled ? 'not-allowed' : 'pointer',
              opacity: confirmDisabled ? 0.5 : 1,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
