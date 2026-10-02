// HAK DEVRI PAYI VE UYARISI (2 Ekim 2026, HAK DEVRI DUZ SATIR; KART-KATALOGU 7.4). SAF hesap.
// Hak devri duz satirdir, kendi rakamini tasir; oran saklanmaz, her an hesaplanir (B18).
import Decimal from 'decimal.js'

// Pay = hak devri / (Hizmet Bedeli + hak devri) x 100. Taban komisyon tabaniyla ayni toplamdir
// (card-view.ts anchorBases), komisyon haric (Engin karari, 2 Ekim 2026). Taban 0 iken pay 0.
export function sharePercentOf(net: number, base: number): number {
  if (base <= 0) return 0
  return new Decimal(net).div(base).mul(100).toDecimalPlaces(8).toNumber()
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
