import { describe, it, expect } from 'vitest'
import { rowTotals, cardTotals } from './totals'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { BordroSheetEntry } from './components/burden-sheet'

function makeItem(overrides: Partial<BudgetItemRow> = {}): BudgetItemRow {
  return {
    id: 'item-1',
    itemCode: 1,
    catalogCode: 'X.001',
    libraryItemId: null,
    name: 'Test kalem',
    nameEn: null,
    description: null,
    unitNet: 1000,
    unitId: 'unit-1',
    unitLabel: 'gün',
    multiplier: 1,
    repeat: 1,
    vatRate: 20,
    ratesPercent: [],
    burdens: [],
    periodQty: {},
    periodNet: {},
    periodUnit: {},
    periodRepeat: {},
    paymentStatus: 'sirket',
    internalNote: null,
    publicNote: null,
    ...overrides,
  }
}

function makeBordro(totalNet: number, totalGross: number): BordroSheetEntry {
  return {
    loading: false,
    error: null,
    data: {
      totalNet,
      totalGross,
      monthlySeries: [],
      signals: [],
      bucketBreakdown: {
        socialSecurityEmployee: 0,
        unemploymentEmployee: 0,
        socialSecurityEmployer: 0,
        unemploymentEmployer: 0,
        incomeTax: 0,
        stampDuty: 0,
      },
      periodBreakdown: [],
    },
  }
}

describe('rowTotals', () => {
  it('bordro-disi kalem icin net/yasalYuk/brut CFE formulune gore hesaplar', () => {
    const item = makeItem({ unitNet: 1000, multiplier: 1, repeat: 1, vatRate: 20, burdens: [] })
    expect(rowTotals(item, undefined)).toEqual({ net: 1000, yasalYuk: 200, brut: 1200 })
  })

  it('additive yuk (SGK) brut ve yasalYuku buyutur', () => {
    const item = makeItem({
      unitNet: 1000,
      multiplier: 1,
      repeat: 1,
      vatRate: 20,
      burdens: [{ label: 'SGK', rate: 10, kind: 'additive' }],
    })
    expect(rowTotals(item, undefined)).toEqual({ net: 1000, yasalYuk: 320, brut: 1320 })
  })

  it('bordro kalemi icin degerleri bordro verisinden (totalNet/totalGross) okur', () => {
    const item = makeItem({ paymentStatus: 'bordro', unitNet: 0, vatRate: 0, burdens: [] })
    const bordro = makeBordro(5000, 6500)
    expect(rowTotals(item, bordro)).toEqual({ net: 5000, yasalYuk: 1500, brut: 6500 })
  })

  it('bordro verisi henuz yoksa (undefined) 0 doner, patlamaz', () => {
    const item = makeItem({ paymentStatus: 'bordro' })
    expect(rowTotals(item, undefined)).toEqual({ net: 0, yasalYuk: 0, brut: 0 })
  })

  it('yasalYuk her zaman brut - net esitligini korur', () => {
    const item = makeItem({
      unitNet: 3333,
      multiplier: 2,
      repeat: 3,
      vatRate: 18,
      burdens: [
        { label: 'SGK', rate: 15.5, kind: 'additive' },
        { label: 'Stopaj', rate: 20, kind: 'deduction' },
      ],
    })
    const t = rowTotals(item, undefined)
    expect(t.brut - t.net).toBe(t.yasalYuk)
  })
})

describe('cardTotals', () => {
  it('bos dizide uc alan da 0', () => {
    expect(cardTotals([], {})).toEqual({ net: 0, yasalYuk: 0, brut: 0 })
  })

  it('birden cok bordro-disi satirda ucunu de dogru toplar', () => {
    const rows = [
      makeItem({ id: 'a', unitNet: 1000, multiplier: 1, repeat: 1, vatRate: 20, burdens: [] }),
      makeItem({ id: 'b', unitNet: 500, multiplier: 2, repeat: 1, vatRate: 20, burdens: [] }),
    ]
    // a: net 1000, yasalYuk 200, brut 1200
    // b: netBaz 500*2*1=1000, yukYok -> brut ekleme yok, kdv 1000*0.2=200 -> brut 1200, yasalYuk 200
    expect(cardTotals(rows, {})).toEqual({ net: 2000, yasalYuk: 400, brut: 2400 })
  })

  it('bordro ve bordro-disi karisik dizide dogru toplar', () => {
    const rows = [
      makeItem({ id: 'a', unitNet: 1000, multiplier: 1, repeat: 1, vatRate: 20, burdens: [] }),
      makeItem({ id: 'b', paymentStatus: 'bordro', unitNet: 0, vatRate: 0, burdens: [] }),
    ]
    const bordroData: Record<string, BordroSheetEntry> = { b: makeBordro(5000, 6500) }
    // a: net 1000, yasalYuk 200, brut 1200 ; b: net 5000, yasalYuk 1500, brut 6500
    expect(cardTotals(rows, bordroData)).toEqual({ net: 6000, yasalYuk: 1700, brut: 7700 })
  })
})
