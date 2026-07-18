import { describe, it, expect } from 'vitest'
import { parseNumericDraft, hasNonPositiveOverride } from './format'

describe('parseNumericDraft (PARSE GUVENCESI, K10 revize + TD-16)', () => {
  it('duz rakam metnini sayiya cevirir', () => {
    expect(parseNumericDraft('1500')).toBe(1500)
  })

  it('virgulu ondalik ayirici olarak kabul eder', () => {
    expect(parseNumericDraft('1500,5')).toBe(1500.5)
  })

  it('nokta iceren taslagi HER ZAMAN gecersiz sayar (tr-TR binlik ayraci ile karisir)', () => {
    expect(parseNumericDraft('1.500')).toBeNull()
  })

  it('bos taslak gecersizdir', () => {
    expect(parseNumericDraft('')).toBeNull()
    expect(parseNumericDraft('   ')).toBeNull()
  })

  it('sayiya cevrilemeyen metin gecersizdir', () => {
    expect(parseNumericDraft('€')).toBeNull()
    expect(parseNumericDraft('abc')).toBeNull()
  })

  it('0 GECERLI bir sayidir', () => {
    expect(parseNumericDraft('0')).toBe(0)
  })

  it('negatif sayi da gecerlidir (parse asamasinda alan-bazli kural uygulanmaz)', () => {
    expect(parseNumericDraft('-5')).toBe(-5)
  })
})

describe('hasNonPositiveOverride (TD-14, 2026-07-18)', () => {
  it('hic girilmemis (override=undefined) donem taramadan HARIC tutulur - gosterge yanmaz', () => {
    const periodNet = { 'stage-1': 50000 }
    expect(hasNonPositiveOverride(['stage-1', 'stage-2'], periodNet)).toBe(false)
  })

  it('acikca 0 girilmis override gostergeyi yakar', () => {
    const periodNet = { 'stage-1': 0, 'stage-2': undefined as unknown as number | null }
    expect(hasNonPositiveOverride(['stage-1', 'stage-2'], periodNet)).toBe(true)
  })

  it('0 duzeltilip pozitif yapilinca (ve diger donem hala girilmemisken) gosterge soner', () => {
    const periodNet = { 'stage-1': 15000 }
    expect(hasNonPositiveOverride(['stage-1', 'stage-2'], periodNet)).toBe(false)
  })

  it('negatif override da gostergeyi yakar', () => {
    const periodNet = { 'stage-1': -100 }
    expect(hasNonPositiveOverride(['stage-1'], periodNet)).toBe(true)
  })

  it('eklenmis donem yoksa false doner', () => {
    expect(hasNonPositiveOverride([], {})).toBe(false)
  })
})
