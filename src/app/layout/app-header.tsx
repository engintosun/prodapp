import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Theme } from '../../shared/theme'

interface Props {
  userEmail: string
  projectName: string
  notificationCount?: number
  theme: Theme
  onToggleTheme: () => void
  onSignOut: () => void
  onSwitchProject?: () => void
}

export function AppHeader({
  userEmail,
  projectName,
  notificationCount,
  theme,
  onToggleTheme,
  onSignOut,
  onSwitchProject,
}: Props) {
  const [open, setOpen] = useState(false)
  const initial = (userEmail[0] ?? '?').toUpperCase()
  const displayName = projectName.trim() || '…'

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
      gap: 'var(--space-3)',
    }}>

      {/* SOL: avatar + dropdown */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
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
            minHeight: 'var(--touch-min)',
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
            left: 0,
            zIndex: 'var(--z-modal)' as unknown as number,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            minWidth: '220px',
            overflow: 'hidden',
          }}>

            {/* Tiklanamiyor — sadece bilgi */}
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              {userEmail}
            </div>

            {/* Profil */}
            {/* TODO-SPEC: profil ekrani EKRAN-SAHA §13 */}
            <button
              onClick={() => setOpen(false)}
              style={menuItemStyle}
            >
              Profil
              <span style={comingSoonStyle}>yakında</span>
            </button>

            {/* Proje Degistir */}
            {/* TODO-SPEC: coklu proje switch mekanigi */}
            <button
              onClick={() => { if (onSwitchProject) { onSwitchProject(); setOpen(false) } else { setOpen(false) } }}
              style={menuItemStyle}
            >
              Proje Değiştir
              {!onSwitchProject && <span style={comingSoonStyle}>yakında</span>}
            </button>

            {/* Tema — islevsel */}
            <button
              onClick={() => { onToggleTheme(); setOpen(false) }}
              style={menuItemStyle}
            >
              {theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
            </button>

            {/* Yardim */}
            {/* TODO-SPEC: yardim ekrani */}
            <button
              onClick={() => setOpen(false)}
              style={menuItemStyle}
            >
              Yardım
              <span style={comingSoonStyle}>yakında</span>
            </button>

            {/* Cikis — islevsel */}
            <button
              onClick={() => { onSignOut(); setOpen(false) }}
              style={{ ...menuItemStyle, color: 'var(--color-danger)' }}
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>

      {/* ORTA: proje adi */}
      <span style={{
        flex: 1,
        textAlign: 'center',
        fontSize: 'var(--text-md)',
        fontWeight: 'var(--weight-medium)',
        color: 'var(--color-text)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {displayName}
        <span style={{
          color: 'var(--color-text-muted)',
          marginLeft: 'var(--space-1)',
          fontSize: 'var(--text-xs)',
        }}>▼</span>
      </span>

      {/* SAG: bildirim zili */}
      {/* TODO-SPEC: bildirimler M3 */}
      <button
        onClick={() => { /* TODO-SPEC: bildirimler M3 */ }}
        aria-label="Bildirimler"
        style={{
          position: 'relative',
          flexShrink: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          minHeight: 'var(--touch-min)',
          minWidth: 'var(--touch-min)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <BellIcon />
        {(notificationCount ?? 0) > 0 && (
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            background: 'var(--color-danger)',
            color: 'var(--color-primary-text)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-bold)',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}>
            {notificationCount}
          </span>
        )}
      </button>
    </header>
  )
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 2a6 6 0 0 1 6 6c0 3.5 1.5 5 1.5 5h-15s1.5-1.5 1.5-5a6 6 0 0 1 6-6z" />
      <path d="M8.5 17a1.5 1.5 0 0 0 3 0" />
    </svg>
  )
}

const menuItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-2)',
  width: '100%',
  minHeight: 'var(--touch-min)',
  padding: '0 var(--space-4)',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  color: 'var(--color-text)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
}

const comingSoonStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
}
