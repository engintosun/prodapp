// BOY: tek is = kisi etiketine gore satir gruplama ve orandan turetme (DOM/React/Supabase yok),
// sebep = KART 1600 ozet satiri ile temsilci komisyonu ayni iki gecisli hesaptan doguyor.
import Decimal from 'decimal.js'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { PersonLabel } from '../../../shared/supabase/person-label-service'
import type { PaymentStatus } from '../../../shared/types/domain'

// Komisyon tabanina yalniz kisinin KENDI KAZANCI olan statuler girer (9 Eylul 2026 karari,
// BUTCE-EKRAN-KARARLARI bolum 20 KOMISYON TABANI VE SILME). Beyaz liste: sonradan eklenen
// yeni bir statu kendiliginden tabana sizmaz - kara liste tersini yapardi.
const EARNING_PAYMENT_STATUSES: ReadonlySet<PaymentStatus> = new Set([
  'bordro',
  'smm',
  'telif_belgeli',
])

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

// Kisi kimligi basina CIPLAK NET TABAN (9 Eylul 2026, B18: ayni formul iki yerde yasayamaz -
// derivedUnitNets ASAGIDA bu islevi CAGIRIR, kopyasini tasimaz; KOMISYON SATIRININ DOGUMU da
// ayni tabani kullanir, bkz. personsNeedingCommissionRow). Kural EARNING_PAYMENT_STATUSES'in
// AYNISI: yalniz kisinin kendi kazanci olan statuler tabana girer, derive_rate DOLU (turetilmis)
// satir tabana GIRMEZ. netByItemId disaridan gelir: Ara toplam tanimi totals.ts icinde yasar,
// burada ikinci kez tanimlanmaz (bordro satirinin neti motordan gelir, ciplak carpimdan degil).
export function personNetBases(
  rows: readonly BudgetItemRow[],
  netByItemId: Readonly<Record<string, number>>,
): Record<string, number> {
  const baseByPerson = new Map<string, Decimal>()
  for (const row of rows) {
    const key = row.personObjectId
    if (!key || row.deriveRate !== null) continue
    if (!row.paymentStatus || !EARNING_PAYMENT_STATUSES.has(row.paymentStatus)) continue
    const net = netByItemId[row.id] ?? 0
    baseByPerson.set(key, (baseByPerson.get(key) ?? new Decimal(0)).plus(net))
  }
  const out: Record<string, number> = {}
  for (const [key, value] of baseByPerson) {
    out[key] = value.toNumber()
  }
  return out
}

// Ikinci gecis: derive_rate dolu satirin birim neti, AYNI etiketteki derive_rate BOS satirlarin
// Ara toplamlarindan oranla dogar. Turetilmis satir tabana GIRMEZ (kendi sonucunu beslemesin).
// Yuvarlama iki hanedir: sonuc Birim net hanesinde gorunur, o kolon numeric(14,2) tasir.
export function derivedUnitNets(
  rows: readonly BudgetItemRow[],
  netByItemId: Readonly<Record<string, number>>,
): Record<string, number> {
  const bases = personNetBases(rows, netByItemId)
  const out: Record<string, number> = {}
  for (const row of rows) {
    const key = row.personObjectId
    if (!key || row.deriveRate === null) continue
    const base = new Decimal(bases[key] ?? 0)
    out[row.id] = base
      .mul(row.deriveRate)
      .div(100)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber()
  }
  return out
}

// TEMSILCI SAYISI KADAR SATIR (KART-KATALOGU 22 Agustos 2026 KART 1600 TASARIM KARARLARI:
// "Alt kalem sayisi temsilci sayisi kadardir. Ajans ile menajer AYRI ATOM GEREKTIRMEZ; fark
// statude yasar"). Iki cins var, ikisi de ayni 1618 atomunu kullanir, fark ODEME STATUSUNDE:
// ajans = 'sirket' (Fatura, kutuphane varsayilani), menajer = 'smm'. Bu esleme TEK yerde
// yasar ve DISA AKTARILIR - dogum (card-table-screen.tsx birthMissingCommissionRows) ve
// silme (onUpdatePersonLabel) ikisi de buradan okur, ikinci bir kopya tanimlanmaz.
export type CommissionKind = 'ajans' | 'menajer'
export const COMMISSION_STATUS_BY_KIND: Record<CommissionKind, PaymentStatus> = {
  ajans: 'sirket',
  menajer: 'smm',
}

export interface CommissionNeed {
  personObjectId: string
  kind: CommissionKind
}

// KOMISYON SATIRININ DOGUMU (9 Eylul 2026, BUTCE-EKRAN-KARARLARI bolum 20): CINS bazinda uc
// sart birden saglaninca kisi+cins ikilisi icin komisyon satiri GEREKIR. VERITABANI
// TETIKLEYICISI YASAK (B18) - taban hesabi (personNetBases) burada TypeScript'te yasar, SQL'de
// ikinci bir kopyasi acilmaz. NOT: 'smm' EARNING_PAYMENT_STATUSES beyaz listesindedir ama
// turetilmis (derive_rate DOLU) satir personNetBases'e ZATEN girmez (derive_rate denetimi
// statuden ONCE calisir) - menajer komisyon satirinin kendisi boylece kendi tabanini beslemez.
export function personsNeedingCommissionRow(
  rows: readonly BudgetItemRow[],
  labels: readonly PersonLabel[],
  netByItemId: Readonly<Record<string, number>>,
): CommissionNeed[] {
  const bases = personNetBases(rows, netByItemId)
  const hasCommissionRow = new Set<string>()
  for (const row of rows) {
    if (row.personObjectId && row.deriveRate !== null && row.paymentStatus) {
      hasCommissionRow.add(row.personObjectId + ':' + row.paymentStatus)
    }
  }
  const needs: CommissionNeed[] = []
  for (const label of labels) {
    if ((bases[label.id] ?? 0) <= 0) continue
    if (label.hasAgency && !hasCommissionRow.has(label.id + ':' + COMMISSION_STATUS_BY_KIND.ajans)) {
      needs.push({ personObjectId: label.id, kind: 'ajans' })
    }
    if (label.hasManager && !hasCommissionRow.has(label.id + ':' + COMMISSION_STATUS_BY_KIND.menajer)) {
      needs.push({ personObjectId: label.id, kind: 'menajer' })
    }
  }
  return needs
}

export type RenderRow =
  | { kind: 'summary'; personObjectId: string; rows: BudgetItemRow[] }
  | { kind: 'item'; row: BudgetItemRow; underSummary: boolean }

// Ucuncu gecis: sira VERITABANINDA (fn_add_budget_item catalog_code, item_code'a gore
// yeniden numaralar), KOMPOZISYON burada. Bir kisinin dagilmis satirlari kisinin ILK satirinin
// bulundugu yerde BLOKTA toplanir - blok icinde satirlarin KENDI ARALARINDAKI sirasi (gelis
// sirasi = katalog kodu sirasi: kase, mesai, prova, komisyon) KORUNUR. Kisisiz satirlar ve
// ozeti olmayan (tek satirli) kisilerin satirlari BULUNDUKLARI YERDE kalir, siralari degismez.
// SIRALAMAYI SQL'E TASIMA (BUTCE-EKRAN-KARARLARI bolum 20 KARTIN GORUNEN DUZENI): ikinci bir
// siralama otoritesi kurulmus olurdu, baslik ekranda kisi veritabaninda kalirdi - kompozisyon
// TEK yerde (burada) yasar.
export function buildRenderRows(
  groupRows: readonly BudgetItemRow[],
  summaryPersonIds: ReadonlySet<string>,
): RenderRow[] {
  const out: RenderRow[] = []
  const summarized = new Set<string>()
  for (const row of groupRows) {
    const key = row.personObjectId
    if (key && summaryPersonIds.has(key)) {
      if (summarized.has(key)) continue
      summarized.add(key)
      const personRows = groupRows.filter((r) => r.personObjectId === key)
      out.push({ kind: 'summary', personObjectId: key, rows: personRows })
      for (const pr of personRows) {
        out.push({ kind: 'item', row: pr, underSummary: true })
      }
    } else {
      out.push({ kind: 'item', row, underSummary: false })
    }
  }
  return out
}
