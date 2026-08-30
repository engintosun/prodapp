import { memo } from 'react'
import { tdStyle } from './table-styles'

// Grid satir kimligi: gercek bir kalem DEGIL, bu yuzden UUID degil sabit etiket. ':' ICERMEZ
// (use-grid-navigation.parsePeriodRowId ':' ile donem satiri ayristirir).
export const ADD_ROW_ID = '__add'

interface AddItemRowProps {
  disabled: boolean
  onOpen: () => void
}

// YUZEY dilimi (2026-07-30): bu satir artik yazi kutusu DEGIL, bir dugmedir. Kutuphane listesi
// ekranin ortasindaki odaya (add-item-panel.tsx) tasindi. Grid duragi (data-row-id + data-col
// name) ve silme sonrasi odak devri AYNEN kalir; degisen tek sey hucre turu: combobox -> button.
// Bolum 16'nin 28 Temmuz tarihli "cellKind combobox DEGISMEZ" satiri bu commit'te duzeltildi.
export const AddItemRow = memo(function AddItemRow({ disabled, onOpen }: AddItemRowProps) {
  const buttonBase = {
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: disabled ? 'default' : 'pointer',
    color: 'var(--color-text-muted)',
    opacity: disabled ? 0.5 : 1,
  } as const

  return (
    <tr>
      <td style={{ ...tdStyle, textAlign: 'center' }}>
        {/* + YALNIZ gorsel isaret ve fare hedefidir (bolum 16): gezinme grafigine GIRMEZ,
            bu yuzden data-grid-cell TASIMAZ ve tabIndex -1 ile klavye sirasindan cikarilir. */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onClick={onOpen}
          style={{ ...buttonBase, fontSize: 'var(--text-md)', lineHeight: 1 }}
        >
          +
        </button>
      </td>
      <td style={tdStyle}>
        <button
          type="button"
          data-grid-cell="true"
          data-row-id={ADD_ROW_ID}
          data-col="name"
          data-cell-kind="button"
          disabled={disabled}
          onClick={onOpen}
          style={{ ...buttonBase, fontSize: 'var(--text-sm)' }}
        >
          kalem ekle
        </button>
      </td>
      <td style={tdStyle} colSpan={9} />
    </tr>
  )
})
