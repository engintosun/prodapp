import { fmt } from '../format'
import { tdStyle, numStyle } from './table-styles'
import type { RowTotals } from '../totals'

// DILIM 1100-B (BUTCE-EKRAN-KARARLARI bolum 19): baslik satiri para TASIMAZ, budget_items'ta
// karsiligi YOKTUR; altindaki kalemlerin toplamini uc rakam olarak gosterir (Net / Yasal Yuk /
// Brut) — bolum 18 kart toplami seridinin ayni deseni, ikinci bir toplam tanimi dogmaz.
// Hucreler data-grid-cell TASIMAZ: satir KLV izgarasina girmez, imlec ustune ugramaz.
// Gorsel ton (renk/zemin) BU TURUN KONUSU DEGIL — ayri UI turuna birakildi.
export function HeadingRow({ name, totals }: { name: string; totals: RowTotals }) {
  return (
    <tr>
      <td style={{ ...tdStyle, fontWeight: 600 }} colSpan={9}>
        {name}
      </td>
      <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.net)}</td>
      <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.yasalYuk)}</td>
      <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.brut)}</td>
    </tr>
  )
}
