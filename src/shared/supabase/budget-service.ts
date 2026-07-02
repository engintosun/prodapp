import { supabase } from './client'

export interface StageRow {
  id: string
  name: string
  isUndated: boolean
  sortOrder: number
}

export interface UnitRow {
  id: string
  code: string
  label: string
  sortOrder: number
}

export interface BudgetItemRow {
  id: string
  itemCode: number
  name: string
  descriptionEn: string | null
  unitNet: number
  unitId: string
  unitLabel: string
  multiplier: number
  repeat: number
  vatRate: number
  ratesPercent: number[]
  burdens: { label: string; rate: number; kind: "additive" | "deduction" }[]
  periodQty: Record<string, number>
  periodNet: Record<string, number | null>
  periodUnit: Record<string, string | null>
  periodRepeat: Record<string, number | null>
  paymentStatus: string | null
  internalNote: string | null
  publicNote: string | null
}

export interface CardView {
  budgetId: string
  groupId: string
  cardName: string
  stages: StageRow[]
  items: BudgetItemRow[]
}

export type EditableField = 'name' | 'descriptionEn' | 'unitNet' | 'multiplier' | 'repeat' | 'vatRate' | 'paymentStatus' | 'unitId' | 'internalNote' | 'publicNote'

const FIELD_COL: Record<EditableField, string> = {
  internalNote: 'internal_note',
  publicNote: 'public_note',
  name: 'name',
  descriptionEn: 'description_en',
  unitNet: 'unit_net',
  multiplier: 'multiplier',
  repeat: 'repeat',
  vatRate: 'vat_rate',
  paymentStatus: 'payment_status',
  unitId: 'unit_id',
}

async function getProjectId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) throw new Error('Oturum bulunamadı, tekrar giriş yapın')
  const projectId = data.session.user.app_metadata?.project_id as string | undefined
  if (!projectId) throw new Error('Aktif proje bulunamadı')
  return projectId
}

export async function getOrOpenBudget(): Promise<string> {
  const projectId = await getProjectId()

  const { data: existing, error: e1 } = await supabase
    .from('budgets')
    .select('id')
    .eq('project_id', projectId)
    .eq('scope', 'single')
    .maybeSingle()
  if (e1) throw new Error(e1.message)
  if (existing) return existing.id as string

  const { data: proj, error: e2 } = await supabase
    .from('projects')
    .select('production_type')
    .eq('id', projectId)
    .single()
  if (e2) throw new Error(e2.message)
  const ptype = (proj?.production_type as string | null) ?? 'film'

  const { data: tpl, error: e3 } = await supabase
    .from('budget_templates')
    .select('id')
    .eq('kind', 'system')
    .eq('scope', 'single')
    .eq('production_type', ptype)
    .eq('is_active', true)
    .maybeSingle()
  if (e3) throw new Error(e3.message)
  if (!tpl) throw new Error('Sistem sablonu bulunamadi (' + ptype + '/single)')

  const { data: opened, error: e4 } = await supabase.rpc('fn_open_budget', {
    p_project: projectId,
    p_template: tpl.id as string,
    p_scope: 'single',
  })
  if (e4) throw new Error(e4.message)
  return opened as string
}

// Butcenin ilk kartini (sort_order) + etaplarini + kalemlerini getir.
// Miktar etap-basina: periodQty[stageId]. Birim label ayri raftan map'lenir.
export async function getFirstCard(budgetId: string): Promise<CardView | null> {
  const { data: stageData, error: es } = await supabase
    .from('budget_stages')
    .select('id, name, is_undated, sort_order')
    .eq('budget_id', budgetId)
    .order('sort_order')
  if (es) throw new Error(es.message)
  const stages: StageRow[] = (stageData ?? []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
    isUndated: s.is_undated as boolean,
    sortOrder: s.sort_order as number,
  }))

  const { data: grp, error: eg } = await supabase
    .from('expense_groups')
    .select('id, name')
    .eq('budget_id', budgetId)
    .order('sort_order')
    .limit(1)
    .maybeSingle()
  if (eg) throw new Error(eg.message)
  if (!grp) return null

  const { data: items, error: ei } = await supabase
    .from('budget_items')
    .select('id, item_code, name, description_en, unit_net, unit_id, multiplier, repeat, vat_rate, payment_status, internal_note, public_note')
    .eq('group_id', grp.id)
    .eq('is_active', true)
    .order('sort_order')
  if (ei) throw new Error(ei.message)
  const itemList = items ?? []
  const itemIds = itemList.map((i) => i.id as string)

  const { data: units, error: eu } = await supabase.from('units').select('id, label')
  if (eu) throw new Error(eu.message)
  const unitLabel: Record<string, string> = {}
  for (const u of units ?? []) unitLabel[u.id as string] = u.label as string

  const burdensByItem: Record<string, number[]> = {}
  const burdenDetailByItem: Record<string, { label: string; rate: number; kind: "additive" | "deduction" }[]> = {}
  const periodByItem: Record<string, Record<string, number>> = {}
  const periodNetByItem: Record<string, Record<string, number | null>> = {}
  const periodUnitByItem: Record<string, Record<string, string | null>> = {}
  const periodRepeatByItem: Record<string, Record<string, number | null>> = {}
  if (itemIds.length) {
    const { data: burdens, error: eb } = await supabase
      .from('item_burdens')
      .select('item_id, rate_percent, burden_components(label, kind)')
      .in('item_id', itemIds)
      .order('rate_percent', { ascending: false })
    if (eb) throw new Error(eb.message)
    for (const b of burdens ?? []) {
      const k = b.item_id as string
      const rate = Number(b.rate_percent)
      ;(burdensByItem[k] ??= []).push(rate)
      const bLabel = (b as { burden_components?: { label?: string; kind?: string } | null }).burden_components?.label ?? "Yük"
      const bKind = (b as { burden_components?: { kind?: string } | null }).burden_components?.kind === "additive" ? "additive" : "deduction"
      ;(burdenDetailByItem[k] ??= []).push({ label: bLabel, rate, kind: bKind })
    }

    const { data: periods, error: ep } = await supabase
      .from('budget_item_periods')
      .select('item_id, stage_id, quantity, unit_net_override, unit_id_override, repeat_override')
      .in('item_id', itemIds)
    if (ep) throw new Error(ep.message)
    for (const p of periods ?? []) {
      const k = p.item_id as string
      ;(periodByItem[k] ??= {})[p.stage_id as string] = Number(p.quantity)
      ;(periodNetByItem[k] ??= {})[p.stage_id as string] =
        p.unit_net_override !== null && p.unit_net_override !== undefined
          ? Number(p.unit_net_override)
          : null
      ;(periodUnitByItem[k] ??= {})[p.stage_id as string] = (p.unit_id_override as string | null) ?? null
      ;(periodRepeatByItem[k] ??= {})[p.stage_id as string] =
        p.repeat_override !== null && p.repeat_override !== undefined
          ? Number(p.repeat_override)
          : null
    }
  }

  const rows: BudgetItemRow[] = itemList.map((i) => ({
    id: i.id as string,
    itemCode: i.item_code as number,
    name: i.name as string,
    descriptionEn: (i.description_en as string | null) ?? null,
    unitNet: Number(i.unit_net),
    unitId: i.unit_id as string,
    unitLabel: unitLabel[i.unit_id as string] ?? '',
    multiplier: Number(i.multiplier),
    repeat: Number((i as unknown as { repeat?: unknown }).repeat ?? 1),
    vatRate: Number(i.vat_rate),
    ratesPercent: burdensByItem[i.id as string] ?? [],
    burdens: burdenDetailByItem[i.id as string] ?? [],
    periodQty: periodByItem[i.id as string] ?? {},
    periodNet: periodNetByItem[i.id as string] ?? {},
    periodUnit: periodUnitByItem[i.id as string] ?? {},
    periodRepeat: periodRepeatByItem[i.id as string] ?? {},
    paymentStatus: typeof i.payment_status === 'string' ? i.payment_status : null,
    internalNote: (i.internal_note as string | null) ?? null,
    publicNote: (i.public_note as string | null) ?? null,
  }))

  return { budgetId, groupId: grp.id as string, cardName: grp.name as string, stages, items: rows }
}

// Tek kalem alanini gunceller (budget_items UPDATE; RLS muhasebe-only, B19 iz).
export async function updateItemField(
  itemId: string,
  field: EditableField,
  value: string | number,
): Promise<void> {
  let payload: Record<string, unknown>
  if (field === 'name') {
    const v = String(value).trim()
    if (!v) throw new Error('Sebep boş olamaz')
    payload = { name: v }
  } else if (field === 'descriptionEn') {
    const v = String(value).trim()
    payload = { description_en: v === '' ? null : v }
  } else if (field === 'paymentStatus') {
    const v = String(value)
    if (v === '') {
      payload = { payment_status: null }
    } else {
      const VALID = ['bordro', 'smm', 'telif_belgeli', 'sirket', 'kira_sahis', 'konaklama'] as const
      if (!(VALID as readonly string[]).includes(v)) throw new Error('Geçersiz statü')
      payload = { payment_status: v }
    }
  } else if (field === 'unitId') {
    const v = String(value).trim()
    if (!v) throw new Error('Birim boş olamaz')
    payload = { unit_id: v }
  } else if (field === 'internalNote' || field === 'publicNote') {
    const noteText = String(value).trim()
    payload = { [FIELD_COL[field]]: noteText === '' ? null : noteText }
  } else {
    const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
    if (!Number.isFinite(n)) throw new Error('Geçersiz sayı')
    if (n < 0) throw new Error('Negatif değer girilemez')
    if (field === 'repeat' && n <= 0) throw new Error('Çarpan sıfırdan büyük olmalı')
    payload = { [FIELD_COL[field]]: n }
  }
  const { error } = await supabase.from('budget_items').update(payload).eq('id', itemId)
  if (error) throw new Error(error.message)
}

// Bir donem satirinin unit_net_override degerini yazar. Bos string -> null (kalitima don).
export async function setItemPeriodNet(
  itemId: string,
  stageId: string,
  value: string | number,
): Promise<void> {
  let override: number | null
  if (String(value).trim() === '') {
    override = null
  } else {
    const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
    if (!Number.isFinite(n)) throw new Error('Geçersiz net değer')
    if (n < 0) throw new Error('Negatif değer girilemez')
    override = n
  }
  const { error } = await supabase
    .from('budget_item_periods')
    .update({ unit_net_override: override })
    .eq('item_id', itemId)
    .eq('stage_id', stageId)
  if (error) throw new Error(error.message)
}

// Tek kalem icin kova + KDV okur (statu degisince canli tazeleme icin).
export async function getItemBurdensAndVat(
  itemId: string,
): Promise<{ burdens: { label: string; rate: number; kind: "additive" | "deduction" }[]; vatRate: number }> {
  const { data: burdensData, error: eb } = await supabase
    .from('item_burdens')
    .select('rate_percent, burden_components(label, kind)')
    .eq('item_id', itemId)
    .order('rate_percent', { ascending: false })
  if (eb) throw new Error(eb.message)
  const { data: itemData, error: ei } = await supabase
    .from('budget_items')
    .select('vat_rate')
    .eq('id', itemId)
    .single()
  if (ei) throw new Error(ei.message)
  const burdens = (burdensData ?? []).map((b) => {
    const bLabel = (b as { burden_components?: { label?: string; kind?: string } | null }).burden_components?.label ?? "Yuk"
    const bKind: "additive" | "deduction" =
      (b as { burden_components?: { kind?: string } | null }).burden_components?.kind === "additive" ? "additive" : "deduction"
    return { label: bLabel, rate: Number(b.rate_percent), kind: bKind }
  })
  return { burdens, vatRate: Number(itemData.vat_rate) }
}

// Kalemin bir etaptaki miktarini yazar. 0 -> koprudeki satiri SIL (temiz).
// >0 -> upsert (item_id,stage_id UNIQUE). budget_id zorunlu (bilesik FK).
export async function setItemPeriodQuantity(
  budgetId: string,
  itemId: string,
  stageId: string,
  value: string | number,
): Promise<void> {
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) throw new Error('Geçersiz miktar')
  if (n === 0) {
    const { error } = await supabase
      .from('budget_item_periods')
      .delete()
      .eq('item_id', itemId)
      .eq('stage_id', stageId)
    if (error) throw new Error(error.message)
    return
  }
  const { error } = await supabase
    .from('budget_item_periods')
    .upsert(
      { budget_id: budgetId, item_id: itemId, stage_id: stageId, quantity: n },
      { onConflict: 'item_id,stage_id' },
    )
  if (error) throw new Error(error.message)
}

// Bir donem satirinin unit_id_override degerini yazar. null -> kalitima don.
export async function updateItemPeriodUnit(
  itemId: string,
  stageId: string,
  unitId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('budget_item_periods')
    .update({ unit_id_override: unitId })
    .eq('item_id', itemId)
    .eq('stage_id', stageId)
  if (error) throw new Error(error.message)
}

// Bir donem satirinin repeat_override (Carpan) degerini yazar. Bos string -> null (kalitima don).
export async function updateItemPeriodRepeat(
  itemId: string,
  stageId: string,
  value: string | number,
): Promise<void> {
  let override: number | null
  if (String(value).trim() === '') {
    override = null
  } else {
    const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
    if (!Number.isFinite(n)) throw new Error('Geçersiz çarpan değeri')
    if (n < 0) throw new Error('Negatif değer girilemez')
    override = n
  }
  const { error } = await supabase
    .from('budget_item_periods')
    .update({ repeat_override: override })
    .eq('item_id', itemId)
    .eq('stage_id', stageId)
  if (error) throw new Error(error.message)
}

// units cetvelini sort_order'a gore getirir (Birim dropdown icin).
export async function loadUnits(): Promise<UnitRow[]> {
  const { data, error } = await supabase
    .from('units')
    .select('id, code, label, sort_order')
    .order('sort_order')
  if (error) throw new Error(error.message)
  return (data ?? []).map((u) => ({
    id: u.id as string,
    code: u.code as string,
    label: u.label as string,
    sortOrder: u.sort_order as number,
  }))
}

// Tek -> cok donem gecisi: ana satir degerlerini ilk donem-satirina yazar (satir zaten var, UPDATE).
export async function copyMainToFirstPeriod(
  itemId: string,
  stageId: string,
  mainUnitNet: number,
  mainUnitId: string,
  mainMultiplier: number,
  mainRepeat: number,
): Promise<void> {
  const { error } = await supabase
    .from('budget_item_periods')
    .update({
      unit_net_override: mainUnitNet,
      unit_id_override: mainUnitId,
      quantity: mainMultiplier,
      repeat_override: mainRepeat,
    })
    .eq('item_id', itemId)
    .eq('stage_id', stageId)
  if (error) throw new Error(error.message)
}

// Cok -> tek donem gecisi: kalan tek donemin override degerlerini ana satira yazar.
export async function copyLastPeriodToMain(itemId: string, stageId: string): Promise<void> {
  const { data: period, error: ep } = await supabase
    .from('budget_item_periods')
    .select('quantity, unit_net_override, unit_id_override, repeat_override')
    .eq('item_id', itemId)
    .eq('stage_id', stageId)
    .single()
  if (ep) throw new Error(ep.message)

  const { data: item, error: ei } = await supabase
    .from('budget_items')
    .select('unit_net, unit_id, repeat')
    .eq('id', itemId)
    .single()
  if (ei) throw new Error(ei.message)

  const { error: eu } = await supabase
    .from('budget_items')
    .update({
      unit_net: period.unit_net_override ?? item.unit_net,
      unit_id: period.unit_id_override ?? item.unit_id,
      multiplier: period.quantity,
      repeat: period.repeat_override ?? item.repeat,
    })
    .eq('id', itemId)
  if (eu) throw new Error(eu.message)
}
