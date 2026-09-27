import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode, RefCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  // K4b: mesajin dogdugu pencerenin kabi; pencere yoksa null (ekranin tepesi).
  host: HTMLElement | null
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, durationMs?: number) => void
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
        <div
          key={toast.id}
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
      ))}
    </div>
  )
  return host ? createPortal(stack, host) : stack
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [hosts, setHosts] = useState<HTMLElement[]>([])
  // addToast sabit kalir (TD-11): dogum anindaki ust pencere state yerine bu ref'ten okunur.
  const hostsRef = useRef<HTMLElement[]>([])

  const removeToast = useCallback((id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const addToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3500) => {
    const id = crypto.randomUUID()
    // En son acilan pencere en usttedir; mesaj o an ustteki pencerede dogar.
    const current = hostsRef.current
    const host = current.length > 0 ? current[current.length - 1] : null
    setToasts((prev) => {
      if (prev.some((t) => t.message === message && t.type === type)) return prev
      return [...prev, { id, message, type, host }]
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

  // Kabi artik sayfada olmayan mesaj (pencere kapandi) ekranin tepesine duser.
  const topToasts = toasts.filter((t) => t.host === null || !hosts.includes(t.host))

  return (
    <ToastContext.Provider value={value}>
      <ToastHostContext.Provider value={hostValue}>
        {children}
        {/* Kap basina bir yigin; ToastContainer durumsuz, sira anahtari yeterli. */}
        {hosts.map((h, i) => (
          <ToastContainer key={i} toasts={toasts.filter((t) => t.host === h)} onRemove={removeToast} host={h} />
        ))}
        <ToastContainer toasts={topToasts} onRemove={removeToast} host={null} />
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
