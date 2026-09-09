// BOY: tek is = Oyuncular listesi panosunun getirme mantigi (kartta olan/olmayan ayrimi,
// gorev sirasi) - DOM/React/Supabase yok, sebep = person-groups.ts ile ayni saf modul deseni
// (KART 1600 M3b-3 GETIRME YOLU).
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { PersonLabel, DutyOption } from '../../../shared/supabase/person-label-service'

export interface PersonCardPresence {
  inCard: Record<string, boolean>
  missingCount: number
}

// Kartta sayilma olcutu: etiketin kimligini person_object_id olarak tasiyan en az bir
// AKTIF satir olmasi. rows zaten aktif satirlardir (useCardRows sorgusu is_active=true
// suzer), o yuzden burada ikinci bir aktiflik denetimi acilmaz.
export function personCardPresence(
  rows: readonly BudgetItemRow[],
  labels: readonly PersonLabel[],
): PersonCardPresence {
  const inCardIds = new Set<string>()
  for (const row of rows) {
    if (row.personObjectId) inCardIds.add(row.personObjectId)
  }
  const inCard: Record<string, boolean> = {}
  let missingCount = 0
  for (const label of labels) {
    const present = inCardIds.has(label.id)
    inCard[label.id] = present
    if (!present) missingCount += 1
  }
  return { inCard, missingCount }
}

// COKLU SATIR UYARISI (9 Eylul 2026): personCardPresence yalniz kisi FISINE bakar. Elle
// yazilmis fissiz bir satir (orn. sablon yer tutucusuna elle "Ahmet Yilmaz" yazilmis) bu
// denetime GORUNMEZ - ayni kisi sonra fisle getirilirse iki satir doger, sessiz cift sayim
// olusur (kart toplami ikisini de toplar, ozet yalniz fisliyi sayar). Bu islev GETIRME
// ENGELLEMEZ, yalniz kullaniciya haber verir - karar kullanicinindir.
// ESLESME BIREBIR: iki yandan bosluk kirpilir, sonra tam metin esitligi. Buyuk-kucuk harf
// katlamasi YOK, normallestirme YOK - bulanik eslestirme kirilgandir ve yanlis uyari,
// kullaniciya uyarilari gormezden gelmeyi ogretir. Bedeli bilerek kabul edildi: "ahmet yilmaz"
// ile "Ahmet Yılmaz" eslesmez, uyari cikmaz.
export function personNameCollisions(
  rows: readonly BudgetItemRow[],
  labels: readonly PersonLabel[],
): Record<string, boolean> {
  const namelessRowNames = new Set(rows.filter((r) => !r.personObjectId).map((r) => r.name.trim()))
  const collisions: Record<string, boolean> = {}
  for (const label of labels) {
    collisions[label.id] = namelessRowNames.has(label.name.trim())
  }
  return collisions
}

// Sira dutyOptions'in kendi sirasidir. Ayni gorev icinde gelis sirasi korunur (istikrarli
// siralama). Gorevi bos olanlar (ve dutyOptions'ta karsiligi olmayan bilinmeyen kod) sona duser.
export function sortPersonsByDuty(
  labels: readonly PersonLabel[],
  dutyOptions: readonly DutyOption[],
): PersonLabel[] {
  const orderByCode = new Map(dutyOptions.map((d, i) => [d.catalogCode, i]))
  return labels
    .map((label, index) => ({ label, index }))
    .sort((a, b) => {
      const ra = a.label.dutyCode !== null ? (orderByCode.get(a.label.dutyCode) ?? Infinity) : Infinity
      const rb = b.label.dutyCode !== null ? (orderByCode.get(b.label.dutyCode) ?? Infinity) : Infinity
      if (ra !== rb) return ra - rb
      return a.index - b.index
    })
    .map((x) => x.label)
}
