// HAK DEVRI IKI KURAL (1 Ekim 2026, Engin karari; KART-KATALOGU 7.4). SAF hesap; yazmayi
// fn_set_split_share yapar (tek islem). Kural: yazilan satir degisir, obur satir uyar.
// - Hizmet Bedeli'ne yazilan buyukluk: hak devri = Hizmet Bedeli x oran / (100 - oran) (splitNetFrom).
// - Hak devrine yazilan paylasim (oran ya da tutar): toplam sabit, Hizmet Bedeli yeniden yazilir
//   (reshareWrite). Eklemede %50 bolme ve silmede rakamin Hizmet Bedeli'ne donmesi ayni islev
//   (oran 0'dan 50'ye / oran 0'a).
// Yeniden yazimda Hizmet Bedeli'nin birim ve donem rakamlari TAM TL'ye yuvarlanir; oran yazilan
// gercek rakamdan 8 basamakla hesaplanir, hak devri toplamdan kalani alir: toplam kaymaz, kurus cikmaz.
// Bordro statulu Hizmet Bedeli bolunmez (net motordan gelir).
// reshareWrite ve rateFromAmount 2d-2'de ekranla birlikte gelir (orphan-check).
import Decimal from 'decimal.js'

function roundTl(n: Decimal): number {
  return n.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber()
}

// Kural 1: hak devrinin rakami (toplamin "oran" kadari).
export function splitNetFrom(anchorNet: number, rate: number): number {
  if (rate <= 0) return 0
  return roundTl(new Decimal(anchorNet).mul(rate).div(new Decimal(100).minus(rate)))
}
