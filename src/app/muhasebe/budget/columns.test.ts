import { describe, expect, it } from 'vitest'
import { BUDGET_COLUMNS } from './columns'

describe('BUDGET_COLUMNS', () => {
  it('on iki kolon icerir ve etiketleri tam sirasiyla eslesir', () => {
    const labels = BUDGET_COLUMNS.map((c) => c.label)
    expect(labels).toEqual([
      'No',
      'Ad',
      'Açıklama',
      'Statü',
      'Dönemler',
      'Birim',
      'Birim net',
      'Miktar',
      'X',
      'Net toplam',
      'Yasal Yük',
      'Brüt toplam',
    ])
  })

  it('her kolonun key degeri tekildir', () => {
    const keys = BUDGET_COLUMNS.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('sayisal kolonlar num, digerleri text hizalanir', () => {
    const numLabels = ['Birim net', 'Miktar', 'X', 'Net toplam', 'Yasal Yük', 'Brüt toplam']
    for (const column of BUDGET_COLUMNS) {
      const expected = numLabels.includes(column.label) ? 'num' : 'text'
      expect(column.align).toBe(expected)
    }
  })
})
