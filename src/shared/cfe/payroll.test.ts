import { describe, it, expect } from 'vitest'
import {
  deriveMinimumWageExemptionSeries,
  deriveStampDutyExemption,
  deriveRoundTripTolerance,
  resolvePayrollMonth,
  resolvePayrollItem,
  type PayrollLegs,
  type PayrollRates,
  type TaxBracket,
  type PayrollMonthInput,
} from './payroll'

const BRACKETS_2026: TaxBracket[] = [
  { floor: 0, ratePercent: 15, baseTax: 0 },
  { floor: 190000, ratePercent: 20, baseTax: 28500 },
  { floor: 400000, ratePercent: 27, baseTax: 70500 },
  { floor: 1500000, ratePercent: 35, baseTax: 367500 },
  { floor: 5300000, ratePercent: 40, baseTax: 1697500 },
]

const RATES_2026: PayrollRates = {
  socialSecurityEmployeePercent: 14.0,
  unemploymentEmployeePercent: 1.0,
  socialSecurityEmployerPercent: 19.75,
  unemploymentEmployerPercent: 2.0,
  stampDutyPercent: 0.759,
  incomeTaxBrackets: BRACKETS_2026,
  minimumWageGrossThisMonth: 33030.0,
  socialSecurityCeilingMultiplier: 9,
}

const STANDARD_LEGS: PayrollLegs = {
  socialSecurityEmployee: true,
  unemploymentEmployee: true,
  socialSecurityEmployer: true,
  unemploymentEmployer: true,
}

const EK6_LEGS: PayrollLegs = {
  socialSecurityEmployee: false,
  unemploymentEmployee: false,
  socialSecurityEmployer: false,
  unemploymentEmployer: false,
}

const EXEMPTION_SERIES = deriveMinimumWageExemptionSeries(33030.0, 14.0, 1.0, BRACKETS_2026)
const STAMP_EXEMPTION = deriveStampDutyExemption(33030.0, 0.759)

function baseFields(year: number, month: number, headcount = 1, dayCount = 30, priorCumulativeTaxBase = 0) {
  return {
    year,
    month,
    dayCount,
    periodIndex: 0,
    headcount,
    priorCumulativeTaxBase,
    incomeTaxExemptionThisMonth: EXEMPTION_SERIES[month - 1],
    stampDutyExemptionThisMonth: STAMP_EXEMPTION,
  }
}

function mulberry32(seed: number) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('payroll — K10 turetilmis istisnalar (altin fiksturler)', () => {
  it('deriveMinimumWageExemptionSeries: Ocak-Haziran 4211.33, Temmuz 4537.75, Agustos-Aralik 5615.10', () => {
    const expected = [
      4211.33, 4211.33, 4211.33, 4211.33, 4211.33, 4211.33,
      4537.75,
      5615.1, 5615.1, 5615.1, 5615.1, 5615.1,
    ]
    expect(EXEMPTION_SERIES).toEqual(expected)
  })

  it('deriveStampDutyExemption: 33030 x %0.759 = 250.70', () => {
    expect(STAMP_EXEMPTION).toBe(250.7)
  })

  it('standart senaryo referans maliyet (net_to_gross): asgari ucretli', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 1),
      calculationType: 'net_to_gross',
      targetNetFullMonth: 28075.5,
    }
    const result = resolvePayrollMonth(input, STANDARD_LEGS, RATES_2026)
    expect(result.costPerPerson).toBe(40214.03)
    expect(result.incomeTax).toBe(0)
    expect(result.stampDuty).toBe(0)
  })

  it('ayni referans noktasi gross_to_net yonunde de bulusur', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 1),
      calculationType: 'gross_to_net',
      targetGrossFullMonth: 33030.0,
    }
    const result = resolvePayrollMonth(input, STANDARD_LEGS, RATES_2026)
    expect(result.netPerPerson).toBe(28075.5)
    expect(result.incomeTax).toBe(0)
    expect(result.stampDuty).toBe(0)
  })
})

describe('payroll — temel cozum dogrulugu (iki yon)', () => {
  it('net_to_gross: orta duzey hedef, round-trip tutuyor + maliyet esitligi', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 3),
      calculationType: 'net_to_gross',
      targetNetFullMonth: 70000,
    }
    const result = resolvePayrollMonth(input, STANDARD_LEGS, RATES_2026)
    expect(result.netPerPerson).toBe(70000)
    expect(result.incomeTax).toBeGreaterThan(0)
    expect(result.costPerPerson).toBeCloseTo(
      result.grossPerPerson + result.socialSecurityEmployer + result.unemploymentEmployer,
      2,
    )
  })

  it('gross_to_net: orta duzey hedef dogru net verir', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 3),
      calculationType: 'gross_to_net',
      targetGrossFullMonth: 90000,
    }
    const result = resolvePayrollMonth(input, STANDARD_LEGS, RATES_2026)
    expect(result.netPerPerson).toBeGreaterThan(0)
    expect(result.netPerPerson).toBeLessThan(90000)
  })

  it('capraz round-trip: net_to_gross G si gross_to_net e verilince ayni net geri gelir', () => {
    const netInput: PayrollMonthInput = {
      ...baseFields(2026, 5),
      calculationType: 'net_to_gross',
      targetNetFullMonth: 55000,
    }
    const netResult = resolvePayrollMonth(netInput, STANDARD_LEGS, RATES_2026)
    const grossInput: PayrollMonthInput = {
      ...baseFields(2026, 5),
      calculationType: 'gross_to_net',
      targetGrossFullMonth: netResult.grossPerPerson,
    }
    const grossResult = resolvePayrollMonth(grossInput, STANDARD_LEGS, RATES_2026)
    expect(Math.abs(grossResult.netPerPerson - 55000)).toBeLessThanOrEqual(deriveRoundTripTolerance(STANDARD_LEGS))
  })
})

describe('payroll — Ek-6 profili (SGK/issizlik 4 bacak duser)', () => {
  it('net_to_gross: sigorta bacaklari 0, maliyet=brut', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 2),
      calculationType: 'net_to_gross',
      targetNetFullMonth: 40000,
    }
    const result = resolvePayrollMonth(input, EK6_LEGS, RATES_2026)
    expect(result.socialSecurityEmployee).toBe(0)
    expect(result.unemploymentEmployee).toBe(0)
    expect(result.socialSecurityEmployer).toBe(0)
    expect(result.unemploymentEmployer).toBe(0)
    expect(result.costPerPerson).toBe(result.grossPerPerson)
  })

  it('gross_to_net: sigorta bacaklari 0, maliyet=brut', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 2),
      calculationType: 'gross_to_net',
      targetGrossFullMonth: 50000,
    }
    const result = resolvePayrollMonth(input, EK6_LEGS, RATES_2026)
    expect(result.socialSecurityEmployee).toBe(0)
    expect(result.unemploymentEmployee).toBe(0)
    expect(result.costPerPerson).toBe(result.grossPerPerson)
  })
})

describe('payroll — cok-aylik kumulatif', () => {
  it('kumulatif matrah ay ay artar, dilim atlamasi tutarli', () => {
    const months: PayrollMonthInput[] = Array.from({ length: 12 }, (_, i) => ({
      ...baseFields(2026, i + 1),
      calculationType: 'net_to_gross' as const,
      targetNetFullMonth: 120000,
    }))
    const envelope = resolvePayrollItem(months, STANDARD_LEGS, RATES_2026)
    for (let i = 1; i < envelope.monthlySeries.length; i++) {
      expect(envelope.monthlySeries[i].newCumulativeTaxBase).toBeGreaterThan(
        envelope.monthlySeries[i - 1].newCumulativeTaxBase,
      )
    }
    expect(envelope.signals.some((s) => s.code === 'SNL-YIL-ASIMI')).toBe(false)
  })

  it('Haziran-Temmuz gecisi: istisna sicramasi gelir vergisine yansir', () => {
    const months: PayrollMonthInput[] = [6, 7].map((month) => ({
      ...baseFields(2026, month),
      calculationType: 'net_to_gross' as const,
      targetNetFullMonth: 28075.5,
    }))
    const envelope = resolvePayrollItem(months, STANDARD_LEGS, RATES_2026)
    expect(envelope.monthlySeries[0].incomeTaxExemptionApplied).toBe(4211.33)
    expect(envelope.monthlySeries[1].incomeTaxExemptionApplied).toBeLessThanOrEqual(4537.75)
  })
})

describe('payroll — SNL-TAKVIM-VARSAYILAN (K7 varsayim dali)', () => {
  it('tarihsiz donemde (usesDefaultCalendar=true) sinyal VAR', () => {
    const months: PayrollMonthInput[] = [{
      ...baseFields(2026, 1),
      calculationType: 'net_to_gross' as const,
      targetNetFullMonth: 40000,
      usesDefaultCalendar: true,
    }]
    const envelope = resolvePayrollItem(months, STANDARD_LEGS, RATES_2026)
    expect(envelope.signals.some((s) => s.code === 'SNL-TAKVIM-VARSAYILAN')).toBe(true)
  })

  it('tarihli donemde (usesDefaultCalendar=false/absent) sinyal YOK', () => {
    const months: PayrollMonthInput[] = [{
      ...baseFields(2026, 1),
      calculationType: 'net_to_gross' as const,
      targetNetFullMonth: 40000,
      usesDefaultCalendar: false,
    }]
    const envelope = resolvePayrollItem(months, STANDARD_LEGS, RATES_2026)
    expect(envelope.signals.some((s) => s.code === 'SNL-TAKVIM-VARSAYILAN')).toBe(false)
  })
})

describe('payroll — sinir testleri (K5 kirilma noktalari)', () => {
  it('matrah tam dilim sinirinda (190.000): gelir vergisi tam basamak degerinde', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 1),
      incomeTaxExemptionThisMonth: 0,
      stampDutyExemptionThisMonth: 0,
      calculationType: 'gross_to_net',
      targetGrossFullMonth: 190000,
    }
    const result = resolvePayrollMonth(input, EK6_LEGS, RATES_2026)
    expect(result.newCumulativeTaxBase).toBe(190000)
    expect(result.incomeTax).toBe(28500)
  })

  it('SGK tavani altinda: bacaklar tam oran uzerinden hesaplanir', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 1),
      calculationType: 'gross_to_net',
      targetGrossFullMonth: 250000,
    }
    const result = resolvePayrollMonth(input, STANDARD_LEGS, RATES_2026)
    expect(result.socialSecurityEmployee).toBe(35000)
  })

  it('SGK tavaninda: bacaklar tavan uzerinden hesaplanir', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 1),
      calculationType: 'gross_to_net',
      targetGrossFullMonth: 297270,
    }
    const result = resolvePayrollMonth(input, STANDARD_LEGS, RATES_2026)
    expect(result.socialSecurityEmployee).toBe(41617.8)
  })

  it('SGK tavaninin uzerinde: bacaklar ARTMAZ, gelir vergisi/damga normal isler', () => {
    const atCeiling = resolvePayrollMonth(
      { ...baseFields(2026, 1), calculationType: 'gross_to_net', targetGrossFullMonth: 297270 },
      STANDARD_LEGS,
      RATES_2026,
    )
    const aboveCeiling = resolvePayrollMonth(
      { ...baseFields(2026, 1), calculationType: 'gross_to_net', targetGrossFullMonth: 400000 },
      STANDARD_LEGS,
      RATES_2026,
    )
    expect(aboveCeiling.socialSecurityEmployee).toBe(atCeiling.socialSecurityEmployee)
    expect(aboveCeiling.socialSecurityEmployer).toBe(atCeiling.socialSecurityEmployer)
    expect(aboveCeiling.incomeTax).toBeGreaterThan(atCeiling.incomeTax)
    expect(aboveCeiling.stampDuty).toBeGreaterThan(atCeiling.stampDuty)
  })

  it('1 gunluk kist ay: oranti dogru uygulanir (net_to_gross)', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 1, 1, 1),
      calculationType: 'net_to_gross',
      targetNetFullMonth: 28075.5,
    }
    const result = resolvePayrollMonth(input, STANDARD_LEGS, RATES_2026)
    expect(result.grossPerPerson).toBe(1101.0)
    expect(result.netPerPerson).toBe(935.85)
    expect(result.incomeTax).toBe(0)
    expect(result.stampDuty).toBe(0)
  })

  it('1 gunluk kist ay: oranti dogru uygulanir (gross_to_net)', () => {
    const input: PayrollMonthInput = {
      ...baseFields(2026, 1, 1, 1),
      calculationType: 'gross_to_net',
      targetGrossFullMonth: 33030.0,
    }
    const result = resolvePayrollMonth(input, STANDARD_LEGS, RATES_2026)
    expect(result.grossPerPerson).toBe(1101.0)
    expect(result.netPerPerson).toBe(935.85)
  })

  it('donem ortasi headcount degisimi: sinyal + tek kumulatif cizgi', () => {
    const months: PayrollMonthInput[] = [1, 2, 3].map((month) => ({
      ...baseFields(2026, month, month === 3 ? 5 : 2),
      calculationType: 'net_to_gross' as const,
      targetNetFullMonth: 60000,
    }))
    const envelope = resolvePayrollItem(months, STANDARD_LEGS, RATES_2026)
    const signal = envelope.signals.find((s) => s.code === 'SNL-MIKTAR-DEGISIM')
    expect(signal).toBeTruthy()
    expect(signal?.data).toEqual({ monthIndex: 2, from: 2, to: 5 })
    // Kumulatif TEK cizgi (kisi-basina ayri kumulatif ACILMAZ - K9 ihtiyat-lehine, kasitli): ay3'un
    // artan headcount'u ay3'un kendi kumulatif matrahini ETKILEMEZ, monoton artis bozulmaz.
    for (let i = 1; i < envelope.monthlySeries.length; i++) {
      expect(envelope.monthlySeries[i].newCumulativeTaxBase).toBeGreaterThan(envelope.monthlySeries[i - 1].newCumulativeTaxBase)
      expect(envelope.monthlySeries[i].effectiveHeadcount).toBe(months[i].headcount)
      expect(envelope.monthlySeries[i].monthTotal).toBeCloseTo(
        envelope.monthlySeries[i].costPerPerson * envelope.monthlySeries[i].effectiveHeadcount,
        2,
      )
    }
  })

  it('gelir vergisi istisnasi tukenme esigi civari: dusuk hedefte sifir, biraz ustunde pozitif', () => {
    const low = resolvePayrollMonth(
      { ...baseFields(2026, 1), calculationType: 'net_to_gross', targetNetFullMonth: 28000 },
      STANDARD_LEGS,
      RATES_2026,
    )
    const high = resolvePayrollMonth(
      { ...baseFields(2026, 1), calculationType: 'net_to_gross', targetNetFullMonth: 50000 },
      STANDARD_LEGS,
      RATES_2026,
    )
    expect(low.incomeTax).toBe(0)
    expect(high.incomeTax).toBeGreaterThan(0)
  })
})

describe('payroll — hata/guard davranisi', () => {
  it('dayCount 0 veya negatif icin hata firlatir', () => {
    expect(() =>
      resolvePayrollMonth(
        { ...baseFields(2026, 1, 1, 0), calculationType: 'gross_to_net', targetGrossFullMonth: 50000 },
        STANDARD_LEGS,
        RATES_2026,
      ),
    ).toThrow()
    expect(() =>
      resolvePayrollMonth(
        { ...baseFields(2026, 1, 1, -1), calculationType: 'gross_to_net', targetGrossFullMonth: 50000 },
        STANDARD_LEGS,
        RATES_2026,
      ),
    ).toThrow()
  })

  it('headcount <=0 icin hata firlatir', () => {
    expect(() =>
      resolvePayrollMonth(
        { ...baseFields(2026, 1, 0), calculationType: 'gross_to_net', targetGrossFullMonth: 50000 },
        STANDARD_LEGS,
        RATES_2026,
      ),
    ).toThrow()
  })

  it('targetNetFullMonth <=0 icin hata firlatir', () => {
    expect(() =>
      resolvePayrollMonth(
        { ...baseFields(2026, 1), calculationType: 'net_to_gross', targetNetFullMonth: 0 },
        STANDARD_LEGS,
        RATES_2026,
      ),
    ).toThrow()
  })

  it('targetGrossFullMonth <=0 icin hata firlatir', () => {
    expect(() =>
      resolvePayrollMonth(
        { ...baseFields(2026, 1), calculationType: 'gross_to_net', targetGrossFullMonth: -5 },
        STANDARD_LEGS,
        RATES_2026,
      ),
    ).toThrow()
  })

  it('karisik calculationType dizisi resolvePayrollItem de hata firlatir', () => {
    const months: PayrollMonthInput[] = [
      { ...baseFields(2026, 1), calculationType: 'net_to_gross', targetNetFullMonth: 40000 },
      { ...baseFields(2026, 2), calculationType: 'gross_to_net', targetGrossFullMonth: 50000 },
    ]
    expect(() => resolvePayrollItem(months, STANDARD_LEGS, RATES_2026)).toThrow()
  })
})

describe('payroll — round-trip property testi (deterministik PRNG, 2000+ vaka)', () => {
  it('net_to_gross -> gross_to_net capraz dogrulama, her iki yon karisik', () => {
    const rnd = mulberry32(42)
    const CASES = 2000
    let netToGrossCount = 0
    let grossToNetCount = 0

    for (let i = 0; i < CASES; i++) {
      const legs = rnd() < 0.5 ? STANDARD_LEGS : EK6_LEGS
      const month = 1 + Math.floor(rnd() * 12)
      const dayCount = 1 + Math.floor(rnd() * 30)
      const priorCumulativeTaxBase = Math.floor(rnd() * 3_000_000)
      const target = 1000 + rnd() * (10_000_000 - 1000)

      if (rnd() < 0.7) {
        netToGrossCount++
        const input: PayrollMonthInput = {
          ...baseFields(2026, month, 1, dayCount, priorCumulativeTaxBase),
          calculationType: 'net_to_gross',
          targetNetFullMonth: target,
        }
        const result = resolvePayrollMonth(input, legs, RATES_2026)

        const dayRatio = dayCount / 30
        const targetGrossFullMonth = result.grossPerPerson / dayRatio
        const crossInput: PayrollMonthInput = {
          ...baseFields(2026, month, 1, dayCount, priorCumulativeTaxBase),
          calculationType: 'gross_to_net',
          targetGrossFullMonth,
        }
        const crossResult = resolvePayrollMonth(crossInput, legs, RATES_2026)
        expect(Math.abs(crossResult.netPerPerson - target * dayRatio)).toBeLessThanOrEqual(0.02)
      } else {
        grossToNetCount++
        const input: PayrollMonthInput = {
          ...baseFields(2026, month, 1, dayCount, priorCumulativeTaxBase),
          calculationType: 'gross_to_net',
          targetGrossFullMonth: target,
        }
        const result = resolvePayrollMonth(input, legs, RATES_2026)
        expect(result.netPerPerson).toBeGreaterThan(0)
        expect(result.netPerPerson).toBeLessThanOrEqual(result.grossPerPerson)
      }
    }

    expect(netToGrossCount + grossToNetCount).toBe(CASES)
  })
})
