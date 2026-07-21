import { describe, it, expect } from 'vitest'
import { parseNumericDraft, effectiveWarning, bordroAllowedUnits } from './format'

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

describe('effectiveWarning (TD-14 ucuncu duzeltme, 2026-07-18 - Net/X/Miktar)', () => {
  it('net<=0 diger degerler ne olursa olsun ONCELIKLIDIR', () => {
    expect(effectiveWarning(0, 5, 5)).toBe('net')
    expect(effectiveWarning(-1, 5, 5)).toBe('net')
    expect(effectiveWarning(0, 0, 0)).toBe('net')
  })

  it('net saglikli + x<=0 -> x', () => {
    expect(effectiveWarning(1000, 0, 5)).toBe('x')
    expect(effectiveWarning(1000, -2, 5)).toBe('x')
  })

  it('net ve x saglikli + miktar<=0 -> miktar', () => {
    expect(effectiveWarning(1000, 3, 0)).toBe('miktar')
    expect(effectiveWarning(1000, 3, -1)).toBe('miktar')
  })

  it('ucu de saglikli -> null', () => {
    expect(effectiveWarning(1000, 3, 5)).toBeNull()
  })

  it('sinir degerler: 0.01 saglikli sayilir, 0 sayilmaz', () => {
    expect(effectiveWarning(0.01, 1, 1)).toBeNull()
    expect(effectiveWarning(0, 1, 1)).toBe('net')
  })
})

describe('effectiveWarning — TD-18: asgari ucret alti (Engin karari 2026-07-20)', () => {
  it('bordro + net esik altinda ise net-min-wage doner', () => {
    expect(effectiveWarning(20000, 1, 1, true, 28075.5)).toBe('net-min-wage')
  })

  it('ayni net esik altinda ama isBordro=false ise kontrol calismaz (null)', () => {
    expect(effectiveWarning(20000, 1, 1, false, 28075.5)).toBeNull()
  })

  it('esik henuz yuklenmemisse (null) kontrol atlanir', () => {
    expect(effectiveWarning(20000, 1, 1, true, null)).toBeNull()
  })

  it('X<=0 iken esik-alti net olsa bile x uyarisi kazanir (oncelik korunur)', () => {
    expect(effectiveWarning(20000, 0, 1, true, 28075.5)).toBe('x')
  })

  it('Miktar<=0 iken esik-alti net olsa bile miktar uyarisi kazanir', () => {
    expect(effectiveWarning(20000, 1, 0, true, 28075.5)).toBe('miktar')
  })

  it('net esige esit veya ustundeyse uyari yok (sinir degeri)', () => {
    expect(effectiveWarning(28075.5, 1, 1, true, 28075.5)).toBeNull()
    expect(effectiveWarning(30000, 1, 1, true, 28075.5)).toBeNull()
  })
})

describe('bordroAllowedUnits — TD-18', () => {
  it('bolum ve sabiti eler, gun/hafta/ay i korur', () => {
    const units = [
      { code: 'day' }, { code: 'week' }, { code: 'month' }, { code: 'episode' }, { code: 'flat' },
    ]
    expect(bordroAllowedUnits(units).map((u) => u.code)).toEqual(['day', 'week', 'month'])
  })
})
