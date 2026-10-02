// HAK DEVRI IKI KURAL (1 Ekim 2026, Engin karari; KART-KATALOGU 7.4). SAF hesap; yazmayi
// fn_set_split_share yapar (tek islem). Kural: yazilan satir degisir, obur satir uyar.
// - Hizmet Bedeli'ne yazilan buyukluk: hak devri = Hizmet Bedeli x oran / (100 - oran) (splitNetFrom).
// - Hak devrine yazilan paylasim (oran ya da tutar): toplam sabit, Hizmet Bedeli yeniden yazilir
//   (reshareWrite). Eklemede %50 bolme ve silmede rakamin Hizmet Bedeli'ne donmesi ayni islev
//   (oran 0'dan 50'ye / oran 0'a).
// Yeniden yazimda Hizmet Bedeli'nin birim ve donem rakamlari TAM TL'ye yuvarlanir; oran yazilan
// gercek rakamdan 8 basamakla hesaplanir, hak devri toplamdan kalani alir: toplam kaymaz, kurus cikmaz.
// Bordro statulu Hizmet Bedeli bolunmez (net motordan gelir).
import Decimal from 'decimal.js'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import { rowTotals } from './totals'

function roundTl(n: Decimal): number {
  return n.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber()
}

// Kural 1: hak devrinin rakami (toplamin "oran" kadari).
export function splitNetFrom(anchorNet: number, rate: number): number {
  if (rate <= 0) return 0
  return roundTl(new Decimal(anchorNet).mul(rate).div(new Decimal(100).minus(rate)))
}

// KURAL 2 METINLERI (2 Ekim 2026, Engin karari 2; KART-KATALOGU 7.4). Metin TEK yerde.
export const SPLIT_OVER_TOTAL = "Hak devri toplamı aşamaz. Toplamı büyütmek için Hizmet Bedeli'ni değiştir."
const BORDRO_NO_SPLIT = 'Bordro statülü Hizmet Bedeli bölünmez.'

export interface SplitShareWrite {
  rate: number
  anchorUnitNet: number
  anchorPeriodNets: Record<string, number>
}

// Toplam = Hizmet Bedeli neti + hak devri (Kural 1 ile ayni hesap).
function shareTotal(anchor: BudgetItemRow, currentRate: number): { anchorNet: number; total: number } {
  if (anchor.paymentStatus === 'bordro') throw new Error(BORDRO_NO_SPLIT)
  const anchorNet = rowTotals(anchor, undefined).net
  return { anchorNet, total: anchorNet + splitNetFrom(anchorNet, currentRate) }
}

// Kural 2: paylasim yeni orana cekilir, toplam sabit. Hizmet Bedeli'nin birim ve dolu donem
// rakamlari ayni carpanla olceklenip tam TL'ye yuvarlanir; oran yazilan gercek rakamdan 8
// basamakla hesaplanir, hak devri toplamdan kalani alir. Hizmet Bedeli 0 iken paylasilacak para
// yoktur, yalniz oran yazilir (Engin karari 2). Oran 0'a cekilirken (silme) yuvarlama Hizmet
// Bedeli'ni toplamin bir iki TL ustune cikarabilir; oran eksiye dusmez, 0'da durur.
export function reshareWrite(anchor: BudgetItemRow, currentRate: number, newRate: number): SplitShareWrite {
  if (newRate < 0 || newRate >= 100) throw new Error('Oran 0 ile 100 arasında olmalı (100 hariç)')
  const { anchorNet, total } = shareTotal(anchor, currentRate)
  if (anchorNet <= 0) return { rate: newRate, anchorUnitNet: anchor.unitNet, anchorPeriodNets: {} }
  const factor = new Decimal(total).mul(new Decimal(100).minus(newRate)).div(100).div(anchorNet)
  const anchorUnitNet = roundTl(new Decimal(anchor.unitNet).mul(factor))
  const anchorPeriodNets: Record<string, number> = {}
  const periodNet: Record<string, number | null> = {}
  for (const [sid, v] of Object.entries(anchor.periodNet)) {
    if (v === null) {
      periodNet[sid] = null
      continue
    }
    const w = roundTl(new Decimal(v).mul(factor))
    anchorPeriodNets[sid] = w
    periodNet[sid] = w
  }
  const written = rowTotals({ ...anchor, unitNet: anchorUnitNet, periodNet }, undefined).net
  if (written <= 0) throw new Error(SPLIT_OVER_TOTAL)
  const rate = new Decimal(total - written).div(total).mul(100).toDecimalPlaces(8).toNumber()
  if (rate >= 100) throw new Error(SPLIT_OVER_TOTAL)
  return { rate: Math.max(0, rate), anchorUnitNet, anchorPeriodNets }
}

// Hak devrine yazilan TUTAR orana cevrilir (oran ve tutar ayni seyin iki gorunusu).
export function rateFromAmount(anchor: BudgetItemRow, currentRate: number, amount: number): number {
  if (amount < 0) throw new Error('Negatif değer girilemez')
  const { total } = shareTotal(anchor, currentRate)
  if (amount === 0) return 0
  if (amount >= total) throw new Error(SPLIT_OVER_TOTAL)
  return new Decimal(amount).div(total).mul(100).toDecimalPlaces(8).toNumber()
}

// %50 UYARISI (1 Ekim 2026, Engin; KART-KATALOGU 7.4 "%50 UYARI METNI"). Metin TEK yerde.
export const SPLIT_WARN_TEXT =
  "Hak devri oranının Hizmet Bedeli'nden çok daha yüksek olması, Avrupa fonlarında (örn: CNC) 'gizli maaş' (salaire déguisé) denetimlerine takılma riski taşır. Oranı dengede tutmanız önerilir."

// Esigi GECEN hak devri satirlari (pay esikten BUYUK; esitlik gecmez - "%50'yi gecerse").
export function splitsOverThreshold(shareById: ReadonlyMap<string, number>, threshold: number): Set<string> {
  const out = new Set<string>()
  for (const [id, share] of shareById) {
    if (share > threshold) out.add(id)
  }
  return out
}
