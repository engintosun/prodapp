import { useCallback, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { BottomSheet } from './bottom-sheet'

// SORU PENCERESI (25 Eylul 2026, Engin karari K3, TASARIM-KARARLARI bolum 9): tarayicinin kendi
// soru kutusu (window.confirm) yerine projenin penceresi. Tetigin yaninda acilir, arka kararmaz
// (K1). Kod cevabi bekleyebilir: ask(...) Promise<boolean> doner. Pencere acilinca imlec kapatma
// dugmesinde durur; Enter orada kapatir (Vazgec), Esc de Vazgec sayilir. Onay dugmesi kirmizidir
// ve sorunun fiilini tasir (Sil, Kaldir). Yalniz kanca disa aktarilir (react-refresh).
export interface ConfirmAsk {
  message: string
  confirmLabel: string
  anchor: () => HTMLElement | null
}

interface Pending extends ConfirmAsk {
  resolve: (ok: boolean) => void
}

const buttonBase: CSSProperties = {
  minHeight: 'var(--touch-min)',
  padding: '0 var(--space-4)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
}

const cancelStyle: CSSProperties = {
  ...buttonBase,
  background: 'transparent',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
}

const confirmStyle: CSSProperties = {
  ...buttonBase,
  background: 'var(--color-danger)',
  border: 'none',
  color: 'var(--color-primary-text)',
}

export function useConfirmSheet(): { ask: (opts: ConfirmAsk) => Promise<boolean>; element: ReactNode } {
  const [pending, setPending] = useState<Pending | null>(null)

  const ask = useCallback(
    (opts: ConfirmAsk) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  )

  const finish = (ok: boolean) => {
    if (!pending) return
    pending.resolve(ok)
    setPending(null)
  }

  const element = pending ? (
    <BottomSheet title={pending.message} anchor={pending.anchor} fitWidth={{ min: 240 }} onClose={() => finish(false)}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
        <button type="button" onClick={() => finish(false)} style={cancelStyle}>
          Vazgeç
        </button>
        <button type="button" onClick={() => finish(true)} style={confirmStyle}>
          {pending.confirmLabel}
        </button>
      </div>
    </BottomSheet>
  ) : null

  return { ask, element }
}
