// BU DOSYA KATLAMA DURUMUNUN TEK KAYNAGIDIR. Baslik ve ozet satirlarinin acik/kapali hali
// burada hesaplanir; ekran kendi hesabini yapmaz. Ayri dosya olmasinin sebebi: ekranda bugun
// uretilemeyen haller (kapali bloga kalem eklenmesi) ancak burada testle dogrulanabilir
// (emsal: production/list-bucket.ts, 18 Eylul 2026).
// BOY: tek is = katlama durumu hesabi. DOM/React yok.
//
// KATLAMA DURUMU MUTLAKTIR (20 Eylul 2026, Engin karari): durum artik "kullanicinin
// varsayilani tersine cevirdigi anahtarlar" kumesi DEGILDIR - kullanicinin bir blokta
// BIRAKTIGI acik/kapali halin kendisidir. Varsayilan yalniz kullanicinin hic dokunmadigi
// bloga uygulanir (state'te kaydi yoksa). true = KAPALI.
export type CollapseState = ReadonlyMap<string, boolean>

export function resolveCollapsed(
  key: string,
  state: CollapseState,
  defaultCollapsed: boolean,
): boolean {
  const stored = state.get(key)
  return stored !== undefined ? stored : defaultCollapsed
}

export function toggleCollapse(
  key: string,
  state: CollapseState,
  defaultCollapsed: boolean,
): Map<string, boolean> {
  const next = new Map(state)
  next.set(key, !resolveCollapsed(key, state, defaultCollapsed))
  return next
}

// KAPALI BLOGA EKLEME (20 Eylul 2026, Engin karari): kullanicinin kapali biraktigi bloga
// odadan kalem eklendiginde blok ACILIR. Zaten acikken (state'te false ya da hic kayit yok
// ve varsayilan acik) degeri BOZMAZ - yeni bir Map dondurur ama icerigi aynidir.
export function openBlock(key: string, state: CollapseState): Map<string, boolean> {
  const next = new Map(state)
  next.set(key, false)
  return next
}
