import { describe, it, expect } from 'vitest'
import { itemDisplayName, summaryDisplayName, commissionDisplayName } from './display-name'

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
  it('kademe 1: rol hanesi doluysa rol adi doner', () => {
    const labels = [{ id: 'p1', name: 'Ahmet Yılmaz', roleName: 'Komiser Şükrü' }]
    expect(summaryDisplayName('p1', labels)).toBe('Komiser Şükrü')
  })

  it('kademe 2: rol bos ama etiket listede varsa oyuncunun gercek adi doner', () => {
    const labels = [{ id: 'p1', name: 'Ahmet Yılmaz', roleName: null }]
    expect(summaryDisplayName('p1', labels)).toBe('Ahmet Yılmaz')
  })

  it('kademe 3: etiket listede yoksa bos doner', () => {
    const labels = [{ id: 'p2', name: 'Başka Kişi', roleName: null }]
    expect(summaryDisplayName('p1', labels)).toBe('')
  })
})

describe('commissionDisplayName', () => {
  it('ajans satiri (sirket) ajans adini tasir, SALT OKUNUR', () => {
    const r = commissionDisplayName(
      { name: 'Temsilci Komisyonu', paymentStatus: 'sirket' },
      { agencyName: 'ABC Ajans', managerName: null },
    )
    expect(r).toEqual({ text: 'Temsilci Komisyonu — ABC Ajans', editable: false })
  })

  it('menajer satiri (smm) menajer adini tasir, SALT OKUNUR', () => {
    const r = commissionDisplayName(
      { name: 'Temsilci Komisyonu', paymentStatus: 'smm' },
      { agencyName: null, managerName: 'Zeynep Kaya' },
    )
    expect(r).toEqual({ text: 'Temsilci Komisyonu — Zeynep Kaya', editable: false })
  })

  it('ad bos ise (tik var, ad hanesi bos) duz ad ve DUZENLENEBILIR kalir', () => {
    const r = commissionDisplayName(
      { name: 'Temsilci Komisyonu', paymentStatus: 'sirket' },
      { agencyName: null, managerName: null },
    )
    expect(r).toEqual({ text: 'Temsilci Komisyonu', editable: true })
  })

  it('etiket hic bulunamazsa (label undefined) duz ad ve DUZENLENEBILIR kalir', () => {
    const r = commissionDisplayName({ name: 'Temsilci Komisyonu', paymentStatus: 'sirket' }, undefined)
    expect(r).toEqual({ text: 'Temsilci Komisyonu', editable: true })
  })
})
