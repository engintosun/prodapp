import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  getOrOpenBudget,
  getFirstCard,
  updateItemField,
  setItemPeriodQuantity,
  setItemPeriodNet,
  updateItemPeriodUnit,
  updateItemPeriodRepeat,
  loadUnits,
  copyMainToFirstPeriod,
  copyLastPeriodToMain,
  getItemBurdensAndVat,
} from '../../shared/supabase/budget-service'
import type { BudgetItemRow, CardView, EditableField, StageRow, UnitRow } from '../../shared/supabase/budget-service'
import { netToplamDonemli, brutToplamDonemli, kisiyeBanka } from '../../shared/cfe'
import type { Yuk, DonemKalemi } from '../../shared/cfe'
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
const periodRowStyle: CSSProperties = { ...tdStyle, background: 'var(--color-surface-2)' }
const periodRowNumStyle: CSSProperties = { ...numStyle, background: 'var(--color-surface-2)' }

function fmt(n: number): string {
  const dp = Number.isInteger(n) ? 0 : 2
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n)
}

function itemHasNote(it: BudgetItemRow): boolean {
  return Boolean((it.internalNote && it.internalNote.trim()) || (it.publicNote && it.publicNote.trim()))
}

function isMultiPeriod(it: BudgetItemRow): boolean {
  return Object.keys(it.periodQty).length > 1
}

// Tek-donem (0 veya 1) modunda ana satir kendi degerlerini parametre olarak kullanir;
// cok-donem modunda her donem-satiri kendi override/kalitim degerleriyle ozerk.
function buildDonemler(it: BudgetItemRow): DonemKalemi[] {
  if (!isMultiPeriod(it)) {
    return [{ net: it.unitNet, qty: it.multiplier, carpan: it.repeat }]
  }
  return Object.keys(it.periodQty).map((sid) => ({
    net: it.periodNet[sid] ?? it.unitNet,
    qty: it.periodQty[sid],
    carpan: it.periodRepeat[sid] ?? it.repeat,
  }))
}

function summarizeSame<T>(stageIds: string[], pick: (sid: string) => T): T | null {
  if (stageIds.length === 0) return null
  const vals = stageIds.map(pick)
  return vals.every((v) => v === vals[0]) ? vals[0] : null
}

export function BudgetCardScreen() {
  const { addToast } = useToast()
  const [card, setCard] = useState<CardView | null>(null)
  const [rows, setRows] = useState<BudgetItemRow[]>([])
  const [stages, setStages] = useState<StageRow[]>([])
  const [units, setUnits] = useState<UnitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [openBurden, setOpenBurden] = useState<{ itemId: string; stageId: string | null } | null>(null)
  const [openNoteItemId, setOpenNoteItemId] = useState<string | null>(null)
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
            periodUnit: { ...it.periodUnit },
            periodRepeat: { ...it.periodRepeat },
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

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const u = await loadUnits()
        if (!cancelled) setUnits(u)
      } catch (e) {
        if (!cancelled) addToast(e instanceof Error ? e.message : 'Birimler yüklenemedi', 'error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [addToast])

  const unitLabelById = new Map<string, string>(units.map((u) => [u.id, u.label]))

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

  function onTextChange(id: string, field: 'name', value: string) {
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

  function onPeriodRepeatChange(itemId: string, stageId: string, raw: string) {
    setBuffers((b) => ({ ...b, [itemId + ':prepeat:' + stageId]: raw }))
    setRows((rs) =>
      rs.map((r) => {
        if (r.id !== itemId) return r
        const n = Number(raw.replace(',', '.'))
        const newRepeat = raw.trim() === '' ? null : Number.isFinite(n) ? n : (r.periodRepeat[stageId] ?? null)
        return { ...r, periodRepeat: { ...r.periodRepeat, [stageId]: newRepeat } }
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
          periodUnit: { ...saved.periodUnit },
          periodRepeat: { ...saved.periodRepeat },
        }
      }
      const fresh = await getItemBurdensAndVat(id)
      patchRow(id, { burdens: fresh.burdens, vatRate: fresh.vatRate })
    } catch (e) {
      if (saved) patchRow(id, { paymentStatus: saved.paymentStatus })
      addToast(e instanceof Error ? e.message : 'Kaydedilemedi', 'error')
    }
  }

  async function onUnitChange(id: string, unitId: string) {
    const saved = savedRef.current[id]
    const newLabel = unitLabelById.get(unitId) ?? ''
    patchRow(id, { unitId, unitLabel: newLabel })
    if (saved && saved.unitId === unitId) return
    try {
      await updateItemField(id, 'unitId', unitId)
      if (saved) {
        savedRef.current[id] = {
          ...saved,
          unitId,
          unitLabel: newLabel,
          periodQty: { ...saved.periodQty },
          periodNet: { ...saved.periodNet },
          periodUnit: { ...saved.periodUnit },
          periodRepeat: { ...saved.periodRepeat },
        }
      }
    } catch (e) {
      if (saved) patchRow(id, { unitId: saved.unitId, unitLabel: saved.unitLabel })
      addToast(e instanceof Error ? e.message : 'Birim kaydedilemedi', 'error')
    }
  }

  async function onPeriodUnitChange(itemId: string, stageId: string, unitId: string) {
    const row = rows.find((r) => r.id === itemId)
    if (!row) return
    const prevUnit = row.periodUnit[stageId] ?? null
    setRows((rs) =>
      rs.map((r) => (r.id === itemId ? { ...r, periodUnit: { ...r.periodUnit, [stageId]: unitId } } : r)),
    )
    try {
      await updateItemPeriodUnit(itemId, stageId, unitId)
      const saved = savedRef.current[itemId]
      if (saved) {
        savedRef.current[itemId] = {
          ...saved,
          periodUnit: { ...saved.periodUnit, [stageId]: unitId },
          periodQty: { ...saved.periodQty },
          periodNet: { ...saved.periodNet },
          periodRepeat: { ...saved.periodRepeat },
        }
      }
    } catch (e) {
      setRows((rs) =>
        rs.map((r) => (r.id === itemId ? { ...r, periodUnit: { ...r.periodUnit, [stageId]: prevUnit } } : r)),
      )
      addToast(e instanceof Error ? e.message : 'Birim kaydedilemedi', 'error')
    }
  }

  async function commitNote(id: string, field: EditableField, value: string) {
    try {
      await updateItemField(id, field, value)
      const norm = value.trim() === '' ? null : value.trim()
      patchRow(id, { [field]: norm } as Partial<BudgetItemRow>)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Not kaydedilemedi', 'error')
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
        periodUnit: { ...(saved?.periodUnit ?? row.periodUnit) },
        periodRepeat: { ...(saved?.periodRepeat ?? row.periodRepeat) },
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
        periodUnit: { ...(saved?.periodUnit ?? row.periodUnit) },
        periodRepeat: { ...(saved?.periodRepeat ?? row.periodRepeat) },
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
          periodUnit: { ...saved.periodUnit },
          periodRepeat: { ...saved.periodRepeat },
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

  async function commitPeriodRepeat(itemId: string, stageId: string) {
    const row = rows.find((r) => r.id === itemId)
    if (!row) return
    const saved = savedRef.current[itemId]
    const currentVal = row.periodRepeat[stageId] ?? null
    const hedef: number | null =
      currentVal === null || currentVal === row.repeat ? null : currentVal
    const savedOverride = saved?.periodRepeat?.[stageId] ?? null
    if (savedOverride === hedef) {
      clearBuf(itemId + ':prepeat:' + stageId)
      return
    }
    try {
      await updateItemPeriodRepeat(itemId, stageId, hedef === null ? '' : hedef)
      if (saved) {
        savedRef.current[itemId] = {
          ...saved,
          periodRepeat: { ...saved.periodRepeat, [stageId]: hedef },
          periodQty: { ...saved.periodQty },
          periodNet: { ...saved.periodNet },
          periodUnit: { ...saved.periodUnit },
        }
      }
      setRows((rs) =>
        rs.map((r) =>
          r.id === itemId ? { ...r, periodRepeat: { ...r.periodRepeat, [stageId]: hedef } } : r,
        ),
      )
    } catch (e) {
      setRows((rs) =>
        rs.map((r) =>
          r.id === itemId ? { ...r, periodRepeat: { ...r.periodRepeat, [stageId]: savedOverride } } : r,
        ),
      )
      addToast(e instanceof Error ? e.message : 'Çarpan override kaydedilemedi', 'error')
    } finally {
      clearBuf(itemId + ':prepeat:' + stageId)
    }
  }

  async function onAddPeriod(itemId: string, stageId: string) {
    if (!card) return
    const row = rows.find((r) => r.id === itemId)
    if (!row) return
    const saved = savedRef.current[itemId]
    const existingStageIds = Object.keys(row.periodQty)
    const willBecomeMulti = existingStageIds.length === 1
    const needsExplicitDefaults = existingStageIds.length >= 1
    const oldStageId = existingStageIds[0]
    try {
      await setItemPeriodQuantity(card.budgetId, itemId, stageId, 1)
      if (willBecomeMulti) {
        await copyMainToFirstPeriod(itemId, oldStageId, row.unitNet, row.unitId, row.multiplier, row.repeat)
      }
      let sourceUnitId: string | null = null
      if (needsExplicitDefaults) {
        const sourceStageId = stages.find((s) => existingStageIds.includes(s.id))?.id ?? existingStageIds[0]
        sourceUnitId = row.periodUnit[sourceStageId] ?? row.unitId
        await updateItemPeriodUnit(itemId, stageId, sourceUnitId)
        await updateItemPeriodRepeat(itemId, stageId, 1)
        await setItemPeriodNet(itemId, stageId, 0)
      }
      setRows((rs) =>
        rs.map((r) => {
          if (r.id !== itemId) return r
          const pq = { ...r.periodQty, [stageId]: needsExplicitDefaults ? 0 : 1 }
          const pn = { ...r.periodNet }
          const pu = { ...r.periodUnit }
          const pr = { ...r.periodRepeat }
          if (willBecomeMulti) {
            pn[oldStageId] = r.unitNet
            pu[oldStageId] = r.unitId
            pq[oldStageId] = r.multiplier
            pr[oldStageId] = r.repeat
          }
          if (needsExplicitDefaults) {
            pn[stageId] = 0
            pu[stageId] = sourceUnitId
            pr[stageId] = 1
          }
          return { ...r, periodQty: pq, periodNet: pn, periodUnit: pu, periodRepeat: pr }
        }),
      )
      if (saved) {
        savedRef.current[itemId] = {
          ...saved,
          periodQty: {
            ...saved.periodQty,
            [stageId]: needsExplicitDefaults ? 0 : 1,
            ...(willBecomeMulti ? { [oldStageId]: row.multiplier } : {}),
          },
          periodNet: {
            ...saved.periodNet,
            ...(willBecomeMulti ? { [oldStageId]: row.unitNet } : {}),
            ...(needsExplicitDefaults ? { [stageId]: 0 } : {}),
          },
          periodUnit: {
            ...saved.periodUnit,
            ...(willBecomeMulti ? { [oldStageId]: row.unitId } : {}),
            ...(needsExplicitDefaults ? { [stageId]: sourceUnitId } : {}),
          },
          periodRepeat: {
            ...saved.periodRepeat,
            ...(willBecomeMulti ? { [oldStageId]: row.repeat } : {}),
            ...(needsExplicitDefaults ? { [stageId]: 1 } : {}),
          },
        }
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Dönem eklenemedi', 'error')
    }
  }

  async function onRemovePeriod(itemId: string, stageId: string) {
    if (!card) return
    const ok = window.confirm('Bu dönemi kaldırmak istiyor musun?')
    if (!ok) return
    const row = rows.find((r) => r.id === itemId)
    if (!row) return
    const saved = savedRef.current[itemId]
    const remainingStageIds = Object.keys(row.periodQty).filter((sid) => sid !== stageId)
    const willCollapseToSingle = Object.keys(row.periodQty).length === 2 && remainingStageIds.length === 1
    const lastStageId = remainingStageIds[0]
    try {
      await setItemPeriodQuantity(card.budgetId, itemId, stageId, 0)
      let mainPatch: Partial<BudgetItemRow> = {}
      if (willCollapseToSingle) {
        const lastNet = row.periodNet[lastStageId] ?? null
        const lastUnit = row.periodUnit[lastStageId] ?? null
        const lastQty = row.periodQty[lastStageId]
        const lastRepeat = row.periodRepeat[lastStageId] ?? null
        await copyLastPeriodToMain(itemId, lastStageId)
        mainPatch = {
          unitNet: lastNet ?? row.unitNet,
          unitId: lastUnit ?? row.unitId,
          unitLabel: unitLabelById.get(lastUnit ?? row.unitId) ?? row.unitLabel,
          multiplier: lastQty,
          repeat: lastRepeat ?? row.repeat,
        }
      }
      setRows((rs) =>
        rs.map((r) => {
          if (r.id !== itemId) return r
          const pq = { ...r.periodQty }
          const pn = { ...r.periodNet }
          const pu = { ...r.periodUnit }
          const pr = { ...r.periodRepeat }
          delete pq[stageId]
          delete pn[stageId]
          delete pu[stageId]
          delete pr[stageId]
          return { ...r, periodQty: pq, periodNet: pn, periodUnit: pu, periodRepeat: pr, ...mainPatch }
        }),
      )
      if (saved) {
        const sp = { ...saved.periodQty }
        const sn = { ...saved.periodNet }
        const su = { ...saved.periodUnit }
        const sr = { ...saved.periodRepeat }
        delete sp[stageId]
        delete sn[stageId]
        delete su[stageId]
        delete sr[stageId]
        savedRef.current[itemId] = {
          ...saved,
          periodQty: sp,
          periodNet: sn,
          periodUnit: su,
          periodRepeat: sr,
          ...mainPatch,
        }
      }
      clearBuf(itemId + ':stage:' + stageId)
      clearBuf(itemId + ':pnet:' + stageId)
      clearBuf(itemId + ':prepeat:' + stageId)
      if (willCollapseToSingle) {
        clearBuf(itemId + ':stage:' + lastStageId)
        clearBuf(itemId + ':pnet:' + lastStageId)
        clearBuf(itemId + ':prepeat:' + lastStageId)
      }
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

  function periodRepeatVal(itemId: string, stageId: string, override: number | null | undefined, repeat: number): string {
    const k = itemId + ':prepeat:' + stageId
    if (k in buffers) return buffers[k]
    return override != null ? String(override) : String(repeat)
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
              <th style={thStyle}>Açıklama</th>
              <th style={thStyle}>Statü</th>
              <th style={thStyle}>Dönemler</th>
              <th style={thStyle}>Birim</th>
              <th style={thNum}>Birim net</th>
              <th style={thNum}>Miktar</th>
              <th style={thNum}>Çarpan</th>
              <th style={thNum}>Yasal Yük</th>
              <th style={thNum}>Net toplam</th>
              <th style={thNum}>Brut toplam</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((it) => {
              const multi = isMultiPeriod(it)
              const addedStageIds = Object.keys(it.periodQty)
              const donemler = buildDonemler(it)
              const yukler: Yuk[] = it.burdens.map((b) => ({ ratePercent: b.rate, kind: b.kind }))
              const netToplam = netToplamDonemli(donemler)
              const brutYuk = brutToplamDonemli(donemler, yukler)
              const kdvTl = kisiyeBanka(netToplam, brutYuk, it.vatRate).kdv
              const brutToplam = brutYuk + kdvTl
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
                <Fragment key={it.id}>
                  <tr>
                    <td style={tdStyle}>{it.itemCode}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <input
                          style={cellInput}
                          value={it.name}
                          onChange={(e) => onTextChange(it.id, 'name', e.target.value)}
                          onBlur={() => commitField(it.id, 'name')}
                        />
                        <button
                          type="button"
                          title={itemHasNote(it) ? 'Not var' : 'Not ekle'}
                          onClick={() => setOpenNoteItemId(it.id)}
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
                        onChange={(e) => onStatusChange(it.id, e.target.value)}
                      >
                        <option value="">Statü seç</option>
                        <option value="bordro">Bordro</option>
                        <option value="smm">SMM</option>
                        <option value="telif_belgeli">Telif</option>
                        <option value="sirket">Fatura</option>
                        <option value="kira_sahis">Kira</option>
                        <option value="konaklama">Konaklama</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      {!multi && addedStages.length === 1 ? (
                        <select
                          style={cellInput}
                          value={addedStages[0].id}
                          onChange={(e) => {
                            const sid = e.target.value
                            if (sid !== addedStages[0].id) void onAddPeriod(it.id, sid)
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
                            if (sid) void onAddPeriod(it.id, sid)
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
                        summaryUnitId !== null ? (unitLabelById.get(summaryUnitId) ?? it.unitLabel) : '—'
                      ) : (
                        <select
                          style={cellInput}
                          value={it.unitId}
                          onChange={(e) => void onUnitChange(it.id, e.target.value)}
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
                          value={fieldVal(it.id, 'unitNet', it.unitNet)}
                          onChange={(e) => onNumChange(it.id, 'unitNet', e.target.value)}
                          onBlur={() => commitField(it.id, 'unitNet')}
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
                          value={fieldVal(it.id, 'multiplier', it.multiplier)}
                          onChange={(e) => onNumChange(it.id, 'multiplier', e.target.value)}
                          onBlur={() => commitField(it.id, 'multiplier')}
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
                          value={repeatVal(it.id, it.repeat)}
                          onChange={(e) => onRepeatChange(it.id, e.target.value)}
                          onBlur={() => commitRepeat(it.id)}
                        />
                      )}
                    </td>
                    <td style={numStyle}>
                      {it.paymentStatus === 'bordro' && it.burdens.length === 0 ? (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 'var(--text-xs)' }}>motor bekliyor</span>
                      ) : brutToplam > netToplam ? (
                        <button
                          onClick={() => setOpenBurden({ itemId: it.id, stageId: null })}
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
                  {multi &&
                    addedStages.map((s) => {
                      const qty = it.periodQty[s.id] ?? 0
                      const netOverride = it.periodNet[s.id] ?? null
                      const effectiveNet = netOverride ?? it.unitNet
                      const unitOverride = it.periodUnit[s.id] ?? null
                      const effectiveUnitId = unitOverride ?? it.unitId
                      const repeatOverride = it.periodRepeat[s.id] ?? null
                      const effectiveRepeat = repeatOverride ?? it.repeat
                      const donemKalemi: DonemKalemi = { net: effectiveNet, qty, carpan: effectiveRepeat }
                      const donemNet = netToplamDonemli([donemKalemi])
                      const donemBrutYuk = brutToplamDonemli([donemKalemi], yukler)
                      const donemKdv = kisiyeBanka(donemNet, donemBrutYuk, it.vatRate).kdv
                      const donemBrut = donemBrutYuk + donemKdv
                      const donemYasalYuk = donemBrut - donemNet
                      return (
                        <tr key={`${it.id}:${s.id}`}>
                          <td style={periodRowStyle} />
                          <td style={periodRowStyle} />
                          <td style={periodRowStyle} />
                          <td style={periodRowStyle}>{stageById.get(s.id)?.name ?? s.name}</td>
                          <td style={periodRowStyle}>
                            <select
                              style={cellInput}
                              value={effectiveUnitId}
                              onChange={(e) => void onPeriodUnitChange(it.id, s.id, e.target.value)}
                            >
                              {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={periodRowNumStyle}>
                            <input
                              style={cellInputNum}
                              type="text"
                              inputMode="decimal"
                              value={periodNetVal(it.id, s.id, netOverride, it.unitNet)}
                              onChange={(e) => onPeriodNetChange(it.id, s.id, e.target.value)}
                              onBlur={() => commitPeriodNet(it.id, s.id)}
                              title={netOverride === null ? 'Kalemden miras (değiştirmek için yaz)' : 'Döneme özel net'}
                            />
                          </td>
                          <td style={periodRowNumStyle}>
                            <input
                              style={cellInputNum}
                              type="text"
                              inputMode="decimal"
                              value={periodVal(it.id, s.id, qty)}
                              onChange={(e) => onPeriodChange(it.id, s.id, e.target.value)}
                              onBlur={() => commitPeriod(it.id, s.id)}
                            />
                          </td>
                          <td style={periodRowNumStyle}>
                            <input
                              style={cellInputNum}
                              type="text"
                              inputMode="decimal"
                              value={periodRepeatVal(it.id, s.id, repeatOverride, it.repeat)}
                              onChange={(e) => onPeriodRepeatChange(it.id, s.id, e.target.value)}
                              onBlur={() => commitPeriodRepeat(it.id, s.id)}
                              title={repeatOverride === null ? 'Kalemden miras (değiştirmek için yaz)' : 'Döneme özel çarpan'}
                            />
                          </td>
                          <td style={periodRowNumStyle}>
                            {donemBrut > donemNet ? (
                              <button
                                onClick={() => setOpenBurden({ itemId: it.id, stageId: s.id })}
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
                                onClick={() => void onRemovePeriod(it.id, s.id)}
                                style={{
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
      {openBurden !== null && (() => {
        const item = rows.find((r) => r.id === openBurden.itemId)
        if (!item) return null
        const sheetStage = openBurden.stageId !== null ? stageById.get(openBurden.stageId) : null
        let dDonemler: DonemKalemi[]
        if (openBurden.stageId !== null) {
          const sid = openBurden.stageId
          const qty = item.periodQty[sid] ?? 0
          const netOverride = item.periodNet[sid] ?? null
          const effectiveNet = netOverride ?? item.unitNet
          const repeatOverride = item.periodRepeat[sid] ?? null
          const effectiveRepeat = repeatOverride ?? item.repeat
          dDonemler = [{ net: effectiveNet, qty, carpan: effectiveRepeat }]
        } else {
          dDonemler = buildDonemler(item)
        }
        const dYukler: Yuk[] = item.burdens.map((b) => ({ ratePercent: b.rate, kind: b.kind }))
        const dNet = netToplamDonemli(dDonemler)
        const dBrutYuk = brutToplamDonemli(dDonemler, dYukler)
        const dKdv = kisiyeBanka(dNet, dBrutYuk, item.vatRate).kdv
        return (
          <>
            <div
              onClick={() => setOpenBurden(null)}
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
                maxHeight: '80vh',
                overflowY: 'auto',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                background: 'var(--color-surface)',
                padding: 'var(--space-4)',
                paddingBottom: 'var(--space-6)',
                zIndex: 201,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                  {item.name}{sheetStage ? ' (' + sheetStage.name + ')' : ''}
                </span>
                <button
                  onClick={() => setOpenBurden(null)}
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
      {openNoteItemId !== null && (() => {
        const item = rows.find((r) => r.id === openNoteItemId)
        if (!item) return null
        return (
          <>
            <div
              onClick={() => setOpenNoteItemId(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }}
            />
            <div
              key={item.id}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(480px, 100%)', maxHeight: '80vh', overflowY: 'auto', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', background: 'var(--color-surface)', padding: 'var(--space-4)', paddingBottom: 'var(--space-6)', zIndex: 201, boxShadow: 'var(--shadow-md)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text)' }}>
                  #{item.itemCode} {item.name}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenNoteItemId(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', padding: '0 var(--space-1)' }}
                >
                  x
                </button>
              </div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                Ic Not
              </label>
              <textarea
                defaultValue={item.internalNote ?? ''}
                onBlur={(e) => void commitNote(item.id, 'internalNote', e.target.value)}
                rows={4}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontFamily: 'inherit', resize: 'vertical', marginBottom: 'var(--space-3)' }}
              />
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                Kamu Notu
              </label>
              <textarea
                defaultValue={item.publicNote ?? ''}
                onBlur={(e) => void commitNote(item.id, 'publicNote', e.target.value)}
                rows={4}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
          </>
        )
      })()}
    </div>
  )
}
