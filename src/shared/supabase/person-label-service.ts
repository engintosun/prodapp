// BOY: tek iş = kişi etiketi (budget_cost_objects, kind='kisi') okuma/yazma servis çağrıları
// (KART 1600 M3b-1), sebep = yeni eksen yeni servis dosyası ister (İ5), budget-service.ts şişirilmez.
import { supabase } from './client'
import { getProjectId } from './budget-service'

export interface PersonLabel {
  id: string
  code: number
  name: string
  roleName: string | null
  dutyCode: string | null
  isActive: boolean
  hasAgency: boolean
  agencyName: string | null
  hasManager: boolean
  managerName: string | null
}

function mapPersonLabel(r: Record<string, unknown>): PersonLabel {
  return {
    id: r.id as string,
    code: r.code as number,
    name: r.name as string,
    roleName: (r.role_name as string | null) ?? null,
    dutyCode: (r.duty_code as string | null) ?? null,
    isActive: r.is_active as boolean,
    hasAgency: r.has_agency as boolean,
    agencyName: (r.agency_name as string | null) ?? null,
    hasManager: r.has_manager as boolean,
    managerName: (r.manager_name as string | null) ?? null,
  }
}

export async function fetchPersonLabels(): Promise<PersonLabel[]> {
  const projectId = await getProjectId()
  const { data, error } = await supabase
    .from('budget_cost_objects')
    .select('id, code, name, role_name, duty_code, is_active, has_agency, agency_name, has_manager, manager_name')
    .eq('project_id', projectId)
    .eq('kind', 'kisi')
    .order('sort_order')
    .order('code')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapPersonLabel)
}

// URETIM KAYITLARI masa kapagi: satirlari CEKMEZ, yalniz sayar (head:true count:'exact').
export async function countPersonLabels(): Promise<number> {
  const projectId = await getProjectId()
  const { count, error } = await supabase
    .from('budget_cost_objects')
    .select('id', { head: true, count: 'exact' })
    .eq('project_id', projectId)
    .eq('kind', 'kisi')
    .eq('is_active', true)
  if (error) throw new Error(error.message)
  return count ?? 0
}

// code degeri YENI SAYAC ICAT ETMEZ: mevcut kolonun bu projedeki en buyugune bir eklenir
// (cost_object'in bugunku deseni, item_code_seq gibi ayri bir sayac tablosu yoktur).
export async function createPersonLabel(name: string): Promise<PersonLabel> {
  const v = name.trim()
  if (!v) throw new Error('Ad boş olamaz')
  const projectId = await getProjectId()
  const { data: maxRow, error: em } = await supabase
    .from('budget_cost_objects')
    .select('code')
    .eq('project_id', projectId)
    .order('code', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (em) throw new Error(em.message)
  const nextCode = ((maxRow?.code as number | undefined) ?? 0) + 1
  const { data, error } = await supabase
    .from('budget_cost_objects')
    .insert({ project_id: projectId, code: nextCode, name: v, kind: 'kisi' })
    .select('id, code, name, role_name, duty_code, is_active, has_agency, agency_name, has_manager, manager_name')
    .single()
  if (error) throw new Error(error.message)
  return mapPersonLabel(data)
}

// Toplu dogum (6 Eylul 2026): N satir TEK yazma islemiyle doger. Sayac BIR KEZ
// okunur, ardisik numaralar burada dagitilir; satir basina ayri sorgu ATILMAZ.
// Dosyadaki sira korunur: liste sort_order sonra code ile cekiliyor ve numaralar
// diziye giris sirasiyla veriliyor.
export type NewPersonRow = { name: string; roleName: string | null }

export async function createPersonLabels(rows: NewPersonRow[]): Promise<number> {
  const cleaned = rows
    .map((r) => ({ name: String(r.name ?? '').trim(), roleName: String(r.roleName ?? '').trim() || null }))
    .filter((r) => r.name.length > 0)
  if (cleaned.length === 0) return 0
  const projectId = await getProjectId()
  const { data: maxRow, error: em } = await supabase
    .from('budget_cost_objects')
    .select('code')
    .eq('project_id', projectId)
    .order('code', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (em) throw new Error(em.message)
  const startCode = ((maxRow?.code as number | undefined) ?? 0) + 1
  const payload = cleaned.map((r, i) => ({
    project_id: projectId,
    code: startCode + i,
    name: r.name,
    role_name: r.roleName,
    kind: 'kisi',
  }))
  const { error } = await supabase.from('budget_cost_objects').insert(payload)
  if (error) throw new Error(error.message)
  return payload.length
}

// Silme (6 Eylul 2026). Kisi bir butce kaleminde kullaniliyorsa veritabani REDDEDER
// (person_object_id -> on delete restrict). Bu kusur degil koruma: silinebilseydi
// kartin oyuncu referansi sessizce bozulurdu. PG hata kodu 23503'u duz Turkce mesaja
// cevirmek serviste yapilir, cunku kodu bilen katman burasi.
// is_active hanesine DOKUNULMAZ: bugun hicbir sorgu onu suzmuyor, silmeyi oraya
// baglamak kisiyi listeden kaldirir ama kartta birakirdi.
export async function deletePersonLabel(id: string): Promise<void> {
  const { error } = await supabase.from('budget_cost_objects').delete().eq('id', id)
  if (!error) return
  if (error.code === '23503') throw new Error('Bu kişi bütçede kullanılıyor, silinemez')
  throw new Error(error.message)
}

export type BulkDeleteResult = { deleted: number; blocked: number }

// Toplu silme. ONCE tek islemle denenir: hicbiri kullanimda degilse bu bir gidis-gelis
// eder ve biter (yaygin durum, yanlis ice aktarilan satirlari temizlemek). Icinde
// kullanimda olan varsa PostgreSQL islemin TAMAMINI geri alir, o zaman tek tek
// denenip hangisinin gectigi sayilir. Once toplu denemenin sebebi: 200 kisilik listede
// 200 ayri gidis-gelis etmemek.
export async function deletePersonLabels(ids: string[]): Promise<BulkDeleteResult> {
  const list = ids.filter((v) => typeof v === 'string' && v.length > 0)
  if (list.length === 0) return { deleted: 0, blocked: 0 }
  const { error } = await supabase.from('budget_cost_objects').delete().in('id', list)
  if (!error) return { deleted: list.length, blocked: 0 }
  if (error.code !== '23503') throw new Error(error.message)
  let deleted = 0
  let blocked = 0
  for (const id of list) {
    const { error: e } = await supabase.from('budget_cost_objects').delete().eq('id', id)
    if (!e) deleted += 1
    else if (e.code === '23503') blocked += 1
    else throw new Error(e.message)
  }
  return { deleted, blocked }
}

export type PersonLabelPatch = Partial<{
  name: string
  roleName: string | null
  dutyCode: string | null
  hasAgency: boolean
  agencyName: string | null
  hasManager: boolean
  managerName: string | null
}>

export async function updatePersonLabel(id: string, patch: PersonLabelPatch): Promise<void> {
  const payload: Record<string, unknown> = {}
  if ('name' in patch) {
    const v = String(patch.name ?? '').trim()
    if (!v) throw new Error('Ad boş olamaz')
    payload.name = v
  }
  if ('roleName' in patch) {
    const v = String(patch.roleName ?? '').trim()
    payload.role_name = v === '' ? null : v
  }
  if ('dutyCode' in patch) {
    const v = String(patch.dutyCode ?? '').trim()
    payload.duty_code = v === '' ? null : v
  }
  if ('hasAgency' in patch) {
    payload.has_agency = Boolean(patch.hasAgency)
  }
  if ('agencyName' in patch) {
    const v = String(patch.agencyName ?? '').trim()
    payload.agency_name = v === '' ? null : v
  }
  if ('hasManager' in patch) {
    payload.has_manager = Boolean(patch.hasManager)
  }
  if ('managerName' in patch) {
    const v = String(patch.managerName ?? '').trim()
    payload.manager_name = v === '' ? null : v
  }
  const { error } = await supabase.from('budget_cost_objects').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export interface DutyOption {
  catalogCode: string
  name: string
  headingCode: string | null
  headingName: string | null
}

// Gorev listesi VERIDEN gelir, kodda gomulmez: item_library.is_duty bayragi gorev
// listesine girecek atomlari isaretler.
// SIRA (10 Eylul 2026, Engin karari): once BASLIK (item_library.heading_id), sonra
// katalog kodu. Sebep: kart satirlarini once basliga gore grupluyordu, liste ise duz
// katalog kodu sirasindaydi; ayni gorev seti iki yuzeyde iki turlu okunuyordu.
// Aidiyet KODDAN TURETILMEZ (DEGISMEZLER md. 2), heading_id VERIDIR.
// heading_id bos olan atom (baslik satiri olmayan kartlar) SONA duser.
// Bu dizinin sirasi UC yuzeyi birden besler: Uretim Kayitlari listesi, oradaki Gorev
// acilir menusu ve karttan acilan Oyuncular panosu (sortPersonsByDuty). Kural TEK
// yerde yasar, ikinci bir kopyasi acilmaz.
export async function fetchDutyOptions(): Promise<DutyOption[]> {
  const { data: duties, error: ed } = await supabase
    .from('item_library')
    .select('catalog_code, name, heading_id')
    .eq('is_duty', true)
  if (ed) throw new Error(ed.message)
  const { data: headings, error: eh } = await supabase
    .from('item_library')
    .select('id, catalog_code, name')
    .eq('is_group', true)
  if (eh) throw new Error(eh.message)
  const headingById = new Map<string, { catalogCode: string; name: string }>()
  for (const h of headings ?? []) {
    headingById.set(h.id as string, { catalogCode: h.catalog_code as string, name: h.name as string })
  }
  const out: DutyOption[] = (duties ?? []).map((r) => {
    const h = r.heading_id ? headingById.get(r.heading_id as string) : undefined
    return {
      catalogCode: r.catalog_code as string,
      name: r.name as string,
      headingCode: h?.catalogCode ?? null,
      headingName: h?.name ?? null,
    }
  })
  out.sort((a, b) => {
    if (a.headingCode !== b.headingCode) {
      if (a.headingCode === null) return 1
      if (b.headingCode === null) return -1
      return a.headingCode < b.headingCode ? -1 : 1
    }
    return a.catalogCode < b.catalogCode ? -1 : a.catalogCode > b.catalogCode ? 1 : 0
  })
  return out
}
