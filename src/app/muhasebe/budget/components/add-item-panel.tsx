import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { resolveKeyAction } from '../hooks/grid-navigation-core'
import type { RoomOption } from '../format'

interface AddItemPanelProps {
  query: string
  options: RoomOption[]
  highlightIndex: number
  inputRef: RefObject<HTMLInputElement | null>
  onQueryChange: (value: string) => void
  onHighlightChange: (next: number) => void
  onSelect: (item: RoomOption) => void
  onCreateFree: (name: string) => void
  onClose: () => void
}

// CALISMA YUZEYI (panel), modal DEGIL - TASARIM-KARARLARI bolum 9: karartmaz, altindaki icerik
// okunur kalir ama dokunulamaz, disina tiklamak Esc ile ayni sonucu verir. Bu yuzden aria-modal
// TASIMAZ (alt-sheet ailesinden bilincli ayrim) ve --z-panel katmaninda yasar.
export function AddItemPanel({
  query,
  options,
  highlightIndex,
  inputRef,
  onQueryChange,
  onHighlightChange,
  onSelect,
  onCreateFree,
  onClose,
}: AddItemPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const triggerElRef = useRef<Element | null>(null)
  const onCloseRef = useRef(onClose)

  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    // Acilista imlec yazi alaninda; kapanista odak yuzeyi acan dugmeye geri doner
    // (alt-sheet ailesindeki triggerElRef deseninin aynisi).
    triggerElRef.current = document.activeElement
    inputRef.current?.focus()
    return () => {
      const trigger = triggerElRef.current
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus()
    }
  }, [inputRef])

  const hasHighlight = highlightIndex >= 0
  const trimmedQuery = query.trim()
  // D3c-1 (Engin karari 2026-07-31): serbest ekleme YALNIZ kart ici eslesme tukendiginde
  // gorunur. Liste ile dugme ayni anda cizilmedigi icin kullanici hicbir anda
  // "listeden mi secsem, dugmeye mi bassam" catalina dusmez.
  const canCreateFree = options.length === 0 && trimmedQuery.length > 0

  // Odak halkasi: yazi alani -> serbest ekleme dugmesi (gorunuyorsa) -> kapatma x -> yazi alani.
  const cycleFocus = () => {
    const active = document.activeElement
    if (active === closeButtonRef.current) inputRef.current?.focus()
    else if (active === createButtonRef.current) closeButtonRef.current?.focus()
    else if (canCreateFree) createButtonRef.current?.focus()
    else closeButtonRef.current?.focus()
  }

  // Tus kararlari cekirdekten okunur: yuzeyin kendi tus dallanmasi YOKTUR. Boylece D3b-2d
  // kontrati (vurgu YALNIZ ok tusuyla dogar; vurgusuz Enter/Tab kalem DOGURMAZ) tek kaynaktan
  // gelir ve grid-navigation-core.test.ts'teki testlerle korunmaya devam eder.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const res = resolveKeyAction(e, 'nav', '', 'combobox', { open: true, hasHighlight })
    if (res.preventDefault) e.preventDefault()
    if (res.listIntent === 'listDown') {
      onHighlightChange(Math.min(highlightIndex + 1, options.length - 1))
    } else if (res.listIntent === 'listUp') {
      onHighlightChange(Math.max(highlightIndex - 1, -1))
    } else if (res.listIntent === 'listSelect') {
      const picked = options[highlightIndex]
      if (picked) onSelect(picked)
    } else if (res.listIntent === 'listClose') {
      // Cekirdek Esc ve VURGUSUZ Tab icin ayni niyeti uretir; odada anlamlari AYRIDIR:
      // Esc odayi kapatir, Tab odak tuzagi icinde dondurur (oda kapanmaz, liste hep acik).
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
      } else {
        cycleFocus()
      }
    } else if (e.key === 'Enter' && canCreateFree) {
      // TEK ISTISNA (Engin karari 2026-07-31, gerekce): oda artik hucreye yapisik acilir liste
      // degil, basligi ve kapatma x'i olan bagimsiz bir yuzey; insanlar boyle bir yuzeyi FORM
      // olarak okur ve formun birincil eylemini Enter ile calistirir. Cekirdek vurgusuz Enter
      // icin niyet URETMEZ (D3b-2d) ve o kural aynen durur: burada secilen bir SECENEK yoktur,
      // kullanicinin kendi yazdigi metinle yeni kalem dogar. Tab hala YALNIZ odak tasir.
      onCreateFree(trimmedQuery)
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          // KARARTMA YOK: tablo okunur kalir (kalemin nereye dustugu gorulsun diye) ama
          // seffaf ortu tikamalari yakalar - tabloya DOKUNULAMAZ.
          background: 'transparent',
          zIndex: 'var(--z-panel)' as unknown as number,
        }}
      />
      <div
        role="dialog"
        aria-label="Kalem ekle"
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          // Alt-sheet ile AYNI olcu (bolum 16): ikinci bir genislik olcusu cikarilmaz.
          width: 'min(480px, 100%)',
          maxHeight: '70vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)',
          padding: 'var(--space-4)',
          zIndex: 'var(--z-panel)' as unknown as number,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text)' }}>Kalem ekle</span>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Kapat"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', padding: '0 var(--space-1)' }}
          >
            ×
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}
        />

        {options.length > 0 && (
          <ul
            role="listbox"
            style={{
              marginTop: 'var(--space-2)',
              marginBottom: 0,
              padding: 0,
              listStyle: 'none',
              maxHeight: 240,
              overflowY: 'auto',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {options.map((o, i) => (
              <li key={o.key} role="option" aria-selected={i === highlightIndex}>
                <button
                  type="button"
                  tabIndex={-1}
                  // Secenege tiklandiginda yazi alaninin blur olmasini engeller
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

        {canCreateFree && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <p
              style={{
                margin: 0,
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              Bu kalem resmî kütüphanede yok. Serbest kalem olarak eklenecek: kartın sonundaki
              Muhtelif bölümüne düşer, statü ve birim seçimi size ait olur, yasal yükler bu
              seçime göre hesaplanır.
            </p>
            <button
              ref={createButtonRef}
              type="button"
              // Yazi alaninin blur olmasini engeller (mousedown blur'dan ONCE gelir);
              // secenek dugmeleriyle ayni desen.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onCreateFree(trimmedQuery)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-2)',
                cursor: 'pointer',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            >
              <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                {trimmedQuery}
              </span>
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                serbest kalem olarak ekle
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
