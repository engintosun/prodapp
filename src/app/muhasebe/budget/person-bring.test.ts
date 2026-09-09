import { describe, it, expect } from 'vitest'
import { personCardPresence, personNameCollisions, sortPersonsByDuty } from './person-bring'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { PersonLabel, DutyOption } from '../../../shared/supabase/person-label-service'

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
    paymentStatus: 'bordro',
    internalNote: null,
    publicNote: null,
    personObjectId: null,
    deriveRate: null,
    ...overrides,
  }
}

function makeLabel(overrides: Partial<PersonLabel> = {}): PersonLabel {
  return {
    id: 'p1',
    code: 1,
    name: 'Test Oyuncu',
    roleName: null,
    dutyCode: null,
    isActive: true,
    hasAgency: false,
    agencyName: null,
    hasManager: false,
    managerName: null,
    ...overrides,
  }
}

describe('personCardPresence', () => {
  it('kartta olan ve olmayan kisiyi dogru ayirir', () => {
    const rows = [makeItem({ id: 'a', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1' }), makeLabel({ id: 'p2' })]
    expect(personCardPresence(rows, labels)).toEqual({
      inCard: { p1: true, p2: false },
      missingCount: 1,
    })
  })

  it('ayni kisinin iki satiri varsa bir kez sayilir', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: 'p1' }),
      makeItem({ id: 'b', personObjectId: 'p1' }),
    ]
    const labels = [makeLabel({ id: 'p1' })]
    expect(personCardPresence(rows, labels)).toEqual({
      inCard: { p1: true },
      missingCount: 0,
    })
  })

  it('hic satiri olmayan kisi tabana kartta degil olarak girer', () => {
    const rows: BudgetItemRow[] = []
    const labels = [makeLabel({ id: 'p1' }), makeLabel({ id: 'p2' })]
    expect(personCardPresence(rows, labels)).toEqual({
      inCard: { p1: false, p2: false },
      missingCount: 2,
    })
  })
})

describe('personNameCollisions', () => {
  it('eslesen ad uyari uretir', () => {
    const rows = [makeItem({ id: 'a', name: 'Ahmet Yılmaz', personObjectId: null })]
    const labels = [makeLabel({ id: 'p1', name: 'Ahmet Yılmaz' })]
    expect(personNameCollisions(rows, labels)).toEqual({ p1: true })
  })

  it('fisli satirla eslesme uyari URETMEZ', () => {
    const rows = [makeItem({ id: 'a', name: 'Ahmet Yılmaz', personObjectId: 'baska-kisi' })]
    const labels = [makeLabel({ id: 'p1', name: 'Ahmet Yılmaz' })]
    expect(personNameCollisions(rows, labels)).toEqual({ p1: false })
  })

  it('bosluk farki eslesir (iki yandan kirpilir)', () => {
    const rows = [makeItem({ id: 'a', name: '  Ahmet Yılmaz  ', personObjectId: null })]
    const labels = [makeLabel({ id: 'p1', name: 'Ahmet Yılmaz' })]
    expect(personNameCollisions(rows, labels)).toEqual({ p1: true })
  })

  it('harf farki eslesmez (buyuk-kucuk katlama yok)', () => {
    const rows = [makeItem({ id: 'a', name: 'ahmet yılmaz', personObjectId: null })]
    const labels = [makeLabel({ id: 'p1', name: 'Ahmet Yılmaz' })]
    expect(personNameCollisions(rows, labels)).toEqual({ p1: false })
  })
})

describe('sortPersonsByDuty', () => {
  const DUTIES: DutyOption[] = [
    { catalogCode: '1601', name: 'Basrol' },
    { catalogCode: '1602', name: 'Yardimci Oyuncu' },
    { catalogCode: '1603', name: 'Gunluk Oyuncu' },
  ]

  it('gorev sirasi dutyOptions sirasini takip eder', () => {
    const labels = [
      makeLabel({ id: 'a', dutyCode: '1603' }),
      makeLabel({ id: 'b', dutyCode: '1601' }),
      makeLabel({ id: 'c', dutyCode: '1602' }),
    ]
    expect(sortPersonsByDuty(labels, DUTIES).map((l) => l.id)).toEqual(['b', 'c', 'a'])
  })

  it('ayni gorev icinde gelis sirasi korunur', () => {
    const labels = [
      makeLabel({ id: 'a', dutyCode: '1601' }),
      makeLabel({ id: 'b', dutyCode: '1601' }),
      makeLabel({ id: 'c', dutyCode: '1601' }),
    ]
    expect(sortPersonsByDuty(labels, DUTIES).map((l) => l.id)).toEqual(['a', 'b', 'c'])
  })

  it('gorevi bos olan kisi sona duser', () => {
    const labels = [
      makeLabel({ id: 'a', dutyCode: null }),
      makeLabel({ id: 'b', dutyCode: '1602' }),
      makeLabel({ id: 'c', dutyCode: '1601' }),
    ]
    expect(sortPersonsByDuty(labels, DUTIES).map((l) => l.id)).toEqual(['c', 'b', 'a'])
  })
})
