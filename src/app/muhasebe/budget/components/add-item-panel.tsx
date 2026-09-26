import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { resolveKeyAction } from '../hooks/grid-navigation-core'
import type { RoomOption } from '../format'
import { useToastHost } from '../../../../shared/components/toast'
import { placeSheet } from '../sheet-placement'
import type { SheetPlacement } from '../sheet-placement'
import { visibleFrame, SHEET_MARGIN, SHEET_GAP } from '../sheet-frame'

export interface PersonOption {
  id: string
  name: string
}

interface AddItemPanelProps {
  query: string
  options: RoomOption[]
  highlightIndex: number
  inputRef: RefObject<HTMLInputElement | null>
  onQueryChange: (value: string) => void
  onHighlightChange: (next: number) => void
  onSelect: (item: RoomOption, personObjectId?: string) => void
  crossCardNames: string[]
  onCreateFree: (name: string) => void
  onClose: () => void
  // GOREV DISI ATOMLARDA KISI SORMA (asks_person, 19 Eylul 2026): kartta aktif satiri
  // olan kisiler - panelde HESAPLANMAZ, prop olarak gelir (card-table-screen.tsx).
  persons: PersonOption[]
  // YER (25 Eylul 2026, Dilim 1b-2): odanin baglandigi ekleme satiri hucresi; bulunamazsa oda ortada acilir.
  anchor?: () => HTMLElement | null
  // YATAY YASLANMA (25 Eylul 2026, Dilim 1b-2 duzeltmesi, Engin karari): verilirse ve bulunursa sol
  // kenar bu ogenin (ilk not dugmesi) sol kenarindan alinir; bulunamazsa anchor'in sol kenari.
  anchorLeft?: () => HTMLElement | null
}

// GENISLIK (25 Eylul 2026, Engin karari): 340 piksel; en uzun kutuphane adi ("Seyahat, Konaklama,
// Yemek, Harcirah") tek satirda sigar. 28 Temmuz'daki "alt-sheet ile ayni olcu" kurali bu kararla degisti.
const ROOM_WIDTH = 340

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
  crossCardNames,
  onCreateFree,
  onClose,
  persons,
  anchor,
  anchorLeft,
}: AddItemPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const triggerElRef = useRef<Element | null>(null)
  const onCloseRef = useRef(onClose)
  const panelRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef(anchor)
  const anchorLeftRef = useRef(anchorLeft)
  const [placement, setPlacement] = useState<SheetPlacement | null>(null)
  // ASKS_PERSON IKI ADIM (19 Eylul 2026): birinci adim bugunku kalem listesi; asksPerson
  // isaretli secenek secilince panel KAPANMAZ, ikinci adima gecer (baslik "Kime?", liste
  // kisi listesi olur). pendingOption ikinci adimda hangi kalemin kisi bekledigini tasir.
  const [step, setStep] = useState<'library' | 'person'>('library')
  const [pendingOption, setPendingOption] = useState<RoomOption | null>(null)

  const backToLibraryStep = () => {
    setStep('library')
    setPendingOption(null)
  }

  const selectOption = (o: RoomOption) => {
    if (o.asksPerson) {
      setPendingOption(o)
      setStep('person')
      onQueryChange('')
      onHighlightChange(-1)
      return
    }
    onSelect(o)
  }

  const selectPerson = (personId: string) => {
    if (!pendingOption) return
    onSelect(pendingOption, personId)
    backToLibraryStep()
  }
  // MESAJ YERI (TASARIM-KARARLARI bolum 9, 17 Eylul 2026): yuzey acikken mesajlar
  // basligin altindaki kapta cikar.
  const toastHostRef = useToastHost()

  useLayoutEffect(() => {
    onCloseRef.current = onClose
    anchorRef.current = anchor
    anchorLeftRef.current = anchorLeft
  })

  // YER (25 Eylul 2026, Engin karari, TASARIM-KARARLARI bolum 9 K1 EKLEME SATIRI, Dilim 1b-2):
  // oda ekleme satirinin bos hucresine gore yerlesir, once ustu dener. Yer YALNIZ acilista ve
  // tarayici yeniden boyutlaninca hesaplanir: kalem eklenip ekleme satiri asagi inse de oda
  // yerinde durur. Ustte acilan odanin alt kenari sabittir; liste uzarsa oda yukari buyur.
  // Tetik bulunamazsa placement bos kalir ve oda eskisi gibi ekranin ortasinda acilir.
  useLayoutEffect(() => {
    const place = () => {
      const el = anchorRef.current?.() ?? null
      const panel = panelRef.current
      if (!el || !panel) return
      const r = el.getBoundingClientRect()
      setPlacement(
        placeSheet({
          anchor: { top: r.top, bottom: r.bottom, left: anchorLeftRef.current?.()?.getBoundingClientRect().left ?? r.left },
          frame: visibleFrame(el),
          panelWidth: ROOM_WIDTH,
          panelHeight: panel.offsetHeight,
          viewportHeight: window.innerHeight,
          margin: SHEET_MARGIN,
          gap: SHEET_GAP,
          prefer: 'above',
          // SATIRI ORTEREK (25 Eylul 2026, Dilim 1b-2 duzeltmesi, Engin karari): alt kenar ekleme satirinin alt cizgisinde.
          cover: true,
        }),
      )
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

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
    // ASKS_PERSON IKI ADIM: ikinci adimda (kisi listesi) cekirdegin combobox sozlesmesi
    // (options/highlightIndex) uygulanmaz - o liste bu odanin degil. Yalniz Esc, kapatma
    // dugmesiyle AYNI anlami tasir: birinci adima doner, oda kapanmaz.
    if (step === 'person') {
      if (e.key === 'Escape') {
        e.stopPropagation()
        backToLibraryStep()
      }
      return
    }
    const res = resolveKeyAction(e, 'nav', '', 'combobox', { open: true, hasHighlight })
    if (res.preventDefault) e.preventDefault()
    if (res.listIntent === 'listDown') {
      onHighlightChange(Math.min(highlightIndex + 1, options.length - 1))
    } else if (res.listIntent === 'listUp') {
      onHighlightChange(Math.max(highlightIndex - 1, -1))
    } else if (res.listIntent === 'listSelect') {
      const picked = options[highlightIndex]
      if (picked) selectOption(picked)
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
        ref={panelRef}
        aria-label={step === 'person' ? 'Kime?' : 'Kalem ekle'}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          ...(placement === null
            ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxHeight: '70vh' }
            : { top: placement.top ?? undefined, bottom: placement.bottom ?? undefined, left: placement.left, maxHeight: placement.maxHeight }),
          width: `min(${ROOM_WIDTH}px, 100%)`,
          // TEK KAYDIRMA (25 Eylul 2026, Engin karari): oda kendisi kaymaz; dikey kutudur, liste kalan
          // yeri alir ve sigmazsa yalniz liste kayar (listeler kaydirilan kutu oldugu icin kendiliginden
          // kisalir; baslik, yazi alani ve serbest kalem aciklamasi kisalmaz).
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)',
          padding: 'var(--space-4)',
          zIndex: 'var(--z-panel)' as unknown as number,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text)' }}>
            {step === 'person' ? 'Kime?' : 'Kalem ekle'}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={step === 'person' ? 'Geri dön' : 'Kapat'}
            // ASKS_PERSON IKI ADIM: ikinci adimda ayni dugme birinci adima doner, oda
            // kapanmaz, satir dogmaz (Engin karari, 19 Eylul 2026).
            onClick={step === 'person' ? backToLibraryStep : onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', padding: '0 var(--space-1)' }}
          >
            ×
          </button>
        </div>

        <div ref={toastHostRef} style={{ position: 'sticky', top: 0 }} />

        {step === 'person' ? (
          persons.length > 0 ? (
            <ul
              role="listbox"
              style={{
                marginTop: 0,
                marginBottom: 0,
                padding: 0,
                listStyle: 'none',
                maxHeight: 320,
                // KAYDIRMA CUBUGU GIZLI (25 Eylul 2026, Engin karari): kaydirma fare, dokunmatik yuzey ve
                // oklarla calisir; en alttaki yarim kesik satir devami oldugunu gosterir.
                scrollbarWidth: 'none',
                overflowY: 'auto',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {persons.map((p) => (
                <li key={p.id} role="option">
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectPerson(p.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: 'var(--space-2)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text)',
                      background: 'transparent',
                    }}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Bu kartta aktif satırı olan kimse yok.
            </p>
          )
        ) : (
          <>
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
              // KAYDIRMA CUBUGU GIZLI (25 Eylul 2026, Engin karari): bkz. Kime? listesi.
              scrollbarWidth: 'none',
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
                  onClick={() => selectOption(o)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--space-2)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                    background: i === highlightIndex ? 'var(--color-surface-2)' : 'transparent',
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
              Başlıksız bölümüne düşer, statü ve birim seçimi size ait olur, yasal yükler bu
              seçime göre hesaplanır.
            </p>
            {crossCardNames.length > 0 && (
              // D3c-3: gorunurluk islevsel oldugu icin simdilik belirgin; renk/ton UI turunda
              // kesinlesir (UX once, UI sonra). Yalniz mevcut token'lar kullanilir.
              <div
                style={{
                  marginBottom: 'var(--space-2)',
                  borderLeft: '2px solid var(--color-border)',
                  paddingLeft: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text)',
                }}
              >
                {crossCardNames.length === 1 ? (
                  <span>
                    Bu ad <strong style={{ fontWeight: 600 }}>{crossCardNames[0]}</strong> kartının kütüphanesinde var.
                  </span>
                ) : (
                  <span>
                    Bu ad{' '}
                    {crossCardNames.map((name, i) => (
                      <span key={name}>
                        {i > 0 && ', '}
                        <strong style={{ fontWeight: 600 }}>{name}</strong>
                      </span>
                    ))}{' '}
                    kartlarının kütüphanesinde var.
                  </span>
                )}
              </div>
            )}
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
          </>
        )}
      </div>
    </>
  )
}
