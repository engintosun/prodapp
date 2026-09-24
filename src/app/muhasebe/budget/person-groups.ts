// BOY: tek is = kisi etiketine gore satir gruplama ve orandan turetme (DOM/React/Supabase yok),
// sebep = KART 1600 ozet satiri ile temsilci komisyonu ayni iki gecisli hesaptan doguyor.
import Decimal from 'decimal.js'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { PersonLabel } from '../../../shared/supabase/person-label-service'
import { personCardPresence } from './person-bring'

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
// derivedUnitNets ASAGIDA bu islevi CAGIRIR, kopyasini tasimaz; KOMISYON SATIRININ DOGUMU
// 23 Eylul 2026'dan beri tabana BAKMAZ, bkz. personsNeedingCommissionRow). Kural (11 Eylul 2026): kisisi bagli
// ve turetilmemis (derive_rate BOS) her satir tabana girer, odeme statusune BAKILMAZ. netByItemId
// disaridan gelir: Ara toplam tanimi totals.ts icinde yasar, burada ikinci kez tanimlanmaz
// (bordro satirinin neti motordan gelir, ciplak carpimdan degil).
export function personNetBases(
  rows: readonly BudgetItemRow[],
  netByItemId: Readonly<Record<string, number>>,
): Record<string, number> {
  const baseByPerson = new Map<string, Decimal>()
  for (const row of rows) {
    const key = row.personObjectId
    // TABAN OLCUTU (11 Eylul 2026, Engin karari): kisisi bagli ve turetilmemis her satir girer.
    // Odeme statusune BAKILMAZ - ajans ucreti oyuncunun kazancindan dogar, o kazancin hangi
    // belgeyle odendigi tabani degistirmez. Eski beyaz liste (bordro/smm/telif) loan-out
    // oyuncusunun kazancini tabandan sessizce dusuruyordu.
    if (!key || row.deriveRate !== null) continue
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

// TEMSILCI SAYISI KADAR SATIR (KART-KATALOGU 22 Agustos 2026 KART 1600 TASARIM KARARLARI'nin
// "Ajans ile menajer AYRI ATOM GEREKTIRMEZ; fark statude yasar" maddesi 12 Eylul 2026'da
// TERSINE DONDU): iki cins artik KENDI ATOMUNU tasir - ajans 1618, menajer 1618-01. Fark
// ATOMDA yasar, statu yalniz vergi olgusudur ve kullanici tarafindan degistirilebilir; kimlik
// tasiyamaz. Bu esleme TEK yerde yasar ve DISA AKTARILIR - dogum (card-table-screen.tsx
// birthMissingCommissionRows) ve silme (onUpdatePersonLabel) ikisi de buradan okur, ikinci bir
// kopya tanimlanmaz.
export type CommissionKind = 'ajans' | 'menajer'
export const COMMISSION_CATALOG_BY_KIND: Record<CommissionKind, string> = {
  ajans: '1618',
  menajer: '1618-01',
}

export interface CommissionNeed {
  personObjectId: string
  kind: CommissionKind
}

// KOMISYON SATIRININ DOGUMU (9 Eylul 2026; SART DEGISTI 23 Eylul 2026, Engin karari,
// BUTCE-EKRAN-KARARLARI bolum 20 madde 1): CINS bazinda iki sart birden saglaninca kisi+cins
// ikilisi icin komisyon satiri GEREKIR: kisi bu kartta ve o cinsin tiki var. "Kartta" olcutu
// Oyuncular listesinin olcutunun AYNISIDIR (person-bring.ts personCardPresence), ikinci tanim
// acilmaz. Taban ARTIK SART DEGIL: rakam yoksa satir sifir tutarla dogar. VERITABANI
// TETIKLEYICISI YASAK (B18).
export function personsNeedingCommissionRow(
  rows: readonly BudgetItemRow[],
  labels: readonly PersonLabel[],
): CommissionNeed[] {
  const { inCard } = personCardPresence(rows, labels)
  const hasCommissionRow = new Set<string>()
  for (const row of rows) {
    if (row.personObjectId && row.deriveRate !== null && row.catalogCode) {
      hasCommissionRow.add(row.personObjectId + ':' + row.catalogCode)
    }
  }
  const needs: CommissionNeed[] = []
  for (const label of labels) {
    if (!inCard[label.id]) continue
    if (label.hasAgency && !hasCommissionRow.has(label.id + ':' + COMMISSION_CATALOG_BY_KIND.ajans)) {
      needs.push({ personObjectId: label.id, kind: 'ajans' })
    }
    if (label.hasManager && !hasCommissionRow.has(label.id + ':' + COMMISSION_CATALOG_BY_KIND.menajer)) {
      needs.push({ personObjectId: label.id, kind: 'menajer' })
    }
  }
  return needs
}

// TIK KALKMIS KOMISYON SATIRI (24 Eylul 2026, Engin karari, BUTCE-EKRAN-KARARLARI bolum 20
// SILME KURALI): personsNeedingCommissionRow islevinin AYNASI. Turetilmis (derive_rate dolu)
// satirin cinsi katalog kodundan okunur; kisinin o cinsteki tiki KAPALIYSA satir silinmelidir.
// Tik Uretim Kayitlari duragindan da kaldirilabilir ve o ekran butceyi hic gormez; bu yuzden
// kart bu islevi hem acilista hem kendi panosunda cagirir. Kopya varsa HEPSI ayni gruba duser
// (10 Eylul 2026). Etiketi bulunamayan kisinin satiri DONMEZ: tik bilinmiyor, silmeye dayanak yok.
export interface UntickedCommission {
  personObjectId: string
  kind: CommissionKind
  rows: BudgetItemRow[]
}

export function commissionRowsWithoutTick(
  rows: readonly BudgetItemRow[],
  labels: readonly PersonLabel[],
): UntickedCommission[] {
  const labelById = new Map(labels.map((l) => [l.id, l] as const))
  const groups = new Map<string, UntickedCommission>()
  for (const row of rows) {
    if (!row.personObjectId || row.deriveRate === null) continue
    const kind: CommissionKind | null =
      row.catalogCode === COMMISSION_CATALOG_BY_KIND.ajans
        ? 'ajans'
        : row.catalogCode === COMMISSION_CATALOG_BY_KIND.menajer
          ? 'menajer'
          : null
    if (!kind) continue
    const label = labelById.get(row.personObjectId)
    if (!label) continue
    const tickOn = kind === 'ajans' ? label.hasAgency : label.hasManager
    if (tickOn) continue
    const key = row.personObjectId + ':' + kind
    const group = groups.get(key)
    if (group) group.rows.push(row)
    else groups.set(key, { personObjectId: row.personObjectId, kind, rows: [row] })
  }
  return [...groups.values()]
}

export type RenderRow =
  | { kind: 'summary'; personObjectId: string; rows: BudgetItemRow[] }
  | { kind: 'item'; row: BudgetItemRow; underSummary: boolean }

// Ucuncu gecis: sira VERITABANINDA (fn_add_budget_item catalog_code, item_code'a gore
// yeniden numaralar), KOMPOZISYON burada. Bir kisinin dagilmis satirlari kisinin ILK satirinin
// bulundugu yerde BLOKTA toplanir - blok icinde satirlarin KENDI ARALARINDAKI sirasi (gelis
// sirasi = katalog kodu sirasi) KORUNUR. TEK ISTISNA (Engin karari, 19 Eylul 2026): oranla
// dogan satir (derive_rate dolu) blogun EN SONUNA alinir - komisyon kendi sahibinin
// kalemlerinden sonra gelmeli, ustunde durursa neye ait oldugu okunmaz. Kisisiz satirlar ve
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
      const ownRows = groupRows.filter((r) => r.personObjectId === key && r.deriveRate === null)
      const derivedRows = groupRows.filter((r) => r.personObjectId === key && r.deriveRate !== null)
      const personRows = [...ownRows, ...derivedRows]
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
