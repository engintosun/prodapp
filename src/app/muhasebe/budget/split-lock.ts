// KILIDI ACIP KAPAMA DEGERLERI (1 Ekim 2026, KART-KATALOGU 7.4 Karar 11, 13, KILIT ACILIRKEN).
// SAF hesap; yazmayi fn_set_split_lock yapar (tek islem). Rakamlar tam TL'ye yuvarlanan Ara toplam
// (totals.ts rowTotals) uzerinden kurulur: birim ve donem rakamlarinin kurus yuvarlamasindan
// dogan artik hak devrinde kalir, toplam korunur. Bordro statulu Hizmet Bedeli bolunmez
// (person-groups.ts lockedSplits ile ayni kural).
import Decimal from 'decimal.js'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import { rowTotals } from './totals'
import { lockedSplits, shareItem } from './person-groups'

export interface SplitLockWrite {
  rate: number | null
  splitUnitNet: number | null
  anchorUnitNet: number
  anchorPeriodNets: Record<string, number>
}

function round2(n: Decimal): number {
  return n.toDecimalPlaces(2).toNumber()
}

// Hizmet Bedeli'nin birim ve (dolu) donem rakamlari factor ile carpilir, kuruşa yuvarlanir.
function scaledWrite(anchor: BudgetItemRow, factor: Decimal) {
  const anchorUnitNet = round2(new Decimal(anchor.unitNet).mul(factor))
  const anchorPeriodNets: Record<string, number> = {}
  const periodNet: Record<string, number | null> = {}
  for (const [sid, v] of Object.entries(anchor.periodNet)) {
    if (v === null) {
      periodNet[sid] = null
      continue
    }
    const w = round2(new Decimal(v).mul(factor))
    anchorPeriodNets[sid] = w
    periodNet[sid] = w
  }
  return { item: { ...anchor, unitNet: anchorUnitNet, periodNet }, anchorUnitNet, anchorPeriodNets }
}

// ACILIS (kilitli -> acik): Hizmet Bedeli payi kayda yazilir; hak devri = toplam - yazilan payin
// Ara toplami. Oran bosalir.
export function unlockWrite(anchor: BudgetItemRow, rate: number): SplitLockWrite {
  const fullNet = rowTotals(anchor, undefined).net
  const w = scaledWrite(anchor, new Decimal(100).minus(rate).div(100))
  const writtenNet = rowTotals(w.item, undefined).net
  return { rate: null, splitUnitNet: fullNet - writtenNet, anchorUnitNet: w.anchorUnitNet, anchorPeriodNets: w.anchorPeriodNets }
}

// KAPANIS (acik -> kilitli): iki rakamin toplami yeni toplam, hak devrinin payi oran. Hizmet
// Bedeli'nin rakamlari (pay + hak devri) / pay ile buyutulur; oran buyutulmus GERCEK toplamdan
// (yuvarlama sonrasi) 8 basamakla hesaplanir ki hak devri bir TL bile ziplamasin.
export function relockWrite(anchor: BudgetItemRow, splitNet: number): SplitLockWrite {
  if (anchor.paymentStatus === 'bordro') throw new Error('Bordro statülü Hizmet Bedeli bölünmez.')
  const share = rowTotals(anchor, undefined).net
  if (share <= 0) throw new Error('Hizmet Bedeli 0 iken toplam kilitlenemez.')
  const w = scaledWrite(anchor, new Decimal(share).plus(splitNet).div(share))
  const total = rowTotals(w.item, undefined).net
  const rate = new Decimal(splitNet).div(total).mul(100).toDecimalPlaces(8).toNumber()
  if (rate >= 100) throw new Error('Hizmet Bedeli 0 iken toplam kilitlenemez.')
  return { rate, splitUnitNet: null, anchorUnitNet: w.anchorUnitNet, anchorPeriodNets: w.anchorPeriodNets }
}

// KILITLI PAY YAZIMI (1 Ekim 2026, KART-KATALOGU 7.4 Karar 12): yazilan pay ile kayittaki birim
// rakam orani verir; miktar ve X pay ile toplamda ayni oldugu icin sadelesir (donemli Hizmet
// Bedeli'nde de tek adim). 8 basamak (kayit hassasiyeti, goc 20261001130000).
export const LOCKED_SHARE_OVER =
  'Toplam kilitli: Hizmet Bedeli payı toplamı aşamaz. Toplamı değiştirmek için oranın yanındaki kilidi aç.'

export function rateFromShare(storedUnitNet: number, typedShare: number): number {
  if (typedShare < 0) throw new Error('Negatif değer girilemez')
  if (typedShare > storedUnitNet) throw new Error(LOCKED_SHARE_OVER)
  if (typedShare === 0) throw new Error('Hizmet Bedeli payı 0 olamaz.')
  return new Decimal(1).minus(new Decimal(typedShare).div(storedUnitNet)).mul(100).toDecimalPlaces(8).toNumber()
}

// Kilitli capanin ekranda gorunen satiri (KLV ham degeri icin); kilitli degilse satirin kendisi.
export function shownRow(rows: readonly BudgetItemRow[], row: BudgetItemRow): BudgetItemRow {
  const split = lockedSplits(rows).get(row.id)
  return split ? shareItem(row, split.rate) : row
}

// KILITLI HAK DEVRININ RAKAMI (Karar 11): toplam - pay. TEK YER: card-view.ts computeRowTotals ve
// kart ekraninin silme sorusu bunu okur (ayni formul iki yerde yasamaz). Bordro capa bolunmez
// (lockedSplits), bordro verisi gerekmez.
export function lockedRemainder(anchor: BudgetItemRow, rate: number): number {
  return rowTotals(anchor, undefined).net - rowTotals(shareItem(anchor, rate), undefined).net
}
