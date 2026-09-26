import { BottomSheet } from '../../../../shared/components/bottom-sheet'
import { PAYMENT_STATUSES } from '../../../../shared/types/domain'

export function StatusInfoSheet({ anchor, onClose }: { anchor?: () => HTMLElement | null; onClose: () => void }) {
  return (
    <BottomSheet title="Statü rehberi" anchor={anchor} onClose={onClose}>
      {PAYMENT_STATUSES.map(({ code, label, guide }) => (
        <div key={code} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>{label}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{guide}</div>
        </div>
      ))}
    </BottomSheet>
  )
}
