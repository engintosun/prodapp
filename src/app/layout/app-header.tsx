import { useState } from 'react'
import type { Theme } from '../../shared/theme'

interface Props {
  userEmail: string
  theme: Theme
  onToggleTheme: () => void
  onSignOut: () => void
}

export function AppHeader({ userEmail, theme, onToggleTheme, onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const initial = (userEmail[0] ?? '?').toUpperCase()

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-nav)' as unknown as number,
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: 'var(--space-3) var(--space-4)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--color-text)',
      }}>
        KAAPA
      </span>

      <div style={{ position: 'relative' }}>
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 'var(--z-nav)' as unknown as number,
            }}
          />
        )}

        <button
          onClick={() => setOpen(v => !v)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-bold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initial}
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 'var(--z-modal)' as unknown as number,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            minWidth: '200px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              {userEmail}
            </div>
            <button
              onClick={() => { onToggleTheme(); setOpen(false) }}
              style={{
                display: 'block',
                width: '100%',
                minHeight: 'var(--touch-min)',
                padding: '0 var(--space-4)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                color: 'var(--color-text)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
            </button>
            <button
              onClick={() => { onSignOut(); setOpen(false) }}
              style={{
                display: 'block',
                width: '100%',
                minHeight: 'var(--touch-min)',
                padding: '0 var(--space-4)',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                color: 'var(--color-danger)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
