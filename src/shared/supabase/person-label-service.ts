// BOY: tek iş = kişi etiketi (budget_cost_objects, kind='kisi') okuma/yazma servis çağrıları
// (KART 1600 M3b-1), sebep = yeni eksen yeni servis dosyası ister (İ5), budget-service.ts şişirilmez.
import { supabase } from './client'

export interface PersonLabel {
  id: string
  code: number
  name: string
  roleName: string | null
  dutyCode: string | null
  isActive: boolean
}

function mapPersonLabel(r: Record<string, unknown>): PersonLabel {
  return {
    id: r.id as string,
    code: r.code as number,
    name: r.name as string,
    roleName: (r.role_name as string | null) ?? null,
    dutyCode: (r.duty_code as string | null) ?? null,
    isActive: r.is_active as boolean,
  }
}

export async function fetchPersonLabels(budgetId: string): Promise<PersonLabel[]> {
  const { data, error } = await supabase
    .from('budget_cost_objects')
    .select('id, code, name, role_name, duty_code, is_active')
    .eq('budget_id', budgetId)
    .eq('kind', 'kisi')
    .order('sort_order')
    .order('code')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapPersonLabel)
}

// code degeri YENI SAYAC ICAT ETMEZ: mevcut kolonun bu butcedeki en buyugune bir eklenir
// (cost_object'in bugunku deseni, item_code_seq gibi ayri bir sayac tablosu yoktur).
export async function createPersonLabel(budgetId: string, name: string): Promise<PersonLabel> {
  const v = name.trim()
  if (!v) throw new Error('Ad boş olamaz')
  const { data: maxRow, error: em } = await supabase
    .from('budget_cost_objects')
    .select('code')
    .eq('budget_id', budgetId)
    .order('code', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (em) throw new Error(em.message)
  const nextCode = ((maxRow?.code as number | undefined) ?? 0) + 1
  const { data, error } = await supabase
    .from('budget_cost_objects')
    .insert({ budget_id: budgetId, code: nextCode, name: v, kind: 'kisi' })
    .select('id, code, name, role_name, duty_code, is_active')
    .single()
  if (error) throw new Error(error.message)
  return mapPersonLabel(data)
}

export type PersonLabelPatch = Partial<{
  name: string
  roleName: string | null
  dutyCode: string | null
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
  const { error } = await supabase.from('budget_cost_objects').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export interface DutyOption {
  catalogCode: string
  name: string
}

// Gorev listesi VERIDEN gelir, kodda gomulmez: 1601-1617 araligi KART 1600 Grup 1/2/4 kisi
// atomlaridir (1618 Temsilci Komisyonu haric - o komisyon satirinin kendi atomu, gorev degil).
// Bugun bu araliktan tohumlu atom YOK (kutuphane resmilesmedi), liste bos doner - DOGRU davranis.
export async function fetchDutyOptions(): Promise<DutyOption[]> {
  const { data, error } = await supabase
    .from('item_library')
    .select('catalog_code, name')
    .gte('catalog_code', '1601')
    .lte('catalog_code', '1617')
    .eq('is_group', false)
    .eq('is_derived', false)
    .order('catalog_code')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    catalogCode: r.catalog_code as string,
    name: r.name as string,
  }))
}
