// BU DOSYA LISTE BOLMESININ TEK KAYNAGIDIR. Uretim Kayitlari listesi kisileri bolmelere ayirir
// ve her bolmenin basina baslik satiri cizer (BUTCE-EKRAN-KARARLARI bolum 20, LISTE KARTIN
// BASLIK HIYERARSISINE GORE DIZILIR, 10 Eylul 2026). Bolme anahtari ile bolme ADI burada
// hesaplanir; ekran kendi hesabini yapmaz. Ayri dosya olmasinin sebebi: ekranda bugun
// uretilemeyen haller (basligi olmayan gorev) ancak burada testle dogrulanabilir.
// BOY: tek is = bolme hesabi. DOM/React/Supabase yok.
import type { DutyOption, PersonLabel } from '../../../shared/supabase/person-label-service'

export interface ListBucket {
  key: string
  name: string
}

export type HeadingIndex = ReadonlyMap<string, { key: string | null; name: string | null }>

// Gorev kodundan basligina: ad ve kimlik dutyOptions'tan gelir, burada UYDURULMAZ.
export function headingIndex(
  dutyOptions: readonly Pick<DutyOption, 'catalogCode' | 'headingCode' | 'headingName'>[],
): HeadingIndex {
  return new Map(dutyOptions.map((d) => [d.catalogCode, { key: d.headingCode, name: d.headingName }] as const))
}

// Uc hal (BOLME ADI, 18 Eylul 2026, Engin karari):
// 1) Gorev hanesi BOS: Gorevsiz bolmesi.
// 2) Gorev var ama basligi yok, ya da gorev kodunun katalogda karsiligi yok: basligi olmayan
//    gorevler bolmesi. Kisinin gorevi VARDIR, eksik olan basliktir; iki halde de basligi
//    BILMIYORUZ, o yuzden ayni bolmede dururlar.
// 3) Baslik dolu: basligin kendi kimligi ve adi.
// Eskiden 1 ve 2 ayri anahtar tasiyip AYNI adi basiyordu; liste ayni adli iki bolme cizebiliyordu.
export function bucketOf(label: Pick<PersonLabel, 'dutyCode'>, headings: HeadingIndex): ListBucket {
  if (label.dutyCode === null) return { key: '__nodutykey', name: 'Görevsiz' }
  const h = headings.get(label.dutyCode)
  if (!h || h.key === null || h.name === null) return { key: '__noheadkey', name: 'Başlığı olmayan görevler' }
  return { key: h.key, name: h.name }
}
