// Kullanici basligi ekseni (BUTCE-UI-MIMARISI I5: yeni eksen = yeni servis dosyasi).
// Karar: BUTCE-EKRAN-KARARLARI bolum 19 GUNCELLEME (22 Eylul 2026) + BUTCE-SEMA-KARARLARI
// KULLANICI BASLIGININ EVI. Baslik projeye ve acildigi karta aittir.
// Kalemi kalmamis baslik burada SUZULMEZ: bosluk saklanmaz, cizimde kalemlerden hesaplanir
// (B18); groupRowsByHeading kalemi olmayan basligi zaten cizmez.
import { supabase } from './client'
import { getProjectId } from './budget-service'

export interface UserHeading {
  id: string
  name: string
}

export async function fetchUserHeadings(cardCode: string): Promise<UserHeading[]> {
  const projectId = await getProjectId()
  const { data, error } = await supabase
    .from('budget_user_headings')
    .select('id, name')
    .eq('project_id', projectId)
    .eq('card_code', cardCode)
    .order('created_at')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({ id: r.id as string, name: r.name as string }))
}

// "Ayni ad ayni basliktir" kuralinin hakemi veritabanidir (fn_open_user_heading +
// fn_heading_name_key). Burada ad KARSILASTIRILMAZ; Turkce harf kuralinin ikinci kopyasi
// yazilirsa iki kopya bir gun ayrisir. Ad varsa var olanin kimligi doner.
export async function openUserHeading(cardCode: string, name: string): Promise<string> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Başlık adı boş olamaz')
  const projectId = await getProjectId()
  const { data, error } = await supabase.rpc('fn_open_user_heading', {
    p_project: projectId,
    p_card_code: cardCode,
    p_name: trimmed,
  })
  if (error) throw new Error(error.message)
  return data as unknown as string
}

// Secilen kalemleri tek istekte bir basliga ya da Basliksiz'a (null) gonderir. headingCode:
// kutuphane basliginda catalog_code, kullanici basliginda budget_user_headings.id.
// Kart disina ve muhurlu butceye gonderimi veritabani reddeder (trg_check_item_heading,
// trg_guard_lock_items). Guncellenen satir sayisi secimden azsa sessiz gecilmez.
export async function moveItemsToHeading(
  itemIds: readonly string[],
  headingCode: string | null,
): Promise<void> {
  if (itemIds.length === 0) throw new Error('Gönderilecek kalem seçilmedi')
  const { data, error } = await supabase
    .from('budget_items')
    .update({ heading_code: headingCode })
    .in('id', [...itemIds])
    .select('id')
  if (error) throw new Error(error.message)
  if ((data ?? []).length !== itemIds.length) {
    throw new Error('Bazı kalemler başlığa gönderilemedi')
  }
}
