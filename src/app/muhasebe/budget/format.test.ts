import { describe, it, expect } from 'vitest'
import { parseNumericDraft, effectiveWarning, bordroAllowedUnits, normalizeForSearch, matchLibraryItems, buildRoomOptions, findCrossCardMatches, headingKeyOf, groupRowsByHeading } from './format'
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'

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

describe('buildRoomOptions (D3c-2 — AYIKLAMA KURALI + DEVRALMA)', () => {
  const LIBRARY = [
    { id: 'l1', catalogCode: '1501', name: 'Yönetmen Kaşesi', aliases: [], defaultPaymentStatus: 'sirket', defaultUnitCode: 'day' },
    { id: 'l2', catalogCode: '1502', name: 'Koreograf', aliases: ['Coreographer'], defaultPaymentStatus: 'bordro', defaultUnitCode: 'day' },
  ]

  it('kutuphane satirlari listeye oldugu gibi girer', () => {
    const r = buildRoomOptions(LIBRARY, [])
    expect(r.map((o) => ({ key: o.key, source: o.source, name: o.name }))).toEqual([
      { key: '1501', source: 'library', name: 'Yönetmen Kaşesi' },
      { key: '1502', source: 'library', name: 'Koreograf' },
    ])
  })

  it('libraryItemId dolu kart satiri listeye GIRMEZ (ikizlenme yok)', () => {
    const rows = [
      { catalogCode: '1501', libraryItemId: 'l1', name: 'Yönetmen Kaşesi', paymentStatusCode: 'sirket', unitCode: 'day', sortNo: 10 },
    ]
    const r = buildRoomOptions(LIBRARY, rows)
    expect(r).toHaveLength(2)
    expect(r.every((o) => o.source === 'library')).toBe(true)
  })

  it('serbest kalem listeye girer, statu ve birimi kendi satirindan gelir', () => {
    const rows = [
      { catalogCode: '1598-01', libraryItemId: null, name: 'Drone Operatoru', paymentStatusCode: 'bordro', unitCode: 'week', sortNo: 5 },
    ]
    const r = buildRoomOptions(LIBRARY, rows)
    const card = r.find((o) => o.source === 'card')
    expect(card).toEqual({
      key: '1598-01',
      name: 'Drone Operatoru',
      aliases: [],
      source: 'card',
      catalogCode: '1598-01',
      paymentStatus: 'bordro',
      unitCode: 'week',
    })
  })

  it('ayni kodda iki serbest satir varsa TEK secenek doner, devralinan statu/birim sortNo kucuk olandan gelir', () => {
    const rows = [
      { catalogCode: '1598-01', libraryItemId: null, name: 'Drone Operatoru', paymentStatusCode: 'bordro', unitCode: 'week', sortNo: 20 },
      { catalogCode: '1598-01', libraryItemId: null, name: 'Drone Operatoru - Ali', paymentStatusCode: 'sirket', unitCode: 'day', sortNo: 5 },
    ]
    const r = buildRoomOptions(LIBRARY, rows)
    const cardOptions = r.filter((o) => o.source === 'card')
    expect(cardOptions).toHaveLength(1)
    expect(cardOptions[0].paymentStatus).toBe('sirket')
    expect(cardOptions[0].unitCode).toBe('day')
    expect(cardOptions[0].name).toBe('Drone Operatoru - Ali')
  })

  it('catalogCode null serbest satir atlanir', () => {
    const rows = [
      { catalogCode: null, libraryItemId: null, name: 'Hayalet Satir', paymentStatusCode: 'sirket', unitCode: 'day', sortNo: 1 },
    ]
    const r = buildRoomOptions(LIBRARY, rows)
    expect(r.some((o) => o.name === 'Hayalet Satir')).toBe(false)
  })

  it('statu veya birim kodu cozulemeyen (bos string) serbest satir listeye HIC GIRMEZ', () => {
    const rowsNoStatus = [
      { catalogCode: '1598-01', libraryItemId: null, name: 'Eksik Statu', paymentStatusCode: '', unitCode: 'day', sortNo: 1 },
    ]
    const rowsNoUnit = [
      { catalogCode: '1598-02', libraryItemId: null, name: 'Eksik Birim', paymentStatusCode: 'sirket', unitCode: '', sortNo: 1 },
    ]
    expect(buildRoomOptions(LIBRARY, rowsNoStatus).some((o) => o.name === 'Eksik Statu')).toBe(false)
    expect(buildRoomOptions(LIBRARY, rowsNoUnit).some((o) => o.name === 'Eksik Birim')).toBe(false)
  })

  it('matchLibraryItems RoomOption uzerinde calisir - es-ad ve Turkce-duyarsiz eslesme bozulmaz', () => {
    const rows = [
      { catalogCode: '1598-01', libraryItemId: null, name: 'Işık Ustası', paymentStatusCode: 'sirket', unitCode: 'day', sortNo: 1 },
    ]
    const options = buildRoomOptions(LIBRARY, rows)
    const byAlias = matchLibraryItems(options, 'coreographer')
    expect(byAlias.map((o) => o.name)).toEqual(['Koreograf'])
    const byFold = matchLibraryItems(options, 'isik')
    expect(byFold.map((o) => o.name)).toEqual(['Işık Ustası'])
  })
})

describe('findCrossCardMatches (D3c-3 — TAM AD, YALNIZ resmi kutuphane, kart bu butcede sinirli)', () => {
  const LIBRARY = [
    { catalogCode: '1501', name: 'Yönetmen Kaşesi', aliases: [], isGroup: false },
    { catalogCode: '2201', name: 'Işık Şefi', aliases: ['Gaffer'], isGroup: false },
  ]
  const CARDS = [
    { cardCode: '1500', name: 'Yönetmen' },
    { cardCode: '2200', name: 'Kamera' },
  ]

  it('baska kartta tam ad eslesmesi kart adini dondurur', () => {
    expect(findCrossCardMatches('Işık Şefi', LIBRARY, '1500', CARDS)).toEqual(['Kamera'])
  })

  it('ayni karttaki eslesme dondurulmez', () => {
    expect(findCrossCardMatches('Yönetmen Kaşesi', LIBRARY, '1500', CARDS)).toEqual([])
  })

  it('ICEREN eslesme dondurmez (kismi ad bos dizi)', () => {
    expect(findCrossCardMatches('Şefi', LIBRARY, '1500', CARDS)).toEqual([])
  })

  it('kart bu butcede yoksa bos dizi', () => {
    const cardsWithoutKamera = [{ cardCode: '1500', name: 'Yönetmen' }]
    expect(findCrossCardMatches('Işık Şefi', LIBRARY, '1500', cardsWithoutKamera)).toEqual([])
  })

  it('es-ad uzerinden eslesme kart adini dondurur', () => {
    expect(findCrossCardMatches('Gaffer', LIBRARY, '1500', CARDS)).toEqual(['Kamera'])
  })

  it('Turkce-duyarsiz eslesme (I/i, s/s) calisir', () => {
    expect(findCrossCardMatches('ISIK SEFI', LIBRARY, '1500', CARDS)).toEqual(['Kamera'])
  })

  it('bos sorgu bos dizi', () => {
    expect(findCrossCardMatches('', LIBRARY, '1500', CARDS)).toEqual([])
    expect(findCrossCardMatches('   ', LIBRARY, '1500', CARDS)).toEqual([])
  })

  it('baslik satiri (is_group) ayni ad+kart olsa da eslesme uretmez (DILIM 1100-A)', () => {
    const libraryWithGroup = [
      { catalogCode: '1101', name: 'Hikâye, Senaryo, Haklar', aliases: [], isGroup: true },
      { catalogCode: '1501', name: 'Yönetmen Kaşesi', aliases: [], isGroup: false },
    ]
    const cardsWithGeliistirme = [
      { cardCode: '1500', name: 'Yönetmen' },
      { cardCode: '1100', name: 'Proje Geliştirme ve Haklar' },
    ]
    expect(findCrossCardMatches('Hikâye, Senaryo, Haklar', libraryWithGroup, '1500', cardsWithGeliistirme)).toEqual([])
  })
})

function makeRow(catalogCode: string): BudgetItemRow {
  return { catalogCode } as unknown as BudgetItemRow
}

describe('headingKeyOf (DILIM 1100-B, BUTCE-EKRAN-KARARLARI bolum 19)', () => {
  it('tireli kod -> tire oncesi parca', () => {
    expect(headingKeyOf({ catalogCode: '1101-04' })).toBe('1101')
  })

  it('tiresiz kod (KART 1500) -> null', () => {
    expect(headingKeyOf({ catalogCode: '1501' })).toBeNull()
  })

  it('kod null -> null', () => {
    expect(headingKeyOf({ catalogCode: null })).toBeNull()
  })
})

describe('groupRowsByHeading (DILIM 1100-B, BUTCE-EKRAN-KARARLARI bolum 19)', () => {
  it('baslik listesi BOS: tek grup doner, heading null, satir sirasi korunur (KART 1500 duz liste)', () => {
    const rows = [makeRow('1501'), makeRow('1503'), makeRow('1502')]
    const groups = groupRowsByHeading(rows, [])
    expect(groups).toHaveLength(1)
    expect(groups[0].heading).toBeNull()
    expect(groups[0].rows.map((r) => r.catalogCode)).toEqual(['1501', '1503', '1502'])
  })

  it('baslik listesi bos VE satir bos: bos dizi doner', () => {
    expect(groupRowsByHeading([], [])).toEqual([])
  })

  it('kalemi olmayan baslik gruplara GIRMEZ', () => {
    const rows = [makeRow('1101-01')]
    const headings = [
      { catalogCode: '1101', name: 'Hikâye, Senaryo, Haklar' },
      { catalogCode: '1102', name: 'Yapımcılık' },
    ]
    const groups = groupRowsByHeading(rows, headings)
    expect(groups).toHaveLength(1)
    expect(groups[0].heading?.key).toBe('1101')
  })

  it('gruplar baslik listesinin sirasinda doner, grup icindeki satirlarin sirasi korunur', () => {
    const rows = [makeRow('1102-02'), makeRow('1101-01'), makeRow('1101-02'), makeRow('1102-01')]
    const headings = [
      { catalogCode: '1101', name: 'Hikâye, Senaryo, Haklar' },
      { catalogCode: '1102', name: 'Yapımcılık' },
    ]
    const groups = groupRowsByHeading(rows, headings)
    expect(groups.map((g) => g.heading?.key)).toEqual(['1101', '1102'])
    expect(groups[0].rows.map((r) => r.catalogCode)).toEqual(['1101-01', '1101-02'])
    expect(groups[1].rows.map((r) => r.catalogCode)).toEqual(['1102-02', '1102-01'])
  })

  it('eslesmeyen kod EN SONDAKI Basliksiz grubuna duser, adi tam olarak Başlıksız', () => {
    const rows = [makeRow('1101-01'), makeRow('1198-01')]
    const headings = [{ catalogCode: '1101', name: 'Hikâye, Senaryo, Haklar' }]
    const groups = groupRowsByHeading(rows, headings)
    expect(groups).toHaveLength(2)
    const last = groups[groups.length - 1]
    expect(last.heading?.key).toBeNull()
    expect(last.heading?.name).toBe('Başlıksız')
    expect(last.rows.map((r) => r.catalogCode)).toEqual(['1198-01'])
  })

  it('her satir bir basliga esleiyorsa Basliksiz grubu HIC olusmaz', () => {
    const rows = [makeRow('1101-01'), makeRow('1102-01')]
    const headings = [
      { catalogCode: '1101', name: 'Hikâye, Senaryo, Haklar' },
      { catalogCode: '1102', name: 'Yapımcılık' },
    ]
    const groups = groupRowsByHeading(rows, headings)
    expect(groups.some((g) => g.heading?.key === null)).toBe(false)
  })
})
