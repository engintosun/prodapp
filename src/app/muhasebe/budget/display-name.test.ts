import { describe, it, expect } from 'vitest'
import { itemDisplayName, summaryDisplayName, commissionDisplayName, rowDisplayName, anchorNames } from './display-name'

const DUTY_CODES = new Set(['1601', '1602'])

describe('itemDisplayName', () => {
  it('hal 1: gorev atomu degilse satirin kendi adi, DUZENLENEBILIR', () => {
    const r = itemDisplayName(
      { name: 'Mesai', catalogCode: '1605', personObjectId: 'p1' },
      DUTY_CODES,
      new Map([['p1', 'Ahmet Yılmaz']]),
    )
    expect(r).toEqual({ text: 'Mesai', editable: true })
  })

  it('hal 2: gorev atomu ama kisi bagli degilse satirin kendi adi, DUZENLENEBILIR', () => {
    const r = itemDisplayName(
      { name: 'Başrol Oyuncu', catalogCode: '1601', personObjectId: null },
      DUTY_CODES,
      new Map([['p1', 'Ahmet Yılmaz']]),
    )
    expect(r).toEqual({ text: 'Başrol Oyuncu', editable: true })
  })

  it('hal 3: gorev atomu + kisi bagli + etiket listede var: etiketin adi, SALT OKUNUR', () => {
    const r = itemDisplayName(
      { name: 'Başrol Oyuncu', catalogCode: '1601', personObjectId: 'p1' },
      DUTY_CODES,
      new Map([['p1', 'Ahmet Yılmaz']]),
    )
    expect(r).toEqual({ text: 'Ahmet Yılmaz', editable: false })
  })

  it('hal 4: gorev atomu + kisi bagli + etiket listede YOK (bayat bag): satirin kendi adi, DUZENLENEBILIR', () => {
    const r = itemDisplayName(
      { name: 'Başrol Oyuncu', catalogCode: '1601', personObjectId: 'silinmis-p' },
      DUTY_CODES,
      new Map([['p1', 'Ahmet Yılmaz']]),
    )
    expect(r).toEqual({ text: 'Başrol Oyuncu', editable: true })
  })
})

describe('summaryDisplayName', () => {
  const duties = new Map([['d1', 'Başrol Oyuncu']])

  it('kademe 1: rol hanesi doluysa rol adi doner', () => {
    const labels = [{ id: 'p1', name: 'Ahmet Yılmaz', roleName: 'Komiser Şükrü', dutyCode: 'd1' }]
    expect(summaryDisplayName('p1', labels, duties)).toBe('Komiser Şükrü')
  })

  it('kademe 2: rol bos ama gorev varsa gorev adi doner', () => {
    const labels = [{ id: 'p1', name: 'Ahmet Yılmaz', roleName: null, dutyCode: 'd1' }]
    expect(summaryDisplayName('p1', labels, duties)).toBe('Başrol Oyuncu')
  })

  it('kademe 3: rol ve gorev yoksa oyuncunun gercek adi doner', () => {
    const labels = [{ id: 'p1', name: 'Ahmet Yılmaz', roleName: null, dutyCode: null }]
    expect(summaryDisplayName('p1', labels, duties)).toBe('Ahmet Yılmaz')
  })

  it('kademe 3: gorev kodunun listede karsiligi yoksa oyuncunun gercek adi doner', () => {
    const labels = [{ id: 'p1', name: 'Ahmet Yılmaz', roleName: null, dutyCode: 'yok' }]
    expect(summaryDisplayName('p1', labels, duties)).toBe('Ahmet Yılmaz')
  })

  it('kademe 4: etiket listede yoksa bos doner', () => {
    const labels = [{ id: 'p2', name: 'Başka Kişi', roleName: null, dutyCode: 'd1' }]
    expect(summaryDisplayName('p1', labels, duties)).toBe('')
  })
})

describe('commissionDisplayName', () => {
  it('ajans satiri (1618) ajans adini tasir, SALT OKUNUR', () => {
    const r = commissionDisplayName(
      { name: 'Ajans Komisyonu', catalogCode: '1618' },
      { agencyName: 'ABC Ajans', managerName: null },
    )
    expect(r).toEqual({ text: 'Ajans Komisyonu — ABC Ajans', editable: false })
  })

  it('menajer satiri (1618-01) menajer adini tasir, SALT OKUNUR', () => {
    const r = commissionDisplayName(
      { name: 'Menajer Komisyonu', catalogCode: '1618-01' },
      { agencyName: null, managerName: 'Zeynep Kaya' },
    )
    expect(r).toEqual({ text: 'Menajer Komisyonu — Zeynep Kaya', editable: false })
  })

  it('ad bos ise (tik var, ad hanesi bos) duz ad ve DUZENLENEBILIR kalir', () => {
    const r = commissionDisplayName(
      { name: 'Ajans Komisyonu', catalogCode: '1618' },
      { agencyName: null, managerName: null },
    )
    expect(r).toEqual({ text: 'Ajans Komisyonu', editable: true })
  })

  it('etiket hic bulunamazsa (label undefined) duz ad ve DUZENLENEBILIR kalir', () => {
    const r = commissionDisplayName({ name: 'Ajans Komisyonu', catalogCode: '1618' }, undefined)
    expect(r).toEqual({ text: 'Ajans Komisyonu', editable: true })
  })
})

describe('rowDisplayName', () => {
  it('komisyon satiri (deriveRate dolu) ajans adiyla birlikte, SALT OKUNUR', () => {
    const r = rowDisplayName(
      { name: 'Ajans Komisyonu', catalogCode: '1618', personObjectId: 'p1', deriveRate: 20 },
      DUTY_CODES,
      new Map([['p1', 'Ahmet Yılmaz']]),
      new Map([['p1', { agencyName: 'Yıldız Ajans', managerName: null }]]),
    )
    expect(r).toEqual({ text: 'Ajans Komisyonu — Yıldız Ajans', editable: false })
  })

  it('komisyon satirinin kisisi yoksa duz ad, DUZENLENEBILIR', () => {
    const r = rowDisplayName(
      { name: 'Ajans Komisyonu', catalogCode: '1618', personObjectId: null, deriveRate: 20 },
      DUTY_CODES,
      new Map(),
      new Map(),
    )
    expect(r).toEqual({ text: 'Ajans Komisyonu', editable: true })
  })

  it('komisyon disi satir itemDisplayName yolundan gider: kisi bagli gorev satirinda kisinin adi', () => {
    const r = rowDisplayName(
      { name: 'Başrol Oyuncu', catalogCode: '1601', personObjectId: 'p1', deriveRate: null },
      DUTY_CODES,
      new Map([['p1', 'Ahmet Yılmaz']]),
      new Map(),
    )
    expect(r).toEqual({ text: 'Ahmet Yılmaz', editable: false })
  })
})

describe('anchorNames (1500 Dilim 2, Karar 2, 7, 10)', () => {
  const LIB = [
    { catalogCode: '1501', name: 'Yönetmen', nameSuffix: 'Hizmet Bedeli' },
    { catalogCode: '1509', name: 'İkinci Ekip Yönetmeni', nameSuffix: 'Hizmet Bedeli' },
  ]
  const CODES = new Set(['1501', '1509'])
  const row = (id: string, catalogCode: string, personName: string | null = null) => ({
    id,
    catalogCode,
    name: 'Yonetmen Kasesi',
    personName,
  })

  it('tek isimsiz ozetsiz 1501: gorev adi, numara yok, ozet adi yok', () => {
    const r = anchorNames([row('a', '1501')], CODES, LIB, new Set())
    expect(r.rowName.get('a')).toBe('Yönetmen')
    expect(r.whoName.get('a')).toBe('Yönetmen')
    expect(r.summaryName.has('a')).toBe(false)
  })

  it('iki isimsiz ozetsiz 1501: satir sirasiyla Yönetmen 1 ve Yönetmen 2', () => {
    const r = anchorNames([row('a', '1501'), row('b', '1501')], CODES, LIB, new Set())
    expect(r.rowName.get('a')).toBe('Yönetmen 1')
    expect(r.rowName.get('b')).toBe('Yönetmen 2')
    expect(r.whoName.get('a')).toBe('Yönetmen 1')
    expect(r.whoName.get('b')).toBe('Yönetmen 2')
  })

  it('isimli ve ozetli 1501: ozet gorev adi, satir kisi adi + ek, Kime? kisi adi', () => {
    const r = anchorNames([row('a', '1501', 'Ayşe Yılmaz')], CODES, LIB, new Set(['a']))
    expect(r.summaryName.get('a')).toBe('Yönetmen')
    expect(r.rowName.get('a')).toBe('Ayşe Yılmaz Hizmet Bedeli')
    expect(r.whoName.get('a')).toBe('Ayşe Yılmaz')
  })

  it('isimsiz ve ozetli 1501: ozet Yönetmen, satir Yönetmen Hizmet Bedeli', () => {
    const r = anchorNames([row('a', '1501')], CODES, LIB, new Set(['a']))
    expect(r.summaryName.get('a')).toBe('Yönetmen')
    expect(r.rowName.get('a')).toBe('Yönetmen Hizmet Bedeli')
  })

  it('bir isimli + iki isimsiz 1501, isimsizlerden biri ozetli: isimsizler numarali, isimli numara almaz', () => {
    const rows = [row('n', '1501', 'Ayşe Yılmaz'), row('u1', '1501'), row('u2', '1501')]
    const r = anchorNames(rows, CODES, LIB, new Set(['u2']))
    expect(r.whoName.get('n')).toBe('Ayşe Yılmaz')
    expect(r.whoName.get('u1')).toBe('Yönetmen 1')
    expect(r.whoName.get('u2')).toBe('Yönetmen 2')
    expect(r.summaryName.get('u2')).toBe('Yönetmen 2')
    expect(r.rowName.get('u2')).toBe('Yönetmen Hizmet Bedeli')
    expect(r.rowName.get('u1')).toBe('Yönetmen 1')
  })

  it('1501 ve 1509 birer isimsiz: ikisi de numarasiz', () => {
    const r = anchorNames([row('a', '1501'), row('b', '1509')], CODES, LIB, new Set())
    expect(r.rowName.get('a')).toBe('Yönetmen')
    expect(r.rowName.get('b')).toBe('İkinci Ekip Yönetmeni')
  })

  it('kutuphanede kaydi olmayan capa kodu: satirin kendi adi doner', () => {
    const r = anchorNames([row('a', '1501')], CODES, [], new Set())
    expect(r.rowName.get('a')).toBe('Yonetmen Kasesi')
    expect(r.whoName.get('a')).toBe('Yonetmen Kasesi')
  })

  it('rowDisplayName: besinci arguman verilince o ad doner, SALT OKUNUR', () => {
    const r = rowDisplayName(
      { name: 'Yonetmen Kasesi', catalogCode: '1501', personObjectId: null, deriveRate: null },
      DUTY_CODES,
      new Map(),
      new Map(),
      'Ayşe Yılmaz Hizmet Bedeli',
    )
    expect(r).toEqual({ text: 'Ayşe Yılmaz Hizmet Bedeli', editable: false })
  })
})