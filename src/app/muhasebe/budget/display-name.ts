// BU ISLEV GOSTERILECEK ADIN TEK KAYNAGIDIR. Disa aktarma, icmal ve muhur yazildiginda
// budget_items.name'i DOGRUDAN okumaz, bu islevi cagirir. Sebep: satirda saklanan ad
// atomun adidir (Basrol Oyuncu), oyuncunun adi degil; iki ayri yol iki ayri ad uretirse
// ekranla kagit ayrisir.
// BOY: tek is = AD YERLESIMI kararinin (BUTCE-EKRAN-KARARLARI bolum 20) saf hesabi -
// DOM/React/Supabase yok.
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { PersonLabel } from '../../../shared/supabase/person-label-service'

export interface ItemDisplayName {
  text: string
  editable: boolean
}

// Dort hal (AD YERLESIMI, 3 Eylul + 9 Eylul UYGULAMA VE DUZELTME):
// 1) Katalog kodu GOREV atomu DEGILSE: satirin kendi adi, DUZENLENEBILIR (blok zaten kimin
//    oldugunu soyluyor - Mesai/Prova/Tekrar Telifi).
// 2) Gorev atomu ama kisi bagli DEGILSE: satirin kendi adi (sablon yer tutucusu), DUZENLENEBILIR.
// 3) Gorev atomu + kisi bagli + etiket listede VAR: etiketin adi, SALT OKUNUR.
// 4) Gorev atomu + kisi bagli + etiket listede YOK (bayat bag): satirin kendi adi,
//    DUZENLENEBILIR - parasi olan satir kimliksiz kalmasin, kullanici mudahale edebilsin.
export function itemDisplayName(
  item: Pick<BudgetItemRow, 'name' | 'catalogCode' | 'personObjectId'>,
  dutyCodes: ReadonlySet<string>,
  personNameById: ReadonlyMap<string, string>,
): ItemDisplayName {
  if (!dutyCodes.has(item.catalogCode)) return { text: item.name, editable: true }
  if (item.personObjectId === null) return { text: item.name, editable: true }
  const personName = personNameById.get(item.personObjectId)
  if (personName === undefined) return { text: item.name, editable: true }
  return { text: personName, editable: false }
}

// Ozet satirinin Ad hucresi: uc kademe, hepsi listeden - UYDURMA AD ATANMAZ.
// 1) Rol hanesi doluysa: rol adi ("Komiser Sukru").
// 2) Rol bos ama etiket listede varsa: oyuncunun gercek adi (uydurmuyoruz, yine listeden).
// 3) Etiket listede yoksa: bos - burada gercekten bilmiyoruz.
export function summaryDisplayName(
  personObjectId: string,
  labels: readonly Pick<PersonLabel, 'id' | 'name' | 'roleName'>[],
): string {
  const label = labels.find((l) => l.id === personObjectId)
  if (!label) return ''
  if (label.roleName) return label.roleName
  return label.name
}
