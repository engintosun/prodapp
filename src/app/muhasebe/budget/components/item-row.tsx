// BOY: tek iş = kart tablosunun kalem satırı bileşeni (14 kolonluk KİLİTLİ kolon setinin tek satırlık render'ı + bordro/genel ayrımı + dönem-satırı açılımı), sebep = kolon seti kilitli tek bir kontrat; satır render'ı bölünürse kolon hizası iki dosyada ayrı ayrı korunmak zorunda kalır.
import { memo } from 'react'
import { PAYMENT_STATUSES } from '../../../../shared/types/domain'
import type { BudgetItemRow, StageRow, UnitRow } from '../../../../shared/supabase/budget-service'
import { fmt, itemHasNote, canChangeHeading, isMultiPeriod, summarizeSame, fieldVal, repeatVal, bordroAllowedUnits } from '../format'
import type { ValueWarning } from '../format'
import { rowTotals } from '../totals'
import type { EditApi } from '../hooks/use-edit-buffers'
import type { BordroSheetEntry } from './burden-sheet'
import { tdStyle, selectTd, numStyle, numFlushTd, readOnlyNumTd, readOnlyTextTd, silTd, silButton, cellInput, cellInputNum, cellInputEllipsis } from './table-styles'

interface ItemRowProps {
  item: BudgetItemRow
  rowNo: number | null
  stages: StageRow[]
  units: UnitRow[]
  api: EditApi
  bordro: BordroSheetEntry | undefined
  warning: ValueWarning
  onOpenBurden: (itemId: string, stageId: string | null) => void
  onOpenNote: (itemId: string) => void
  onOpenHeading: (itemId: string) => void
  onOpenPerson: (itemId: string) => void
  onRemove: (itemId: string) => void
  personNameById: ReadonlyMap<string, string>
  justAdded: boolean
  bufUnitNet: string | undefined
  bufMultiplier: string | undefined
  bufRepeat: string | undefined
  navUnitNet: string | undefined
  navMultiplier: string | undefined
  navRepeat: string | undefined
  bufDeriveRate: string | undefined
  navDeriveRate: string | undefined
}

export const ItemRow = memo(function ItemRow({
  item,
  rowNo,
  stages,
  units,
  api,
  bordro,
  warning,
  onOpenBurden,
  onOpenNote,
  onOpenHeading,
  onOpenPerson,
  onRemove,
  personNameById,
  justAdded,
  bufUnitNet,
  bufMultiplier,
  bufRepeat,
  navUnitNet,
  navMultiplier,
  navRepeat,
  bufDeriveRate,
  navDeriveRate,
}: ItemRowProps) {
  const it = item
  const isCommission = it.deriveRate !== null
  const multi = isMultiPeriod(it)
  const addedStageIds = Object.keys(it.periodQty)
  const isBordro = it.paymentStatus === 'bordro'
  const bd = bordro
  const { net: araToplam, yasalYuk: yasalYukTl, maliyet, kdv, brut: brutToplam } = rowTotals(it, bordro)
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
    <tr data-item-id={it.id} data-just-added={justAdded ? 'true' : undefined}>
      <td style={tdStyle}>{rowNo ?? ''}</td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <input
            data-grid-cell="true"
            data-row-id={it.id}
            data-col="name"
            style={cellInputEllipsis}
            value={it.name}
            onChange={(e) => api.onTextChange(it.id, 'name', e.target.value)}
            onBlur={() => api.commitField(it.id, 'name')}
          />
          <button
            type="button"
            data-grid-cell="true"
            data-row-id={it.id}
            data-col="note"
            data-cell-kind="button"
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
          {canChangeHeading(it) && (
            <button
              type="button"
              data-grid-cell="true"
              data-row-id={it.id}
              data-col="heading"
              data-cell-kind="button"
              title="Başlık"
              onClick={() => onOpenHeading(it.id)}
              style={{ display: 'flex', alignItems: 'center', flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', color: it.headingCode ? 'var(--color-primary)' : 'var(--color-text-muted)', opacity: it.headingCode ? 1 : 0.45 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6h10M4 12h16M4 18h13" />
              </svg>
            </button>
          )}
          <button
            type="button"
            data-grid-cell="true"
            data-row-id={it.id}
            data-col="person"
            data-cell-kind="button"
            title={(it.personObjectId && personNameById.get(it.personObjectId)) || 'Kişi seç'}
            onClick={() => onOpenPerson(it.id)}
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', color: it.personObjectId ? 'var(--color-primary)' : 'var(--color-text-muted)', opacity: it.personObjectId ? 1 : 0.45 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
            </svg>
          </button>
        </div>
      </td>
      <td style={selectTd}>
        <select
          data-grid-cell="true"
          data-row-id={it.id}
          data-col="status"
          data-cell-kind="select"
          style={cellInput}
          value={it.paymentStatus ?? ''}
          onChange={(e) => api.onStatusChange(it.id, e.target.value)}
        >
          <option value="">Statü seç</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <td style={selectTd}>
        {!multi && addedStages.length === 1 ? (
          <select
            key={addedStages[0].id}
            data-grid-cell="true"
            data-row-id={it.id}
            data-col="periods"
            data-cell-kind="select"
            style={cellInput}
            defaultValue={addedStages[0].id}
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
            key={addedStages.length}
            data-grid-cell="true"
            data-row-id={it.id}
            data-col="periods"
            data-cell-kind="select"
            style={cellInput}
            defaultValue=""
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
      {isCommission ? (
        <td colSpan={4} style={numFlushTd}>
          <input
            data-grid-cell="true"
            data-row-id={it.id}
            data-col="deriveRate"
            style={cellInputNum}
            type="text"
            inputMode="decimal"
            value={navDeriveRate ?? fieldVal(bufDeriveRate, it.deriveRate ?? 0)}
            onChange={(e) => api.onNumChange(it.id, 'deriveRate', e.target.value)}
            onBlur={() => api.commitField(it.id, 'deriveRate')}
          />
        </td>
      ) : (
        <>
          <td style={multi ? readOnlyTextTd : selectTd}>
            {multi ? (
              summaryUnitId !== null ? (units.find((u) => u.id === summaryUnitId)?.label ?? it.unitLabel) : '—'
            ) : (
              <select
                data-grid-cell="true"
                data-row-id={it.id}
                data-col="unit"
                data-cell-kind="select"
                style={cellInput}
                value={it.unitId}
                onChange={(e) => void api.onUnitChange(it.id, e.target.value)}
              >
                {(isBordro ? bordroAllowedUnits(units) : units).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            )}
          </td>
          <td style={multi ? readOnlyNumTd : numFlushTd}>
            {multi ? (
              summaryNet !== null ? fmt(summaryNet) : '—'
            ) : (
              <input
                data-grid-cell="true"
                data-row-id={it.id}
                data-col="unitNet"
                style={cellInputNum}
                type="text"
                inputMode="decimal"
                value={navUnitNet ?? fieldVal(bufUnitNet, it.unitNet)}
                onChange={(e) => api.onNumChange(it.id, 'unitNet', e.target.value)}
                onBlur={() => api.commitField(it.id, 'unitNet')}
              />
            )}
          </td>
          <td style={multi ? readOnlyNumTd : numFlushTd}>
            {multi ? (
              fmt(summaryRepeatSum ?? 0)
            ) : (
              <input
                data-grid-cell="true"
                data-row-id={it.id}
                data-col="repeat"
                style={cellInputNum}
                type="text"
                inputMode="decimal"
                value={navRepeat ?? repeatVal(bufRepeat, it.repeat)}
                onChange={(e) => api.onRepeatChange(it.id, e.target.value)}
                onBlur={() => api.commitRepeat(it.id)}
              />
            )}
          </td>
          <td style={multi ? readOnlyNumTd : numFlushTd}>
            {multi ? (
              summaryQty !== null ? fmt(summaryQty) : '—'
            ) : (
              <input
                data-grid-cell="true"
                data-row-id={it.id}
                data-col="multiplier"
                style={cellInputNum}
                type="text"
                inputMode="decimal"
                value={navMultiplier ?? fieldVal(bufMultiplier, it.multiplier)}
                onChange={(e) => api.onNumChange(it.id, 'multiplier', e.target.value)}
                onBlur={() => api.commitField(it.id, 'multiplier')}
              />
            )}
          </td>
        </>
      )}
      <td style={{ ...numStyle, fontWeight: 600 }}>
        <span title={isBordro && bd?.missingNet ? 'Birim Net bekleniyor' : undefined} style={isBordro ? { opacity: 0.55 } : undefined}>{isBordro && bd?.missingNet ? '—' : fmt(araToplam)}</span>
      </td>
      <td style={numStyle}>
        {/* TD-14 ucuncu duzeltme (2026-07-18): uyari metni yalniz TEK-donemli kalemde (satirin
            kendisi = kalem) gosterilir; COK-donemli kalemde ust/ozet satir HER ZAMAN dogru
            hesaplanan toplami gosterir, uyari sorunlu DONEM satirina tasindi (bkz period-row.tsx). */}
        {!multi && warning ? (
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
        ) : isBordro && bd?.missingNet ? (
          <span title="Birim Net bekleniyor" style={{ color: 'var(--color-text-muted)' }}>—</span>
        ) : isBordro && bd?.loading ? (
          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 'var(--text-xs)' }}>hesaplanıyor…</span>
        ) : isBordro && bd?.error ? (
          <span style={{ color: 'var(--color-danger, #c0392b)', fontSize: 'var(--text-xs)' }}>{bd.error}</span>
        ) : yasalYukTl > 0 ? (
          <button
            data-grid-cell="true"
            data-row-id={it.id}
            data-col="burden"
            data-cell-kind="button"
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
        <span style={isBordro ? { opacity: 0.55 } : undefined}>{isBordro && bd?.missingNet ? '—' : fmt(maliyet)}</span>
      </td>
      <td style={numStyle}>{isBordro ? '—' : fmt(kdv)}</td>
      <td style={{ ...numStyle, fontWeight: 600 }}>
        <span title={isBordro && bd?.missingNet ? 'Birim Net bekleniyor' : undefined} style={isBordro ? { opacity: 0.55 } : undefined}>{isBordro && bd?.missingNet ? '—' : fmt(brutToplam)}</span>
      </td>
      <td style={silTd}>
        <button
          data-grid-cell="true"
          data-row-id={item.id}
          data-col="itemRemove"
          data-cell-kind="button"
          onClick={() => onRemove(item.id)}
          style={silButton}
          title="Kalemi sil"
        >
          ×
        </button>
      </td>
    </tr>
  )
})
