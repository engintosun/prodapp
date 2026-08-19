import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { DonemKalemi } from '../../../shared/cfe'

export function fmt(n: number): string {
  const dp = Number.isInteger(n) ? 0 : 2
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n)
}

// deriveBordroFields, motor hatasini tipli reason koduyla firlatir (bkz. budget-service.ts
// classifyBordroError); ham kod yerine kullaniciya kisa Turkce mesaj gosterilir.
export function bordroReasonMessage(reason: string): string {
  if (reason === 'invalid_net') return 'Net eksik'
  if (reason === 'no_periods') return 'Dönem verisi eksik'
  return 'Hesaplanamadı'
}

export function itemHasNote(it: BudgetItemRow): boolean {
  return Boolean((it.internalNote && it.internalNote.trim()) || (it.publicNote && it.publicNote.trim()))
}

// AIDIYET-2b-1 (BUTCE-EKRAN-KARARLARI bolum 19): baslik degistirme dugmesi YALNIZ elle
// girilen (serbest) kalemlerde gorunur. Kutuphane kaleminde HIC CIZILMEZ - soluk/disabled
// birakilmaz (Engin karari: ayni soluk hal not dugmesinde "bos ama yapilabilir" anlamina
// geliyor, ikinci bir anlama gelmemeli).
export function canChangeHeading(it: { libraryItemId: string | null }): boolean {
  return it.libraryItemId === null
}

export function isMultiPeriod(it: BudgetItemRow): boolean {
  return Object.keys(it.periodQty).length > 1
}

// Tek-donem (0 veya 1) modunda ana satir kendi degerlerini parametre olarak kullanir;
// cok-donem modunda her donem-satiri kendi override/kalitim degerleriyle ozerk.
export function buildDonemler(it: BudgetItemRow): DonemKalemi[] {
  if (!isMultiPeriod(it)) {
    return [{ net: it.unitNet, qty: it.multiplier, carpan: it.repeat }]
  }
  return Object.keys(it.periodQty).map((sid) => ({
    net: it.periodNet[sid] ?? it.unitNet,
    qty: it.periodQty[sid],
    carpan: it.periodRepeat[sid] ?? it.repeat,
  }))
}

export function summarizeSame<T>(stageIds: string[], pick: (sid: string) => T): T | null {
  if (stageIds.length === 0) return null
  const vals = stageIds.map(pick)
  return vals.every((v) => v === vals[0]) ? vals[0] : null
}

export function fieldVal(buf: string | undefined, n: number): string {
  return buf !== undefined ? buf : String(n)
}

export function repeatVal(buf: string | undefined, n: number): string {
  return buf !== undefined ? buf : String(n)
}

export function periodVal(buf: string | undefined, n: number): string {
  return buf !== undefined ? buf : String(n)
}

export function periodNetVal(buf: string | undefined, override: number | null | undefined, unitNet: number): string {
  if (buf !== undefined) return buf
  return override != null ? String(override) : String(unitNet)
}

export function periodRepeatVal(buf: string | undefined, override: number | null | undefined, repeat: number): string {
  if (buf !== undefined) return buf
  return override != null ? String(override) : String(repeat)
}

// PARSE GUVENCESI (K10 revize + TD-16, 2026-07-18): sayiya cevrilemeyen veya bos taslak
// gecersizdir - null doner. Cagiran taraf (commit yolu, use-edit-buffers.ts) null gorunce
// ESKI (kasadaki/saved) degeri korur, servise hic gitmez. 0 GECERLI sayidir (TD-14 sifir-net
// gostergesi tam bunu yakalar) - bos ('') ile 0 AYNI SEY DEGILDIR. NOKTA her zaman gecersizdir:
// tr-TR bicimde (fmt()) nokta binlik ayracidir, ondalik ayirici YALNIZ virguldur - '1.500'i
// 1.5 okumak sessiz veri bozulmasi olurdu, o yuzden nokta iceren taslak dogrudan reddedilir.
export function parseNumericDraft(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  if (trimmed.includes('.')) return null
  const n = Number(trimmed.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export type ValueWarning = 'net' | 'net-min-wage' | 'x' | 'miktar' | null

// TD-14 UCUNCU DUZELTME (2026-07-18, Engin karari): Net'ten Miktar/X'e genisledi. Uc alan da
// ayni kurala tabi - KAAPA harcanacak parayi hesaplar, 0 hesaplanacak bir rakam degildir.
// Oncelik net > x > miktar: ayni anda birden fazlasi bozuksa EN TEMEL sorun gosterilir (once
// net dogru olmali, sonra kac kisi/adet [X], sonra ne kadar sure [Miktar]).
// TD-18 (Engin karari 2026-07-20): asgari-alti kontrolu EN SONA eklendi (net>x>miktar sirasindan
// SONRA) - X veya Miktar zaten <=0 ise kimse/sure yok demektir, maas karsilastirmasi anlamsizlasir,
// bu yuzden bastirilir. isBordro=false veya threshold=null (henuz yuklenmedi) ise kontrol hic
// calismaz - ikisi de varsayilan deger tasir, eski 3-parametreli cagrilar (mevcut testler dahil)
// DEGISMEDEN calismaya devam eder.
export function effectiveWarning(
  net: number,
  x: number,
  miktar: number,
  isBordro = false,
  minWageThreshold: number | null = null,
): ValueWarning {
  if (net <= 0) return 'net'
  if (x <= 0) return 'x'
  if (miktar <= 0) return 'miktar'
  if (isBordro && minWageThreshold !== null && net < minWageThreshold) return 'net-min-wage'
  return null
}

// TD-18 (Engin karari 2026-07-20): Bordro sure uzerinden hesaplanir (SGK prim gun sayisi kanunen
// tam gun ister). Bolum degisken sureli (sabit gun sayisi YOK) ve sabit sure kavrami hic tasimiyor -
// ikisi de bordroda Birim secimine SUNULMAZ. Gecmis veri yok (sistem sifirdan kuruluyor), bu yuzden
// "mevcut secili degeri koru" inceligine gerek YOK - kosulsuz filtre yeterli.
export function bordroAllowedUnits<T extends { code: string }>(units: T[]): T[] {
  return units.filter((u) => u.code !== 'episode' && u.code !== 'flat')
}

// D3b-2a — Kutuphane eslesmesi (BUTCE-EKRAN-KARARLARI bolum 16): Turkce-duyarsiz + ICEREN
// eslesme + es-ad taramasi. SAF fonksiyon: DOM/servis bilmez, listeyi cagiran taraf tutar.

// Turkce harf katlamasi: I/İ/ı/i ayrimi ARANIRKEN kaldirilir ("asıstan" -> "asistan"i bulur).
// toLocaleLowerCase('tr') TEK BASINA YETMEZ: 'I'.toLocaleLowerCase('tr') = 'ı' verir ve 'i' ile
// eslesmez - bu yuzden ONCE katlanir, SONRA kucultulur.
const SEARCH_FOLD: Record<string, string> = {
  'ı': 'i', 'İ': 'i', 'I': 'i',
  'ş': 's', 'Ş': 's',
  'ğ': 'g', 'Ğ': 'g',
  'ü': 'u', 'Ü': 'u',
  'ö': 'o', 'Ö': 'o',
  'ç': 'c', 'Ç': 'c',
}

export function normalizeForSearch(s: string): string {
  return s.replace(/[ıİIşŞğĞüÜöÖçÇ]/g, (ch) => SEARCH_FOLD[ch] ?? ch).toLowerCase()
}

// Bos sorgu = SUZME YOK, tum liste doner. Dropdown'un ne zaman ACILACAGI cagiran tarafin
// karari, bu fonksiyonun konusu degil. Donen kayit KANONIK nesnedir - es-ad uzerinden bulunsa
// bile ekranda gosterilecek metin item.name'dir (bolum 16). Siralama kutuphaneden geldigi gibi
// korunur (katalog kodu sirasi); puanlama/yeniden-siralama YOK.
export function matchLibraryItems<T extends { name: string; aliases: string[] }>(
  items: T[],
  query: string,
): T[] {
  const q = normalizeForSearch(query.trim())
  if (q === '') return items
  return items.filter(
    (it) =>
      normalizeForSearch(it.name).includes(q) ||
      it.aliases.some((a) => normalizeForSearch(a).includes(q)),
  )
}

// D3c-2 (BUTCE-EKRAN-KARARLARI bolum 16 AYIKLAMA KURALI + DEVRALMA): oda listesi artik
// kutuphane + kartin MEVCUT serbest kalemlerinden kurulur. SAF fonksiyon: DOM/servis bilmez.
export interface RoomOption {
  key: string
  name: string
  aliases: string[]
  source: 'library' | 'card'
  catalogCode: string
  paymentStatus: string
  unitCode: string
}

export function buildRoomOptions(
  library: { id: string; catalogCode: string; name: string; aliases: string[]; defaultPaymentStatus: string; defaultUnitCode: string }[],
  rows: { catalogCode: string | null; libraryItemId: string | null; name: string; paymentStatusCode: string; unitCode: string; sortNo: number }[],
): RoomOption[] {
  const libraryOptions: RoomOption[] = library
    .slice()
    .sort((a, b) => a.catalogCode.localeCompare(b.catalogCode))
    .map((it) => ({
      key: it.catalogCode,
      name: it.name,
      aliases: it.aliases,
      source: 'library',
      catalogCode: it.catalogCode,
      paymentStatus: it.defaultPaymentStatus,
      unitCode: it.defaultUnitCode,
    }))

  // AYIKLAMA KURALI: libraryItemId dolu satirlar ATLANIR (karsiligi kutuphane adiyla zaten
  // listede var, "gorunen ad kanonik" karari geregi). DEVRALMA: ayni kodda birden fazla serbest
  // satir varsa ILK DOGAN (sortNo en kucuk) esas alinir.
  const firstByCode = new Map<string, { name: string; paymentStatus: string; unitCode: string; sortNo: number }>()
  for (const r of rows) {
    if (r.libraryItemId !== null) continue
    if (r.catalogCode === null) continue
    // Statu veya birim kodu cozulemeyen satir listeye HIC GIRMEZ (sunucuda "Birim bulunamadi"
    // gibi belirsiz bir hataya dusmek yerine, secenek zaten hic gorunmez).
    if (!r.paymentStatusCode || !r.unitCode) continue
    const existing = firstByCode.get(r.catalogCode)
    if (!existing || r.sortNo < existing.sortNo) {
      firstByCode.set(r.catalogCode, {
        name: r.name,
        paymentStatus: r.paymentStatusCode,
        unitCode: r.unitCode,
        sortNo: r.sortNo,
      })
    }
  }
  const cardOptions: RoomOption[] = Array.from(firstByCode.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([code, v]) => ({
      key: code,
      name: v.name,
      aliases: [],
      source: 'card',
      catalogCode: code,
      paymentStatus: v.paymentStatus,
      unitCode: v.unitCode,
    }))

  return [...libraryOptions, ...cardOptions]
}

// D3c-3 (BUTCE-EKRAN-KARARLARI bolum 16 + 202): odada yazilan ad, BU BUTCEDEKI baska bir kartin
// kutuphanesinde TAM AD ile (Turkce-duyarsiz) varsa o kartin adini dondurur. TAM AD tercihi
// (Engin tereddutlu kabul, 1 Agustos 2026): bu satirin isi arama degil, mukerrer kalemden
// dondurmek - ICEREN kullanilirsa kismi metin eslesmeleri gurultu uretir. Arama YALNIZ bu
// butcede duran kartlarla sinirlidir (cards parametresi) - sablonda olmayan kartin adi yoktur
// ve kullanicinin gidebilecegi bir yer de yoktur, o durumda mesaj hic cikmaz.
export function findCrossCardMatches(
  query: string,
  library: { catalogCode: string; name: string; aliases: string[]; isGroup: boolean }[],
  currentCardCode: string,
  cards: { cardCode: string; name: string }[],
): string[] {
  const q = normalizeForSearch(query.trim())
  if (q === '') return []

  const currentPrefix = currentCardCode.slice(0, 2)
  const matchesPrefix = (prefix: string) =>
    library.some(
      (it) =>
        !it.isGroup &&
        it.catalogCode.slice(0, 2) === prefix &&
        (normalizeForSearch(it.name) === q || it.aliases.some((a) => normalizeForSearch(a) === q)),
    )

  const result: string[] = []
  for (const c of cards) {
    const prefix = c.cardCode.slice(0, 2)
    if (prefix === currentPrefix) continue
    if (matchesPrefix(prefix)) result.push(c.name)
  }
  return result
}

// DILIM 1100-B (BUTCE-EKRAN-KARARLARI bolum 19) + AIDIYET-2a: bir kalemin hangi basliga
// ait oldugu TEK BU FONKSIYONDAN okunur. Cevap artik budget_items.heading_code alanidir;
// kod ayristirma YOK. Aidiyet veri oldu, turetme degil - serbest bir kalem (1198-nn) da
// bir basligin altinda durabilir, kutuphane kalemi de Basliksiz kalabilir. null = aidiyet
// yok (KART 1500 gibi kutuphanesinde hic baslik satiri olmayan kartlar, ve kullanicinin
// henuz baslik secmedigi serbest kalemler).
export function headingKeyOf(it: { headingCode: string | null }): string | null {
  return it.headingCode
}

// heading === null ise o grup icin BASLIK SATIRI CIZILMEZ (kartin kutuphanesinde hic
// baslik yok — KART 1500 duz liste, bolum 19). heading.key === null ise BASLIKSIZ
// blogudur: baslik satiri cizilir, adi Basliksiz.
export interface HeadingGroup {
  heading: { key: string | null; name: string } | null
  rows: BudgetItemRow[]
}

// SIRALAMA YAPILMAZ. rows zaten katalog kodu sirasinda gelir (fn_add_budget_item her
// eklemede kartin tamamini catalog_code, item_code sirasina gore yeniden numaralar);
// bu fonksiyon satirlarin SIRASINI DEGISTIRMEZ, yalniz gruplara boler. Kalemi olmayan
// baslik CIZILMEZ (Engin karari 18 Agustos 2026: bolum 19 "kalem listesi basliklara gore
// BOLUNUR" der, kalemi olmayan baslik bir bolme uretmez; silinen kalem kutuphaneden geri
// cagrilabildigi icin kayip degildir). Basliksiz blogu EN SONA gelir ve yalniz doluysa cizilir.
export function groupRowsByHeading(
  rows: BudgetItemRow[],
  headings: { catalogCode: string; name: string }[],
): HeadingGroup[] {
  if (headings.length === 0) {
    return rows.length === 0 ? [] : [{ heading: null, rows }]
  }
  const known = new Set(headings.map((h) => h.catalogCode))
  const byKey = new Map<string, BudgetItemRow[]>()
  const orphans: BudgetItemRow[] = []
  for (const r of rows) {
    const key = headingKeyOf(r)
    if (key !== null && known.has(key)) {
      const bucket = byKey.get(key)
      if (bucket) bucket.push(r)
      else byKey.set(key, [r])
    } else {
      orphans.push(r)
    }
  }
  const groups: HeadingGroup[] = []
  for (const h of headings) {
    const bucket = byKey.get(h.catalogCode)
    if (bucket && bucket.length > 0) {
      groups.push({ heading: { key: h.catalogCode, name: h.name }, rows: bucket })
    }
  }
  if (orphans.length > 0) {
    groups.push({ heading: { key: null, name: 'Başlıksız' }, rows: orphans })
  }
  return groups
}
