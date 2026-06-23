import { supabase } from './client'

export interface BudgetItemRow {
  id: string
  itemCode: number
  name: string
  detail: string | null
  unitNet: number
  unitLabel: string
  multiplier: number
  vatRate: number
  ratesPercent: number[]
  quantity: number
}

export interface CardView {
  budgetId: string
  groupId: string
  cardName: string
  items: BudgetItemRow[]
}

async function getProjectId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) throw new Error('Oturum bulunamadı, tekrar giriş yapın')
  const projectId = data.session.user.app_metadata?.project_id as string | undefined
  if (!projectId) throw new Error('Aktif proje bulunamadı')
  return projectId
}

// Aktif projede 'single' butce var mi? Yoksa projenin turune uygun aktif sistem
// sablonundan fn_open_budget ile ac (kimlikli muhasebe; migration'dan acilamaz).
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

// Butcenin ilk kartini (sort_order) + kalemlerini getir. Birim label ayri raftan
// map'lenir (PostgREST embed'e bagimli degil). Miktar = kalem-donem koprusu toplami
// (Model A: acilista bos -> 0). Yuk = item_burdens oranlari.
export async function getFirstCard(budgetId: string): Promise<CardView | null> {
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
    .select('id, item_code, name, detail, unit_net, unit_id, multiplier, vat_rate')
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
  const qtyByItem: Record<string, number> = {}
  if (itemIds.length) {
    const { data: burdens, error: eb } = await supabase
      .from('item_burdens')
      .select('item_id, rate_percent')
      .in('item_id', itemIds)
    if (eb) throw new Error(eb.message)
    for (const b of burdens ?? []) {
      const k = b.item_id as string
      ;(burdensByItem[k] ??= []).push(Number(b.rate_percent))
    }

    const { data: periods, error: ep } = await supabase
      .from('budget_item_periods')
      .select('item_id, quantity')
      .in('item_id', itemIds)
    if (ep) throw new Error(ep.message)
    for (const p of periods ?? []) {
      const k = p.item_id as string
      qtyByItem[k] = (qtyByItem[k] ?? 0) + Number(p.quantity)
    }
  }

  const rows: BudgetItemRow[] = itemList.map((i) => ({
    id: i.id as string,
    itemCode: i.item_code as number,
    name: i.name as string,
    detail: (i.detail as string | null) ?? null,
    unitNet: Number(i.unit_net),
    unitLabel: unitLabel[i.unit_id as string] ?? '',
    multiplier: Number(i.multiplier),
    vatRate: Number(i.vat_rate),
    ratesPercent: burdensByItem[i.id as string] ?? [],
    quantity: qtyByItem[i.id as string] ?? 0,
  }))

  return { budgetId, groupId: grp.id as string, cardName: grp.name as string, items: rows }
}
