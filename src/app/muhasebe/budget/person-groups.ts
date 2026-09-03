// BOY: tek is = kisi etiketine gore satir gruplama ve orandan turetme (DOM/React/Supabase yok),
// sebep = KART 1600 ozet satiri ile temsilci komisyonu ayni iki gecisli hesaptan doguyor.
import Decimal from 'decimal.js'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'

export interface PersonGroup {
  personObjectId: string
  itemIds: string[]
  hasSummary: boolean
}

// Birinci gecis: ayni kisi etiketini tasiyan satirlar ekran sirasiyla toplanir. Etiketsiz satir
// gruba girmez. Ozet iki satirdan itibaren dogar; hicbir satir donusmez, veri asagi tasinmaz.
export function groupByPerson(rows: readonly BudgetItemRow[]): PersonGroup[] {
  const order: string[] = []
  const byPerson = new Map<string, string[]>()
  for (const row of rows) {
    const key = row.personObjectId
    if (!key) continue
    const bucket = byPerson.get(key)
    if (bucket) {
      bucket.push(row.id)
    } else {
      byPerson.set(key, [row.id])
      order.push(key)
    }
  }
  return order.map((key) => {
    const itemIds = byPerson.get(key) ?? []
    return { personObjectId: key, itemIds, hasSummary: itemIds.length >= 2 }
  })
}

// Ikinci gecis: derive_rate dolu satirin birim neti, AYNI etiketteki derive_rate BOS satirlarin
// Ara toplamlarindan oranla dogar. Turetilmis satir tabana GIRMEZ (kendi sonucunu beslemesin).
// netByItemId disaridan gelir: Ara toplam tanimi totals.ts icinde yasar, burada ikinci kez
// tanimlanmaz (bordro satirinin neti motordan gelir, ciplak carpimdan degil).
// Yuvarlama iki hanedir: sonuc Birim net hanesinde gorunur, o kolon numeric(14,2) tasir.
export function derivedUnitNets(
  rows: readonly BudgetItemRow[],
  netByItemId: Readonly<Record<string, number>>,
): Record<string, number> {
  const baseByPerson = new Map<string, Decimal>()
  for (const row of rows) {
    const key = row.personObjectId
    if (!key || row.deriveRate !== null) continue
    const net = netByItemId[row.id] ?? 0
    baseByPerson.set(key, (baseByPerson.get(key) ?? new Decimal(0)).plus(net))
  }
  const out: Record<string, number> = {}
  for (const row of rows) {
    const key = row.personObjectId
    if (!key || row.deriveRate === null) continue
    const base = baseByPerson.get(key) ?? new Decimal(0)
    out[row.id] = base
      .mul(row.deriveRate)
      .div(100)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber()
  }
  return out
}

export type RenderRow =
  | { kind: 'summary'; personObjectId: string; rows: BudgetItemRow[] }
  | { kind: 'item'; row: BudgetItemRow; underSummary: boolean }

// Ucuncu gecis: bir baslik grubunun satirlarini, cizilecek sirayla, ozet satirlariyla birlikte
// duz bir listeye cevirir. Ozetlenen kisinin ILK satirina gelindiginde once summary uretilir;
// o kisinin TUM satirlari (ekran sirasiyla) hem summary.rows'ta hem underSummary:true item
// olarak yerinde kalir - veri asagi tasinmaz, hicbir satir donusmez.
export function buildRenderRows(
  groupRows: readonly BudgetItemRow[],
  summaryPersonIds: ReadonlySet<string>,
): RenderRow[] {
  const out: RenderRow[] = []
  const summarized = new Set<string>()
  for (const row of groupRows) {
    const key = row.personObjectId
    if (key && summaryPersonIds.has(key)) {
      if (!summarized.has(key)) {
        summarized.add(key)
        const rows = groupRows.filter((r) => r.personObjectId === key)
        out.push({ kind: 'summary', personObjectId: key, rows })
      }
      out.push({ kind: 'item', row, underSummary: true })
    } else {
      out.push({ kind: 'item', row, underSummary: false })
    }
  }
  return out
}
