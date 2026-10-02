import { describe, it, expect } from 'vitest'
import { groupByPerson, derivedUnitNets, buildRenderRows, personNetBases, personsNeedingCommissionRow, commissionRowsWithoutTick, anchorCodesOf, summaryAnchorIds, anchorNetBases } from './person-groups'
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
    parentItemId: null,
    personName: null,
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
    expect(personsNeedingCommissionRow(rows, labels)).toEqual([])
  })

  it('tabani sifir ama kartta olan gerekir (satir sifir tutarla dogar)', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: true })]
    expect(personsNeedingCommissionRow(rows, labels)).toEqual([{ personObjectId: 'p1', kind: 'ajans' }])
  })

  it('kartta satiri olmayan gerekmez', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p2' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: true })]
    expect(personsNeedingCommissionRow(rows, labels)).toEqual([])
  })

  it('komisyon satiri zaten olan (o cinste) gerekmez', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'ajans-komisyon', personObjectId: 'p1', deriveRate: 20, catalogCode: '1618' }),
    ]
    const labels = [makeLabel({ id: 'p1', hasAgency: true })]
    expect(personsNeedingCommissionRow(rows, labels)).toEqual([])
  })

  it('iki tik iki cift uretir (ajans + menajer)', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: true, hasManager: true })]
    expect(personsNeedingCommissionRow(rows, labels)).toEqual([
      { personObjectId: 'p1', kind: 'ajans' },
      { personObjectId: 'p1', kind: 'menajer' },
    ])
  })

  it('tek tik (ajans) bir cift uretir', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: true, hasManager: false })]
    expect(personsNeedingCommissionRow(rows, labels)).toEqual([
      { personObjectId: 'p1', kind: 'ajans' },
    ])
  })

  it('tiksiz kisi hicbir cift uretmez', () => {
    const rows = [makeItem({ id: 'kase', personObjectId: 'p1' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: false, hasManager: false })]
    expect(personsNeedingCommissionRow(rows, labels)).toEqual([])
  })

  it('ajans satiri varken menajer eksikse yalniz menajer cifti doner', () => {
    const rows = [
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'ajans-komisyon', personObjectId: 'p1', deriveRate: 20, catalogCode: '1618' }),
    ]
    const labels = [makeLabel({ id: 'p1', hasAgency: true, hasManager: true })]
    expect(personsNeedingCommissionRow(rows, labels)).toEqual([
      { personObjectId: 'p1', kind: 'menajer' },
    ])
  })
})

describe('commissionRowsWithoutTick', () => {
  it('tiki acik kisinin komisyon satiri donmez', () => {
    const rows = [makeItem({ id: 'ajans', personObjectId: 'p1', deriveRate: 20, catalogCode: '1618' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: true })]
    expect(commissionRowsWithoutTick(rows, labels)).toEqual([])
  })

  it('tiki kapali cinsin satiri doner, tiki acik cinsinki donmez', () => {
    const ajans = makeItem({ id: 'ajans', personObjectId: 'p1', deriveRate: 20, catalogCode: '1618' })
    const menajer = makeItem({ id: 'menajer', personObjectId: 'p1', deriveRate: 20, catalogCode: '1618-01' })
    const labels = [makeLabel({ id: 'p1', hasAgency: false, hasManager: true })]
    expect(commissionRowsWithoutTick([ajans, menajer], labels)).toEqual([{ personObjectId: 'p1', kind: 'ajans', rows: [ajans] }])
  })

  it('kopya satirlar ayni grupta doner', () => {
    const a1 = makeItem({ id: 'a1', personObjectId: 'p1', deriveRate: 20, catalogCode: '1618' })
    const a2 = makeItem({ id: 'a2', personObjectId: 'p1', deriveRate: 15, catalogCode: '1618' })
    const labels = [makeLabel({ id: 'p1', hasAgency: false })]
    expect(commissionRowsWithoutTick([a1, a2], labels)).toEqual([{ personObjectId: 'p1', kind: 'ajans', rows: [a1, a2] }])
  })

  it('etiketi bulunamayan kisinin satiri donmez', () => {
    const rows = [makeItem({ id: 'ajans', personObjectId: 'p9', deriveRate: 20, catalogCode: '1618' })]
    expect(commissionRowsWithoutTick(rows, [])).toEqual([])
  })

  it('turetilmemis satir donmez', () => {
    const rows = [makeItem({ id: 'x', personObjectId: 'p1', deriveRate: null, catalogCode: '1618' })]
    const labels = [makeLabel({ id: 'p1', hasAgency: false })]
    expect(commissionRowsWithoutTick(rows, labels)).toEqual([])
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

  it('turetilmis satir blogun EN SONUNDA durur, digerlerinin sirasi bozulmaz', () => {
    const rows = [
      makeItem({ id: 'komisyon', personObjectId: 'p1', deriveRate: 20 }),
      makeItem({ id: 'kase', personObjectId: 'p1' }),
      makeItem({ id: 'mesai', personObjectId: 'p1' }),
    ]
    const out = buildRenderRows(rows, new Set(['p1']))
    expect(out).toEqual([
      { kind: 'summary', personObjectId: 'p1', rows: [rows[1], rows[2], rows[0]] },
      { kind: 'item', row: rows[1], underSummary: true },
      { kind: 'item', row: rows[2], underSummary: true },
      { kind: 'item', row: rows[0], underSummary: true },
    ])
  })
})

describe('zimba blogu (1500 Dilim 2)', () => {
  it('anchorCodesOf: kutuphanedeki attaches_to kodlarinin birlesimi', () => {
    const out = anchorCodesOf([{ attachesTo: ['1501', '1509'] }, { attachesTo: [] }, { attachesTo: ['1501'] }])
    expect(out).toEqual(new Set(['1501', '1509']))
  })

  it('summaryAnchorIds: isimsiz ve alt satirsiz capa ozet almaz; isimli capa alir; alt satiri olan isimsiz capa alir', () => {
    const codes = new Set(['1501', '1509'])
    const rows = [
      makeItem({ id: 'bos', catalogCode: '1501' }),
      makeItem({ id: 'isimli', catalogCode: '1509', personName: 'Ayşe Yılmaz' }),
      makeItem({ id: 'ebeveyn', catalogCode: '1501' }),
      makeItem({ id: 'alt', catalogCode: '1501-01', parentItemId: 'ebeveyn' }),
    ]
    expect(summaryAnchorIds(rows, codes)).toEqual(new Set(['isimli', 'ebeveyn']))
  })

  it('summaryAnchorIds: capa olmayan satirin isim ve zimba durumu sonucu etkilemez', () => {
    const codes = new Set(['1501'])
    const rows = [
      makeItem({ id: 'x', catalogCode: '1503', personName: 'Biri' }),
      makeItem({ id: 'y', catalogCode: '1503', parentItemId: 'x' }),
    ]
    expect(summaryAnchorIds(rows, codes)).toEqual(new Set())
  })

  it('buildRenderRows: isimli tek capa ozet ve altinda kendisi', () => {
    const a = makeItem({ id: 'a', catalogCode: '1501', personName: 'Ayşe Yılmaz' })
    const out = buildRenderRows([a], new Set(), new Set(['a']))
    expect(out).toEqual([
      { kind: 'anchorSummary', anchorItemId: 'a', rows: [a] },
      { kind: 'item', row: a, underSummary: true },
    ])
  })

  it('buildRenderRows: zimbali satirlar capanin bulundugu yerde toplanir, kod sirasi blogu bolmez', () => {
    const a1 = makeItem({ id: 'a1', catalogCode: '1501' })
    const h = makeItem({ id: 'h', catalogCode: '1501-01', parentItemId: 'b9' })
    const x = makeItem({ id: 'x', catalogCode: '1503' })
    const b9 = makeItem({ id: 'b9', catalogCode: '1509' })
    const k = makeItem({ id: 'k', catalogCode: '1511', parentItemId: 'b9', deriveRate: 20 })
    const out = buildRenderRows([a1, h, x, b9, k], new Set(), new Set(['b9']))
    expect(out).toEqual([
      { kind: 'item', row: a1, underSummary: false },
      { kind: 'item', row: x, underSummary: false },
      { kind: 'anchorSummary', anchorItemId: 'b9', rows: [b9, h, k] },
      { kind: 'item', row: b9, underSummary: true },
      { kind: 'item', row: h, underSummary: true },
      { kind: 'item', row: k, underSummary: true },
    ])
  })

  it('buildRenderRows: capasi grupta olmayan zimbali satir bulundugu yerde cizilir', () => {
    const h = makeItem({ id: 'h', catalogCode: '1501-01', parentItemId: 'b9' })
    const out = buildRenderRows([h], new Set(), new Set(['b9']))
    expect(out).toEqual([{ kind: 'item', row: h, underSummary: false }])
  })
})
describe('zimbali komisyon tabani (1500 Dilim 2c-1)', () => {
  const hb = makeItem({ id: 'hb', catalogCode: '1501' })
  const hd = makeItem({ id: 'hd', catalogCode: '1501-01', parentItemId: 'hb' })
  const k = makeItem({ id: 'k', catalogCode: '1511', parentItemId: 'hb', deriveRate: 20 })

  it('anchorNetBases: capa ve zimbali turetilmemis satirlarin toplami, komisyon tabana girmez', () => {
    expect(anchorNetBases([hb, hd, k], { hb: 500000, hd: 500000, k: 999 })).toEqual({ hb: 1000000 })
  })

  it('derivedUnitNets: zimbali komisyon ozet toplaminin yuzdesi', () => {
    expect(derivedUnitNets([hb, hd, k], { hb: 500000, hd: 500000, k: 999 })).toEqual({ k: 200000 })
  })

  it('derivedUnitNets: kisi komisyonu ile zimbali komisyon ayni anda', () => {
    const kase = makeItem({ id: 'kase', personObjectId: 'p1' })
    const pk = makeItem({ id: 'pk', personObjectId: 'p1', deriveRate: 20 })
    const out = derivedUnitNets([kase, pk, hb, hd, k], { kase: 100000, hb: 500000, hd: 500000 })
    expect(out).toEqual({ pk: 20000, k: 200000 })
  })
})
