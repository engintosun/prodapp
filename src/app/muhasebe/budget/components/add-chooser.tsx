import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { BottomSheet } from './bottom-sheet'

export type AddChoice = 'item' | 'heading'

// "+ EKLE" SECIMI (BUTCE-EKRAN-KARARLARI bolum 16 + 19, 23 Eylul 2026, Engin karari): pencere
// ailesinden kucuk bir pencere, iki satir. Emsal: sokulen satirdaki Baslik dugmesinin kisa listesi.
// Acilinca odak Kalem satirindadir; ok tuslari iki satir arasinda
// gezer, Enter secer (dugmenin kendi davranisi), Esc ve disina tiklama kapatir (BottomSheet).
export function AddChooser({ anchor, onPick, onClose }: { anchor?: () => HTMLElement | null; onPick: (choice: AddChoice) => void; onClose: () => void }) {
  const itemRef = useRef<HTMLButtonElement>(null)
  const headingRef = useRef<HTMLButtonElement>(null)

  // BottomSheet acilista odagi kapat dugmesine verir; o efekt (alt bilesen) bu efektten
  // ONCE kosar, bu yuzden odak burada Kalem satirina alinir.
  useEffect(() => {
    itemRef.current?.focus()
  }, [])

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const next = document.activeElement === itemRef.current ? headingRef.current : itemRef.current
    next?.focus()
  }

  const optionStyle = {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: 'var(--space-2)',
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text)',
    fontFamily: 'inherit',
  }

  return (
    <BottomSheet title="Ekle" anchor={anchor} fitWidth={{ min: 240 }} onClose={onClose}>
      <ul onKeyDown={onListKeyDown} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li>
          <button ref={itemRef} type="button" onClick={() => onPick('item')} style={optionStyle}>
            Kalem
          </button>
        </li>
        <li>
          <button ref={headingRef} type="button" onClick={() => onPick('heading')} style={optionStyle}>
            Başlık
          </button>
        </li>
      </ul>
    </BottomSheet>
  )
}
