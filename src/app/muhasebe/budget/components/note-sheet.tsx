import type { BudgetItemRow } from '../../../../shared/supabase/budget-service'
import { BottomSheet } from './bottom-sheet'

export function NoteSheet({
  item,
  onCommit,
  onClose,
}: {
  item: BudgetItemRow
  onCommit: (id: string, field: 'internalNote' | 'publicNote', value: string) => void | Promise<void>
  onClose: () => void
}) {
  return (
    <BottomSheet title={<>#{item.itemCode} {item.name}</>} onClose={onClose}>
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
        Ic Not
      </label>
      <textarea
        defaultValue={item.internalNote ?? ''}
        onBlur={(e) => void onCommit(item.id, 'internalNote', e.target.value)}
        rows={4}
        style={{ width: '100%', boxSizing: 'border-box', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontFamily: 'inherit', resize: 'vertical', marginBottom: 'var(--space-3)' }}
      />
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
        Kamu Notu
      </label>
      <textarea
        defaultValue={item.publicNote ?? ''}
        onBlur={(e) => void onCommit(item.id, 'publicNote', e.target.value)}
        rows={4}
        style={{ width: '100%', boxSizing: 'border-box', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontFamily: 'inherit', resize: 'vertical' }}
      />
    </BottomSheet>
  )
}
