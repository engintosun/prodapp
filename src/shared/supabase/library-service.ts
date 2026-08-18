import { supabase } from './client'

// Kalem Kutuphanesi okuma ekseni (BUTCE-UI-MIMARISI I5: yeni eksen = yeni servis dosyasi).
// K-E: liste YALNIZ aktif kartin kod araliginda arar; filtre kod prefixiyle sunucuda daraltilir,
// isim/es-ad eslesmesi istemci tarafinda yapilir (BUTCE-EKRAN-KARARLARI 16: kart acilisinda BIR KEZ cekilir).

export interface LibraryItem {
  id: string
  catalogCode: string
  name: string
  nameEn: string | null
  defaultPaymentStatus: string
  defaultUnitCode: string
  aliases: string[]
  isGroup: boolean
}

export interface CardLibrary {
  items: LibraryItem[]
  headings: LibraryItem[]
}

function mapLibraryRow(r: Record<string, unknown>): LibraryItem {
  return {
    id: r.id as string,
    catalogCode: r.catalog_code as string,
    name: r.name as string,
    nameEn: (r.name_en as string | null) ?? null,
    defaultPaymentStatus: r.default_payment_status as string,
    defaultUnitCode: r.default_unit_code as string,
    aliases: (r.aliases as string[] | null) ?? [],
    isGroup: r.is_group as boolean,
  }
}

// Baslik satirlari (is_group) bir KALEM DEGILDIR: kalem ekleme listesinde gorunmez
// (BUTCE-EKRAN-KARARLARI bolum 16, BUTCE-SEMA-KARARLARI GORSEL GRUP). Ayni cekimden
// AYRI bir liste olarak da doner: baslik satirlarinin ekrana cizilmesi icin (bolum 19).
export async function fetchCardLibrary(cardCode: string): Promise<CardLibrary> {
  const prefix = cardCode.slice(0, 2)
  const { data, error } = await supabase
    .from('item_library')
    .select('id, catalog_code, name, name_en, default_payment_status, default_unit_code, aliases, is_group')
    .like('catalog_code', prefix + '%')
    .order('catalog_code')
  if (error) throw new Error(error.message)
  const all = (data ?? []).map(mapLibraryRow)
  return {
    items: all.filter((it) => !it.isGroup),
    headings: all.filter((it) => it.isGroup),
  }
}

// D3c-3 (BUTCE-EKRAN-KARARLARI bolum 16): capraz-kart bilgisi tum kutuphaneyi gerektirir, kart
// cizildikten SONRA arka planda inar. Kutuphane dolmaya baslayinca tek cekiste donen satir
// sayisi sinirinin (Supabase varsayilan tavani) TEYIT EDILMESI gerekir, sayfalama ayri is.
export async function fetchAllLibrary(): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('item_library')
    .select('id, catalog_code, name, name_en, default_payment_status, default_unit_code, aliases, is_group')
    .order('catalog_code')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapLibraryRow)
}
