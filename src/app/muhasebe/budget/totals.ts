// BOY: tek iş = kalem satırı ve kart toplamı hesabının saf fonksiyonları (DOM/React/Supabase yok),
// sebep = aynı hesap hem satır render'ında hem toplam şeridinde kullanılıyor; tek yerde yaşamalı.
import { netToplamDonemli, brutToplamDonemli, kisiyeBanka } from '../../../shared/cfe'
import type { Yuk } from '../../../shared/cfe'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import { buildDonemler } from './format'
import type { BordroSheetEntry } from './components/burden-sheet'

export interface RowTotals {
  net: number
  yasalYuk: number
  maliyet: number
  kdv: number
  brut: number
}

export function rowTotals(item: BudgetItemRow, bordro: BordroSheetEntry | undefined): RowTotals {
  const isBordro = item.paymentStatus === 'bordro'
  // Bordro: motor (deriveBordroFields) kaynak; genel additive/deduction CFE yolu (cfe.ts)
  // ARTIK CAGRILMAZ (1a borcu - item_burdens skeleton bacaklari null rate tasir).
  const donemler = isBordro ? [] : buildDonemler(item)
  const yukler: Yuk[] = isBordro ? [] : item.burdens.map((b) => ({ ratePercent: b.rate, kind: b.kind }))
  const netToplam = isBordro ? (bordro?.data?.totalNet ?? 0) : netToplamDonemli(donemler)
  const brutYuk = isBordro ? 0 : brutToplamDonemli(donemler, yukler)
  const kdvTl = isBordro ? 0 : kisiyeBanka(netToplam, brutYuk, item.vatRate).kdv
  const maliyet = isBordro ? (bordro?.data?.totalGross ?? 0) : brutYuk
  const yasalYukTl = maliyet - netToplam
  const brutToplam = maliyet + kdvTl
  return { net: netToplam, yasalYuk: yasalYukTl, maliyet, kdv: kdvTl, brut: brutToplam }
}

export function cardTotals(
  rows: BudgetItemRow[],
  bordroData: Record<string, BordroSheetEntry>,
): RowTotals {
  return rows.reduce<RowTotals>(
    (acc, it) => {
      const t = rowTotals(it, bordroData[it.id])
      return {
        net: acc.net + t.net,
        yasalYuk: acc.yasalYuk + t.yasalYuk,
        maliyet: acc.maliyet + t.maliyet,
        kdv: acc.kdv + t.kdv,
        brut: acc.brut + t.brut,
      }
    },
    { net: 0, yasalYuk: 0, maliyet: 0, kdv: 0, brut: 0 },
  )
}
