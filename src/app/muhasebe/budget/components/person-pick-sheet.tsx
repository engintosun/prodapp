import type { BudgetItemRow } from '../../../../shared/supabase/budget-service'
import type { PersonLabel } from '../../../../shared/supabase/person-label-service'
import { BottomSheet } from './bottom-sheet'

export function PersonPickSheet({
  item,
  labels,
  onCommit,
  onClose,
}: {
  item: BudgetItemRow
  labels: PersonLabel[]
  onCommit: (id: string, field: 'personObjectId', value: string) => void | Promise<void>
  onClose: () => void
}) {
  const pick = (value: string) => {
    void onCommit(item.id, 'personObjectId', value)
    onClose()
  }

  return (
    <BottomSheet title={<>#{item.itemCode} {item.name}</>} onClose={onClose}>
      <ul style={{ margin: 0, marginTop: 0, padding: 0, listStyle: 'none' }}>
        {labels.map((l) => {
          const active = item.personObjectId === l.id
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => pick(l.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--space-2)',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                  fontSize: 'var(--text-sm)',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-primary)' : 'var(--color-text)',
                }}
              >
                {l.name}
                {l.roleName ? ` (${l.roleName})` : ''}
              </button>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => pick('')}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: 'var(--space-2)',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              fontSize: 'var(--text-sm)',
              fontWeight: item.personObjectId === null ? 600 : 400,
              color: item.personObjectId === null ? 'var(--color-primary)' : 'var(--color-text)',
            }}
          >
            Kişisiz
          </button>
        </li>
      </ul>
    </BottomSheet>
  )
}
