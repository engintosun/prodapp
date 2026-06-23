import type { UserRole } from '../../shared/types/domain'

export const NAV_ITEMS: Record<UserRole, { key: string; label: string }[]> = {
  saha: [
    { key: 'ana', label: 'Ana' },
    { key: 'donem', label: 'Dönem' },
    { key: 'ara', label: 'Ara' },
    { key: 'mesajlar', label: 'Mesajlar' },
  ],
  // TODO-SPEC: dept nav = 6-tab bar (Bekleyen/Ekip/Avanslar/Kiralama/Gecmis/Mesajlar) + ustunde donem pill — saha bottom-nav'dan FARKLI layout (EKRAN-DEPT.md §1-2). Layout karari dept ekran build'inde (M2.4). Asagisi B4 stub'i, spec DEGIL.
  dept: [
    { key: 'bekleyen', label: 'Bekleyen' },
    { key: 'fisler', label: 'Fişler' },
    { key: 'donem', label: 'Dönem' },
  ],
  // TODO-SPEC: muhasebe nav = 7-tab bar + kart-masa sunumu (ACIK SLOT, Engin tasarlayacak — EKRAN-MUHASEBE.md §2). Layout/sunum karari muhasebe ekran build'inde (M2.5). Asagisi B4 stub'i, spec DEGIL.
  muhasebe: [
    { key: 'masa', label: 'Masa' },
    { key: 'donem', label: 'Dönem' },
    { key: 'rapor', label: 'Rapor' },
    // TODO-SPEC gecici Davet sekmesi -- final muhasebe nav (7-tab + kart-masa) Engin tasarlayacak (M2.5).
    { key: 'davet', label: 'Davet' },
    // TODO-SPEC gecici Butce sekmesi (2b-1 salt-gorunur) -- final muhasebe nav + kart-masa Engin tasarlayacak (M2.5).
    { key: 'butce', label: 'Bütçe' },
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
