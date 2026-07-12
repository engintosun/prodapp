import { memo } from 'react'
import { netToplamDonemli, brutToplamDonemli, kisiyeBanka } from '../../../../shared/cfe'
import type { Yuk } from '../../../../shared/cfe'
import type { BudgetItemRow, StageRow, UnitRow } from '../../../../shared/supabase/budget-service'
import { fmt, itemHasNote, isMultiPeriod, buildDonemler, summarizeSame, fieldVal, repeatVal } from '../format'
import type { EditApi } from '../hooks/use-edit-buffers'
import type { BordroSheetEntry } from './burden-sheet'
import { tdStyle, numStyle, cellInput, cellInputNum, cellInputEllipsis } from './table-styles'

interface ItemRowProps {
  item: BudgetItemRow
  stages: StageRow[]
  units: UnitRow[]
  api: EditApi
  bordro: BordroSheetEntry | undefined
  onOpenBurden: (itemId: string, stageId: string | null) => void
  onOpenNote: (itemId: string) => void
  bufUnitNet: string | undefined
  bufMultiplier: string | undefined
  bufRepeat: string | undefined
}

export const ItemRow = memo(function ItemRow({
  item,
  stages,
  units,
  api,
  bordro,
  onOpenBurden,
  onOpenNote,
  bufUnitNet,
  bufMultiplier,
  bufRepeat,
}: ItemRowProps) {
  const it = item
  const multi = isMultiPeriod(it)
  const addedStageIds = Object.keys(it.periodQty)
  const isBordro = it.paymentStatus === 'bordro'
  const bd = bordro
  // Bordro: motor (deriveBordroFields) kaynak; genel additive/deduction CFE yolu (cfe.ts)
  // ARTIK CAGRILMAZ (1a borcu - item_burdens skeleton bacaklari null rate tasir).
  const donemler = isBordro ? [] : buildDonemler(it)
  const yukler: Yuk[] = isBordro ? [] : it.burdens.map((b) => ({ ratePercent: b.rate, kind: b.kind }))
  const netToplam = isBordro ? (bd?.data?.totalNet ?? 0) : netToplamDonemli(donemler)
  const brutYuk = isBordro ? 0 : brutToplamDonemli(donemler, yukler)
  const kdvTl = isBordro ? 0 : kisiyeBanka(netToplam, brutYuk, it.vatRate).kdv
  const brutToplam = isBordro ? (bd?.data?.totalGross ?? 0) : brutYuk + kdvTl
  const yasalYukTl = brutToplam - netToplam
  const periodKeys = new Set(addedStageIds)
  const addableStages = stages.filter((s) => !periodKeys.has(s.id))
  const addedStages = stages.filter((s) => periodKeys.has(s.id))
  const allAdded = addableStages.length === 0

  const summaryNet = multi ? summarizeSame(addedStageIds, (sid) => it.periodNet[sid] ?? it.unitNet) : null
  const summaryUnitId = multi ? summarizeSame(addedStageIds, (sid) => it.periodUnit[sid] ?? it.unitId) : null
  const summaryQty = multi ? summarizeSame(addedStageIds, (sid) => it.periodQty[sid]) : null
  const summaryRepeatSum = multi
    ? addedStageIds.reduce((acc, sid) => acc + (it.periodRepeat[sid] ?? it.repeat), 0)
    : null

  return (
    <tr>
      <td style={tdStyle}>{it.itemCode}</td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <input
            style={cellInputEllipsis}
            value={it.name}
            onChange={(e) => api.onTextChange(it.id, 'name', e.target.value)}
            onBlur={() => api.commitField(it.id, 'name')}
          />
          <button
            type="button"
            title={itemHasNote(it) ? 'Not var' : 'Not ekle'}
            onClick={() => onOpenNote(it.id)}
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', color: itemHasNote(it) ? 'var(--color-primary)' : 'var(--color-text-muted)', opacity: itemHasNote(it) ? 1 : 0.45 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6" />
              <path d="M9 13h6M9 17h4" />
            </svg>
          </button>
        </div>
      </td>
      <td style={tdStyle}>
        <select
          style={cellInput}
          value={it.paymentStatus ?? ''}
          onChange={(e) => api.onStatusChange(it.id, e.target.value)}
        >
          <option value="">Statü seç</option>
          <option value="bordro">Bordro</option>
          <option value="smm">SMM</option>
          <option value="telif_belgeli">Telif</option>
          <option value="sirket">Fatura</option>
          <option value="kira_sahis">Kira</option>
          <option value="konaklama">Konaklama/Yemek</option>
        </select>
      </td>
      <td style={tdStyle}>
        {!multi && addedStages.length === 1 ? (
          <select
            style={cellInput}
            value={addedStages[0].id}
            onChange={(e) => {
              const sid = e.target.value
              if (sid !== addedStages[0].id) void api.onAddPeriod(it.id, sid)
            }}
          >
            <option value={addedStages[0].id}>{addedStages[0].name}</option>
            {addableStages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <select
            style={cellInput}
            value=""
            disabled={allAdded}
            onChange={(e) => {
              const sid = e.target.value
              if (sid) void api.onAddPeriod(it.id, sid)
            }}
          >
            <option value="">
              {allAdded ? 'Tüm dönemler eklendi' : multi ? '+ Dönem ekle' : '+ Dönem seç'}
            </option>
            {addableStages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </td>
      <td style={tdStyle}>
        {multi ? (
          summaryUnitId !== null ? (units.find((u) => u.id === summaryUnitId)?.label ?? it.unitLabel) : '—'
        ) : (
          <select
            style={cellInput}
            value={it.unitId}
            onChange={(e) => void api.onUnitChange(it.id, e.target.value)}
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        )}
      </td>
      <td style={numStyle}>
        {multi ? (
          summaryNet !== null ? fmt(summaryNet) : '—'
        ) : (
          <input
            style={cellInputNum}
            type="text"
            inputMode="decimal"
            value={fieldVal(bufUnitNet, it.unitNet)}
            onChange={(e) => api.onNumChange(it.id, 'unitNet', e.target.value)}
            onBlur={() => api.commitField(it.id, 'unitNet')}
          />
        )}
      </td>
      <td style={numStyle}>
        {multi ? (
          fmt(summaryRepeatSum ?? 0)
        ) : (
          <input
            style={cellInputNum}
            type="text"
            inputMode="decimal"
            value={repeatVal(bufRepeat, it.repeat)}
            onChange={(e) => api.onRepeatChange(it.id, e.target.value)}
            onBlur={() => api.commitRepeat(it.id)}
          />
        )}
      </td>
      <td style={numStyle}>
        {multi ? (
          summaryQty !== null ? fmt(summaryQty) : '—'
        ) : (
          <input
            style={cellInputNum}
            type="text"
            inputMode="decimal"
            value={fieldVal(bufMultiplier, it.multiplier)}
            onChange={(e) => api.onNumChange(it.id, 'multiplier', e.target.value)}
            onBlur={() => api.commitField(it.id, 'multiplier')}
          />
        )}
      </td>
      <td style={numStyle}>
        {isBordro && bd?.loading ? (
          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 'var(--text-xs)' }}>hesaplanıyor…</span>
        ) : isBordro && bd?.error ? (
          <span style={{ color: 'var(--color-danger, #c0392b)', fontSize: 'var(--text-xs)' }}>{bd.error}</span>
        ) : brutToplam > netToplam ? (
          <button
            onClick={() => onOpenBurden(it.id, null)}
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
            {fmt(yasalYukTl)}
          </button>
        ) : (
          '—'
        )}
      </td>
      <td style={{ ...numStyle, fontWeight: 600 }}>
        <span style={isBordro ? { opacity: 0.55 } : undefined}>{fmt(netToplam)}</span>
      </td>
      <td style={{ ...numStyle, fontWeight: 600 }}>
        <span style={isBordro ? { opacity: 0.55 } : undefined}>{fmt(brutToplam)}</span>
      </td>
    </tr>
  )
})
