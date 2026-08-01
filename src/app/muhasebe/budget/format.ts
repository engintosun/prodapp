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
