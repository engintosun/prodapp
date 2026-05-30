import type { UserRole } from '../../shared/types/domain'

export const NAV_ITEMS: Record<UserRole, { key: string; label: string }[]> = {
  saha: [
    { key: 'tara', label: 'Fiş Tara' },
    { key: 'fislerim', label: 'Fişlerim' },
    { key: 'donem', label: 'Dönem' },
  ],
  dept: [
    { key: 'bekleyen', label: 'Bekleyen' },
    { key: 'fisler', label: 'Fişler' },
    { key: 'donem', label: 'Dönem' },
  ],
  muhasebe: [
    { key: 'masa', label: 'Masa' },
    { key: 'donem', label: 'Dönem' },
    { key: 'rapor', label: 'Rapor' },
  ],
}

interface Props {
  role: UserRole
  activeKey: string
  onSelect: (key: string) => void
}

export function BottomNav({ role, activeKey, onSelect }: Props) {
  const items = NAV_ITEMS[role]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 'var(--space-4)',
      left: 'var(--space-4)',
      right: 'var(--space-4)',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 'var(--z-nav)' as unknown as number,
      display: 'flex',
      justifyContent: 'space-around',
      padding: 'var(--space-2)',
    }}>
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 'var(--touch-min)',
            background: 'transparent',
            border: 'none',
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            color: item.key === activeKey ? 'var(--color-primary)' : 'var(--color-text-muted)',
            padding: '0 var(--space-3)',
            justifyContent: 'center',
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
