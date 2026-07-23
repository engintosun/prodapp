import { memo } from 'react'
import { netToplamDonemli, brutToplamDonemli, kisiyeBanka } from '../../../../shared/cfe'
import type { Yuk, DonemKalemi } from '../../../../shared/cfe'
import type { BudgetItemRow, StageRow, UnitRow } from '../../../../shared/supabase/budget-service'
import { fmt, periodVal, periodNetVal, periodRepeatVal, bordroAllowedUnits } from '../format'
import type { ValueWarning } from '../format'
import type { EditApi } from '../hooks/use-edit-buffers'
import type { BordroSheetEntry } from './burden-sheet'
import { cellInput, cellInputNum, cellInputNumMuted, periodRowStyle, periodRowSelectTd, periodRowNumStyle, periodRowInputTd } from './table-styles'

interface PeriodRowProps {
  item: BudgetItemRow
  stage: StageRow
  api: EditApi
  units: UnitRow[]
  bordro: BordroSheetEntry | undefined
  warning: ValueWarning
  onOpenBurden: (itemId: string, stageId: string | null) => void
  bufQty: string | undefined
  bufNet: string | undefined
  bufRepeat: string | undefined
  navQty: string | undefined
  navNet: string | undefined
  navRepeat: string | undefined
}

export const PeriodRow = memo(function PeriodRow({
  item,
  stage,
  api,
  units,
  bordro,
  warning,
  onOpenBurden,
  bufQty,
  bufNet,
  bufRepeat,
  navQty,
  navNet,
  navRepeat,
}: PeriodRowProps) {
  const it = item
  const s = stage
  const isBordro = it.paymentStatus === 'bordro'
  const bd = bordro
  const yukler: Yuk[] = isBordro ? [] : it.burdens.map((b) => ({ ratePercent: b.rate, kind: b.kind }))
  const qty = it.periodQty[s.id] ?? 0
  const netOverride = it.periodNet[s.id] ?? null
  const unitOverride = it.periodUnit[s.id] ?? null
  const effectiveUnitId = unitOverride ?? it.unitId
  const repeatOverride = it.periodRepeat[s.id] ?? null
  const effectiveNet = netOverride ?? it.unitNet
  const effectiveRepeat = repeatOverride ?? it.repeat
  const periodBd = isBordro ? (bd?.data?.periodBreakdown.find((p) => p.stageId === s.id) ?? null) : null
  const donemKalemi: DonemKalemi = { net: effectiveNet, qty, carpan: effectiveRepeat }
  const donemNet = isBordro ? (periodBd?.netTotal ?? 0) : netToplamDonemli([donemKalemi])
  const donemBrutYuk = isBordro ? 0 : brutToplamDonemli([donemKalemi], yukler)
  const donemKdv = isBordro ? 0 : kisiyeBanka(donemNet, donemBrutYuk, it.vatRate).kdv
  const donemBrut = isBordro ? (periodBd?.grossTotal ?? 0) : donemBrutYuk + donemKdv
  const donemYasalYuk = isBordro ? (periodBd?.legalBurden ?? 0) : donemBrut - donemNet

  return (
    <tr>
      <td style={periodRowStyle} />
      <td style={periodRowStyle} />
      <td style={periodRowStyle} />
      <td style={periodRowStyle}>{s.name}</td>
      <td style={periodRowSelectTd}>
        <select
          data-grid-cell="true"
          data-row-id={`${it.id}:${s.id}`}
          data-col="periodUnit"
          data-cell-kind="select"
          style={cellInput}
          value={effectiveUnitId}
          onChange={(e) => void api.onPeriodUnitChange(it.id, s.id, e.target.value)}
        >
          {(isBordro ? bordroAllowedUnits(units) : units).map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
      </td>
      <td style={periodRowInputTd}>
        <input
          data-grid-cell="true"
          data-row-id={`${it.id}:${s.id}`}
          data-col="periodNet"
          style={netOverride === null ? cellInputNumMuted : cellInputNum}
          type="text"
          inputMode="decimal"
          value={navNet ?? periodNetVal(bufNet, netOverride, it.unitNet)}
          onChange={(e) => api.onPeriodNetChange(it.id, s.id, e.target.value)}
          onBlur={() => api.commitPeriodNet(it.id, s.id)}
          title={netOverride === null ? 'Kalemden miras (değiştirmek için yaz)' : 'Döneme özel net'}
        />
      </td>
      <td style={periodRowInputTd}>
        <input
          data-grid-cell="true"
          data-row-id={`${it.id}:${s.id}`}
          data-col="periodRepeat"
          style={cellInputNum}
          type="text"
          inputMode="decimal"
          value={navRepeat ?? periodRepeatVal(bufRepeat, repeatOverride, it.repeat)}
          onChange={(e) => api.onPeriodRepeatChange(it.id, s.id, e.target.value)}
          onBlur={() => api.commitPeriodRepeat(it.id, s.id)}
          title={repeatOverride === null ? 'Kalemden miras (değiştirmek için yaz)' : 'Döneme özel Miktar'}
        />
      </td>
      <td style={periodRowInputTd}>
        <input
          data-grid-cell="true"
          data-row-id={`${it.id}:${s.id}`}
          data-col="periodQty"
          style={cellInputNum}
          type="text"
          inputMode="decimal"
          value={navQty ?? periodVal(bufQty, qty)}
          onChange={(e) => api.onPeriodChange(it.id, s.id, e.target.value)}
          onBlur={() => api.commitPeriod(it.id, s.id)}
        />
      </td>
      <td style={periodRowNumStyle}>
        {/* TD-14 ucuncu duzeltme (2026-07-18): cok-donemli kalemde uyari BU donem satirinda
            gosterilir (item-row.tsx ust/ozet satirinda ARTIK gosterilmiyor) - dogru yer sorunlu
            donemin kendisi, ust satir hep dogru toplami gosterir. */}
        {warning ? (
          <span style={{ color: 'var(--color-danger, #c0392b)', fontSize: 'var(--text-xs)' }}>
            {warning === 'net'
              ? isBordro
                ? 'Net 0 olamaz'
                : 'Bedel 0'
              : warning === 'net-min-wage'
                ? 'Net asgari altı'
                : warning === 'x'
                  ? 'X 0 olamaz'
                  : 'Miktar 0 olamaz'}
          </span>
        ) : donemBrut > donemNet ? (
          <button
            data-grid-cell="true"
            data-row-id={`${it.id}:${s.id}`}
            data-col="periodBurden"
            data-cell-kind="button"
            onClick={() => onOpenBurden(it.id, s.id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              fontSize: 'var(--text-sm)',
              fontVariantNumeric: 'tabular-nums',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            {fmt(donemYasalYuk)}
          </button>
        ) : (
          '—'
        )}
      </td>
      <td style={periodRowNumStyle}>{fmt(donemNet)}</td>
      <td style={periodRowNumStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <span>{fmt(donemBrut)}</span>
          <button
            onClick={() => void api.onRemovePeriod(it.id, s.id)}
            style={{
              display: 'inline-flex',
              width: 20,
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-base)',
              padding: 0,
              lineHeight: 1,
            }}
            title="Dönemi kaldır"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  )
})
