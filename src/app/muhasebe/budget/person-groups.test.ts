import { describe, it, expect } from 'vitest'
import { groupByPerson, derivedUnitNets, buildRenderRows } from './person-groups'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'

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
    personObjectId: null,
    deriveRate: null,
    ...overrides,
  }
}

describe('groupByPerson', () => {
  it('etiketsiz satirlar grup uretmez', () => {
    const rows = [makeItem({ id: 'a' }), makeItem({ id: 'b' })]
    expect(groupByPerson(rows)).toEqual([])
  })

  it('tek satirli etiket grup uretir ama ozet dogmaz', () => {
    const rows = [makeItem({ id: 'a', personObjectId: 'p1' })]
    expect(groupByPerson(rows)).toEqual([
      { personObjectId: 'p1', itemIds: ['a'], hasSummary: false },
    ])
  })

  it('etiketin satir sayisi ikiye cikinca ozet dogar', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: 'p1' }),
      makeItem({ id: 'b', personObjectId: 'p1' }),
    ]
    const groups = groupByPerson(rows)
    expect(groups).toHaveLength(1)
    expect(groups[0].hasSummary).toBe(true)
    expect(groups[0].itemIds).toEqual(['a', 'b'])
  })

  it('gruplar ve satirlar ekran sirasini korur', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: 'p2' }),
      makeItem({ id: 'b', personObjectId: 'p1' }),
      makeItem({ id: 'c', personObjectId: 'p2' }),
    ]
    const groups = groupByPerson(rows)
    expect(groups.map((g) => g.personObjectId)).toEqual(['p2', 'p1'])
    expect(groups[0].itemIds).toEqual(['a', 'c'])
  })
})

describe('derivedUnitNets', () => {
  it('oran kardes satirlarin ara toplamindan turer', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'mesai', personObjectId: 'p1' }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20 }),
    ]
    expect(derivedUnitNets(rows, { kase: 100000, mesai: 20000 })).toEqual({ komisyon: 24000 })
  })

  it('turetilmis satir tabana girmez', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'ajans', personObjectId: 'p1', deriveRate: 10 }),
      makeItem({ id: 'menajer', personObjectId: 'p1', deriveRate: 10 }),
    ]
    const out = derivedUnitNets(rows, { kase: 100000, ajans: 10000, menajer: 10000 })
    expect(out).toEqual({ ajans: 10000, menajer: 10000 })
  })

  it('baz baska etiketten beslenmez', () => {
    const rows = [
      makeItem({ id: 'kase1', personObjectId: 'p1' }),
      makeItem({ id: 'kase2', personObjectId: 'p2' }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20 }),
    ]
    expect(derivedUnitNets(rows, { kase1: 50000, kase2: 90000 })).toEqual({ komisyon: 10000 })
  })

  it('etiketsiz turetilmis satir sonuc uretmez', () => {
    const rows = [makeItem({ id: 'komisyon', deriveRate: 20 })]
    expect(derivedUnitNets(rows, {})).toEqual({})
  })

  it('baz sifirsa sonuc sifirdir', () => {
    const rows = [
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20 }),
      makeItem({ id: 'kase', personObjectId: 'p1' }),
    ]
    expect(derivedUnitNets(rows, {})).toEqual({ komisyon: 0 })
  })

  it('yuvarlama iki hane yari yukari', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 33.33 }),
    ]
    expect(derivedUnitNets(rows, { kase: 1001 })).toEqual({ komisyon: 333.63 })
  })
})

describe('buildRenderRows', () => {
  it('ozetlenmeyen satirlar sirayla, hepsi underSummary:false', () => {
    const rows = [makeItem({ id: 'a' }), makeItem({ id: 'b' })]
    const out = buildRenderRows(rows, new Set())
    expect(out).toEqual([
      { kind: 'item', row: rows[0], underSummary: false },
      { kind: 'item', row: rows[1], underSummary: false },
    ])
  })

  it('iki satirli ozetlenen kisi: ilk satirin onune summary girer, iki satir da underSummary:true', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: 'p1' }),
      makeItem({ id: 'b', personObjectId: 'p1' }),
    ]
    const out = buildRenderRows(rows, new Set(['p1']))
    expect(out).toEqual([
      { kind: 'summary', personObjectId: 'p1', rows: [rows[0], rows[1]] },
      { kind: 'item', row: rows[0], underSummary: true },
      { kind: 'item', row: rows[1], underSummary: true },
    ])
  })

  it('ozetlenen kisinin satirlari arasina baska kisinin satiri girse bile ozet BIR kez uretilir', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: 'p1' }),
      makeItem({ id: 'x' }),
      makeItem({ id: 'b', personObjectId: 'p1' }),
    ]
    const out = buildRenderRows(rows, new Set(['p1']))
    expect(out).toEqual([
      { kind: 'summary', personObjectId: 'p1', rows: [rows[0], rows[2]] },
      { kind: 'item', row: rows[0], underSummary: true },
      { kind: 'item', row: rows[1], underSummary: false },
      { kind: 'item', row: rows[2], underSummary: true },
    ])
  })

  it('iki farkli ozetlenen kisi: iki ayri summary, her biri kendi ilk satirinin onunde', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: 'p1' }),
      makeItem({ id: 'b', personObjectId: 'p1' }),
      makeItem({ id: 'c', personObjectId: 'p2' }),
      makeItem({ id: 'd', personObjectId: 'p2' }),
    ]
    const out = buildRenderRows(rows, new Set(['p1', 'p2']))
    expect(out).toEqual([
      { kind: 'summary', personObjectId: 'p1', rows: [rows[0], rows[1]] },
      { kind: 'item', row: rows[0], underSummary: true },
      { kind: 'item', row: rows[1], underSummary: true },
      { kind: 'summary', personObjectId: 'p2', rows: [rows[2], rows[3]] },
      { kind: 'item', row: rows[2], underSummary: true },
      { kind: 'item', row: rows[3], underSummary: true },
    ])
  })
})
