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
