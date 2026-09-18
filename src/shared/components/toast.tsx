import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode, RefCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// MESAJ YERI (TASARIM-KARARLARI bolum 9, 17 Eylul 2026): acik bir pencere kendi icinde
// mesaj yeri acarsa mesajlar EN USTTEKI pencerenin icinde cikar; pencere yoksa ekranin
// tepesinde. Pencere kapaninca acik kalan mesaj tepeye gecer, kaybolmaz.
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

  const removeToast = useCallback((id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const addToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3500) => {
    const id = crypto.randomUUID()
    setToasts((prev) => {
      if (prev.some((t) => t.message === message && t.type === type)) return prev
      return [...prev, { id, message, type }]
    })
    if (!STICKY_TYPES.has(type)) setTimeout(() => removeToast(id), durationMs)
  }, [removeToast])

  const value = useMemo(() => ({ addToast }), [addToast])

  const registerHost = useCallback((el: HTMLElement) =>
    setHosts((prev) => (prev.includes(el) ? prev : [...prev, el])), [])
  const unregisterHost = useCallback((el: HTMLElement) =>
    setHosts((prev) => prev.filter((h) => h !== el)), [])
  const hostValue = useMemo(() => ({ registerHost, unregisterHost }), [registerHost, unregisterHost])
  // En son acilan pencere en usttedir; ic ice pencerede mesaj ustteki pencereye duser.
  const host = hosts.length > 0 ? hosts[hosts.length - 1] : null

  return (
    <ToastContext.Provider value={value}>
      <ToastHostContext.Provider value={hostValue}>
        {children}
        <ToastContainer toasts={toasts} onRemove={removeToast} host={host} />
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
