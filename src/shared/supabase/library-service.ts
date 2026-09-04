import { supabase } from './client'

// Kalem Kutuphanesi okuma ekseni (BUTCE-UI-MIMARISI I5: yeni eksen = yeni servis dosyasi).
// K-E: liste YALNIZ aktif kartin card_code'una gore filtrelenir (K-B iptali, 5 Eylul 2026:
// aidiyet veridir, kod onekinden turetilmez), isim/es-ad eslesmesi istemci tarafinda yapilir
// (BUTCE-EKRAN-KARARLARI 16: kart acilisinda BIR KEZ cekilir).

export interface LibraryItem {
  id: string
  catalogCode: string
  cardCode: string
  name: string
  nameEn: string | null
  defaultPaymentStatus: string
  defaultUnitCode: string
  aliases: string[]
  isGroup: boolean
  isDerived: boolean
}

export interface CardLibrary {
  items: LibraryItem[]
  headings: LibraryItem[]
}

function mapLibraryRow(r: Record<string, unknown>): LibraryItem {
  return {
    id: r.id as string,
    catalogCode: r.catalog_code as string,
    cardCode: r.card_code as string,
    name: r.name as string,
    nameEn: (r.name_en as string | null) ?? null,
    defaultPaymentStatus: r.default_payment_status as string,
    defaultUnitCode: r.default_unit_code as string,
    aliases: (r.aliases as string[] | null) ?? [],
    isGroup: r.is_group as boolean,
    isDerived: r.is_derived as boolean,
  }
}

// Baslik satirlari (is_group) bir KALEM DEGILDIR: kalem ekleme listesinde gorunmez
// (BUTCE-EKRAN-KARARLARI bolum 16, BUTCE-SEMA-KARARLARI GORSEL GRUP). Ayni cekimden
// AYRI bir liste olarak da doner: baslik satirlarinin ekrana cizilmesi icin (bolum 19).
// Turetilen atom (is_derived) da kalem ekleme listesinde gorunmez, sebebi farkli: baslik
// kalem degildir, turetilen atom ise elle eklenmez.
export async function fetchCardLibrary(cardCode: string): Promise<CardLibrary> {
  const { data, error } = await supabase
    .from('item_library')
    .select('id, catalog_code, card_code, name, name_en, default_payment_status, default_unit_code, aliases, is_group, is_derived')
    .eq('card_code', cardCode)
    .order('catalog_code')
  if (error) throw new Error(error.message)
  const all = (data ?? []).map(mapLibraryRow)
  return {
    items: all.filter((it) => !it.isGroup && !it.isDerived),
    headings: all.filter((it) => it.isGroup),
  }
}

// D3c-3 (BUTCE-EKRAN-KARARLARI bolum 16): capraz-kart bilgisi tum kutuphaneyi gerektirir, kart
// cizildikten SONRA arka planda inar. Kutuphane dolmaya baslayinca tek cekiste donen satir
// sayisi sinirinin (Supabase varsayilan tavani) TEYIT EDILMESI gerekir, sayfalama ayri is.
export async function fetchAllLibrary(): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('item_library')
    .select('id, catalog_code, card_code, name, name_en, default_payment_status, default_unit_code, aliases, is_group, is_derived')
    .order('catalog_code')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapLibraryRow)
}
