import { describe, expect, it } from 'vitest'
import { bucketOf, headingIndex } from './list-bucket'

const duties = [
  { catalogCode: 'd1', headingCode: 'h1', headingName: 'Oyuncular' },
  { catalogCode: 'd2', headingCode: null, headingName: null },
]

describe('bucketOf', () => {
  it('baslikli gorev: bolme basligin kimligini ve adini tasir', () => {
    expect(bucketOf({ dutyCode: 'd1' }, headingIndex(duties))).toEqual({ key: 'h1', name: 'Oyuncular' })
  })

  it('basligi olmayan gorev: ayri bolme, kendi adiyla', () => {
    expect(bucketOf({ dutyCode: 'd2' }, headingIndex(duties))).toEqual({
      key: '__noheadkey',
      name: 'Başlığı olmayan görevler',
    })
  })

  it('katalogda karsiligi olmayan gorev kodu ayni bolmeye duser', () => {
    expect(bucketOf({ dutyCode: 'yok' }, headingIndex(duties))).toEqual({
      key: '__noheadkey',
      name: 'Başlığı olmayan görevler',
    })
  })

  it('gorevi olmayan kisi: Gorevsiz bolmesi, ayri anahtar', () => {
    expect(bucketOf({ dutyCode: null }, headingIndex(duties))).toEqual({ key: '__nodutykey', name: 'Görevsiz' })
  })

  it('gorevsiz ile baslisiz iki ayri ad tasir', () => {
    const headings = headingIndex(duties)
    expect(bucketOf({ dutyCode: null }, headings).name).not.toBe(bucketOf({ dutyCode: 'd2' }, headings).name)
  })
})
