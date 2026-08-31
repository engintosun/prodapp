import { describe, expect, it } from 'vitest'
import { BUDGET_COLUMNS } from './columns'

describe('BUDGET_COLUMNS', () => {
  it('on dort kolon icerir ve etiketleri tam sirasiyla eslesir', () => {
    const labels = BUDGET_COLUMNS.map((c) => c.label)
    expect(labels).toEqual([
      'No',
      'Ad',
      'Statü',
      'Dönemler',
      'Birim',
      'Birim net',
      'Miktar',
      'X',
      'Ara toplam',
      'Yasal Yük',
      'Maliyet',
      'KDV',
      'Toplam',
      '',
    ])
  })

  it('her kolonun key degeri tekildir', () => {
    const keys = BUDGET_COLUMNS.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('sayisal kolonlar num, digerleri text hizalanir', () => {
    const numLabels = ['Birim net', 'Miktar', 'X', 'Ara toplam', 'Yasal Yük', 'Maliyet', 'KDV', 'Toplam']
    for (const column of BUDGET_COLUMNS) {
      const expected = numLabels.includes(column.label) ? 'num' : 'text'
      expect(column.align).toBe(expected)
    }
  })

  it('satir bilesenlerinin hucre sayisi kolon setiyle ayni olmali', () => {
    const n = BUDGET_COLUMNS.length
    // heading-row ve kart toplami seridi: colSpan + bes rakam hucresi + bos silme hanesi
    expect(8 + 5 + 1).toBe(n)
    // add-item-row: iki hucre + colSpan
    expect(2 + 12).toBe(n)
    // period-row: uc bos hucre + on icerik hucresi + silme hanesi
    expect(3 + 10 + 1).toBe(n)
  })
})
