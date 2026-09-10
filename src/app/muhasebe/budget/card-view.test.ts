import { describe, it, expect } from 'vitest'
import { buildCardView } from './card-view'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { BordroSheetEntry } from './components/burden-sheet'

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
    ...overrides,
  }
}

const NO_BORDRO: Record<string, BordroSheetEntry> = {}

describe('buildCardView', () => {
  it('turetilen satirin tutari orandan dogar (veritabanindaki sifir degil)', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1', unitNet: 100000 }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20, unitNet: 0, paymentStatus: 'sirket' }),
    ]
    const view = buildCardView(rows, [], NO_BORDRO, new Set())
    expect(view.rowTotalsById.komisyon).toEqual({ net: 20000, yasalYuk: 0, maliyet: 20000, kdv: 0, brut: 20000 })
  })

  it('kart toplami turetilen satiri icerir', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1', unitNet: 100000 }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20, unitNet: 0, paymentStatus: 'sirket' }),
    ]
    const view = buildCardView(rows, [], NO_BORDRO, new Set())
    expect(view.cardTotals.net).toBe(120000)
  })

  it('baslik ve kisi blogu birlikte dogru dizilir', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1', unitNet: 100000, headingCode: 'H1' }),
      makeItem({ id: 'mesai', personObjectId: null, unitNet: 5000, headingCode: 'H1' }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20, unitNet: 0, paymentStatus: 'sirket', headingCode: 'H1' }),
    ]
    const view = buildCardView(rows, [{ catalogCode: 'H1', name: 'Baslik 1' }], NO_BORDRO, new Set())
    expect(view.groups).toHaveLength(1)
    const group = view.groups[0]
    expect(group.heading).toEqual({ key: 'H1', name: 'Baslik 1' })
    expect(group.renderRows.map((rr) => (rr.kind === 'summary' ? 'summary:' + rr.personObjectId : rr.row.id))).toEqual([
      'summary:p1',
      'kase',
      'komisyon',
      'mesai',
    ])
    const summary = group.renderRows[0]
    expect(summary.kind).toBe('summary')
    if (summary.kind === 'summary') {
      // p1'in tabani (kase 100000) + komisyonu (20000) = 120000
      expect(summary.totals.net).toBe(120000)
    }
  })

  it('baslik grubunun toplami kendi satirlarinin toplamidir', () => {
    const rows = [
      makeItem({ id: 'a', unitNet: 1000, headingCode: 'H1' }),
      makeItem({ id: 'b', unitNet: 2000, headingCode: 'H2' }),
    ]
    const view = buildCardView(
      rows,
      [
        { catalogCode: 'H1', name: 'Baslik 1' },
        { catalogCode: 'H2', name: 'Baslik 2' },
      ],
      NO_BORDRO,
      new Set(),
    )
    expect(view.groups.map((g) => g.totals.net)).toEqual([1000, 2000])
  })

  it('rolu olan ve tek kalemi olan kisi ozet satiri alir', () => {
    const rows = [makeItem({ id: 'a', personObjectId: 'p1', unitNet: 1000 })]
    const view = buildCardView(rows, [], NO_BORDRO, new Set(['p1']))
    const group = view.groups[0]
    const summary = group.renderRows.find((rr) => rr.kind === 'summary' && rr.personObjectId === 'p1')
    expect(summary?.kind).toBe('summary')
    if (summary?.kind === 'summary') {
      expect(summary.rows).toHaveLength(1)
    }
  })
})
