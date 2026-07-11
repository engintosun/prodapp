import { describe, it, expect } from 'vitest'
import {
  monthEquivalentNet,
  computeBordroFields,
  computeBordroFieldsResult,
  type BordroItemFields,
  type BordroPeriodRow,
} from './budget-service'
import type { PayrollLegs, PayrollRates, TaxBracket } from '../cfe'

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

function itemFields(overrides: Partial<BordroItemFields> = {}): BordroItemFields {
  return { unitNet: 40000, unitCode: 'month', multiplier: 1, repeat: 1, ...overrides }
}

function periodRow(overrides: Partial<BordroPeriodRow> = {}): BordroPeriodRow {
  return {
    quantity: 1,
    repeatOverride: 1,
    unitCodeOverride: null,
    unitNetOverride: null,
    sortOrder: 0,
    startDate: '2026-01-01',
    isUndated: false,
    stageId: null,
    ...overrides,
  }
}

describe('budget-service — S1: Birim -> ay-esdegeri cevrim', () => {
  it('monthEquivalentNet: hafta biriminde 5000 -> 5000*30/7 aylik esdeger', () => {
    expect(monthEquivalentNet(5000, 'week')).toBeCloseTo((5000 * 30) / 7, 6)
  })

  it('gun biriminde girilen net, kendi gun-uzunlugundaki bir donemde tam geri gelir (round-trip)', () => {
    // Tek donem = 1 hafta (repeat=1, unit=week): dayCount=7, dayRatio=7/30. targetNet =
    // monthEquivalentNet(5000,'week') * dayRatio = 5000*30/7 * 7/30 = 5000 tam - S1 dogru
    // calisiyorsa netPerPerson bu 7-gunluk donemde ~5000'e cozulur.
    const item = itemFields({ unitNet: 5000, unitCode: 'week', repeat: 1 })
    const result = computeBordroFields(item, [], STANDARD_LEGS, RATES_2026)
    expect(result.monthlySeries).toHaveLength(1)
    expect(result.monthlySeries[0].dayCount).toBe(7)
    expect(result.monthlySeries[0].netPerPerson).toBeCloseTo(5000, 1)
  })
})

describe('budget-service — SNL-TAKVIM-VARSAYILAN (anchorOf kablolamasi)', () => {
  it('tarihsiz donem (isUndated=true): sinyal VAR', () => {
    const item = itemFields({ unitNet: 40000, unitCode: 'month', repeat: 1 })
    const periods: BordroPeriodRow[] = [periodRow({ isUndated: true, startDate: null })]
    const result = computeBordroFields(item, periods, STANDARD_LEGS, RATES_2026)
    expect(result.signals.some((s) => s.code === 'SNL-TAKVIM-VARSAYILAN')).toBe(true)
  })

  it('tarihli donem (isUndated=false, startDate dolu): sinyal YOK', () => {
    const item = itemFields({ unitNet: 40000, unitCode: 'month', repeat: 1 })
    const periods: BordroPeriodRow[] = [periodRow({ isUndated: false, startDate: '2026-03-01' })]
    const result = computeBordroFields(item, periods, STANDARD_LEGS, RATES_2026)
    expect(result.signals.some((s) => s.code === 'SNL-TAKVIM-VARSAYILAN')).toBe(false)
  })
})

describe('budget-service — S5: donem-bazli bagimsiz net', () => {
  it('iki periyotta farkli unit_net_override, her biri kendi hedefiyle cozulur', () => {
    const item = itemFields({ unitNet: 1, unitCode: 'month' }) // item-level deger periyotlarca gormezden gelinmeli
    const periods: BordroPeriodRow[] = [
      periodRow({ sortOrder: 0, unitNetOverride: 8000, quantity: 1, repeatOverride: 1 }),
      periodRow({ sortOrder: 1, unitNetOverride: 12000, quantity: 1, repeatOverride: 1 }),
    ]
    const result = computeBordroFields(item, periods, STANDARD_LEGS, RATES_2026)
    expect(result.monthlySeries).toHaveLength(2)
    expect(result.monthlySeries[0].netPerPerson).toBeCloseTo(8000, 1)
    expect(result.monthlySeries[1].netPerPerson).toBeCloseTo(12000, 1)
  })
})

describe('budget-service — S2: Brut Toplam = uretici maliyeti', () => {
  it('totalGross, grossPerPerson toplami degil costPerPerson toplamidir (isveren SGK/issizlik dahil)', () => {
    const item = itemFields({ unitNet: 40000, unitCode: 'month', repeat: 1 })
    const result = computeBordroFields(item, [], STANDARD_LEGS, RATES_2026)
    const sumCost = result.monthlySeries.reduce((acc, m) => acc + m.costPerPerson * m.effectiveHeadcount, 0)
    const sumGrossPerPerson = result.monthlySeries.reduce((acc, m) => acc + m.grossPerPerson * m.effectiveHeadcount, 0)
    expect(result.totalGross).toBeCloseTo(sumCost, 1)
    // Isveren SGK/issizlik payi > 0 oldugu icin costPerPerson daima grossPerPerson'dan buyuktur -
    // bu ikisinin ayni SAYI OLMADIGINI dogrular (S2'nin gercekten devrede oldugunun kaniti).
    expect(result.totalGross).toBeGreaterThan(sumGrossPerPerson)
  })
})

describe('budget-service — ham hata sizintisi savunmasi (tipli sonuc)', () => {
  it('net=0 durumunda throw ETMEZ, tipli { ok:false, reason: invalid_net } doner', () => {
    const item = itemFields({ unitNet: 0, unitCode: 'month', repeat: 1 })
    const result = computeBordroFieldsResult(item, [], STANDARD_LEGS, RATES_2026)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('invalid_net')
  })

  it('bos periyotta (quantity=0) throw ETMEZ, tipli { ok:false, reason: no_periods } doner', () => {
    const item = itemFields({ unitNet: 40000, unitCode: 'month', multiplier: 0, repeat: 1 })
    const result = computeBordroFieldsResult(item, [], STANDARD_LEGS, RATES_2026)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('no_periods')
  })

  it('gecerli girdide { ok:true, data } doner', () => {
    const item = itemFields({ unitNet: 40000, unitCode: 'month', repeat: 1 })
    const result = computeBordroFieldsResult(item, [], STANDARD_LEGS, RATES_2026)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.totalNet).toBeGreaterThan(0)
  })
})

describe('budget-service — periodBreakdown: donem-bazli gruplama', () => {
  it('iki farkli unit_net_override donemi, periodBreakdown 2 ayri eleman - her biri kendi hedefine yakin', () => {
    const item = itemFields({ unitNet: 1, unitCode: 'month' })
    const periods: BordroPeriodRow[] = [
      periodRow({ sortOrder: 0, unitNetOverride: 8000, quantity: 1, repeatOverride: 1 }),
      periodRow({ sortOrder: 1, unitNetOverride: 12000, quantity: 1, repeatOverride: 1 }),
    ]
    const result = computeBordroFields(item, periods, STANDARD_LEGS, RATES_2026)
    expect(result.periodBreakdown).toHaveLength(2)
    expect(result.periodBreakdown[0].periodIndex).toBe(0)
    expect(result.periodBreakdown[0].netTotal).toBeCloseTo(8000, 1)
    expect(result.periodBreakdown[1].periodIndex).toBe(1)
    expect(result.periodBreakdown[1].netTotal).toBeCloseTo(12000, 1)
    // legalBurden = grossTotal - netTotal, isveren payi > 0 oldugu icin daima pozitif.
    expect(result.periodBreakdown[0].legalBurden).toBeGreaterThan(0)
    expect(result.periodBreakdown[0].grossTotal).toBeCloseTo(
      result.periodBreakdown[0].netTotal + result.periodBreakdown[0].legalBurden,
      2,
    )
  })

  it('grup netTotal toplami, kalem-geneli totalNet ile tutarli (aggregate = grup toplami)', () => {
    const item = itemFields({ unitNet: 1, unitCode: 'month' })
    const periods: BordroPeriodRow[] = [
      periodRow({ sortOrder: 0, unitNetOverride: 8000, quantity: 1, repeatOverride: 1 }),
      periodRow({ sortOrder: 1, unitNetOverride: 12000, quantity: 2, repeatOverride: 1 }),
    ]
    const result = computeBordroFields(item, periods, STANDARD_LEGS, RATES_2026)
    const sumBreakdown = result.periodBreakdown.reduce((acc, p) => acc + p.netTotal, 0)
    expect(sumBreakdown).toBeCloseTo(result.totalNet, 1)
  })

  it('tek donem ay sinirini asip birden fazla skeleton parcasina bolunse bile (2 aylik repeat), periodBreakdown TEK eleman', () => {
    // Tek/sifir-donem modunda (periodRows=[]) item.repeat=2 ay -> 60 gun -> ay sinirinda ikiye bolunur
    // (usedInCursorMonth mantigi): 2 ayri monthlySeries satiri ama AYNI periodIndex (0).
    const item = itemFields({ unitNet: 40000, unitCode: 'month', repeat: 2 })
    const result = computeBordroFields(item, [], STANDARD_LEGS, RATES_2026)
    expect(result.monthlySeries.length).toBeGreaterThanOrEqual(2)
    expect(result.periodBreakdown).toHaveLength(1)
    expect(result.periodBreakdown[0].periodIndex).toBe(0)
  })
})

describe('budget-service — telescoping: N donem satiri = tek satir Miktar×N', () => {
  // Tolerans 3 kurus: standart profil turetilmis round-trip toleransi (deriveRoundTripTolerance),
  // Engin canli dogrulamasi 2026-07-09.
  const TOLERANCE_TL = 0.03

  it('tarihsiz: 3 ayri donem satiri (Miktar=1 her biri) vs tek satir Miktar=3, ayni totalNet, brut farki <=3 kurus', () => {
    // 400K/ay kasitli - kumulatif matrah ay ilerledikce dilim atlar (GVK 103 kirilma noktalari);
    // donem satirlari kumulatifi sifirlasaydi fark kurus degil binlerce lira olurdu, test bunu korur.
    const itemA = itemFields({ unitNet: 400000, unitCode: 'month', multiplier: 1 })
    const periodsA: BordroPeriodRow[] = [
      periodRow({ sortOrder: 0, quantity: 1, repeatOverride: 1, isUndated: true, startDate: null, stageId: 's1' }),
      periodRow({ sortOrder: 1, quantity: 1, repeatOverride: 1, isUndated: true, startDate: null, stageId: 's2' }),
      periodRow({ sortOrder: 2, quantity: 1, repeatOverride: 1, isUndated: true, startDate: null, stageId: 's3' }),
    ]
    // Tek-satir dalinda (periodRows.length<=1) computeBordroFields periodRow.quantity/repeatOverride'i
    // OKUMAZ, item.multiplier/item.repeat kullanir (budget-service.ts:619-627) - Miktar=3 burada verilir.
    const itemB = itemFields({ unitNet: 400000, unitCode: 'month', multiplier: 1, repeat: 3 })
    const periodsB: BordroPeriodRow[] = [
      periodRow({ sortOrder: 0, isUndated: true, startDate: null, stageId: null }),
    ]
    const resultA = computeBordroFields(itemA, periodsA, STANDARD_LEGS, RATES_2026)
    const resultB = computeBordroFields(itemB, periodsB, STANDARD_LEGS, RATES_2026)
    expect(resultA.totalNet).toBeCloseTo(resultB.totalNet, 2)
    expect(Math.abs(resultA.totalGross - resultB.totalGross)).toBeLessThanOrEqual(TOLERANCE_TL)
  })

  it('tarihli ardisik: 3 ayri donem satiri (2026-01/02/03) vs tek satir Miktar=3 (2026-01 baslangic), ayni totalNet, brut farki <=3 kurus', () => {
    const itemA = itemFields({ unitNet: 400000, unitCode: 'month', multiplier: 1 })
    const periodsA: BordroPeriodRow[] = [
      periodRow({ sortOrder: 0, quantity: 1, repeatOverride: 1, isUndated: false, startDate: '2026-01-01', stageId: 's1' }),
      periodRow({ sortOrder: 1, quantity: 1, repeatOverride: 1, isUndated: false, startDate: '2026-02-01', stageId: 's2' }),
      periodRow({ sortOrder: 2, quantity: 1, repeatOverride: 1, isUndated: false, startDate: '2026-03-01', stageId: 's3' }),
    ]
    const itemB = itemFields({ unitNet: 400000, unitCode: 'month', multiplier: 1, repeat: 3 })
    const periodsB: BordroPeriodRow[] = [
      periodRow({ sortOrder: 0, isUndated: false, startDate: '2026-01-01', stageId: null }),
    ]
    const resultA = computeBordroFields(itemA, periodsA, STANDARD_LEGS, RATES_2026)
    const resultB = computeBordroFields(itemB, periodsB, STANDARD_LEGS, RATES_2026)
    expect(resultA.totalNet).toBeCloseTo(resultB.totalNet, 2)
    expect(Math.abs(resultA.totalGross - resultB.totalGross)).toBeLessThanOrEqual(TOLERANCE_TL)
  })
})
