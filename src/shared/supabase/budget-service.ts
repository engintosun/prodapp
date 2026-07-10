import Decimal from 'decimal.js'
import { supabase } from './client'
import { resolvePayrollItem, deriveMinimumWageExemptionSeries, deriveStampDutyExemption } from '../cfe'
import type { PayrollLegs, TaxBracket, PayrollRates, PayrollMonthInput, PayrollMonthResult, PayrollSignal, PayrollEnvelope } from '../cfe'

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

export type EditableField =
  | 'name'
  | 'descriptionEn'
  | 'unitNet'
  | 'multiplier'
  | 'repeat'
  | 'vatRate'
  | 'paymentStatus'
  | 'unitId'
  | 'internalNote'
  | 'publicNote'

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
      // rate_percent NULL = iskelet bacagi (fill_mode=skeleton, orn. bordro); Number(null)===0 SESSIZCE
      // yanlis-sifir uretirdi - bu satirlar genel additive/deduction dokumune (CFE) hic girmez.
      const rate = b.rate_percent === null ? null : Number(b.rate_percent)
      if (rate === null) continue
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

// Birim -> gun karsiligi (bordro ay-dagilimi icin). episode/flat gibi bordroda anlamsiz birimler
// icin 30 gun varsayilir (console.warn ile isaretlenir), throw ETMEZ. Tek kaynak: hem skeleton gun
// bolusturmede hem Birim Net'i ay-esdegerine cevirmede (S1, DILIM-3e-1) kullanilir.
const UNIT_DAY_LENGTH: Record<string, number> = { day: 1, week: 7, month: 30 }

function unitDayLength(unitCode: string): number {
  const len = UNIT_DAY_LENGTH[unitCode]
  if (len === undefined) {
    console.warn(`Payroll: beklenmeyen Birim (${unitCode}), bordroda gun/hafta/ay bekleniyordu - 30 gun varsayildi`)
    return 30
  }
  return len
}

// Girilen Birim Net'i (o birimin TEK doneminde kazanilan net) ay-esdegerine cevirir (S1 duzeltmesi,
// DILIM-3e-1): motor targetNetFullMonth'u hep TAM AYLIK net bekler - hafta biriminde girilen 5000,
// 5000*30/7 aylik esdegerine cevrilmeden hic dokunulmadan motora veriliyordu (bug).
export function monthEquivalentNet(net: number, unitCode: string): number {
  return new Decimal(net).mul(30).div(unitDayLength(unitCode)).toNumber()
}

// rate_catalog'dan bu ayin yururlukteki bordro parametrelerini derler. Su an tek yurutluk-donemi
// (2026-01-01) var; coklu-vintage cozumleme (Temmuz/Ocak parametre degisimi) rate_catalog semasi
// destekler ama bu DILIM'de tek-donem veriyle calisir (K5: mekanizma hazir, veri buyudukce genisler).
async function fetchPayrollRates(): Promise<PayrollRates> {
  const today = new Date().toISOString().slice(0, 10)
  const { data: rows, error } = await supabase
    .from('rate_catalog')
    .select('rate_percent, amount_tl, bracket_floor, bracket_base_tax, valid_from, value_kind, burden_components(code)')
    .lte('valid_from', today)
    .order('valid_from', { ascending: false })
  if (error) throw new Error(error.message)
  const all = rows ?? []

  function codeOf(r: (typeof all)[number]): string | undefined {
    return (r as { burden_components?: { code?: string } | null }).burden_components?.code
  }
  function latestOran(code: string): number {
    const row = all.find((r) => codeOf(r) === code && r.value_kind === 'oran')
    if (!row) throw new Error(`Payroll: rate_catalog eksik parametre (${code}, oran)`)
    return Number(row.rate_percent)
  }
  function latestTutar(code: string): number {
    const row = all.find((r) => codeOf(r) === code && r.value_kind === 'tutar')
    if (!row) throw new Error(`Payroll: rate_catalog eksik parametre (${code}, tutar)`)
    return Number(row.amount_tl)
  }
  const brackets: TaxBracket[] = all
    .filter((r) => codeOf(r) === 'gv_ucret' && r.value_kind === 'tarife')
    .map((r) => ({
      floor: Number(r.bracket_floor),
      ratePercent: Number(r.rate_percent),
      baseTax: Number(r.bracket_base_tax),
    }))
    .sort((a, b) => a.floor - b.floor)
  if (brackets.length === 0) throw new Error('Payroll: gv_ucret tarife satirlari bulunamadi')

  return {
    socialSecurityEmployeePercent: latestOran('sgk_isci'),
    unemploymentEmployeePercent: latestOran('issizlik_isci'),
    // Sirket-Profili senaryo secici (borclu/kultur girisim/kultur yatirim) henuz UI'da yok (PERSONEL-
    // MEVZUATI B/H); sgk_isveren item_burdens'inda daima NULL durur (fill_mode=skeleton). Standart
    // senaryo rate_catalog varsayilanidir - senaryo secimi gelecek bir DILIM'in konusu.
    socialSecurityEmployerPercent: latestOran('sgk_isveren'),
    unemploymentEmployerPercent: latestOran('issizlik_isveren'),
    stampDutyPercent: latestOran('damga'),
    incomeTaxBrackets: brackets,
    minimumWageGrossThisMonth: latestTutar('parametre_asgari_brut'),
    socialSecurityCeilingMultiplier: latestTutar('parametre_sgk_tavan_katsayi'),
  }
}

export interface BordroPeriodBreakdownEntry {
  periodIndex: number
  stageId: string | null
  netTotal: number
  grossTotal: number
  legalBurden: number
}

export interface BordroDerivedFields {
  totalNet: number
  totalGross: number
  monthlySeries: PayrollMonthResult[]
  signals: PayrollSignal[]
  bucketBreakdown: PayrollEnvelope['bucketBreakdown']
  periodBreakdown: BordroPeriodBreakdownEntry[]
}

export type BordroDerivationReason = 'invalid_net' | 'no_periods' | 'unknown'

export type BordroDerivationResult = { ok: true; data: BordroDerivedFields } | { ok: false; reason: BordroDerivationReason }

export interface BordroItemFields {
  unitNet: number
  unitCode: string
  multiplier: number
  repeat: number
}

export interface BordroPeriodRow {
  quantity: number
  repeatOverride: number | null
  unitCodeOverride: string | null
  unitNetOverride: number | null
  sortOrder: number
  startDate: string | null
  isUndated: boolean
  stageId: string | null
}

function anchorOf(stage: { startDate: string | null; isUndated: boolean } | undefined): { year: number; month: number; usesDefaultCalendar: boolean } {
  if (stage && !stage.isUndated && stage.startDate) {
    const d = new Date(stage.startDate)
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, usesDefaultCalendar: false }
  }
  // Tarih bilinmiyorken herkes Ocak'ta ise girmis varsayilir: istisna serisinin en dusuk degerleri ->
  // maliyet en yuksek (ihtiyat-lehine risk payi, Engin karari 07-07). Iki ozdes butce olusturulma
  // tarihinden bagimsiz AYNI rakami verir. Gercek tarih girildiginde gercek takvim kullanilir,
  // maliyet ancak asagi iner.
  return { year: new Date().getUTCFullYear(), month: 1, usesDefaultCalendar: true }
}

// Motor hatasini (Error) tipli reason'a cevirir - ham error.message asla disariya sizmaz (savunma
// kurali, DILIM-3e-1). Mesaj icerigine gore siniflandirir: "net" gecen -> gecersiz hedef net,
// "donem"/"K faktoru" gecen -> kalemin donem/miktar verisi hic ay uretmedi, digerleri -> bilinmeyen.
function classifyBordroError(e: unknown): BordroDerivationReason {
  const message = e instanceof Error ? e.message : ''
  if (/net/i.test(message)) return 'invalid_net'
  if (/donem|K faktoru/i.test(message)) return 'no_periods'
  return 'unknown'
}

// Saf hesap cekirdegi (DB'ye dokunmaz, dogrudan test edilir). Kalemin donem/miktar/carpan verisinden
// ay iskeleti kurar: 0/1 donemde ana satir Miktar/Carpan/Birim'ini parametre olarak kullanir (buildDonemler
// UI ile AYNI davranis, K9 muhuru); >1 donemde her donem KENDI override'iyla ozerktir (S5 duzeltmesi -
// unit_net_override artik okunuyor). Her donemin Birim Net'i kendi Biriminden ay-esdegerine cevrilir
// (S1 duzeltmesi) - tek global hedef yok, her donem kendi sozlesmesi. Toplam sure = tum donemlerin
// (Miktar x Carpan) duz toplami; sadece ilk donem ankorlanir (K7), sonrakiler kesintisiz devam eder.
export function computeBordroFields(
  item: BordroItemFields,
  periodRows: BordroPeriodRow[],
  legs: PayrollLegs,
  rates: PayrollRates,
): BordroDerivedFields {
  interface PeriodSpec {
    quantity: number
    repeatVal: number
    unitCode: string
    netFullMonth: number
    stageId: string | null
  }

  let firstStage: { startDate: string | null; isUndated: boolean } | undefined
  const periods: PeriodSpec[] = []
  if (periodRows.length <= 1) {
    firstStage = periodRows[0]
    periods.push({
      quantity: item.multiplier,
      repeatVal: item.repeat,
      unitCode: item.unitCode,
      netFullMonth: monthEquivalentNet(item.unitNet, item.unitCode),
      stageId: periodRows.length === 1 ? periodRows[0].stageId : null,
    })
  } else {
    const sorted = [...periodRows].sort((a, b) => a.sortOrder - b.sortOrder)
    firstStage = sorted[0]
    for (const p of sorted) {
      const unitCode = p.unitCodeOverride ?? item.unitCode
      const netSource = p.unitNetOverride ?? item.unitNet
      periods.push({
        quantity: p.quantity,
        repeatVal: p.repeatOverride ?? item.repeat,
        unitCode,
        netFullMonth: monthEquivalentNet(netSource, unitCode),
        stageId: p.stageId,
      })
    }
  }

  const anchor = anchorOf(firstStage)
  let cursorYear = anchor.year
  let cursorMonth = anchor.month
  let usedInCursorMonth = 0

  const skeleton: {
    year: number
    month: number
    dayCount: number
    headcount: number
    targetNetFullMonth: number
    periodIndex: number
  }[] = []
  periods.forEach((per, periodIndex) => {
    if (per.quantity <= 0) return
    let remainingDays = Math.round(per.repeatVal * unitDayLength(per.unitCode))
    while (remainingDays > 0) {
      const spaceLeftInMonth = 30 - usedInCursorMonth
      const chunk = Math.min(spaceLeftInMonth, remainingDays)
      // Donem ay sinirini asip birden fazla skeleton parcasina bolunse bile (bu while dongusu),
      // TUM parcalar AYNI periodIndex'i tasir - kasitli, periodBreakdown gruplamasinda birlesecekler.
      skeleton.push({
        year: cursorYear,
        month: cursorMonth,
        dayCount: chunk,
        headcount: per.quantity,
        targetNetFullMonth: per.netFullMonth,
        periodIndex,
      })
      remainingDays -= chunk
      usedInCursorMonth += chunk
      if (usedInCursorMonth >= 30) {
        usedInCursorMonth = 0
        cursorMonth += 1
        if (cursorMonth > 12) {
          cursorMonth = 1
          cursorYear += 1
        }
      }
    }
  })
  if (skeleton.length === 0) throw new Error('Payroll: kalemin donem/miktar/carpan verisinden ay uretilemedi')

  const K = skeleton.reduce((acc, s) => acc + (s.dayCount / 30) * s.headcount, 0)
  if (K <= 0) throw new Error('Payroll: K faktoru sifir veya negatif, hesaplanamaz')

  const employeeSSPercent = legs.socialSecurityEmployee ? rates.socialSecurityEmployeePercent : 0
  const employeeUnempPercent = legs.unemploymentEmployee ? rates.unemploymentEmployeePercent : 0
  const exemptionSeries = deriveMinimumWageExemptionSeries(
    rates.minimumWageGrossThisMonth,
    employeeSSPercent,
    employeeUnempPercent,
    rates.incomeTaxBrackets,
  )
  const stampExemption = deriveStampDutyExemption(rates.minimumWageGrossThisMonth, rates.stampDutyPercent)

  // Donem gecisi ay ortasindaysa ayni gercek (yil,ay) ikilisine birden fazla skeleton satiri dusebilir;
  // her satira o ayin istisnasini TAM vermek ayni ay icin istisnayi iki kere sayardi (ihtiyat-ALEYHINE
  // hata). Istisna dayCount/30 oraniyla dagitilir: tam kapsanan ay toplamda TAM istisna alir, kist ay
  // gun-oranli (eksik) alir - yon ihtiyat-lehine.
  const months: PayrollMonthInput[] = skeleton.map((s) => {
    const dayRatio = new Decimal(s.dayCount).div(30)
    return {
      year: s.year,
      month: s.month,
      dayCount: s.dayCount,
      headcount: s.headcount,
      priorCumulativeTaxBase: 0,
      incomeTaxExemptionThisMonth: new Decimal(exemptionSeries[s.month - 1])
        .mul(dayRatio)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        .toNumber(),
      stampDutyExemptionThisMonth: new Decimal(stampExemption)
        .mul(dayRatio)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        .toNumber(),
      calculationType: 'net_to_gross' as const,
      targetNetFullMonth: s.targetNetFullMonth,
      periodIndex: s.periodIndex,
      usesDefaultCalendar: anchor.usesDefaultCalendar,
    }
  })

  const envelope = resolvePayrollItem(months, legs, rates)

  // Donem-bazli gruplama: motor ay-bazli calisir (kumulatif vergi tabani ay siniriyla ilerler, K7
  // ankoru), donem-bazli DEGIL - bir donem ay sinirini asip birden fazla skeleton parcasina
  // bolunebilir (yukarida periods.forEach). Cozum donemi hesaba karistirmiyor, sadece SONUCA
  // (monthlySeries) hangi donemden geldigini periodIndex ile etiketleyip burada gruplu topluyor.
  const breakdownByIndex = new Map<number, { netTotal: Decimal; grossTotal: Decimal }>()
  for (const r of envelope.monthlySeries) {
    const hc = new Decimal(r.effectiveHeadcount)
    const acc = breakdownByIndex.get(r.periodIndex) ?? { netTotal: new Decimal(0), grossTotal: new Decimal(0) }
    acc.netTotal = acc.netTotal.plus(new Decimal(r.netPerPerson).mul(hc))
    // grossTotal burada da uretici maliyeti (costPerPerson) - S2 ile ayni mantik, kisi brutu degil.
    acc.grossTotal = acc.grossTotal.plus(new Decimal(r.costPerPerson).mul(hc))
    breakdownByIndex.set(r.periodIndex, acc)
  }
  const periodBreakdown: BordroPeriodBreakdownEntry[] = [...breakdownByIndex.entries()]
    .sort(([a], [b]) => a - b)
    .map(([periodIndex, acc]) => {
      const netTotal = acc.netTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
      const grossTotal = acc.grossTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
      const legalBurden = acc.grossTotal.minus(acc.netTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
      const stageId = periods[periodIndex]?.stageId ?? null
      return { periodIndex, stageId, netTotal, grossTotal, legalBurden }
    })

  return {
    totalNet: envelope.netTotal,
    totalGross: envelope.grossTotal,
    monthlySeries: envelope.monthlySeries,
    signals: envelope.signals,
    bucketBreakdown: envelope.bucketBreakdown,
    periodBreakdown,
  }
}

// computeBordroFields'i sarar: motor Error firlatirsa (orn. hedef net 0/negatif) ham mesaji tipli
// reason'a cevirir. Servis katmaninin temiz sozlesmesi budur - dogrudan test edilir.
export function computeBordroFieldsResult(
  item: BordroItemFields,
  periodRows: BordroPeriodRow[],
  legs: PayrollLegs,
  rates: PayrollRates,
): BordroDerivationResult {
  try {
    return { ok: true, data: computeBordroFields(item, periodRows, legs, rates) }
  } catch (e) {
    return { ok: false, reason: classifyBordroError(e) }
  }
}

// Bordro kalemi icin DB'den okuyup computeBordroFieldsResult'i cagirir. UI (budget-card-screen.tsx)
// bu fonksiyonu try/catch ile sarar; motor hatasinda ham mesaj degil tipli reason kodu firlatilir
// (ham hata sizintisi savunmasi, DILIM-3e-1). input_mode/input_value KULLANILMAZ - kaynak her zaman
// unit_net (item veya donem override).
export async function deriveBordroFields(itemId: string): Promise<BordroDerivedFields> {
  const { data: itemData, error: ei } = await supabase
    .from('budget_items')
    .select('id, budget_id, unit_net, unit_id, multiplier, repeat')
    .eq('id', itemId)
    .single()
  if (ei) throw new Error(ei.message)

  const { data: periodRowsRaw, error: ep } = await supabase
    .from('budget_item_periods')
    .select('stage_id, quantity, repeat_override, unit_id_override, unit_net_override')
    .eq('item_id', itemId)
  if (ep) throw new Error(ep.message)

  const stageIds = (periodRowsRaw ?? []).map((p) => p.stage_id as string)
  const stageById = new Map<string, { startDate: string | null; isUndated: boolean; sortOrder: number }>()
  if (stageIds.length) {
    const { data: stageRows, error: es } = await supabase
      .from('budget_stages')
      .select('id, start_date, is_undated, sort_order')
      .in('id', stageIds)
    if (es) throw new Error(es.message)
    for (const s of stageRows ?? []) {
      stageById.set(s.id as string, {
        startDate: (s.start_date as string | null) ?? null,
        isUndated: s.is_undated as boolean,
        sortOrder: s.sort_order as number,
      })
    }
  }

  const { data: unitRows, error: eu } = await supabase.from('units').select('id, code')
  if (eu) throw new Error(eu.message)
  const unitCodeById = new Map<string, string>((unitRows ?? []).map((u) => [u.id as string, u.code as string]))

  const { data: burdenRows, error: eb } = await supabase
    .from('item_burdens')
    .select('burden_components(code)')
    .eq('item_id', itemId)
  if (eb) throw new Error(eb.message)
  const legCodes = new Set(
    (burdenRows ?? [])
      .map((r) => (r as { burden_components?: { code?: string } | null }).burden_components?.code)
      .filter((c): c is string => !!c),
  )
  const legs: PayrollLegs = {
    socialSecurityEmployee: legCodes.has('sgk_isci'),
    unemploymentEmployee: legCodes.has('issizlik_isci'),
    socialSecurityEmployer: legCodes.has('sgk_isveren'),
    unemploymentEmployer: legCodes.has('issizlik_isveren'),
  }

  const rates = await fetchPayrollRates()

  const periodRows: BordroPeriodRow[] = (periodRowsRaw ?? []).map((p) => {
    const stage = stageById.get(p.stage_id as string)
    return {
      quantity: Number(p.quantity),
      repeatOverride: p.repeat_override !== null && p.repeat_override !== undefined ? Number(p.repeat_override) : null,
      unitCodeOverride: p.unit_id_override ? (unitCodeById.get(p.unit_id_override as string) ?? null) : null,
      unitNetOverride:
        p.unit_net_override !== null && p.unit_net_override !== undefined ? Number(p.unit_net_override) : null,
      sortOrder: stage?.sortOrder ?? 0,
      startDate: stage?.startDate ?? null,
      isUndated: stage?.isUndated ?? true,
      stageId: p.stage_id as string,
    }
  })

  const item: BordroItemFields = {
    unitNet: Number(itemData.unit_net),
    unitCode: unitCodeById.get(itemData.unit_id as string) ?? 'month',
    multiplier: Number(itemData.multiplier),
    repeat: Number(itemData.repeat),
  }

  const result = computeBordroFieldsResult(item, periodRows, legs, rates)
  if (!result.ok) throw new Error(result.reason)
  return result.data
}
