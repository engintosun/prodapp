import { supabase } from './client'

// Kalem Kutuphanesi okuma ekseni (BUTCE-UI-MIMARISI I5: yeni eksen = yeni servis dosyasi).
// K-E: liste YALNIZ aktif kartin kod araliginda arar; filtre kod prefixiyle sunucuda daraltilir,
// isim/es-ad eslesmesi istemci tarafinda yapilir (BUTCE-EKRAN-KARARLARI 16: kart acilisinda BIR KEZ cekilir).

export interface LibraryItem {
  id: string
  catalogCode: string
  name: string
  descriptionEn: string | null
  defaultPaymentStatus: string
  defaultUnitCode: string
  aliases: string[]
}

export async function fetchCardLibrary(cardCode: string): Promise<LibraryItem[]> {
  const prefix = cardCode.slice(0, 2)
  const { data, error } = await supabase
    .from('item_library')
    .select('id, catalog_code, name, description_en, default_payment_status, default_unit_code, aliases')
    .like('catalog_code', prefix + '%')
    .order('catalog_code')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id as string,
    catalogCode: r.catalog_code as string,
    name: r.name as string,
    descriptionEn: (r.description_en as string | null) ?? null,
    defaultPaymentStatus: r.default_payment_status as string,
    defaultUnitCode: r.default_unit_code as string,
    aliases: (r.aliases as string[] | null) ?? [],
  }))
}
