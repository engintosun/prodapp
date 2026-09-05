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
}

// Gorev listesi VERIDEN gelir, kodda gomulmez: item_library.is_duty bayragi kart
// acilisinda gorev listesine girecek atomlari isaretler. Kodda gomulu aralik YOK -
// is_duty=true olan satir zaten baslik (is_group) ya da turetilen (is_derived) olamaz,
// bayrak tek basina yeterli.
export async function fetchDutyOptions(): Promise<DutyOption[]> {
  const { data, error } = await supabase
    .from('item_library')
    .select('catalog_code, name')
    .eq('is_duty', true)
    .order('catalog_code')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    catalogCode: r.catalog_code as string,
    name: r.name as string,
  }))
}
