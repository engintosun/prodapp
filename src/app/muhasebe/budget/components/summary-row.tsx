import { fmt } from '../format'
import { tdStyle, numStyle } from './table-styles'
import type { RowTotals } from '../totals'

// KART 1600 M3a-2 (BUTCE-EKRAN-KARARLARI bolum 20, satir 300/301/303): ozet satiri kendi
// budget_items kaydi TASIMAZ, ayni kisi etiketini tasiyan alt kalemlerin toplamini bes rakam
// olarak gosterir - heading-row.tsx ile AYNI desen (bolum 19). Fark: No hanesi ayri durur (ozet
// numara ALIR), Ad hucresi bu dilimde BOSTUR (isim popup'i M3b'nin isi, kapsam disi).
// Hucreler data-grid-cell TASIMAZ: satir KLV izgarasina girmez.
export function SummaryRow({
  rowNo,
  totals,
  collapsed,
  onToggle,
}: {
  rowNo: number
  totals: RowTotals
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <tr>
      <td style={tdStyle}>{rowNo}</td>
      <td style={{ ...tdStyle, fontWeight: 600 }} colSpan={7}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          title={collapsed ? 'Özeti aç' : 'Özeti kapat'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1,
          }}
        >
          {collapsed ? '▶' : '▼'}
        </button>
      </td>
      <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.net)}</td>
      <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.yasalYuk)}</td>
      <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.maliyet)}</td>
      <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.kdv)}</td>
      <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.brut)}</td>
      <td style={tdStyle} />
    </tr>
  )
}
