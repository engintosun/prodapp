import { describe, it, expect } from 'vitest'
import { parseNumericDraft, effectiveWarning, bordroAllowedUnits, normalizeForSearch, matchLibraryItems } from './format'

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

describe('normalizeForSearch', () => {
  it('İ -> i', () => {
    expect(normalizeForSearch('İ')).toBe('i')
  })

  it('I -> i', () => {
    expect(normalizeForSearch('I')).toBe('i')
  })

  it('ı -> i', () => {
    expect(normalizeForSearch('ı')).toBe('i')
  })

  it('Ş -> s, ş -> s', () => {
    expect(normalizeForSearch('Ş')).toBe('s')
    expect(normalizeForSearch('ş')).toBe('s')
  })

  it('Ğ -> g', () => {
    expect(normalizeForSearch('Ğ')).toBe('g')
  })

  it('Ü -> u', () => {
    expect(normalizeForSearch('Ü')).toBe('u')
  })

  it('Ö -> o', () => {
    expect(normalizeForSearch('Ö')).toBe('o')
  })

  it('Ç -> c', () => {
    expect(normalizeForSearch('Ç')).toBe('c')
  })

  it('Isik Sefi -> isik sefi', () => {
    expect(normalizeForSearch('Işık Şefi')).toBe('isik sefi')
  })

  it('Turkce olmayan metin bozulmadan kucultulur', () => {
    expect(normalizeForSearch('Gaffer')).toBe('gaffer')
  })
})

describe('matchLibraryItems', () => {
  const FIXTURE = [
    { name: 'Yönetmen Özel Asistanı', aliases: [] },
    { name: 'Işık Şefi', aliases: ['Gaffer'] },
    { name: 'Koreograf', aliases: [] },
  ]

  it('asistan -> yalniz Yonetmen Ozel Asistani (ICEREN eslesme, bastan degil)', () => {
    const r = matchLibraryItems(FIXTURE, 'asistan')
    expect(r.map((i) => i.name)).toEqual(['Yönetmen Özel Asistanı'])
  })

  it('ASISTAN -> ayni sonuc (buyuk harf duyarsiz)', () => {
    const r = matchLibraryItems(FIXTURE, 'ASISTAN')
    expect(r.map((i) => i.name)).toEqual(['Yönetmen Özel Asistanı'])
  })

  it('asıstan -> ayni sonuc (i/i katlamasi)', () => {
    const r = matchLibraryItems(FIXTURE, 'asıstan')
    expect(r.map((i) => i.name)).toEqual(['Yönetmen Özel Asistanı'])
  })

  it('ASİSTAN -> ayni sonuc (İ katlamasi)', () => {
    const r = matchLibraryItems(FIXTURE, 'ASİSTAN')
    expect(r.map((i) => i.name)).toEqual(['Yönetmen Özel Asistanı'])
  })

  it('gaffer -> Isik Sefi doner (es-ad uzerinden bulunur, donen nesne KANONIK)', () => {
    const r = matchLibraryItems(FIXTURE, 'gaffer')
    expect(r).toHaveLength(1)
    expect(r[0].name).toBe('Işık Şefi')
  })

  it('ısık -> Isik Sefi doner (i/i + s/s katlamasi birlikte)', () => {
    const r = matchLibraryItems(FIXTURE, 'ısık')
    expect(r.map((i) => i.name)).toEqual(['Işık Şefi'])
  })

  it('bos sorgu -> tum liste (3 kayit, sira korunur)', () => {
    const r = matchLibraryItems(FIXTURE, '')
    expect(r.map((i) => i.name)).toEqual(['Yönetmen Özel Asistanı', 'Işık Şefi', 'Koreograf'])
  })

  it('yalniz bosluk -> tum liste (bos sorgu sayilir)', () => {
    const r = matchLibraryItems(FIXTURE, '   ')
    expect(r.map((i) => i.name)).toEqual(['Yönetmen Özel Asistanı', 'Işık Şefi', 'Koreograf'])
  })

  it('xyzq -> bos dizi', () => {
    expect(matchLibraryItems(FIXTURE, 'xyzq')).toEqual([])
  })

  it('tek harf a -> iceren tum kayitlar (minimum uzunluk sarti yok)', () => {
    const r = matchLibraryItems(FIXTURE, 'a')
    expect(r.map((i) => i.name)).toEqual(['Yönetmen Özel Asistanı', 'Işık Şefi', 'Koreograf'])
  })
})
