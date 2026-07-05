import Decimal from 'decimal.js'

export interface PayrollLegs {
  socialSecurityEmployee: boolean
  unemploymentEmployee: boolean
  socialSecurityEmployer: boolean
  unemploymentEmployer: boolean
}

export interface TaxBracket {
  floor: number
  ratePercent: number
  baseTax: number
}

export interface PayrollRates {
  socialSecurityEmployeePercent: number
  unemploymentEmployeePercent: number
  socialSecurityEmployerPercent: number
  unemploymentEmployerPercent: number
  stampDutyPercent: number
  incomeTaxBrackets: TaxBracket[]
  minimumWageGrossThisMonth: number
  socialSecurityCeilingMultiplier: number
}

interface PayrollMonthInputBase {
  year: number
  month: number
  dayCount: number
  headcount: number
  priorCumulativeTaxBase: number
  incomeTaxExemptionThisMonth: number
  stampDutyExemptionThisMonth: number
}

export type PayrollMonthInput =
  | (PayrollMonthInputBase & { calculationType: 'net_to_gross'; targetNetFullMonth: number })
  | (PayrollMonthInputBase & { calculationType: 'gross_to_net'; targetGrossFullMonth: number })

export interface PayrollMonthResult {
  year: number
  month: number
  grossPerPerson: number
  socialSecurityEmployee: number
  unemploymentEmployee: number
  socialSecurityEmployer: number
  unemploymentEmployer: number
  incomeTax: number
  stampDuty: number
  incomeTaxExemptionApplied: number
  stampDutyExemptionApplied: number
  newCumulativeTaxBase: number
  costPerPerson: number
  effectiveHeadcount: number
  monthTotal: number
  netPerPerson: number
}

export interface PayrollSignal {
  code: 'SNL-YIL-ASIMI' | 'SNL-MIKTAR-DEGISIM'
  data: Record<string, unknown>
}

export interface PayrollEnvelope {
  netTotal: number
  grossTotal: number
  bucketBreakdown: {
    socialSecurityEmployee: number
    unemploymentEmployee: number
    socialSecurityEmployer: number
    unemploymentEmployer: number
    incomeTax: number
    stampDuty: number
  }
  monthlySeries: PayrollMonthResult[]
  signals: PayrollSignal[]
  parameterTrace: string[]
}

interface CoreCommon {
  year: number
  month: number
  dayCount: number
  headcount: number
  priorCumulativeTaxBase: number
  incomeTaxExemptionThisMonth: number
  stampDutyExemptionThisMonth: number
}

function roundCurrency(n: Decimal): Decimal {
  return n.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}

// Kumulatif tarife fonksiyonu (GVK 103 tipi 5-basamak): tek yerde, iki cagiran (istisna serisi + ay motoru).
function bracketTax(base: Decimal, brackets: TaxBracket[]): Decimal {
  let applicable = brackets[0]
  for (const b of brackets) {
    if (base.gte(b.floor)) applicable = b
    else break
  }
  return new Decimal(applicable.baseTax).plus(base.minus(applicable.floor).mul(applicable.ratePercent).div(100))
}

function findBracketIndex(base: Decimal, brackets: TaxBracket[]): number {
  let idx = 0
  for (let i = 0; i < brackets.length; i++) {
    if (base.gte(brackets[i].floor)) idx = i
    else break
  }
  return idx
}

export function deriveMinimumWageExemptionSeries(
  minimumWageGrossThisMonth: number,
  socialSecurityEmployeePercent: number,
  unemploymentEmployeePercent: number,
  incomeTaxBrackets: TaxBracket[],
): number[] {
  const monthlyBase = new Decimal(minimumWageGrossThisMonth).mul(
    new Decimal(1).minus(new Decimal(socialSecurityEmployeePercent).plus(unemploymentEmployeePercent).div(100)),
  )
  const series: number[] = []
  let prevCumulativeTax = new Decimal(0)
  for (let n = 1; n <= 12; n++) {
    const cumulativeTax = bracketTax(monthlyBase.mul(n), incomeTaxBrackets)
    series.push(roundCurrency(cumulativeTax.minus(prevCumulativeTax)).toNumber())
    prevCumulativeTax = cumulativeTax
  }
  return series
}

export function deriveStampDutyExemption(minimumWageGrossThisMonth: number, stampDutyPercent: number): number {
  return roundCurrency(new Decimal(minimumWageGrossThisMonth).mul(stampDutyPercent).div(100)).toNumber()
}

// Her bagimsiz HALF_UP yuvarlanan bacak en kotu +-0.005 tasir; brut-tavan yuvarlamasi tek yonlu +0.01.
// Bu, doktrinin (bagimsiz bilesen yuvarlama + brut yukari yuvarlama) matematiksel bileskesidir, tahmini deger DEGIL.
export function deriveRoundTripTolerance(legs: PayrollLegs): number {
  const roundedLegCount =
    2 + (legs.socialSecurityEmployee ? 1 : 0) + (legs.unemploymentEmployee ? 1 : 0)
  const grossCeilingRounding = 0.01
  return grossCeilingRounding + roundedLegCount * 0.005
}

function computeMonthFromGross(
  gross: Decimal,
  common: CoreCommon,
  legs: PayrollLegs,
  rates: PayrollRates,
): PayrollMonthResult {
  const dayRatio = new Decimal(common.dayCount).div(30)
  const ceilingThisMonth = new Decimal(rates.minimumWageGrossThisMonth)
    .mul(rates.socialSecurityCeilingMultiplier)
    .mul(dayRatio)
  const socialSecurityBase = Decimal.min(gross, ceilingThisMonth)

  const socialSecurityEmployeeAmt = legs.socialSecurityEmployee
    ? roundCurrency(socialSecurityBase.mul(rates.socialSecurityEmployeePercent).div(100))
    : new Decimal(0)
  const unemploymentEmployeeAmt = legs.unemploymentEmployee
    ? roundCurrency(socialSecurityBase.mul(rates.unemploymentEmployeePercent).div(100))
    : new Decimal(0)
  const socialSecurityEmployerAmt = legs.socialSecurityEmployer
    ? roundCurrency(socialSecurityBase.mul(rates.socialSecurityEmployerPercent).div(100))
    : new Decimal(0)
  const unemploymentEmployerAmt = legs.unemploymentEmployer
    ? roundCurrency(socialSecurityBase.mul(rates.unemploymentEmployerPercent).div(100))
    : new Decimal(0)

  const incomeTaxBaseThisMonth = gross.minus(socialSecurityEmployeeAmt).minus(unemploymentEmployeeAmt)
  const priorCumulativeTaxBase = new Decimal(common.priorCumulativeTaxBase)
  const newCumulativeTaxBase = priorCumulativeTaxBase.plus(incomeTaxBaseThisMonth)
  const incomeTaxCalculated = bracketTax(newCumulativeTaxBase, rates.incomeTaxBrackets).minus(
    bracketTax(priorCumulativeTaxBase, rates.incomeTaxBrackets),
  )
  const incomeTaxExemptionApplied = roundCurrency(Decimal.min(common.incomeTaxExemptionThisMonth, incomeTaxCalculated))
  const incomeTax = roundCurrency(Decimal.max(0, incomeTaxCalculated.minus(incomeTaxExemptionApplied)))

  const stampDutyCalculated = gross.mul(rates.stampDutyPercent).div(100)
  const stampDutyExemptionApplied = roundCurrency(Decimal.min(common.stampDutyExemptionThisMonth, stampDutyCalculated))
  const stampDuty = roundCurrency(Decimal.max(0, stampDutyCalculated.minus(stampDutyExemptionApplied)))

  const netPerPerson = roundCurrency(
    gross.minus(socialSecurityEmployeeAmt).minus(unemploymentEmployeeAmt).minus(incomeTax).minus(stampDuty),
  )
  const costPerPerson = roundCurrency(gross.plus(socialSecurityEmployerAmt).plus(unemploymentEmployerAmt))

  return {
    year: common.year,
    month: common.month,
    grossPerPerson: roundCurrency(gross).toNumber(),
    socialSecurityEmployee: socialSecurityEmployeeAmt.toNumber(),
    unemploymentEmployee: unemploymentEmployeeAmt.toNumber(),
    socialSecurityEmployer: socialSecurityEmployerAmt.toNumber(),
    unemploymentEmployer: unemploymentEmployerAmt.toNumber(),
    incomeTax: incomeTax.toNumber(),
    stampDuty: stampDuty.toNumber(),
    incomeTaxExemptionApplied: incomeTaxExemptionApplied.toNumber(),
    stampDutyExemptionApplied: stampDutyExemptionApplied.toNumber(),
    newCumulativeTaxBase: roundCurrency(newCumulativeTaxBase).toNumber(),
    costPerPerson: costPerPerson.toNumber(),
    effectiveHeadcount: common.headcount,
    monthTotal: roundCurrency(costPerPerson.mul(common.headcount)).toNumber(),
    netPerPerson: netPerPerson.toNumber(),
  }
}

// Esik degerleri (gv/sd istisna tukenmesi) bolme yoluyla turetiliyor (orn. /0.85) - tam ondalik ifade
// edilemeyen kesirler kirilma noktasinda mikroskobik bir yuvarlama hatasi birakabilir. Epsilon olmadan
// bu, gte kontrolunu yanlis tarafa dusurup bir sonraki segmentin egimini hatali secebilir.
const EXHAUSTION_EPSILON = new Decimal('1e-6')

function computeEmployeeRateFraction(legs: PayrollLegs, rates: PayrollRates): Decimal {
  let r = new Decimal(0)
  if (legs.socialSecurityEmployee) r = r.plus(rates.socialSecurityEmployeePercent)
  if (legs.unemploymentEmployee) r = r.plus(rates.unemploymentEmployeePercent)
  return r.div(100)
}

// G'nin cozuldugu (bilinmeyen) rejimde monthlyBase(G) = G - min(G,ceiling)*employeeRateFraction hedefine
// ulasan G degerini verir. Tarife-siniri VE gv-istisna-tukenme esikleri AYNI ters-fonksiyonu paylasir.
function gAtMonthlyBase(targetMonthlyBase: Decimal, belowCeiling: boolean, employeeRateFraction: Decimal, ceiling: Decimal): Decimal {
  return belowCeiling
    ? targetMonthlyBase.div(new Decimal(1).minus(employeeRateFraction))
    : targetMonthlyBase.plus(ceiling.mul(employeeRateFraction))
}

// K5: parcali-dogrusal KESIN cozum, iterasyon/bisection YASAK. net(G) yediginin egimi SGK tavani +
// gelir-vergisi dilimi + iki istisnanin tukenme noktasinda degisir (en fazla ~7 segment). Her segmentte
// egim SABIT oldugu icin hedef o segmente dustugu an G cebirsel (tek adim) cozulur.
// NOT: egimdeki gelir-vergisi terimi SGK-tavan-altinda iken (1 - employeeRateFraction) ile CARPILIR -
// cunku gelir vergisi matrahi (G - SGK kesintisi) uzerinden hesaplanir, dogrudan G uzerinden degil.
function solveGrossForTargetNet(targetNet: Decimal, common: CoreCommon, legs: PayrollLegs, rates: PayrollRates): Decimal {
  const dayRatio = new Decimal(common.dayCount).div(30)
  const ceiling = new Decimal(rates.minimumWageGrossThisMonth).mul(rates.socialSecurityCeilingMultiplier).mul(dayRatio)
  const employeeRateFraction = computeEmployeeRateFraction(legs, rates)
  const stampDutyFraction = new Decimal(rates.stampDutyPercent).div(100)
  const priorCumulativeTaxBase = new Decimal(common.priorCumulativeTaxBase)
  const exemptionIncomeTax = new Decimal(common.incomeTaxExemptionThisMonth)
  const exemptionStampDuty = new Decimal(common.stampDutyExemptionThisMonth)
  const brackets = rates.incomeTaxBrackets

  let gPrev = new Decimal(0)
  let netPrev = new Decimal(0)

  for (let iterations = 0; iterations < 20; iterations++) {
    const belowCeiling = gPrev.lt(ceiling)
    const monthlyBasePrev = gPrev.minus(Decimal.min(gPrev, ceiling).mul(employeeRateFraction))
    const totalCumPrev = priorCumulativeTaxBase.plus(monthlyBasePrev)
    const bracketIdx = findBracketIndex(totalCumPrev, brackets)
    const bracketRateFraction = new Decimal(brackets[bracketIdx].ratePercent).div(100)
    const taxCalculatedPrev = bracketTax(totalCumPrev, brackets).minus(bracketTax(priorCumulativeTaxBase, brackets))
    const gvExhausted = taxCalculatedPrev.gte(exemptionIncomeTax.minus(EXHAUSTION_EPSILON))
    const stampCalculatedPrev = gPrev.mul(stampDutyFraction)
    const sdExhausted = stampCalculatedPrev.gte(exemptionStampDuty.minus(EXHAUSTION_EPSILON))

    let slope = new Decimal(1)
    if (belowCeiling) slope = slope.minus(employeeRateFraction)
    if (gvExhausted) {
      const monthlyBaseSlope = belowCeiling ? new Decimal(1).minus(employeeRateFraction) : new Decimal(1)
      slope = slope.minus(bracketRateFraction.mul(monthlyBaseSlope))
    }
    if (sdExhausted) slope = slope.minus(stampDutyFraction)
    if (slope.lte(0)) {
      throw new Error('Payroll: gecersiz egim (<=0) - kesin cozum bulunamadi')
    }

    const candidates: Decimal[] = []
    if (belowCeiling) candidates.push(ceiling)
    if (bracketIdx < brackets.length - 1) {
      const targetMonthlyBase = new Decimal(brackets[bracketIdx + 1].floor).minus(priorCumulativeTaxBase)
      const g = gAtMonthlyBase(targetMonthlyBase, belowCeiling, employeeRateFraction, ceiling)
      if (g.gt(gPrev)) candidates.push(g)
    }
    if (!gvExhausted) {
      // Esik MUTLAK degil: onceki bir dilim sinirinda zaten birikmis vergi olabilir (taxCalculatedPrev),
      // kalan istisna payi SADECE bu noktadan itibaren guncel dilim oraniyla harcanir.
      const remainingExemption = exemptionIncomeTax.minus(taxCalculatedPrev)
      const targetMonthlyBase = monthlyBasePrev.plus(remainingExemption.div(bracketRateFraction))
      const g = gAtMonthlyBase(targetMonthlyBase, belowCeiling, employeeRateFraction, ceiling)
      if (g.gt(gPrev)) candidates.push(g)
    }
    if (!sdExhausted) {
      const g = exemptionStampDuty.div(stampDutyFraction)
      if (g.gt(gPrev)) candidates.push(g)
    }

    let nextBreak: Decimal | null = null
    for (const c of candidates) {
      if (nextBreak === null || c.lt(nextBreak)) nextBreak = c
    }

    if (nextBreak === null) {
      return gPrev.plus(targetNet.minus(netPrev).div(slope))
    }
    const netAtBreak = netPrev.plus(slope.mul(nextBreak.minus(gPrev)))
    if (targetNet.lte(netAtBreak)) {
      return gPrev.plus(targetNet.minus(netPrev).div(slope))
    }
    gPrev = nextBreak
    netPrev = netAtBreak
  }
  throw new Error('Payroll: parcali-dogrusal cozum 20 adimda sonlanmadi (beklenmeyen durum)')
}

export function resolvePayrollMonth(input: PayrollMonthInput, legs: PayrollLegs, rates: PayrollRates): PayrollMonthResult {
  if (input.dayCount <= 0) throw new Error('Payroll: dayCount 0 veya negatif olamaz')
  if (input.headcount <= 0) throw new Error('Payroll: headcount 0 veya negatif olamaz')

  const common: CoreCommon = {
    year: input.year,
    month: input.month,
    dayCount: input.dayCount,
    headcount: input.headcount,
    priorCumulativeTaxBase: input.priorCumulativeTaxBase,
    incomeTaxExemptionThisMonth: input.incomeTaxExemptionThisMonth,
    stampDutyExemptionThisMonth: input.stampDutyExemptionThisMonth,
  }

  if (input.calculationType === 'gross_to_net') {
    if (input.targetGrossFullMonth <= 0) throw new Error('Payroll: targetGrossFullMonth 0 veya negatif olamaz')
    const dayRatio = new Decimal(input.dayCount).div(30)
    const gross = new Decimal(input.targetGrossFullMonth).mul(dayRatio)
    return computeMonthFromGross(gross, common, legs, rates)
  }

  if (input.targetNetFullMonth <= 0) throw new Error('Payroll: targetNetFullMonth 0 veya negatif olamaz')
  const dayRatio = new Decimal(input.dayCount).div(30)
  const targetNet = new Decimal(input.targetNetFullMonth).mul(dayRatio)
  const grossUnrounded = solveGrossForTargetNet(targetNet, common, legs, rates)
  const gross = grossUnrounded.toDecimalPlaces(2, Decimal.ROUND_UP)
  const result = computeMonthFromGross(gross, common, legs, rates)

  const residual = new Decimal(result.netPerPerson).minus(targetNet).abs()
  const tolerance = deriveRoundTripTolerance(legs)
  if (residual.gt(tolerance)) {
    throw new Error(`Payroll: round-trip toleransi asildi (fark ${residual.toFixed(4)} TL, tolerans ${tolerance} TL)`)
  }

  return { ...result, netPerPerson: roundCurrency(targetNet).toNumber() }
}

export function resolvePayrollItem(
  months: PayrollMonthInput[],
  legs: PayrollLegs,
  rates: PayrollRates,
  parameterLabels?: string[],
): PayrollEnvelope {
  const emptyBucket = {
    socialSecurityEmployee: 0,
    unemploymentEmployee: 0,
    socialSecurityEmployer: 0,
    unemploymentEmployer: 0,
    incomeTax: 0,
    stampDuty: 0,
  }
  if (months.length === 0) {
    return { netTotal: 0, grossTotal: 0, bucketBreakdown: emptyBucket, monthlySeries: [], signals: [], parameterTrace: parameterLabels ?? [] }
  }

  const firstType = months[0].calculationType
  if (months.some((m) => m.calculationType !== firstType)) {
    throw new Error('Payroll: bir kalem icinde karisik calculationType olamaz (net_to_gross/gross_to_net)')
  }

  const sorted = [...months].sort((a, b) => a.year - b.year || a.month - b.month)

  const signals: PayrollSignal[] = []
  const monthlySeries: PayrollMonthResult[] = []
  let runningCumulative = sorted[0].priorCumulativeTaxBase

  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i]
    const monthInput = { ...m, priorCumulativeTaxBase: runningCumulative }
    const result = resolvePayrollMonth(monthInput, legs, rates)
    monthlySeries.push(result)
    runningCumulative = result.newCumulativeTaxBase

    if (i > 0) {
      const prev = sorted[i - 1]
      if (prev.month === 12 && m.month === 1) {
        signals.push({ code: 'SNL-YIL-ASIMI', data: { fromYear: prev.year, toYear: m.year } })
      }
      if (prev.headcount !== m.headcount) {
        signals.push({ code: 'SNL-MIKTAR-DEGISIM', data: { monthIndex: i, from: prev.headcount, to: m.headcount } })
      }
    }
  }

  let grossTotal = new Decimal(0)
  let netTotal = new Decimal(0)
  const bucket = {
    socialSecurityEmployee: new Decimal(0),
    unemploymentEmployee: new Decimal(0),
    socialSecurityEmployer: new Decimal(0),
    unemploymentEmployer: new Decimal(0),
    incomeTax: new Decimal(0),
    stampDuty: new Decimal(0),
  }
  for (const r of monthlySeries) {
    const hc = new Decimal(r.effectiveHeadcount)
    grossTotal = grossTotal.plus(new Decimal(r.grossPerPerson).mul(hc))
    netTotal = netTotal.plus(new Decimal(r.netPerPerson).mul(hc))
    bucket.socialSecurityEmployee = bucket.socialSecurityEmployee.plus(new Decimal(r.socialSecurityEmployee).mul(hc))
    bucket.unemploymentEmployee = bucket.unemploymentEmployee.plus(new Decimal(r.unemploymentEmployee).mul(hc))
    bucket.socialSecurityEmployer = bucket.socialSecurityEmployer.plus(new Decimal(r.socialSecurityEmployer).mul(hc))
    bucket.unemploymentEmployer = bucket.unemploymentEmployer.plus(new Decimal(r.unemploymentEmployer).mul(hc))
    bucket.incomeTax = bucket.incomeTax.plus(new Decimal(r.incomeTax).mul(hc))
    bucket.stampDuty = bucket.stampDuty.plus(new Decimal(r.stampDuty).mul(hc))
  }

  return {
    netTotal: roundCurrency(netTotal).toNumber(),
    grossTotal: roundCurrency(grossTotal).toNumber(),
    bucketBreakdown: {
      socialSecurityEmployee: roundCurrency(bucket.socialSecurityEmployee).toNumber(),
      unemploymentEmployee: roundCurrency(bucket.unemploymentEmployee).toNumber(),
      socialSecurityEmployer: roundCurrency(bucket.socialSecurityEmployer).toNumber(),
      unemploymentEmployer: roundCurrency(bucket.unemploymentEmployer).toNumber(),
      incomeTax: roundCurrency(bucket.incomeTax).toNumber(),
      stampDuty: roundCurrency(bucket.stampDuty).toNumber(),
    },
    monthlySeries,
    signals,
    parameterTrace: parameterLabels ?? [],
  }
}
