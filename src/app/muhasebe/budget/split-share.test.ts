import { describe, it, expect } from 'vitest'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import { splitNetFrom, reshareWrite, rateFromAmount, SPLIT_OVER_TOTAL, splitsOverThreshold } from './split-share'
import { rowTotals } from './totals'

function makeItem(overrides: Partial<BudgetItemRow> = {}): BudgetItemRow {
  return {
    id: 'hb',
    itemCode: 1,
    catalogCode: '1501',
    headingCode: null,
    libraryItemId: null,
    name: 'Test kalem',
    nameEn: null,
    unitNet: 1000,
    unitId: 'unit-1',
    unitLabel: 'gun',
    multiplier: 1,
    repeat: 1,
    vatRate: 0,
    ratesPercent: [],
    burdens: [],
    periodQty: {},
    periodNet: {},
    periodUnit: {},
    periodRepeat: {},
    paymentStatus: 'smm',
    internalNote: null,
    publicNote: null,
    personObjectId: null,
    deriveRate: null,
    parentItemId: null,
    personName: null,
    splitRate: null,
    ...overrides,
  }
}

describe('hak devri iki kural (split-share)', () => {
  it('splitNetFrom: Hizmet Bedeli x oran / (100 - oran)', () => {
    expect(splitNetFrom(500000, 50)).toBe(500000)
    expect(splitNetFrom(700000, 30)).toBe(300000)
    expect(splitNetFrom(500000, 0)).toBe(0)
  })
})

describe('Kural 2: reshareWrite', () => {
  it('oran 0 dan 50 ye: Hizmet Bedeli yariya iner', () => {
    expect(reshareWrite(makeItem({ unitNet: 1000000 }), 0, 50)).toEqual({ rate: 50, anchorUnitNet: 500000, anchorPeriodNets: {} })
  })

  it('HB 700000 oran 30 dan 40 a: HB 600000, toplam 1000000 sabit', () => {
    expect(reshareWrite(makeItem({ unitNet: 700000 }), 30, 40)).toEqual({ rate: 40, anchorUnitNet: 600000, anchorPeriodNets: {} })
  })

  it('donemli HB: donem rakamlari ayni carpanla yeniden yazilir', () => {
    const hb = makeItem({ unitNet: 500000, periodQty: { s1: 1, s2: 1 }, periodNet: { s1: 200000, s2: 800000 } })
    expect(reshareWrite(hb, 0, 50)).toEqual({ rate: 50, anchorUnitNet: 250000, anchorPeriodNets: { s1: 100000, s2: 400000 } })
  })

  it('yuvarlama toplami kaydirmaz: oran yazilan gercek rakamdan hesaplanir', () => {
    const w = reshareWrite(makeItem({ unitNet: 333333, multiplier: 3 }), 0, 50)
    expect(w).toEqual({ rate: 49.99985, anchorUnitNet: 166667, anchorPeriodNets: {} })
    const hb = rowTotals(makeItem({ unitNet: 166667, multiplier: 3 }), undefined).net
    expect(hb + splitNetFrom(hb, w.rate)).toBe(999999)
  })

  it('oran 0 a cekilince rakam Hizmet Bedelina doner', () => {
    expect(reshareWrite(makeItem({ unitNet: 500000 }), 50, 0)).toEqual({ rate: 0, anchorUnitNet: 1000000, anchorPeriodNets: {} })
  })

  it('silmede yuvarlama orani eksiye dusurmez', () => {
    expect(reshareWrite(makeItem({ unitNet: 100000, multiplier: 3 }), 40, 0)).toEqual({ rate: 0, anchorUnitNet: 166667, anchorPeriodNets: {} })
  })

  it('HB 0 iken yalniz oran yazilir', () => {
    expect(reshareWrite(makeItem({ unitNet: 0 }), 0, 30)).toEqual({ rate: 30, anchorUnitNet: 0, anchorPeriodNets: {} })
  })

  it('bordro HB ve gecersiz oran hata verir', () => {
    expect(() => reshareWrite(makeItem({ paymentStatus: 'bordro' }), 0, 50)).toThrow('Bordro statülü Hizmet Bedeli bölünmez.')
    expect(() => reshareWrite(makeItem({ unitNet: 1000000 }), 0, 100)).toThrow('Oran 0 ile 100 arasında olmalı (100 hariç)')
  })
})

describe('Kural 2: rateFromAmount', () => {
  it('tutar orana cevrilir', () => {
    expect(rateFromAmount(makeItem({ unitNet: 700000 }), 30, 400000)).toBe(40)
    expect(rateFromAmount(makeItem({ unitNet: 700000 }), 30, 0)).toBe(0)
  })

  it('toplami asan ya da toplama esit tutar kabul edilmez', () => {
    expect(() => rateFromAmount(makeItem({ unitNet: 700000 }), 30, 1000000)).toThrow(SPLIT_OVER_TOTAL)
    expect(() => rateFromAmount(makeItem({ unitNet: 0 }), 0, 100)).toThrow(SPLIT_OVER_TOTAL)
  })

  it('negatif tutar ve bordro HB hata verir', () => {
    expect(() => rateFromAmount(makeItem({ unitNet: 700000 }), 30, -1)).toThrow('Negatif değer girilemez')
    expect(() => rateFromAmount(makeItem({ paymentStatus: 'bordro' }), 0, 100)).toThrow('Bordro statülü Hizmet Bedeli bölünmez.')
  })
})

describe('%50 uyarisi (1500 Dilim 2c-2)', () => {
  it('esigi gecenler: yalniz esikten buyuk olan', () => {
    const over = splitsOverThreshold(new Map([['a', 50], ['b', 60], ['c', 49.99]]), 50)
    expect(over).toEqual(new Set(['b']))
  })

  it('bos harita bos kume verir', () => {
    expect(splitsOverThreshold(new Map(), 50)).toEqual(new Set())
  })
})
