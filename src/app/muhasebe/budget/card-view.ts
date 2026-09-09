// BU ISLEV KARTIN GORUNEN DUZENININ TEK KAYNAGIDIR. Disa aktarma, icmal ve muhur yazildiginda
// budget_items'i ham siralamayla okuyup kendi duzenini KURMAZ, bu islevi cagirir. Sebep:
// veritabani ham sirayi katalog koduna gore tutar, ekranda gorunen duzen baslik ve kisi
// bloguyla kompoze edilir; iki ayri duzen kurulursa kagit ekrandan baska cikar. Ayni kural
// display-name.ts icin de gecerlidir.
// BOY: tek is = kartin gorunen duzeninin (baslik grubu + kisi bloku + turetilen satir
// tutarlari) TEK kaynagi - DOM/React/Supabase yok.
import type { BudgetItemRow } from '../../../shared/supabase/budget-service'
import type { BordroSheetEntry } from './components/burden-sheet'
import { rowTotals } from './totals'
import type { RowTotals } from './totals'
import { groupRowsByHeading } from './format'
import { groupByPerson, buildRenderRows, derivedUnitNets } from './person-groups'
import type { RenderRow } from './person-groups'

export type CardRenderRow =
  | { kind: 'summary'; personObjectId: string; rows: BudgetItemRow[]; totals: RowTotals }
  | { kind: 'item'; row: BudgetItemRow; underSummary: boolean; totals: RowTotals }

export interface CardViewGroup {
  heading: { key: string | null; name: string } | null
  totals: RowTotals
  renderRows: CardRenderRow[]
}

export interface CardView {
  groups: CardViewGroup[]
  cardTotals: RowTotals
  rowTotalsById: Record<string, RowTotals>
}

const ZERO_TOTALS: RowTotals = { net: 0, yasalYuk: 0, maliyet: 0, kdv: 0, brut: 0 }

function addTotals(a: RowTotals, b: RowTotals): RowTotals {
  return {
    net: a.net + b.net,
    yasalYuk: a.yasalYuk + b.yasalYuk,
    maliyet: a.maliyet + b.maliyet,
    kdv: a.kdv + b.kdv,
    brut: a.brut + b.brut,
  }
}

function sumRows(rows: readonly BudgetItemRow[], rowTotalsById: Readonly<Record<string, RowTotals>>): RowTotals {
  return rows.reduce<RowTotals>((acc, r) => addTotals(acc, rowTotalsById[r.id] ?? ZERO_TOTALS), ZERO_TOTALS)
}

function enrichRenderRow(rr: RenderRow, rowTotalsById: Readonly<Record<string, RowTotals>>): CardRenderRow {
  if (rr.kind === 'summary') {
    return { kind: 'summary', personObjectId: rr.personObjectId, rows: rr.rows, totals: sumRows(rr.rows, rowTotalsById) }
  }
  return { kind: 'item', row: rr.row, underSummary: rr.underSummary, totals: rowTotalsById[rr.row.id] ?? ZERO_TOTALS }
}

// Sira: (1) turetilmemis satirlarin netleri hesaplanir, (2) derivedUnitNets ile turetilen
// satirlarin birim netleri dogar (B18: IKINCI BIR HESAP YAZILMAZ, person-groups.ts CAGIRILIR),
// (3) turetilen satirlarin TUM tutarlari (ara toplam, yasal yuk, KDV, toplam) veritabanindaki
// sifir yerine bu birim netle doner, (4) basliga gore bolunur, (5) her baslik grubu icinde
// kisi bloklari toplanir.
export function buildCardView(
  rows: readonly BudgetItemRow[],
  headings: readonly { catalogCode: string; name: string }[],
  bordroData: Readonly<Record<string, BordroSheetEntry>>,
): CardView {
  const rowTotalsById: Record<string, RowTotals> = {}
  const netByItemId: Record<string, number> = {}
  for (const row of rows) {
    if (row.deriveRate === null) {
      const t = rowTotals(row, bordroData[row.id])
      rowTotalsById[row.id] = t
      netByItemId[row.id] = t.net
    }
  }
  const unitNetOverrides = derivedUnitNets(rows, netByItemId)
  for (const row of rows) {
    if (row.deriveRate !== null) {
      rowTotalsById[row.id] = rowTotals(row, bordroData[row.id], unitNetOverrides[row.id] ?? 0)
    }
  }

  const headingGroups = groupRowsByHeading([...rows], [...headings])
  const summaryPersonIds = new Set(groupByPerson(rows).filter((g) => g.hasSummary).map((g) => g.personObjectId))

  const groups: CardViewGroup[] = headingGroups.map((g) => ({
    heading: g.heading,
    totals: sumRows(g.rows, rowTotalsById),
    renderRows: buildRenderRows(g.rows, summaryPersonIds).map((rr) => enrichRenderRow(rr, rowTotalsById)),
  }))

  return {
    groups,
    cardTotals: sumRows(rows, rowTotalsById),
    rowTotalsById,
  }
}
