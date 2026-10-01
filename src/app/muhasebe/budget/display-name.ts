// BU ISLEV GOSTERILECEK ADIN TEK KAYNAGIDIR. Disa aktarma, icmal ve muhur yazildiginda
// budget_items.name'i DOGRUDAN okumaz, bu islevi cagirir. Sebep: satirda saklanan ad
// atomun adidir (Basrol Oyuncu), oyuncunun adi degil; iki ayri yol iki ayri ad uretirse
// ekranla kagit ayrisir.
// BOY: tek is = AD YERLESIMI kararinin (BUTCE-EKRAN-KARARLARI bolum 20) saf hesabi -
// DOM/React/Supabase yok.
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { PersonLabel } from '../../../shared/supabase/person-label-service'
import { COMMISSION_CATALOG_BY_KIND } from './person-groups'

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

// Turetilmis (komisyon) satirin Ad hucresi (9 Eylul 2026, KOMISYON SATIRININ DOGUMU - TEMSILCI
// SAYISI KADAR SATIR; 12 Eylul 2026'da cins statuden ATOMA tasindi). Iki komisyon atomu var
// (1618 Ajans, 1618-01 Menajer); cins artik CATALOG KODUNDAN okunur, statuye BAKILMAZ - statu
// kullanici tarafindan degistirilebilir bir vergi hanesidir, kimlik tasiyamaz. Esleme TEK yerde
// yasar (person-groups.ts COMMISSION_CATALOG_BY_KIND), buradan IMPORT edilir - ikinci bir kopya
// acilmaz. O cinsin adi (ajansName/managerName) doluysa "<atom adi> — <ad>" SALT OKUNUR gorunur;
// adi bos ise (tik var, ad hanesi bos) duz atom adi DUZENLENEBILIR kalir. Ad SAKLANMAZ, listeden
// okunur - bu dosyanin basindaki TEK KAYNAK kurali burada da gecerlidir.
export function commissionDisplayName(
  item: Pick<BudgetItemRow, 'name' | 'catalogCode'>,
  label: Pick<PersonLabel, 'agencyName' | 'managerName'> | undefined,
): ItemDisplayName {
  const repName = item.catalogCode === COMMISSION_CATALOG_BY_KIND.menajer ? label?.managerName : label?.agencyName
  if (repName) return { text: `${item.name} — ${repName}`, editable: false }
  return { text: item.name, editable: true }
}

// Ozet satirinin Ad hucresi: dort kademe, hepsi listeden - UYDURMA AD ATANMAZ.
// 1) Rol hanesi doluysa: rol adi (Komiser Sukru).
// 2) Rol bos ama gorev kodu listede karsiligi olan bir gorevse: GOREV ADI (Basrol Oyuncu).
//    18 Eylul 2026 (Engin karari): blok bir GOREVI, icindeki kalem o gorevi yapan KISIYI
//    gosterir. Eskiden bu kademe yoktu ve rol bosken ozet ile kalem ayni adi tasiyordu.
// 3) Rol ve gorev yoksa: oyuncunun gercek adi - kapali blok kimliksiz kalmasin.
// 4) Etiket listede yoksa: bos - burada gercekten bilmiyoruz.
export function summaryDisplayName(
  personObjectId: string,
  labels: readonly Pick<PersonLabel, 'id' | 'name' | 'roleName' | 'dutyCode'>[],
  dutyNameByCode: ReadonlyMap<string, string>,
): string {
  const label = labels.find((l) => l.id === personObjectId)
  if (!label) return ''
  if (label.roleName) return label.roleName
  const dutyName = label.dutyCode === null ? undefined : dutyNameByCode.get(label.dutyCode)
  if (dutyName) return dutyName
  return label.name
}

// SATIRIN GORUNEN ADI TEK KARARDA (24 Eylul 2026, Engin karari): satirin Ad hucresi ve pencere
// basliklari (Yasal Yuk dokumu, Not) AYNI adi tasir. Turetilmis (komisyon) satir deriveRate
// dolu olan satirdir ve commissionDisplayName'e gider; digerleri itemDisplayName'e. Bu secim
// eskiden yalniz item-row.tsx icinde yaziliydi; pencere basligi kalemin kayitli adini (gorev
// adi) basiyordu.
// 1500 Dilim 2: anchorName verilirse once o doner (yonetmen satiri).
export function rowDisplayName(
  item: Pick<BudgetItemRow, 'name' | 'catalogCode' | 'personObjectId' | 'deriveRate'>,
  dutyCodes: ReadonlySet<string>,
  personNameById: ReadonlyMap<string, string>,
  personLabelById: ReadonlyMap<string, Pick<PersonLabel, 'agencyName' | 'managerName'>>,
  anchorName?: string,
): ItemDisplayName {
  // YONETMEN SATIRI (1 Ekim 2026): adi anchorNames kurar, cagiran hazir verir. 2a-2'de SALT
  // OKUNUR; kisi adi yazma yolu 2a-3'te acilir.
  if (anchorName !== undefined) return { text: anchorName, editable: false }
  if (item.deriveRate !== null) {
    return commissionDisplayName(item, item.personObjectId ? personLabelById.get(item.personObjectId) : undefined)
  }
  return itemDisplayName(item, dutyCodes, personNameById)
}

// YONETMEN BLOGUNUN ADLARI - TEK KAYNAK (1 Ekim 2026, KART-KATALOGU 7.4 Karar 2, 7, 10).
// Gorev adi ve ek KUTUPHANEDEN gelir; satirda saklanan ad okunmaz (eski ve karaktersiz adlar
// ekrana cikmasin). Kutuphanede kaydi bulunamayan capa satirin kendi adina duser.
// - Ozet satiri: gorev adi; isimsiz capa numarali olabilir.
// - Ozetli capanin Ad hucresi: (kisi adi, yoksa gorev adi) + bosluk + ek ("Ayse Yilmaz Hizmet Bedeli").
// - Ozetsiz capanin Ad hucresi: gorev adi, numarali olabilir.
// - Kime? adi: kisi adi, yoksa gorev adi, numarali olabilir.
// NUMARA (Karar 10): ayni katalog kodunda iki ve daha fazla ISIMSIZ capa varsa isimsizler satir
// sirasiyla 1'den numaralanir; tek isimsiz capa numara almaz. Numara SAKLANMAZ.
export interface AnchorLibraryEntry {
  catalogCode: string
  name: string
  nameSuffix: string | null
  attachesTo: string[]
}

export interface AnchorNames {
  rowName: Map<string, string>
  summaryName: Map<string, string>
  whoName: Map<string, string>
}

export function anchorNames(
  rows: readonly Pick<BudgetItemRow, 'id' | 'catalogCode' | 'name' | 'personName'>[],
  anchorCodes: ReadonlySet<string>,
  library: readonly Pick<AnchorLibraryEntry, 'catalogCode' | 'name' | 'nameSuffix'>[],
  summaryAnchors: ReadonlySet<string>,
): AnchorNames {
  const libByCode = new Map(library.map((l) => [l.catalogCode, l] as const))
  const anchors = rows.filter((r) => anchorCodes.has(r.catalogCode))
  const unnamedByCode = new Map<string, string[]>()
  for (const a of anchors) {
    if (a.personName !== null) continue
    const bucket = unnamedByCode.get(a.catalogCode)
    if (bucket) bucket.push(a.id)
    else unnamedByCode.set(a.catalogCode, [a.id])
  }
  const rowName = new Map<string, string>()
  const summaryName = new Map<string, string>()
  const whoName = new Map<string, string>()
  for (const a of anchors) {
    const lib = libByCode.get(a.catalogCode)
    const duty = lib?.name ?? a.name
    const suffix = lib?.nameSuffix ?? null
    const unnamed = unnamedByCode.get(a.catalogCode) ?? []
    const numbered = a.personName === null && unnamed.length >= 2 ? duty + ' ' + (unnamed.indexOf(a.id) + 1) : duty
    whoName.set(a.id, a.personName ?? numbered)
    if (summaryAnchors.has(a.id)) {
      summaryName.set(a.id, a.personName === null ? numbered : duty)
      const head = a.personName ?? duty
      rowName.set(a.id, suffix ? head + ' ' + suffix : head)
    } else {
      rowName.set(a.id, numbered)
    }
  }
  return { rowName, summaryName, whoName }
}
