import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { placeSheet } from './sheet-placement'
import { SHEET_GAP, SHEET_MARGIN, visibleFrame } from './sheet-frame'
import type { CSSProperties, ReactNode, RefCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  // K4b: mesajin dogdugu pencerenin kabi; pencere yoksa null (ekranin tepesi).
  host: HTMLElement | null
  // K4: hucreye ya da dugmeye bagli mesajin sayfadaki adresi (CSS secicisi); yoksa null.
  anchor: string | null
}

export interface ToastOptions {
  // Varsayilan 3500 ms; yalniz basari ve bilgi mesajlarinda kullanilir.
  durationMs?: number
  // K4 (TASARIM-KARARLARI bolum 9, 27 Eylul 2026): hucrenin ya da dugmenin sayfadaki adresi.
  // Verilirse mesaj o ogenin dibinde cikar; oge sayfada yoksa adressiz mesaj gibi davranir.
  anchor?: string
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// MESAJ YERI (TASARIM-KARARLARI bolum 9, 17 Eylul 2026; K4b 27 Eylul 2026): mesaj dogdugu
// anda en ustteki pencerenin icinde, pencere yoksa ekranin tepesinde cikar ve orada kalir;
// sonradan acilan pencere eski mesaji icine cekmez. Pencere kapaninca acik kalan mesaj
// tepeye gecer, kaybolmaz.
interface ToastHostContextValue {
  registerHost: (el: HTMLElement) => void
  unregisterHost: (el: HTMLElement) => void
}

const ToastHostContext = createContext<ToastHostContextValue | null>(null)

// SURE (ayni karar): uyari ve hata kullanici kapatana kadar durur - kendiliginden giden
// uyari gorulmeyebilir, gorulmeyen uyari sessiz hatadir. Basari ve bilgi kisa kalir.
const STICKY_TYPES: ReadonlySet<ToastType> = new Set<ToastType>(['warning', 'error'])

// Pencerenin icindeki mesaj yigini akista durur, pencerenin kendi dolgusunu kullanir.
const HOSTED_STACK_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  marginBottom: 'var(--space-3)',
}

const TYPE_COLOR: Record<ToastType, string> = {
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
}

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  return (
    <div
      role={STICKY_TYPES.has(toast.type) ? 'alert' : 'status'}
      onClick={() => onRemove(toast.id)}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        borderLeft: `4px solid ${TYPE_COLOR[toast.type]}`,
        padding: 'var(--space-3)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
        <span style={{ flex: 1 }}>{toast.message}</span>
        {STICKY_TYPES.has(toast.type) && (
          <button
            type="button"
            aria-label="Kapat"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(toast.id)
            }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 'var(--text-md)', lineHeight: 1, padding: '0 var(--space-1)' }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

function ToastContainer({ toasts, onRemove, host }: { toasts: ToastItem[]; onRemove: (id: string) => void; host: HTMLElement | null }) {
  if (toasts.length === 0) return null
  const stack = (
    <div style={host ? HOSTED_STACK_STYLE : {
      position: 'fixed',
      top: 'var(--space-4)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 'var(--z-toast)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      minWidth: '280px',
      maxWidth: '420px',
      width: 'max-content',
    }}>
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
  return host ? createPortal(stack, host) : stack
}

// K4 (TASARIM-KARARLARI bolum 9, 27 Eylul 2026): adresi olan mesaj ogenin dibinde cikar. Yer K1
// hesabiyla (sheet-placement.ts) ve ogenin gorunen alaniyla (sheet-frame.ts) bulunur. Oge
// gorunen alanin tamamen disindaysa kutu gorunmez olur, geri gelince yine gorunur.
// tick: kaydirma, boyutlanma ya da sayfa degisikliginde saglayicinin arttirdigi sayac.
function AnchoredToast({ toast, anchorEl, tick, onRemove }: { toast: ToastItem; anchorEl: HTMLElement; tick: number; onRemove: (id: string) => void }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [placed, setPlaced] = useState<CSSProperties>({ visibility: 'hidden', top: 0, left: 0 })

  useLayoutEffect(() => {
    const place = () => {
      const box = boxRef.current
      if (!box) return
      const r = anchorEl.getBoundingClientRect()
      const frame = visibleFrame(anchorEl)
      const outside = r.bottom <= frame.top || r.top >= frame.bottom || r.right <= frame.left || r.left >= frame.right
      const p = placeSheet({
        anchor: { top: r.top, bottom: r.bottom, left: r.left },
        frame,
        panelWidth: box.offsetWidth,
        panelHeight: box.offsetHeight,
        viewportHeight: window.innerHeight,
        margin: SHEET_MARGIN,
        gap: SHEET_GAP,
      })
      setPlaced({
        visibility: outside ? 'hidden' : 'visible',
        top: p.top ?? undefined,
        bottom: p.bottom ?? undefined,
        left: p.left,
      })
    }
    place()
  }, [anchorEl, tick])

  return createPortal(
    <div
      ref={boxRef}
      data-toast-anchored="true"
      style={{ position: 'fixed', zIndex: 'var(--z-toast)', minWidth: '280px', maxWidth: '420px', width: 'max-content', ...placed }}
    >
      <ToastCard toast={toast} onRemove={onRemove} />
    </div>,
    document.body,
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [hosts, setHosts] = useState<HTMLElement[]>([])
  // addToast sabit kalir (TD-11): dogum anindaki ust pencere state yerine bu ref'ten okunur.
  const hostsRef = useRef<HTMLElement[]>([])
  // K4: kaydirma, boyutlanma ya da sayfa degisikliginde artar; adresli kutular yeniden yerlesir,
  // ogesi sayfadan kalkan mesaj bugunku yerine duser, oge donunce geri gelir.
  const [tick, setTick] = useState(0)

  const removeToast = useCallback((id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const addToast = useCallback((message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const id = crypto.randomUUID()
    // En son acilan pencere en usttedir; mesaj o an ustteki pencerede dogar.
    const current = hostsRef.current
    const host = current.length > 0 ? current[current.length - 1] : null
    const anchor = options?.anchor ?? null
    const durationMs = options?.durationMs ?? 3500
    setToasts((prev) => {
      // Ayni metin ayni yerde tek kez durur; baska hucrede cikan ayni metin ayri kutudur (K4).
      if (prev.some((t) => t.message === message && t.type === type && t.anchor === anchor)) return prev
      return [...prev, { id, message, type, host, anchor }]
    })
    if (!STICKY_TYPES.has(type)) setTimeout(() => removeToast(id), durationMs)
  }, [removeToast])

  const value = useMemo(() => ({ addToast }), [addToast])

  const registerHost = useCallback((el: HTMLElement) => {
    if (!hostsRef.current.includes(el)) hostsRef.current = [...hostsRef.current, el]
    setHosts(hostsRef.current)
  }, [])
  const unregisterHost = useCallback((el: HTMLElement) => {
    hostsRef.current = hostsRef.current.filter((h) => h !== el)
    setHosts(hostsRef.current)
  }, [])
  const hostValue = useMemo(() => ({ registerHost, unregisterHost }), [registerHost, unregisterHost])

  // Adresli mesaj varken kaydirma (her kutu, yakalama asamasinda), boyutlanma ve sayfadaki
  // dugum degisiklikleri kare basina en fazla bir kez tick'i arttirir.
  const hasAnchored = toasts.some((t) => t.anchor !== null)
  useEffect(() => {
    if (!hasAnchored) return undefined
    let pending = false
    const run = () => {
      pending = false
      setTick((n) => n + 1)
    }
    const schedule = () => {
      if (pending) return
      pending = true
      if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run)
      else window.setTimeout(run, 16)
    }
    document.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    const observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(schedule)
    observer?.observe(document.body, { childList: true, subtree: true })
    return () => {
      document.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      observer?.disconnect()
    }
  }, [hasAnchored])

  // Adresli mesajin ogesi sayfadaysa kutu ogenin dibinde durur; degilse mesaj adressiz mesaj
  // gibi dogdugu pencerede ya da ekranin tepesinde durur. tick bu okumayi tazeler.
  const anchorEls = new Map<string, HTMLElement>()
  for (const t of toasts) {
    if (t.anchor === null) continue
    const el = document.querySelector<HTMLElement>(t.anchor)
    if (el) anchorEls.set(t.id, el)
  }
  const flowToasts = toasts.filter((t) => !anchorEls.has(t.id))
  // Kabi artik sayfada olmayan mesaj (pencere kapandi) ekranin tepesine duser.
  const topToasts = flowToasts.filter((t) => t.host === null || !hosts.includes(t.host))

  return (
    <ToastContext.Provider value={value}>
      <ToastHostContext.Provider value={hostValue}>
        {children}
        {/* Kap basina bir yigin; ToastContainer durumsuz, sira anahtari yeterli. */}
        {hosts.map((h, i) => (
          <ToastContainer key={i} toasts={flowToasts.filter((t) => t.host === h)} onRemove={removeToast} host={h} />
        ))}
        <ToastContainer toasts={topToasts} onRemove={removeToast} host={null} />
        {toasts.map((t) => {
          const el = anchorEls.get(t.id)
          return el ? <AnchoredToast key={t.id} toast={t} anchorEl={el} tick={tick} onRemove={removeToast} /> : null
        })}
      </ToastHostContext.Provider>
    </ToastContext.Provider>
  )
}

// Pencerenin mesaj yeri: donen ref pencerenin icindeki bos bir kaba verilir; kap sayfada
// durdugu surece mesajlar oraya duser. Saglayici yoksa (pencereyi tek basina cizen testler)
// hicbir sey yapmaz. Uygulamada saglayici yoksa useToast zaten hata firlatir, bu yuzden
// eksik saglayici burada sessiz kalamaz.
export function useToastHost(): RefCallback<HTMLElement> {
  const ctx = useContext(ToastHostContext)
  return useCallback((el: HTMLElement | null) => {
    if (!ctx || !el) return undefined
    ctx.registerHost(el)
    return () => ctx.unregisterHost(el)
  }, [ctx])
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast ToastProvider içinde kullanılmalı')
  return ctx
}
