import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useToastHost } from '../../../../shared/components/toast'
import { placeSheet } from '../sheet-placement'
import type { SheetPlacement } from '../sheet-placement'

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// TETIGIN YANINDA (TASARIM-KARARLARI bolum 9, 24 Eylul 2026, Engin karari K1): anchor verilirse
// pencere tetigin yaninda acilir ve arka KARARTILMAZ (okunur kalir, dokunulmaz, disina tiklamak
// kapatir). anchor verilmezse bugunku alt-orta, karartmali pencere AYNEN durur. Pencere acikken
// ekran kaymaz (24 Eylul 2026 Edge denemesi): kaydirma DINLENMEZ, yer acilista, icerik boyu
// degisince ve pencere yeniden boyutlaninca hesaplanir.
const SHEET_MARGIN = 8
const SHEET_GAP = 4

// PENCERENIN DURABILECEGI ALAN (25 Eylul 2026, Engin karari, TASARIM-KARARLARI bolum 9 K1):
// tetigin icinde durdugu KAYDIRILAN kutularin (kabuk icerik alani, varsa tablonun kaydirma
// kutusu) kaydirma cubuklari haric gorunen kisimlarinin tarayiciyla kesisimi. Yalniz auto/scroll
// sayilir: hidden/clip sayilmaz, cunku yaziyi "..." ile kesen hucreler de hidden'dir ve Not
// penceresini hucrenin icine sikistirirdi. Alan bozuksa (bos) tarayicinin tamami kullanilir.
function visibleFrame(el: HTMLElement): { top: number; bottom: number; left: number; right: number } {
  const viewport = { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth }
  let frame = viewport
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (!/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)) continue
    const r = node.getBoundingClientRect()
    const top = r.top + node.clientTop
    const left = r.left + node.clientLeft
    frame = {
      top: Math.max(frame.top, top),
      bottom: Math.min(frame.bottom, top + node.clientHeight),
      left: Math.max(frame.left, left),
      right: Math.min(frame.right, left + node.clientWidth),
    }
  }
  if (frame.bottom - frame.top < 1 || frame.right - frame.left < 1) return viewport
  return frame
}

export function BottomSheet({
  title,
  maxWidth = 480,
  anchor,
  fitWidth,
  prefer,
  onClose,
  children,
}: {
  title: ReactNode
  maxWidth?: number
  // Tetik her hesapta yeniden bulunur (sessiz yenileme dugumu degistirebilir). Tetik
  // activeElement'ten okunamaz: Mac Safari'de tiklanan dugme odak almaz.
  anchor?: () => HTMLElement | null
  // ICERIK KADAR GENIS (24 Eylul 2026, Engin karari, BUTCE-EKRAN-KARARLARI bolum 8): verilirse
  // tetigin yaninda acilan pencere icerigi kadar genis olur, en dar min, en genis maxWidth.
  fitWidth?: { min: number }
  // ONCE USTU DENE (25 Eylul 2026, Dilim 1b-1): ekleme satirindan acilan pencereler 'above' verir.
  prefer?: 'below' | 'above'
  onClose: () => void
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerElRef = useRef<Element | null>(null)
  const onCloseRef = useRef(onClose)
  const anchorRef = useRef(anchor)
  const placedRef = useRef(false)
  const [placement, setPlacement] = useState<SheetPlacement | null>(null)
  // Tetik ilk hesapta bulunamazsa pencere bugunku alt-orta bicimine duser; gorunmez kalmaz.
  const [anchorLost, setAnchorLost] = useState(false)
  // MESAJ YERI (TASARIM-KARARLARI bolum 9, 17 Eylul 2026): acik pencerenin mesajlari
  // basligin altindaki kapta cikar, liste kaysa da yerinde durur (sticky). Bu pencereyi
  // kullanan alti pencerenin hicbiri bugun konumlu oge tasimiyor (17 Eylul 2026 olcumu);
  // tasirsa kap ortulebilir, o gun pencere ici katman tokeni gerekir.
  const toastHostRef = useToastHost()

  useLayoutEffect(() => {
    onCloseRef.current = onClose
    anchorRef.current = anchor
  })

  const anchored = anchor !== undefined
  const fitMin = fitWidth?.min ?? null
  useLayoutEffect(() => {
    if (!anchored) return undefined
    const place = () => {
      const el = anchorRef.current?.() ?? null
      const content = contentRef.current
      if (!el || !content) {
        if (!placedRef.current) setAnchorLost(true)
        return
      }
      const r = el.getBoundingClientRect()
      placedRef.current = true
      setPlacement(
        placeSheet({
          anchor: { top: r.top, bottom: r.bottom, left: r.left },
          panelWidth: fitMin === null ? maxWidth : (panelRef.current?.offsetWidth ?? maxWidth),
          panelHeight: content.offsetHeight,
          frame: visibleFrame(el),
          viewportHeight: window.innerHeight,
          margin: SHEET_MARGIN,
          gap: SHEET_GAP,
          prefer,
        }),
      )
    }
    place()
    window.addEventListener('resize', place)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place)
    if (observer && contentRef.current) observer.observe(contentRef.current)
    return () => {
      window.removeEventListener('resize', place)
      observer?.disconnect()
    }
  }, [anchored, maxWidth, fitMin, prefer])

  useEffect(() => {
    triggerElRef.current = document.activeElement
    closeButtonRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        const active = document.activeElement
        if (active instanceof HTMLElement && panelRef.current?.contains(active)) active.blur()
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      // Tetik odaklanabilir bir ogeyse imlec ona doner (Safari'de activeElement tetik degildir);
      // degilse (ekleme satirinin bos hucresi gibi) acilistaki odakli ogeye doner (K11).
      const anchorEl = anchorRef.current?.() ?? null
      const trigger = anchorEl && anchorEl.matches(FOCUSABLE_SELECTOR) ? anchorEl : triggerElRef.current
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus()
    }
  }, [])

  const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const mode: 'anchored' | 'bottom' = anchored && !anchorLost ? 'anchored' : 'bottom'
  // Genislik icerik kadarsa SABITLENMEZ: icerik sonradan buyurse (bordro hesabi gelince) pencere
  // de buyur; yer yeniden hesaplanir (ResizeObserver). Tavan ekrandan da tasmaz.
  const anchoredWidth: CSSProperties =
    fitMin === null
      ? { width: placement === null ? `min(${maxWidth}px, 100%)` : placement.width }
      : { width: 'fit-content', minWidth: fitMin, maxWidth: `min(${maxWidth}px, calc(100vw - ${2 * SHEET_MARGIN}px))` }
  // Yer hesaplanana kadar pencere saydam durur (boyu olculsun, odak alabilsin); hesap boyamadan
  // once biter, kullanici bu hali gormez.
  const panelPlace: CSSProperties =
    mode === 'bottom'
      ? {
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `min(${maxWidth}px, 100%)`,
          maxHeight: '80vh',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        }
      : placement === null
        ? { top: 0, left: 0, ...anchoredWidth, opacity: 0, borderRadius: 'var(--radius-lg)' }
        : {
            top: placement.top ?? undefined,
            bottom: placement.bottom ?? undefined,
            left: placement.left,
            ...anchoredWidth,
            maxHeight: placement.maxHeight,
            borderRadius: 'var(--radius-lg)',
          }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          // Alt-orta bicim karartir; tetigin yaninda acilan pencere karartmaz (K1). Seffaf ortu
          // tiklamayi yine yakalar: arka DOKUNULMAZ, disina tiklamak kapatir.
          background: mode === 'bottom' ? 'rgba(0,0,0,0.45)' : 'transparent',
          // Katman sirasi tokens.css'te TEK yerde yasar (TASARIM-KARARLARI bolum 9).
          zIndex: 'var(--z-modal)' as unknown as number,
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        onKeyDown={onPanelKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          ...panelPlace,
          overflowY: 'auto',
          background: 'var(--color-surface)',
          // Govde scrim ile AYNI katmanda; DOM sirasi geregi ustte kalir.
          zIndex: 'var(--z-modal)' as unknown as number,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          ref={contentRef}
          style={{ padding: 'var(--space-4)', paddingBottom: mode === 'bottom' ? 'var(--space-6)' : 'var(--space-4)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text)' }}>{title}</span>
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
          <div ref={toastHostRef} style={{ position: 'sticky', top: 0 }} />
          {children}
        </div>
      </div>
    </>
  )
}
