import Decimal from 'decimal.js'

export interface KdvSonuc {
  net: number
  vat: number
}

export interface ZincirSonuc {
  totalCost: number
  grandTotal: number
}

export interface DokumGirdi {
  unitNet: number
  ratesPercent: number[]
  unitLabel: string
  quantity: number
  multiplier: number
}

export interface DonemKalemi {
  net: number
  qty: number
  carpan: number
}

export type YukCins = 'additive' | 'deduction'

export interface Yuk {
  ratePercent: number
  kind: YukCins
}

function rateFactor(ratesPercent: number[]): Decimal {
  const sum = ratesPercent.reduce((acc, r) => acc.plus(r), new Decimal(0))
  return new Decimal(1).plus(sum.div(100))
}

function netBazDonemli(donemler: DonemKalemi[]): Decimal {
  return donemler.reduce(
    (acc, d) => acc.plus(new Decimal(d.net).mul(d.qty).mul(d.carpan)),
    new Decimal(0),
  )
}

function fmtPara(n: number): string {
  const dp = Number.isInteger(n) ? 0 : 2
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(n)
}

function fmtMiktar(n: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(n)
}

function fmtYuzde(n: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

export function brutBirim(unitNet: number, ratesPercent: number[]): number {
  return new Decimal(unitNet).mul(rateFactor(ratesPercent)).toNumber()
}

export function brutStopaj(net: number, stopajPercent: number): number {
  return new Decimal(net)
    .div(new Decimal(1).minus(new Decimal(stopajPercent).div(100)))
    .toNumber()
}

// Net cizelge toplami (yuksuz): anlasilan net x adet x carpan, tam TL.
export function netToplamDonemli(donemler: DonemKalemi[]): number {
  if (donemler.length === 0) return 0
  return netBazDonemli(donemler)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber()
}

// Brut cizelge toplami, kova CINSINE gore:
//   additive (SGK) net'i sisirir x(1+SUMekleme); deduction (stopaj) brutu yukari ceker /(1-SUMkesinti).
//   Iki eksen bagimsiz carpan. Tam TL, yari-yukari.
export function brutToplamDonemli(
  donemler: DonemKalemi[],
  yukler: Yuk[],
): number {
  if (donemler.length === 0) return 0
  const eklemeSum = yukler
    .filter((y) => y.kind === 'additive')
    .reduce((acc, y) => acc.plus(y.ratePercent), new Decimal(0))
  const kesintiSum = yukler
    .filter((y) => y.kind === 'deduction')
    .reduce((acc, y) => acc.plus(y.ratePercent), new Decimal(0))
  const kesintiFactor = new Decimal(1).minus(kesintiSum.div(100))
  if (kesintiFactor.lte(0)) {
    throw new Error('Kesinti orani toplami yuzde 100 veya uzeri: brut hesaplanamaz')
  }
  return netBazDonemli(donemler)
    .mul(new Decimal(1).plus(eklemeSum.div(100)))
    .div(kesintiFactor)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber()
}

// KDV matrahi = brut (stopaj dahil bedel), net DEGIL — VERGI-MEVZUATI L51. KDV tasiyan statuler additive yuk tasimaz.
export function kisiyeBanka(netToplam: number, brutToplam: number, vatRatePercent: number): { kdv: number; toplam: number } {
  const kdv = new Decimal(brutToplam)
    .mul(vatRatePercent)
    .div(100)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber()
  return { kdv, toplam: netToplam + kdv }
}

// Eski additive satir toplami: brutToplamDonemli'nin "hepsi ekleme" sarmalayicisi (tek motor).
export function satirToplamDonemli(
  donemler: DonemKalemi[],
  ratesPercent: number[],
): number {
  const yukler: Yuk[] = ratesPercent.map((r) => ({ ratePercent: r, kind: 'additive' }))
  return brutToplamDonemli(donemler, yukler)
}

export function satirToplam(
  unitNet: number,
  ratesPercent: number[],
  quantity: number,
  multiplier: number,
): number {
  return new Decimal(unitNet)
    .mul(rateFactor(ratesPercent))
    .mul(quantity)
    .mul(multiplier)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber()
}

export function kdvAyristir(grossAmount: number, vatRatePercent: number): KdvSonuc {
  const divisor = new Decimal(1).plus(new Decimal(vatRatePercent).div(100))
  const net = new Decimal(grossAmount).div(divisor).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  const vat = new Decimal(grossAmount).minus(net)
  return { net: net.toNumber(), vat: vat.toNumber() }
}

export function zincirToplam(
  costTotal: number,
  contingencyPct: number,
  profitPct: number,
): ZincirSonuc {
  const totalCost = new Decimal(costTotal)
    .mul(new Decimal(1).plus(new Decimal(contingencyPct).div(100)))
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
  const grandTotal = totalCost
    .mul(new Decimal(1).plus(new Decimal(profitPct).div(100)))
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
  return { totalCost: totalCost.toNumber(), grandTotal: grandTotal.toNumber() }
}

export function dokum(girdi: DokumGirdi): string {
  const bb = brutBirim(girdi.unitNet, girdi.ratesPercent)
  const st = satirToplam(girdi.unitNet, girdi.ratesPercent, girdi.quantity, girdi.multiplier)
  const yukToplam = girdi.ratesPercent.reduce((acc, r) => acc.plus(r), new Decimal(0)).toNumber()
  const adetKismi = girdi.multiplier === 1 ? '' : ` × ${fmtMiktar(girdi.multiplier)} adet`
  return `${fmtPara(girdi.unitNet)} net + %${fmtYuzde(yukToplam)} yük = ${fmtPara(bb)} × ${fmtMiktar(girdi.quantity)} ${girdi.unitLabel}${adetKismi} = ${fmtPara(st)}`
}
