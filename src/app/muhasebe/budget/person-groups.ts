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

// ZIMBALI KOMISYON TABANI (1 Ekim 2026, KART-KATALOGU 7.4; Engin 30 Eylul: "kase arti hak
// devrinin toplamindan hesaplanir bu zaten ozette yer alacak"): capanin ve capaya zimbali
// TURETILMEMIS satirlarin net toplami = ozet toplami (Hizmet Bedeli + hak devri; hak devri payinin tabani da budur, card-view.ts anchorBases).
// Kisi tabanindan (personNetBases) AYRI: zimbali satirin kisi etiketi yoktur.
export function anchorNetBases(
  rows: readonly BudgetItemRow[],
  netByItemId: Readonly<Record<string, number>>,
): Record<string, number> {
  const anchorIds = new Set(rows.filter((r) => r.parentItemId !== null).map((r) => r.parentItemId as string))
  const base = new Map<string, Decimal>()
  for (const row of rows) {
    if (row.deriveRate !== null) continue
    const key = anchorIds.has(row.id) ? row.id : row.parentItemId !== null && anchorIds.has(row.parentItemId) ? row.parentItemId : null
    if (key === null) continue
    base.set(key, (base.get(key) ?? new Decimal(0)).plus(netByItemId[row.id] ?? 0))
  }
  const out: Record<string, number> = {}
  for (const [key, value] of base) out[key] = value.toNumber()
  return out
}

// Ikinci gecis: derive_rate dolu satirin birim neti, AYNI etiketteki derive_rate BOS satirlarin
// Ara toplamlarindan oranla dogar. Turetilmis satir tabana GIRMEZ (kendi sonucunu beslemesin).
// Yuvarlama iki hanedir: sonuc Birim net hanesinde gorunur, o kolon numeric(14,2) tasir.
// 1500 Dilim 2c-1: zimbali turetilmis satir tabanini capanin blogundan alir, kisiden degil.
export function derivedUnitNets(
  rows: readonly BudgetItemRow[],
  netByItemId: Readonly<Record<string, number>>,
): Record<string, number> {
  const bases = personNetBases(rows, netByItemId)
  const anchorBases = anchorNetBases(rows, netByItemId)
  const out: Record<string, number> = {}
  for (const row of rows) {
    if (row.deriveRate === null) continue
    let base: Decimal
    if (row.parentItemId !== null) base = new Decimal(anchorBases[row.parentItemId] ?? 0)
    else if (row.personObjectId) base = new Decimal(bases[row.personObjectId] ?? 0)
    else continue
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

// 1500 Dilim 2 (1 Ekim 2026, KART-KATALOGU 7.4 Karar 1, 6): ZIMBA blogu. Capa kodlari VERIDIR:
// kutuphanede herhangi bir atomun attaches_to listesinde gecen katalog kodlari. Kod 1501/1509
// bilmez. Blok kisi etiketinden DEGIL satirin zimbasindan (parentItemId) kurulur.
export function anchorCodesOf(library: readonly { attachesTo: readonly string[] }[]): Set<string> {
  const out = new Set<string>()
  for (const it of library) {
    for (const code of it.attachesTo) out.add(code)
  }
  return out
}

// Ozeti olan capa satirlari (Karar 2): kisi adi yazilmis YA DA altina zimbali en az bir satir
// var. Isimsiz ve alt satirsiz capa ozet ALMAZ (tek satir, gorev adi).
export function summaryAnchorIds(
  rows: readonly Pick<BudgetItemRow, 'id' | 'catalogCode' | 'personName' | 'parentItemId'>[],
  anchorCodes: ReadonlySet<string>,
): Set<string> {
  const anchorIds = new Set(rows.filter((r) => anchorCodes.has(r.catalogCode)).map((r) => r.id))
  const out = new Set<string>()
  for (const r of rows) {
    if (anchorIds.has(r.id) && r.personName !== null) out.add(r.id)
    if (r.parentItemId !== null && anchorIds.has(r.parentItemId)) out.add(r.parentItemId)
  }
  return out
}

export type RenderRow =
  | { kind: 'summary'; personObjectId: string; rows: BudgetItemRow[] }
  | { kind: 'anchorSummary'; anchorItemId: string; rows: BudgetItemRow[] }
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
// 1500 Dilim 2: zimba blogu (anchorSummary) ayni gecisin icinde, kisi blogundan ONCE sinanir.
export function buildRenderRows(
  groupRows: readonly BudgetItemRow[],
  summaryPersonIds: ReadonlySet<string>,
  summaryAnchors: ReadonlySet<string> = new Set(),
): RenderRow[] {
  const out: RenderRow[] = []
  const summarized = new Set<string>()
  // ZIMBA BLOGU (1 Ekim 2026, Karar 1-2): ozeti olan capanin zimbali satirlari capanin
  // BULUNDUGU yerde toplanir - kod sirasi (1501-01 < 1509) blogu araya kacirmasin. Capasi bu
  // grupta olmayan zimbali satir (capa baska basliga tasinmis) bulundugu yerde cizilir, kaybolmaz.
  const groupIds = new Set(groupRows.map((r) => r.id))
  const childrenByAnchor = new Map<string, BudgetItemRow[]>()
  const collectedChildIds = new Set<string>()
  for (const r of groupRows) {
    if (r.parentItemId !== null && summaryAnchors.has(r.parentItemId) && groupIds.has(r.parentItemId)) {
      const bucket = childrenByAnchor.get(r.parentItemId)
      if (bucket) bucket.push(r)
      else childrenByAnchor.set(r.parentItemId, [r])
      collectedChildIds.add(r.id)
    }
  }
  for (const row of groupRows) {
    if (collectedChildIds.has(row.id)) continue
    if (summaryAnchors.has(row.id)) {
      // Blok icinde sira: capa, sonra kendi satirlari (hak devri), en sonda oranla dogan (komisyon).
      const children = childrenByAnchor.get(row.id) ?? []
      const blockRows = [row, ...children.filter((c) => c.deriveRate === null), ...children.filter((c) => c.deriveRate !== null)]
      out.push({ kind: 'anchorSummary', anchorItemId: row.id, rows: blockRows })
      for (const br of blockRows) {
        out.push({ kind: 'item', row: br, underSummary: true })
      }
      continue
    }
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
