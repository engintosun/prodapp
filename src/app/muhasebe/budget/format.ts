import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { DonemKalemi } from '../../../shared/cfe'

export function fmt(n: number): string {
  const dp = Number.isInteger(n) ? 0 : 2
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n)
}

// deriveBordroFields, motor hatasini tipli reason koduyla firlatir (bkz. budget-service.ts
// classifyBordroError); ham kod yerine kullaniciya kisa Turkce mesaj gosterilir.
export function bordroReasonMessage(reason: string): string {
  if (reason === 'invalid_net') return 'Net eksik'
  if (reason === 'no_periods') return 'Dönem verisi eksik'
  return 'Hesaplanamadı'
}

export function itemHasNote(it: BudgetItemRow): boolean {
  return Boolean((it.internalNote && it.internalNote.trim()) || (it.publicNote && it.publicNote.trim()))
}

export function isMultiPeriod(it: BudgetItemRow): boolean {
  return Object.keys(it.periodQty).length > 1
}

// Tek-donem (0 veya 1) modunda ana satir kendi degerlerini parametre olarak kullanir;
// cok-donem modunda her donem-satiri kendi override/kalitim degerleriyle ozerk.
export function buildDonemler(it: BudgetItemRow): DonemKalemi[] {
  if (!isMultiPeriod(it)) {
    return [{ net: it.unitNet, qty: it.multiplier, carpan: it.repeat }]
  }
  return Object.keys(it.periodQty).map((sid) => ({
    net: it.periodNet[sid] ?? it.unitNet,
    qty: it.periodQty[sid],
    carpan: it.periodRepeat[sid] ?? it.repeat,
  }))
}

export function summarizeSame<T>(stageIds: string[], pick: (sid: string) => T): T | null {
  if (stageIds.length === 0) return null
  const vals = stageIds.map(pick)
  return vals.every((v) => v === vals[0]) ? vals[0] : null
}

export function fieldVal(buf: string | undefined, n: number): string {
  return buf !== undefined ? buf : String(n)
}

export function repeatVal(buf: string | undefined, n: number): string {
  return buf !== undefined ? buf : String(n)
}

export function periodVal(buf: string | undefined, n: number): string {
  return buf !== undefined ? buf : String(n)
}

export function periodNetVal(buf: string | undefined, override: number | null | undefined, unitNet: number): string {
  if (buf !== undefined) return buf
  return override != null ? String(override) : String(unitNet)
}

export function periodRepeatVal(buf: string | undefined, override: number | null | undefined, repeat: number): string {
  if (buf !== undefined) return buf
  return override != null ? String(override) : String(repeat)
}
