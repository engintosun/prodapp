// BOY: tek iş = bütçe açılış + kart okuma + kalem yazma servis çağrıları (tek Supabase servis dosyası), sebep = 500+ — bölünme planı docs/butce/BUTCE-UI-MIMARISI.md §8'de kayıtlı, bölme ayrı turda yapılır.
import { supabase } from './client'
import type { YukCins } from '../cfe'
import type { PaymentStatus } from '../types/domain'
import { isPaymentStatus } from '../types/domain'

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
  catalogCode: string
  headingCode: string | null
  libraryItemId: string | null
  name: string
  nameEn: string | null
  unitNet: number
  unitId: string
  unitLabel: string
  multiplier: number
  repeat: number
  vatRate: number
  ratesPercent: number[]
  burdens: { label: string; rate: number; kind: YukCins }[]
  periodQty: Record<string, number>
  periodNet: Record<string, number | null>
  periodUnit: Record<string, string | null>
  periodRepeat: Record<string, number | null>
  paymentStatus: PaymentStatus | null
  internalNote: string | null
  publicNote: string | null
  personObjectId: string | null
  deriveRate: number | null
}

export interface CardView {
  budgetId: string
  groupId: string
  cardCode: string
  cardName: string
  stages: StageRow[]
  items: BudgetItemRow[]
}

export type EditableField =
  | 'name'
  | 'nameEn'
  | 'unitNet'
  | 'multiplier'
  | 'repeat'
  | 'vatRate'
  | 'paymentStatus'
  | 'unitId'
  | 'internalNote'
  | 'publicNote'
  | 'headingCode'
  | 'deriveRate'
  | 'personObjectId'

const FIELD_COL: Record<EditableField, string> = {
  internalNote: 'internal_note',
  publicNote: 'public_note',
  name: 'name',
  nameEn: 'name_en',
  unitNet: 'unit_net',
  multiplier: 'multiplier',
  repeat: 'repeat',
  vatRate: 'vat_rate',
  paymentStatus: 'payment_status',
  unitId: 'unit_id',
  headingCode: 'heading_code',
  deriveRate: 'derive_rate',
  personObjectId: 'person_object_id',
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
  if (!tpl) throw new Error('Sistem şablonu bulunamadı (' + ptype + '/single)')

  const { data: opened, error: e4 } = await supabase.rpc('fn_open_budget', {
    p_project: projectId,
    p_template: tpl.id as string,
    p_scope: 'single',
  })
  if (e4) throw new Error(e4.message)
  return opened as string
}

export interface BudgetCardRef {
  id: string
  cardCode: string
  name: string
}

// D3c-3: capraz-kart bilgisi kartin ADINI gosterir, numarasini ASLA; adlar bu butcenin kendi
// kartlarindan okunur (BUTCE-EKRAN-KARARLARI bolum 16, kod gorunmez kurali).
export async function fetchBudgetCards(budgetId: string): Promise<BudgetCardRef[]> {
  const { data, error } = await supabase
    .from('expense_groups')
    .select('id, card_code, name')
    .eq('budget_id', budgetId)
    .order('card_code')
  if (error) throw new Error(error.message)
  return (data ?? [])
    .filter((r) => r.card_code !== null)
    .map((r) => ({
      id: r.id as string,
      cardCode: r.card_code as string,
      name: r.name as string,
    }))
}

// Ham budget_items satirlarini BudgetItemRow'a cevirir (units cekimi + yuk/donem gruplamasi +
// alan eslemesi). Kart-ozel DEGIL, herhangi bir kalem listesi icin calisir - getCard (tek kart)
// ve fetchBudgetItemRowsByCard (butcenin tamami, masa kapak rakami icin) AYNI eslemeyi kullanir,
// ikinci bir tanim yoktur (KABUK-KARARLARI 12.3 TEK HESAP IKI YUZEY).
export async function mapItemRows(itemList: readonly Record<string, unknown>[]): Promise<BudgetItemRow[]> {
  const itemIds = itemList.map((i) => i.id as string)

  const { data: units, error: eu } = await supabase.from('units').select('id, label')
  if (eu) throw new Error(eu.message)
  const unitLabel: Record<string, string> = {}
  for (const u of units ?? []) unitLabel[u.id as string] = u.label as string

  const burdensByItem: Record<string, number[]> = {}
  const burdenDetailByItem: Record<string, { label: string; rate: number; kind: YukCins }[]> = {}
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
      // rate_percent NULL = iskelet bacagi (fill_mode=skeleton, orn. bordro); Number(null)===0 SESSIZCE
      // yanlis-sifir uretirdi - bu satirlar genel additive/deduction dokumune (CFE) hic girmez.
      const rate = b.rate_percent === null ? null : Number(b.rate_percent)
      if (rate === null) continue
      ;(burdensByItem[k] ??= []).push(rate)
      const bLabel = (b as { burden_components?: { label?: string; kind?: string } | null }).burden_components?.label ?? "Yük"
      const bKind: YukCins = (b as { burden_components?: { kind?: string } | null }).burden_components?.kind === "additive" ? "additive" : "deduction"
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

  return itemList.map((i) => ({
    id: i.id as string,
    itemCode: i.item_code as number,
    catalogCode: i.catalog_code as string,
    headingCode: (i.heading_code as string | null) ?? null,
    libraryItemId: (i.library_item_id as string | null) ?? null,
    name: i.name as string,
    nameEn: (i.name_en as string | null) ?? null,
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
    paymentStatus: isPaymentStatus(i.payment_status) ? i.payment_status : null,
    internalNote: (i.internal_note as string | null) ?? null,
    publicNote: (i.public_note as string | null) ?? null,
    personObjectId: (i.person_object_id as string | null) ?? null,
    deriveRate:
      i.derive_rate !== null && i.derive_rate !== undefined ? Number(i.derive_rate) : null,
  }))
}

// Butcenin TUM aktif kalemleri, kartina (group_id) gore gruplu. Masa kapak rakami bunu kullanir
// (Engin karari 31 Agustos 2026): getCard'in tek-kart select'i + mapItemRows AYNEN, yalniz
// budget_id genelinde. Suzgec fetchCardNetTotals'in (silindi) kullandigi suzgecin aynisidir.
export async function fetchBudgetItemRowsByCard(
  budgetId: string,
): Promise<Record<string, BudgetItemRow[]>> {
  const { data: items, error: ei } = await supabase
    .from('budget_items')
    .select(
      'id, item_code, catalog_code, heading_code, library_item_id, name, name_en, unit_net, unit_id, multiplier, repeat, vat_rate, payment_status, internal_note, person_object_id, derive_rate, public_note, group_id',
    )
    .eq('budget_id', budgetId)
    .eq('is_active', true)
  if (ei) throw new Error(ei.message)
  const itemList = items ?? []
  if (itemList.length === 0) return {}

  const rows = await mapItemRows(itemList)

  const byCard: Record<string, BudgetItemRow[]> = {}
  itemList.forEach((raw, idx) => {
    const cardId = raw.group_id as string
    ;(byCard[cardId] ??= []).push(rows[idx])
  })
  return byCard
}

// Butcenin bir kartini (cardId verilirse o karti, verilmezse ilk kart - sort_order) + etaplarini +
// kalemlerini getir. X etap-basina: periodQty[stageId]. Birim label ayri raftan map'lenir.
export async function getCard(budgetId: string, cardId?: string): Promise<CardView | null> {
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

  // D3b-2a: card_code kutuphane sorgusunun ANAHTARIDIR (aidiyet=kod doktrini, K-B). Kart ADI
  // anahtar OLAMAZ - kullanici hucrede degistirmis olabilir; kod dogumdan beri sabittir.
  const grpQuery = supabase.from('expense_groups').select('id, name, card_code').eq('budget_id', budgetId)
  const { data: grp, error: eg } = await (cardId ? grpQuery.eq('id', cardId) : grpQuery.order('sort_order').limit(1)).maybeSingle()
  if (eg) throw new Error(eg.message)
  if (!grp) return null

  const { data: items, error: ei } = await supabase
    .from('budget_items')
    .select('id, item_code, catalog_code, heading_code, library_item_id, name, name_en, unit_net, unit_id, multiplier, repeat, vat_rate, payment_status, internal_note, person_object_id, derive_rate, public_note')
    .eq('group_id', grp.id)
    .eq('is_active', true)
    .order('sort_order')
  if (ei) throw new Error(ei.message)
  const itemList = items ?? []

  const rows = await mapItemRows(itemList)

  return {
    budgetId,
    groupId: grp.id as string,
    cardCode: grp.card_code as string,
    cardName: grp.name as string,
    stages,
    items: rows,
  }
}

// Ince geriye-uyum sarmalayicisi (R3): getCard'in cardId verilmemis hali.
export async function getFirstCard(budgetId: string): Promise<CardView | null> {
  return getCard(budgetId)
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
    if (!v) throw new Error('Ad boş olamaz')
    payload = { name: v }
  } else if (field === 'nameEn') {
    const v = String(value).trim()
    payload = { name_en: v === '' ? null : v }
  } else if (field === 'paymentStatus') {
    const v = String(value)
    if (v === '') {
      payload = { payment_status: null }
    } else {
      if (!isPaymentStatus(v)) throw new Error('Geçersiz statü')
      payload = { payment_status: v }
    }
  } else if (field === 'unitId') {
    const v = String(value).trim()
    if (!v) throw new Error('Birim boş olamaz')
    payload = { unit_id: v }
  } else if (field === 'internalNote' || field === 'publicNote') {
    const noteText = String(value).trim()
    payload = { [FIELD_COL[field]]: noteText === '' ? null : noteText }
  } else if (field === 'headingCode') {
    const v = String(value).trim()
    payload = { heading_code: v === '' ? null : v }
  } else if (field === 'deriveRate') {
    const v = String(value).trim()
    if (v === '') {
      payload = { derive_rate: null }
    } else {
      const n = typeof value === 'number' ? value : Number(v.replace(',', '.'))
      if (!Number.isFinite(n)) throw new Error('Geçersiz sayı')
      if (n < 0 || n > 100) throw new Error('Oran 0 ile 100 arasında olmalı')
      payload = { derive_rate: n }
    }
  } else if (field === 'personObjectId') {
    const v = String(value).trim()
    payload = { person_object_id: v === '' ? null : v }
  } else {
    const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
    if (!Number.isFinite(n)) throw new Error('Geçersiz sayı')
    if (n < 0) throw new Error('Negatif değer girilemez')
    if (field === 'repeat' && n <= 0) throw new Error('Miktar sıfırdan büyük olmalı')
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
): Promise<{ burdens: { label: string; rate: number; kind: YukCins }[]; vatRate: number }> {
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
    const bKind: YukCins =
      (b as { burden_components?: { kind?: string } | null }).burden_components?.kind === "additive" ? "additive" : "deduction"
    return { label: bLabel, rate: Number(b.rate_percent), kind: bKind }
  })
  return { burdens, vatRate: Number(itemData.vat_rate) }
}

// Kalemin bir etaptaki X (adet) degerini yazar. 0 -> koprudeki satiri SIL (temiz).
// >0 -> upsert (item_id,stage_id UNIQUE). budget_id zorunlu (bilesik FK).
export async function setItemPeriodQuantity(
  budgetId: string,
  itemId: string,
  stageId: string,
  value: string | number,
): Promise<void> {
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) throw new Error('Geçersiz X değeri')
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

// Bir donem satirinin repeat_override (Miktar[süre]) degerini yazar. Bos string -> null (kalitima don).
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
    if (!Number.isFinite(n)) throw new Error('Geçersiz Miktar değeri')
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

// D2 fn_add_budget_item sarmalayicisi (BUTCE-SEMA-KARARLARI L + M/D2-d + D3c-2 ucuncu yol).
// Kutuphane modu: yalniz catalogCode. Serbest mod (yeni): name + paymentStatus + unitCode.
// Mevcut-kod modu (D3c-2): existingCode + name + paymentStatus + unitCode - kartin MEVCUT
// serbest kalemi ikinci kez secildiginde AYNI kodla ikinci satir doger, misc_code_seq ARTMAZ.
// Ucu de tip duzeyinde ayrik; sunucu tarafi ayrica exception ile korur.
export async function addBudgetItem(
  groupId: string,
  opts:
    | { catalogCode: string }
    | { name: string; paymentStatus: string; unitCode: string }
    | { existingCode: string; name: string; paymentStatus: string; unitCode: string }
): Promise<string> {
  const { data, error } = await supabase.rpc('fn_add_budget_item', {
    p_group_id: groupId,
    p_catalog_code: 'catalogCode' in opts ? opts.catalogCode : null,
    p_name: 'catalogCode' in opts ? null : opts.name,
    p_payment_status: 'catalogCode' in opts ? null : opts.paymentStatus,
    p_unit_code: 'catalogCode' in opts ? null : opts.unitCode,
    p_existing_code: 'existingCode' in opts ? opts.existingCode : null,
  })
  if (error) throw new Error(error.message)
  return data as unknown as string
}

export async function softDeleteBudgetItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('budget_items')
    .update({ is_active: false })
    .eq('id', itemId)
  if (error) throw new Error(error.message)
}

