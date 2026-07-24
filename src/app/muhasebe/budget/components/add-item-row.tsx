import { memo, forwardRef } from 'react'
import type { LibraryItem } from '../../../../shared/supabase/library-service'
import { tdStyle, cellInput } from './table-styles'

// Grid satir kimligi: gercek bir kalem DEGIL, bu yuzden UUID degil sabit etiket. ':' ICERMEZ
// (use-grid-navigation.parsePeriodRowId ':' ile donem satiri ayristirir).
export const ADD_ROW_ID = '__add'

interface AddItemRowProps {
  query: string
  options: LibraryItem[]
  isOpen: boolean
  highlightIndex: number
  disabled: boolean
  onQueryChange: (value: string) => void
  onOpen: () => void
  onClose: () => void
  onSelect: (item: LibraryItem) => void
}

export const AddItemRow = memo(
  forwardRef<HTMLInputElement, AddItemRowProps>(function AddItemRow(
    { query, options, isOpen, highlightIndex, disabled, onQueryChange, onOpen, onClose, onSelect },
    ref,
  ) {
    return (
      <tr>
        <td style={tdStyle} />
        <td style={{ ...tdStyle, position: 'relative' }}>
          <input
            ref={ref}
            data-grid-cell="true"
            data-row-id={ADD_ROW_ID}
            data-col="name"
            data-cell-kind="combobox"
            style={{ ...cellInput, opacity: disabled ? 0.5 : 1 }}
            placeholder="+ kalem ekle"
            value={query}
            disabled={disabled}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={onOpen}
            onBlur={onClose}
          />
          {isOpen && options.length > 0 && (
            <ul
              role="listbox"
              style={{
                // Liste YUKARI acilir (Engin tarayici bulgusu 2026-07-24): "+ kalem ekle" satiri
                // YAPISAL OLARAK kartin son satiridir, asagi acilan liste her zaman sayfanin
                // dibine tasar. Olcum/carpisma tespiti gerekmez - bu satirin yeri hep sonda.
                position: 'absolute',
                // --z-dropdown (150) nav'in (100) USTUNDE, modallarin (200) ALTINDA: acilir liste
                // sayfa mobilyasini orter ama bir alt-sheet acilinca onun arkasinda kalir.
                // Ciplak sayi YASAK - katman sirasi tokens.css'te TEK yerde yasar.
                zIndex: 'var(--z-dropdown)' as unknown as number,
                bottom: '100%',
                left: 0,
                minWidth: '100%',
                maxHeight: 240,
                overflowY: 'auto',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              {options.map((o, i) => (
                <li key={o.id} role="option" aria-selected={i === highlightIndex}>
                  <button
                    type="button"
                    tabIndex={-1}
                    // Secenege tiklandiginda input'un blur'lanip listeyi kapatmasini engeller
                    // (mousedown blur'dan ONCE gelir). Blur ASLA secmez (bolum 17 kontrati).
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelect(o)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: 'var(--space-2)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text)',
                      background: i === highlightIndex ? 'var(--color-surface-alt, rgba(0,0,0,0.06))' : 'transparent',
                    }}
                  >
                    {o.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </td>
        <td style={tdStyle} colSpan={9} />
      </tr>
    )
  }),
)
