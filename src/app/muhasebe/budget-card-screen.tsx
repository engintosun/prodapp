import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  getOrOpenBudget,
  getFirstCard,
  updateItemField,
  setItemPeriodQuantity,
  setItemPeriodNet,
  getItemBurdensAndVat,
} from '../../shared/supabase/budget-service'
import type { BudgetItemRow, CardView, EditableField, StageRow } from '../../shared/supabase/budget-service'
import { netToplamDonemli, brutToplamDonemli, kisiyeBanka } from '../../shared/cfe'
import type { Yuk } from '../../shared/cfe'
import { useToast } from '../../shared/components/toast'
import { Loading } from '../../shared/components/loading'
import { EmptyState } from '../../shared/components/empty-state'
import { ErrorMessage } from '../../shared/components/error-message'

const thStyle: CSSProperties = {
  textAlign: 'left',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  fontWeight: 600,
  padding: 'var(--space-2)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}
const thNum: CSSProperties = { ...thStyle, textAlign: 'right' }
const tdStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  padding: 'var(--space-2)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}
const numStyle: CSSProperties = { ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
const cellInput: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  fontFamily: 'inherit',
}
const cellInputNum: CSSProperties = { ...cellInput, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }

const TOTAL_COLS = 12

function fmt(n: number): string {
  const dp = Number.isInteger(n) ? 0 : 2
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n)
}


export function BudgetCardScreen() {
  const { addToast } = useToast()
  const [card, setCard] = useState<CardView | null>(null)
  const [rows, setRows] = useState<BudgetItemRow[]>([])
  const [stages, setStages] = useState<StageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [openBurdenItemId, setOpenBurdenItemId] = useState<string | null>(null)
  const savedRef = useRef<Record<string, BudgetItemRow>>({})
  const [buffers, setBuffers] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        setError(null)
        const budgetId = await getOrOpenBudget()
        const c = await getFirstCard(budgetId)
        if (cancelled) return
        setCard(c)
        setRows(c?.items ?? [])
        setStages(c?.stages ?? [])
        savedRef.current = {}
        for (const it of c?.items ?? []) {
          savedRef.current[it.id] = {
            ...it,
            periodQty: { ...it.periodQty },
            periodNet: { ...it.periodNet },
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Bütçe yüklenemedi')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload])

  function clearBuf(key: string) {
    setBuffers((b) => {
      const c = { ...b }
      delete c[key]
      return c
    })
  }

  function patchRow(id: string, patch: Partial<BudgetItemRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function onTextChange(id: string, field: 'name' | 'detail', value: string) {
    patchRow(id, { [field]: value } as Partial<BudgetItemRow>)
  }

  function onNumChange(id: string, field: 'unitNet' | 'multiplier' | 'vatRate', raw: string) {
    setBuffers((b) => ({ ...b, [id + ':' + field]: raw }))
    const n = Number(raw.replace(',', '.'))
    patchRow(id, { [field]: Number.isFinite(n) ? n : 0 } as Partial<BudgetItemRow>)
  }

  function onPeriodChange(id: string, stageId: string, raw: string) {
    setBuffers((b) => ({ ...b, [id + ':stage:' + stageId]: raw }))
    const n = Number(raw.replace(',', '.'))
    setRows((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, periodQty: { ...r.periodQty, [stageId]: Number.isFinite(n) ? n : 0 } } : r,
      ),
    )
  }

  function onPeriodNetChange(itemId: string, stageId: string, raw: string) {
    setBuffers((b) => ({ ...b, [itemId + ':pnet:' + stageId]: raw }))
    setRows((rs) =>
      rs.map((r) => {
        if (r.id !== itemId) return r
        const n = Number(raw.replace(',', '.'))
        const newNet = raw.trim() === '' ? null : Number.isFinite(n) ? n : (r.periodNet[stageId] ?? null)
        return { ...r, periodNet: { ...r.periodNet, [stageId]: newNet } }
      }),
    )
  }

  async function onStatusChange(id: string, value: string) {
    const newStatus = value === '' ? null : value
    patchRow(id, { paymentStatus: newStatus })
    const saved = savedRef.current[id]
    if (saved && saved.paymentStatus === newStatus) return
    try {
      await updateItemField(id, 'paymentStatus', value)
      if (saved) {
        savedRef.current[id] = {
          ...saved,
          paymentStatus: newStatus,
          periodQty: { ...saved.periodQty },
          periodNet: { ...saved.periodNet },
        }
      }
      const fresh = await getItemBurdensAndVat(id)
      patchRow(id, { burdens: fresh.burdens, vatRate: fresh.vatRate })
    } catch (e) {
      if (saved) patchRow(id, { paymentStatus: saved.paymentStatus })
      addToast(e instanceof Error ? e.message : 'Kaydedilemedi', 'error')
    }
  }

  async function commitField(id: string, field: EditableField) {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    const value = (row[field] ?? '') as string | number
    const saved = savedRef.current[id]
    if (saved && saved[field] === value) {
      clearBuf(id + ':' + field)
      return
    }
    try {
      await updateItemField(id, field, value)
      savedRef.current[id] = {
        ...(saved ?? row),
        [field]: value,
        periodQty: { ...(saved?.periodQty ?? row.periodQty) },
        periodNet: { ...(saved?.periodNet ?? row.periodNet) },
      } as BudgetItemRow
    } catch (e) {
      if (saved) patchRow(id, { [field]: saved[field] } as Partial<BudgetItemRow>)
      addToast(e instanceof Error ? e.message : 'Kaydedilemedi', 'error')
    } finally {
      clearBuf(id + ':' + field)
    }
  }

  async function commitPeriod(id: string, stageId: string) {
    if (!card) return
    const row = rows.find((r) => r.id === id)
    if (!row) return
    const value = row.periodQty[stageId] ?? 0
    const saved = savedRef.current[id]
    const savedVal = saved?.periodQty[stageId] ?? 0
    if (savedVal === value) {
      clearBuf(id + ':stage:' + stageId)
      return
    }
    try {
      await setItemPeriodQuantity(card.budgetId, id, stageId, value)
      const sp = { ...(saved?.periodQty ?? {}) }
      if (value === 0) delete sp[stageId]
      else sp[stageId] = value
      savedRef.current[id] = {
        ...(saved ?? row),
        periodQty: sp,
        periodNet: { ...(saved?.periodNet ?? row.periodNet) },
      } as BudgetItemRow
    } catch (e) {
      setRows((rs) =>
        rs.map((r) => (r.id === id ? { ...r, periodQty: { ...r.periodQty, [stageId]: savedVal } } : r)),
      )
      addToast(e instanceof Error ? e.message : 'Miktar kaydedilemedi', 'error')
    } finally {
      clearBuf(id + ':stage:' + stageId)
    }
  }

  async function commitPeriodNet(itemId: string, stageId: string) {
    const row = rows.find((r) => r.id === itemId)
    if (!row) return
    const saved = savedRef.current[itemId]
    const currentVal = row.periodNet[stageId] ?? null
    const hedef: number | null =
      currentVal === null || currentVal === row.unitNet ? null : currentVal
    const savedOverride = saved?.periodNet?.[stageId] ?? null
    if (savedOverride === hedef) {
      clearBuf(itemId + ':pnet:' + stageId)
      return
    }
    try {
      await setItemPeriodNet(itemId, stageId, hedef === null ? '' : hedef)
      if (saved) {
        savedRef.current[itemId] = {
          ...saved,
          periodNet: { ...saved.periodNet, [stageId]: hedef },
          periodQty: { ...saved.periodQty },
        }
      }
      setRows((rs) =>
        rs.map((r) =>
          r.id === itemId ? { ...r, periodNet: { ...r.periodNet, [stageId]: hedef } } : r,
        ),
      )
    } catch (e) {
      setRows((rs) =>
        rs.map((r) =>
          r.id === itemId ? { ...r, periodNet: { ...r.periodNet, [stageId]: savedOverride } } : r,
        ),
      )
      addToast(e instanceof Error ? e.message : 'Net override kaydedilemedi', 'error')
    } finally {
      clearBuf(itemId + ':pnet:' + stageId)
    }
  }

  async function onAddPeriod(itemId: string, stageId: string) {
    if (!card) return
    const saved = savedRef.current[itemId]
    try {
      await setItemPeriodQuantity(card.budgetId, itemId, stageId, 1)
      setRows((rs) =>
        rs.map((r) => (r.id === itemId ? { ...r, periodQty: { ...r.periodQty, [stageId]: 1 } } : r)),
      )
      if (saved) {
        savedRef.current[itemId] = {
          ...saved,
          periodQty: { ...saved.periodQty, [stageId]: 1 },
          periodNet: { ...saved.periodNet },
        }
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Dönem eklenemedi', 'error')
    }
  }

  async function onRemovePeriod(itemId: string, stageId: string) {
    if (!card) return
    const saved = savedRef.current[itemId]
    try {
      await setItemPeriodQuantity(card.budgetId, itemId, stageId, 0)
      setRows((rs) =>
        rs.map((r) => {
          if (r.id !== itemId) return r
          const pq = { ...r.periodQty }
          delete pq[stageId]
          const pn = { ...r.periodNet }
          delete pn[stageId]
          return { ...r, periodQty: pq, periodNet: pn }
        }),
      )
      if (saved) {
        const sp = { ...saved.periodQty }
        delete sp[stageId]
        const sn = { ...saved.periodNet }
        delete sn[stageId]
        savedRef.current[itemId] = { ...saved, periodQty: sp, periodNet: sn }
      }
      clearBuf(itemId + ':stage:' + stageId)
      clearBuf(itemId + ':pnet:' + stageId)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Dönem kaldırılamadı', 'error')
    }
  }

  function fieldVal(id: string, field: 'unitNet' | 'multiplier' | 'vatRate', n: number): string {
    const k = id + ':' + field
    return k in buffers ? buffers[k] : String(n)
  }

  function repeatVal(id: string, n: number): string {
    const k = id + ':repeat'
    return k in buffers ? buffers[k] : String(n)
  }

  function onRepeatChange(id: string, raw: string) {
    setBuffers((b) => ({ ...b, [id + ':repeat']: raw }))
    const n = Number(raw.replace(',', '.'))
    if (Number.isFinite(n) && n > 0) patchRow(id, { repeat: n })
  }

  function commitRepeat(id: string) {
    void commitField(id, 'repeat')
  }

  function periodVal(id: string, stageId: string, n: number): string {
    const k = id + ':stage:' + stageId
    return k in buffers ? buffers[k] : String(n)
  }

  function periodNetVal(itemId: string, stageId: string, override: number | null | undefined, unitNet: number): string {
    const k = itemId + ':pnet:' + stageId
    if (k in buffers) return buffers[k]
    return override != null ? String(override) : String(unitNet)
  }

  if (loading) return <Loading label="Bütçe yükleniyor..." />
  if (error) return <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
  if (!card || rows.length === 0)
    return <EmptyState title="Kart boş" description="Bu bütçede kalem yok." />

  const stageById = new Map<string, StageRow>(stages.map((s) => [s.id, s]))

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text)', margin: '0 0 var(--space-1)' }}>
        {card.cardName}
      </h2>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
        Dönem eklemek için Dönemler hücresinden seç; her dönem için miktar gir. Hücreden çıkınca otomatik kaydeder.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1000 }}>
          <thead>
            <tr>
              <th style={thStyle}>Kod</th>
              <th style={thStyle}>Gider</th>
              <th style={thStyle}>Açıklama</th>
              <th style={thStyle}>Statü</th>
              <th style={thStyle}>Dönemler</th>
              <th style={thNum}>Birim net</th>
              <th style={thStyle}>Birim</th>
              <th style={thNum}>Miktar</th>
              <th style={thNum}>Çarpan</th>
              <th style={thNum}>Yasal Yük</th>
              <th style={thNum}>Net toplam</th>
              <th style={thNum}>Brut toplam</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((it) => {
              const donemler = Object.keys(it.periodQty).map((sid) => ({
                net: it.periodNet[sid] ?? it.unitNet,
                qty: it.periodQty[sid],
              }))
              const yukler: Yuk[] = it.burdens.map((b) => ({ ratePercent: b.rate, kind: b.kind }))
              const netToplam = netToplamDonemli(donemler, it.multiplier) * it.repeat
              const brutYuk = brutToplamDonemli(donemler, yukler, it.multiplier) * it.repeat
              const kdvTl = kisiyeBanka(netToplam, brutYuk, it.vatRate).kdv
              const brutToplam = brutYuk + kdvTl
              const yasalYukTl = brutToplam - netToplam
              const periodKeys = new Set(Object.keys(it.periodQty))
              const addableStages = stages.filter((s) => !periodKeys.has(s.id))
              const addedStages = stages.filter((s) => periodKeys.has(s.id))
              const allAdded = addableStages.length === 0

              return (
                <Fragment key={it.id}>
                  <tr>
                    <td style={tdStyle}>{it.itemCode}</td>
                    <td style={tdStyle}>
                      <input
                        style={cellInput}
                        value={it.name}
                        onChange={(e) => onTextChange(it.id, 'name', e.target.value)}
                        onBlur={() => commitField(it.id, 'name')}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        style={cellInput}
                        value={it.detail ?? ''}
                        placeholder="—"
                        onChange={(e) => onTextChange(it.id, 'detail', e.target.value)}
                        onBlur={() => commitField(it.id, 'detail')}
                      />
                    </td>
                    <td style={tdStyle}>
                      <select
                        style={cellInput}
                        value={it.paymentStatus ?? ''}
                        onChange={(e) => onStatusChange(it.id, e.target.value)}
                      >
                        <option value="">Statü seç</option>
                        <option value="bordro">Bordro</option>
                        <option value="smm">Serbest meslek (SMM)</option>
                        <option value="telif_belgeli">Telif (eser belgeli)</option>
                        <option value="sirket">Şirket faturası</option>
                        <option value="kira_sahis">Kira (şahıs)</option>
                        <option value="konaklama">Konaklama / yemek</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <select
                        style={cellInput}
                        value=""
                        disabled={allAdded}
                        onChange={(e) => {
                          const sid = e.target.value
                          if (sid) void onAddPeriod(it.id, sid)
                        }}
                      >
                        <option value="">{allAdded ? 'Tüm dönemler eklendi' : '+ Dönem ekle'}</option>
                        {addableStages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={numStyle}>
                      <input
                        style={cellInputNum}
                        type="text"
                        inputMode="decimal"
                        value={fieldVal(it.id, 'unitNet', it.unitNet)}
                        onChange={(e) => onNumChange(it.id, 'unitNet', e.target.value)}
                        onBlur={() => commitField(it.id, 'unitNet')}
                      />
                    </td>
                    <td style={tdStyle}>{it.unitLabel}</td>
                    <td style={numStyle}>
                      <input
                        style={cellInputNum}
                        type="text"
                        inputMode="decimal"
                        value={fieldVal(it.id, 'multiplier', it.multiplier)}
                        onChange={(e) => onNumChange(it.id, 'multiplier', e.target.value)}
                        onBlur={() => commitField(it.id, 'multiplier')}
                      />
                    </td>
                    <td style={numStyle}>
                      <input
                        style={cellInputNum}
                        type="text"
                        inputMode="decimal"
                        value={repeatVal(it.id, it.repeat)}
                        onChange={(e) => onRepeatChange(it.id, e.target.value)}
                        onBlur={() => commitRepeat(it.id)}
                      />
                    </td>
                    <td style={numStyle}>
                      {it.paymentStatus === 'bordro' && it.burdens.length === 0 ? (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 'var(--text-xs)' }}>motor bekliyor</span>
                      ) : brutToplam > netToplam ? (
                        <button
                          onClick={() => setOpenBurdenItemId(it.id)}
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
                    <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(netToplam)}</td>
                    <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(brutToplam)}</td>
                  </tr>
                  {addedStages.map((s) => {
                    const qty = it.periodQty[s.id] ?? 0
                    const override = it.periodNet[s.id] ?? null
                    const effectiveNet = override ?? it.unitNet
                    const subtotal = effectiveNet * qty
                    const isInherited = override === null
                    return (
                      <tr key={`${it.id}:${s.id}`}>
                        <td
                          colSpan={TOTAL_COLS}
                          style={{ borderBottom: '1px solid var(--color-border)', padding: 0 }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-3)',
                              paddingLeft: 'var(--space-8)',
                              paddingRight: 'var(--space-2)',
                              paddingTop: 'var(--space-1)',
                              paddingBottom: 'var(--space-1)',
                              background: 'var(--color-surface-2)',
                              fontSize: 'var(--text-xs)',
                            }}
                          >
                            <span style={{ minWidth: 100, color: 'var(--color-text)', fontWeight: 500 }}>
                              {stageById.get(s.id)?.name ?? s.name}
                            </span>
                            <input
                              style={{
                                ...cellInputNum,
                                width: 90,
                                color: isInherited ? 'var(--color-text-muted)' : 'var(--color-text)',
                              }}
                              type="text"
                              inputMode="decimal"
                              value={periodNetVal(it.id, s.id, override, it.unitNet)}
                              onChange={(e) => onPeriodNetChange(it.id, s.id, e.target.value)}
                              onBlur={() => commitPeriodNet(it.id, s.id)}
                              title={isInherited ? 'Kalemden miras (değiştirmek için yaz)' : 'Döneme özel net'}
                            />
                            <input
                              style={{ ...cellInputNum, width: 80 }}
                              type="text"
                              inputMode="decimal"
                              value={periodVal(it.id, s.id, qty)}
                              onChange={(e) => onPeriodChange(it.id, s.id, e.target.value)}
                              onBlur={() => commitPeriod(it.id, s.id)}
                            />
                            <span
                              style={{
                                color: 'var(--color-text-muted)',
                                fontVariantNumeric: 'tabular-nums',
                                minWidth: 80,
                                textAlign: 'right',
                              }}
                            >
                              = {fmt(subtotal)}
                            </span>
                            <button
                              onClick={() => void onRemovePeriod(it.id, s.id)}
                              style={{
                                marginLeft: 'auto',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-text-muted)',
                                fontSize: 'var(--text-base)',
                                padding: '0 var(--space-1)',
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
                  })}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      {openBurdenItemId !== null && (() => {
        const item = rows.find((r) => r.id === openBurdenItemId)
        if (!item) return null
        const dDonemler = Object.keys(item.periodQty).map((sid) => ({ net: item.periodNet[sid] ?? item.unitNet, qty: item.periodQty[sid] }))
        const dYukler: Yuk[] = item.burdens.map((b) => ({ ratePercent: b.rate, kind: b.kind }))
        const dNet = netToplamDonemli(dDonemler, item.multiplier) * item.repeat
        const dBrutYuk = brutToplamDonemli(dDonemler, dYukler, item.multiplier) * item.repeat
        const dKdv = kisiyeBanka(dNet, dBrutYuk, item.vatRate).kdv
        return (
          <>
            <div
              onClick={() => setOpenBurdenItemId(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 200,
              }}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(480px, 100%)',
                maxHeight: '70vh',
                overflowY: 'auto',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                background: 'var(--color-surface)',
                padding: 'var(--space-4)',
                zIndex: 201,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                  {item.name}
                </span>
                <button
                  onClick={() => setOpenBurdenItemId(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', padding: '0 var(--space-1)' }}
                >
                  ×
                </button>
              </div>
              {item.burdens.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  <span>{b.label} %{fmt(b.rate)}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(b.kind === 'deduction' ? Math.round(dBrutYuk * b.rate / 100) : Math.round(dNet * b.rate / 100))}</span>
                </div>
              ))}
              {item.vatRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  <span>KDV %{fmt(item.vatRate)}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(dKdv)}</span>
                </div>
              )}
            </div>
          </>
        )
      })()}
    </div>
  )
}
