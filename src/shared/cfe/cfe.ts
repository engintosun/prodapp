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
}

function rateFactor(ratesPercent: number[]): Decimal {
  const sum = ratesPercent.reduce((acc, r) => acc.plus(r), new Decimal(0))
  return new Decimal(1).plus(sum.div(100))
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

export function satirToplamDonemli(
  donemler: DonemKalemi[],
  ratesPercent: number[],
  multiplier: number,
): number {
  if (donemler.length === 0) return 0
  const netBaz = donemler.reduce(
    (acc, d) => acc.plus(new Decimal(d.net).mul(d.qty)),
    new Decimal(0),
  )
  return netBaz
    .mul(rateFactor(ratesPercent))
    .mul(multiplier)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber()
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
