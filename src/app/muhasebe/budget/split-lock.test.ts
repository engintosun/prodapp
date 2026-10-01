import { describe, it, expect } from 'vitest'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import { unlockWrite, relockWrite } from './split-lock'
import { shareItem } from './person-groups'
import { rowTotals } from './totals'

function makeItem(overrides: Partial<BudgetItemRow> = {}): BudgetItemRow {
  return {
    id: 'item-1',
    itemCode: 1,
    catalogCode: 'X.001',
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

describe('split-lock (1500 Dilim 2b-2b)', () => {
  it('acilis tek donem: pay yazilir, kalan hak devrine, oran bosalir', () => {
    const anchor = makeItem({ unitNet: 1000000 })
    expect(unlockWrite(anchor, 50)).toEqual({ rate: null, splitUnitNet: 500000, anchorUnitNet: 500000, anchorPeriodNets: {} })
  })

  it('acilis oran 30: 700000 ve 300000', () => {
    const r = unlockWrite(makeItem({ unitNet: 1000000 }), 30)
    expect(r.anchorUnitNet).toBe(700000)
    expect(r.splitUnitNet).toBe(300000)
  })

  it('acilis donemli: donem rakamlari payla yazilir, kalan hak devrinde', () => {
    const anchor = makeItem({ unitNet: 1000000, periodQty: { s1: 1, s2: 1 }, periodNet: { s1: 200000, s2: 800000 } })
    const r = unlockWrite(anchor, 50)
    expect(r.anchorPeriodNets).toEqual({ s1: 100000, s2: 400000 })
    expect(r.splitUnitNet).toBe(500000)
  })

  it('acilis kusurat: toplam korunur', () => {
    const anchor = makeItem({ unitNet: 1000001 })
    const r = unlockWrite(anchor, 50)
    const written = rowTotals({ ...anchor, unitNet: r.anchorUnitNet }, undefined).net
    expect((r.splitUnitNet ?? 0) + written).toBe(1000001)
  })

  it('kapanis: oran 8 basamak, gidis-donus pay degismez', () => {
    const anchor = makeItem({ unitNet: 612345 })
    const r = relockWrite(anchor, 387655)
    expect(r.anchorUnitNet).toBe(1000000)
    expect(r.rate).toBe(38.7655)
    const back = rowTotals(shareItem({ ...anchor, unitNet: 1000000 }, r.rate as number), undefined).net
    expect(back).toBe(612345)
  })

  it('kapanis donemli: donem rakamlari buyutulur, oran dogru', () => {
    const anchor = makeItem({ periodQty: { s1: 1, s2: 1 }, periodNet: { s1: 100000, s2: 400000 } })
    const r = relockWrite(anchor, 500000)
    expect(r.anchorPeriodNets).toEqual({ s1: 200000, s2: 800000 })
    expect(r.rate).toBe(50)
  })

  it('kapanis Hizmet Bedeli 0 iken firlatir', () => {
    expect(() => relockWrite(makeItem({ unitNet: 0 }), 100)).toThrow('Hizmet Bedeli 0 iken toplam kilitlenemez.')
  })

  it('kapanis bordro Hizmet Bedeli firlatir', () => {
    expect(() => relockWrite(makeItem({ unitNet: 1000, paymentStatus: 'bordro' }), 100)).toThrow('Bordro statülü Hizmet Bedeli bölünmez.')
  })
})
