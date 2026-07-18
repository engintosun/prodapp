import { describe, it, expect } from 'vitest'
import { parseNumericDraft, hasNonPositiveOverride, isNonPositiveNet } from './format'

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

  // TD-14 genislemesi (2026-07-18, Engin karari): bu tarama HER ZAMAN statuden bagimsizdi
  // (paymentStatus parametresi hic almiyor) - genisleme yalniz use-edit-buffers.ts'teki
  // cagri yerinde bordro sartinin kaldirilmasiydi. Asagidaki testler bordro-disi (orn. SMM)
  // kalemin donem yolunda AYNI kurala tabi oldugunu acikca dokumante eder.
  it('bordro-disi (orn. SMM) kalemde acikca 0 override girilince gosterge yanar', () => {
    const periodNet = { 'stage-1': 0 }
    expect(hasNonPositiveOverride(['stage-1', 'stage-2'], periodNet)).toBe(true)
  })

  it('bordro-disi kalemde hic girilmemis donem gostergeyi yakmaz', () => {
    const periodNet = { 'stage-1': 30000 }
    expect(hasNonPositiveOverride(['stage-1', 'stage-2'], periodNet)).toBe(false)
  })
})

describe('isNonPositiveNet (TD-14, 2026-07-18 - tum statulere genisleme)', () => {
  it('0 gostergeyi yakar (statuden bagimsiz - SMM/Fatura/Telif/bordro hepsi ayni kural)', () => {
    expect(isNonPositiveNet(0)).toBe(true)
  })

  it('negatif deger gostergeyi yakar', () => {
    expect(isNonPositiveNet(-100)).toBe(true)
  })

  it('pozitif deger gostergeyi sondurur', () => {
    expect(isNonPositiveNet(1)).toBe(false)
    expect(isNonPositiveNet(50000)).toBe(false)
  })
})
