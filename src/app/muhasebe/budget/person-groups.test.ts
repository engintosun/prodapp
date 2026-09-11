import { describe, it, expect } from 'vitest'
import { groupByPerson, derivedUnitNets, buildRenderRows, personNetBases, personsNeedingCommissionRow } from './person-groups'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { PersonLabel } from '../../../shared/supabase/person-label-service'

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

  it('LOAN-OUT: sirket (Fatura) statulu satir da tabana girer, odeme belgesi tabani degistirmez', () => {
    const rows = [
      makeItem({ id: 'kase_fatura', personObjectId: 'p1', paymentStatus: 'sirket' }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20 }),
    ]
    expect(derivedUnitNets(rows, { kase_fatura: 100000 })).toEqual({ komisyon: 20000 })
  })

  it('bordro + smm + telif_belgeli karisik satirlarin ucu de tabana girer', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1', paymentStatus: 'bordro' }),
      makeItem({ id: 'ek-cekim', personObjectId: 'p1', paymentStatus: 'smm' }),
      makeItem({ id: 'tekrar-telifi', personObjectId: 'p1', paymentStatus: 'telif_belgeli' }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20 }),
    ]
    expect(
      derivedUnitNets(rows, { kase: 50000, 'ek-cekim': 30000, 'tekrar-telifi': 20000 }),
    ).toEqual({ komisyon: 20000 })
  })
})

describe('personNetBases', () => {
  it('kazanc statuleri toplanir, turetilmis satir tabana girmez', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'mesai', personObjectId: 'p1' }),
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20 }),
    ]
    expect(personNetBases(rows, { kase: 100000, mesai: 20000, komisyon: 24000 })).toEqual({ p1: 120000 })
  })

  it('kisi basina ayrisir', () => {
    const rows = [
      makeItem({ id: 'kase1', personObjectId: 'p1' }),
      makeItem({ id: 'kase2', personObjectId: 'p2' }),
    ]
    expect(personNetBases(rows, { kase1: 50000, kase2: 90000 })).toEqual({ p1: 50000, p2: 90000 })
  })

  it('etiketsiz satir tabana girmez, etiketli satir statusu ne olursa olsun girer', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: null }),
      makeItem({ id: 'b', personObjectId: 'p1', paymentStatus: 'sirket' }),
    ]
    expect(personNetBases(rows, { a: 1000, b: 2000 })).toEqual({ p1: 2000 })
  })

  it('DIKKAT: turetilmis (menajer komisyonu) satir tabana girmez, kendi tabanini beslemez', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1', paymentStatus: 'bordro' }),
      makeItem({ id: 'menajer-komisyon', personObjectId: 'p1', paymentStatus: 'smm', deriveRate: 20 }),
    ]
    expect(personNetBases(rows, { kase: 100000, 'menajer-komisyon': 20000 })).toEqual({ p1: 100000 })
  })
})

describe('personsNeedingCommissionRow', () => {
  it('tiksiz kisi gerekmez', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: false, hasManager: false })]
    expect(personsNeedingCommissionRow(rows, labels, { kase: 100000 })).toEqual([])
  })

  it('tabani sifir olan gerekmez', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: true })]
    expect(personsNeedingCommissionRow(rows, labels, { kase: 0 })).toEqual([])
  })

  it('komisyon satiri zaten olan (o cinste) gerekmez', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'ajans-komisyon', personObjectId: 'p1', deriveRate: 20, paymentStatus: 'sirket' }),
    ]
    const labels = [makeLabel({ id: 'p1', hasAgency: true })]
    expect(personsNeedingCommissionRow(rows, labels, { kase: 100000, 'ajans-komisyon': 20000 })).toEqual([])
  })

  it('iki tik iki cift uretir (ajans + menajer)', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: true, hasManager: true })]
    expect(personsNeedingCommissionRow(rows, labels, { kase: 100000 })).toEqual([
      { personObjectId: 'p1', kind: 'ajans' },
      { personObjectId: 'p1', kind: 'menajer' },
    ])
  })

  it('tek tik (ajans) bir cift uretir', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: true, hasManager: false })]
    expect(personsNeedingCommissionRow(rows, labels, { kase: 100000 })).toEqual([
      { personObjectId: 'p1', kind: 'ajans' },
    ])
  })

  it('tiksiz kisi hicbir cift uretmez', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: false, hasManager: false })]
    expect(personsNeedingCommissionRow(rows, labels, { kase: 100000 })).toEqual([])
  })

  it('ajans satiri varken menajer eksikse yalniz menajer cifti doner', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'ajans-komisyon', personObjectId: 'p1', deriveRate: 20, paymentStatus: 'sirket' }),
    ]
    const labels = [makeLabel({ id: 'p1', hasAgency: true, hasManager: true })]
    expect(personsNeedingCommissionRow(rows, labels, { kase: 100000, 'ajans-komisyon': 20000 })).toEqual([
      { personObjectId: 'p1', kind: 'menajer' },
    ])
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

  it('kisinin dagitilmis satirlari BLOKTA toplanir - araya giren baska satir bloktan sonraya kayar', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: 'p1' }),
      makeItem({ id: 'x' }),
      makeItem({ id: 'b', personObjectId: 'p1' }),
    ]
    const out = buildRenderRows(rows, new Set(['p1']))
    expect(out).toEqual([
      { kind: 'summary', personObjectId: 'p1', rows: [rows[0], rows[2]] },
      { kind: 'item', row: rows[0], underSummary: true },
      { kind: 'item', row: rows[2], underSummary: true },
      { kind: 'item', row: rows[1], underSummary: false },
    ])
  })

  it('blok kartta kisinin ILK satirinin bulundugu yerde durur; kisisiz satirlarin kendi aralarindaki sirasi bozulmaz', () => {
    const rows = [
      makeItem({ id: 'z' }),
      makeItem({ id: 'a', personObjectId: 'p1' }),
      makeItem({ id: 'x' }),
      makeItem({ id: 'b', personObjectId: 'p1' }),
      makeItem({ id: 'y' }),
    ]
    const out = buildRenderRows(rows, new Set(['p1']))
    expect(out).toEqual([
      { kind: 'item', row: rows[0], underSummary: false },
      { kind: 'summary', personObjectId: 'p1', rows: [rows[1], rows[3]] },
      { kind: 'item', row: rows[1], underSummary: true },
      { kind: 'item', row: rows[3], underSummary: true },
      { kind: 'item', row: rows[2], underSummary: false },
      { kind: 'item', row: rows[4], underSummary: false },
    ])
  })

  it('blok ICI sira korunur (gelis sirasi = katalog kodu sirasi: kase, mesai, komisyon)', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'mesai', personObjectId: 'p1' }),
      makeItem({ id: 'komisyon', personObjectId: 'p1' }),
    ]
    const out = buildRenderRows(rows, new Set(['p1']))
    expect(out.filter((rr) => rr.kind === 'item').map((rr) => (rr.kind === 'item' ? rr.row.id : ''))).toEqual([
      'kase',
      'mesai',
      'komisyon',
    ])
  })

  it('tek satirli (ozeti olmayan) kisinin satiri bulundugu yerde kalir', () => {
    const rows = [
      makeItem({ id: 'a', personObjectId: 'p1' }),
      makeItem({ id: 'x' }),
    ]
    const out = buildRenderRows(rows, new Set())
    expect(out).toEqual([
      { kind: 'item', row: rows[0], underSummary: false },
      { kind: 'item', row: rows[1], underSummary: false },
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
