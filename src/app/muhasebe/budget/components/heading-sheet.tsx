import type { BudgetItemRow } from '../../../../shared/supabase/budget-service'
import { BottomSheet } from './bottom-sheet'

export function HeadingSheet({
  item,
  headings,
  onCommit,
  onClose,
}: {
  item: BudgetItemRow
  headings: { catalogCode: string; name: string }[]
  onCommit: (id: string, field: 'headingCode', value: string) => void | Promise<void>
  onClose: () => void
}) {
  const pick = (value: string) => {
    void onCommit(item.id, 'headingCode', value)
    onClose()
  }

  return (
    <BottomSheet title={<>#{item.itemCode} {item.name}</>} onClose={onClose}>
      <ul style={{ margin: 0, marginTop: 0, padding: 0, listStyle: 'none' }}>
        {headings.map((h) => {
          const active = item.headingCode === h.catalogCode
          return (
            <li key={h.catalogCode}>
              <button
                type="button"
                onClick={() => pick(h.catalogCode)}
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
                {h.name}
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
              fontWeight: item.headingCode === null ? 600 : 400,
              color: item.headingCode === null ? 'var(--color-primary)' : 'var(--color-text)',
            }}
          >
            Başlıksız
          </button>
        </li>
      </ul>
    </BottomSheet>
  )
}
