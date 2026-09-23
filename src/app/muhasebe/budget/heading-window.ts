// BASLIK PENCERESI MANTIGI (BUTCE-EKRAN-KARARLARI bolum 19, 22-23 Eylul 2026).
// BOY: tek is = pencerenin listesini, hedef suzmesini ve geri alma paketlerini kurmak;
// DOM/React/Supabase yok.
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import { canChangeHeading, normalizeForSearch } from './format'

// key: kutuphane basliginda catalog_code, kullanici basliginda budget_user_headings.id.
export interface HeadingOption {
  key: string
  name: string
}

// key null = Basliksiz.
export interface WindowGroup {
  key: string | null
  name: string
  items: BudgetItemRow[]
}

export interface SendRecord {
  targetKey: string | null
  targetName: string
  moves: { id: string; from: string | null }[]
}

// Sol liste: kartin SERBEST kalemleri (canChangeHeading; kutuphane ve sablon satirlari
// girmez), bulunduklari basligin altinda. Basliksiz EN USTTE, sonra basliklar options
// sirasinda. Kartta olmayan bir basliga isaret eden kalem Basliksiz'a duser
// (groupRowsByHeading ile ayni kural). Bos grup yoktur. Liste her kartta aynidir, 1500 dahil.
export function buildWindowGroups(rows: readonly BudgetItemRow[], options: readonly HeadingOption[]): WindowGroup[] {
  const known = new Set(options.map((o) => o.key))
  const free = rows.filter((r) => canChangeHeading(r))
  const groups: WindowGroup[] = []
  const none = free.filter((r) => r.headingCode === null || !known.has(r.headingCode))
  if (none.length > 0) groups.push({ key: null, name: 'Başlıksız', items: none })
  for (const o of options) {
    const items = free.filter((r) => r.headingCode === o.key)
    if (items.length > 0) groups.push({ key: o.key, name: o.name, items })
  }
  return groups
}

// Hedef suzmesi YALNIZ arama icindir (kutuphane aramasiyla ayni normallestirici). "Ayni ad
// ayni baslik" karari burada VERILMEZ: listeden secilmeyen ad veritabanina gider
// (fn_open_user_heading), hakem odur.
export function filterHeadingOptions(options: readonly HeadingOption[], query: string): HeadingOption[] {
  const q = normalizeForSearch(query.trim())
  if (q === '') return [...options]
  return options.filter((o) => normalizeForSearch(o.name).includes(q))
}

// Geri al: her kalem GELDIGI yere doner (23 Eylul 2026; liste artik butun basliklari
// gosterdigi icin 21 Eylul'deki "Basliksiz'a geri" kurali genislendi). Ayni yerden
// gelenler tek pakette.
export function undoBatches(moves: SendRecord['moves']): { headingCode: string | null; ids: string[] }[] {
  const byFrom = new Map<string | null, string[]>()
  for (const m of moves) {
    const ids = byFrom.get(m.from)
    if (ids) ids.push(m.id)
    else byFrom.set(m.from, [m.id])
  }
  return [...byFrom.entries()].map(([headingCode, ids]) => ({ headingCode, ids }))
}
