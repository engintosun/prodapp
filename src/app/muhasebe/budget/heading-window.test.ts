import { describe, it, expect } from 'vitest'
import { buildWindowGroups, filterHeadingOptions, undoBatches } from './heading-window'
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

const options = [
  { key: '1101', name: 'Hikâye, Senaryo, Haklar' },
  { key: 'u1', name: 'Istanbul Masraflari' },
]

describe('buildWindowGroups', () => {
  it('yalniz serbest kalemler listelenir, kutuphane kalemi girmez', () => {
    const rows = [
      makeItem({ id: 'lib', libraryItemId: 'L1', headingCode: '1101' }),
      makeItem({ id: 'free', headingCode: '1101' }),
    ]
    const groups = buildWindowGroups(rows, options)
    expect(groups.flatMap((g) => g.items.map((i) => i.id))).toEqual(['free'])
  })

  it('Basliksiz en ustte, sonra basliklar secenek sirasinda', () => {
    const rows = [
      makeItem({ id: 'a', headingCode: 'u1' }),
      makeItem({ id: 'b', headingCode: null }),
      makeItem({ id: 'c', headingCode: '1101' }),
    ]
    expect(buildWindowGroups(rows, options).map((g) => g.key)).toEqual([null, '1101', 'u1'])
  })

  it('kartta olmayan basliga isaret eden kalem Basliksiz grubuna duser', () => {
    const groups = buildWindowGroups([makeItem({ id: 'a', headingCode: 'yok' })], options)
    expect(groups).toHaveLength(1)
    expect(groups[0].key).toBeNull()
    expect(groups[0].name).toBe('Başlıksız')
  })

  it('bos grup dogmaz', () => {
    const groups = buildWindowGroups([makeItem({ id: 'a', headingCode: '1101' })], options)
    expect(groups.map((g) => g.key)).toEqual(['1101'])
  })
})

describe('filterHeadingOptions', () => {
  it('bos arama hepsini dondurur', () => {
    expect(filterHeadingOptions(options, '   ').map((o) => o.key)).toEqual(['1101', 'u1'])
  })

  it('yazilan metne uyanlari dondurur', () => {
    expect(filterHeadingOptions(options, 'masraf').map((o) => o.key)).toEqual(['u1'])
  })
})

describe('undoBatches', () => {
  it('her kalem geldigi yere doner, ayni yerden gelenler tek pakette', () => {
    const batches = undoBatches([
      { id: 'a', from: null },
      { id: 'b', from: '1101' },
      { id: 'c', from: null },
    ])
    expect(batches).toEqual([
      { headingCode: null, ids: ['a', 'c'] },
      { headingCode: '1101', ids: ['b'] },
    ])
  })
})
