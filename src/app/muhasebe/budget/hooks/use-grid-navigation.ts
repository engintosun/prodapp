import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { createGridState, reduceGrid } from './grid-navigation-core'
import type { CellId, GridShape, GridState } from './grid-navigation-core'
import type { BudgetItemRow } from '../../../../shared/supabase/budget-service'
import type { EditApi } from './use-edit-buffers'

// I7 motoru DOM baglayicisi. Cekirdek (grid-navigation-core) DOM'suz saf reducer;
// bu hook onu DOM'a baglar, kolon->alan eslemesini yapip MEVCUT onXChange/commitX
// yollarina delege eder (dogrulama/parse yeniden yazilmaz).
export type GridCol = 'name' | 'unitNet' | 'repeat' | 'multiplier' | 'periodNet' | 'periodRepeat' | 'periodQty'

interface UseGridNavigationParams {
  rowsRef: MutableRefObject<BudgetItemRow[]>
  savedRef: MutableRefObject<Record<string, BudgetItemRow>>
  patchRow: (id: string, patch: Partial<BudgetItemRow>) => void
  api: EditApi
  rows: BudgetItemRow[]
}

// PeriodRow hucreleri rowId'yi "itemId:stageId" olarak tasir (itemId/stageId UUID,
// ':' icermez -> ayristirma guvenli). ItemRow hucreleri duz itemId kullanir.
function parsePeriodRowId(rowId: string): { itemId: string; stageId: string } | null {
  const idx = rowId.indexOf(':')
  if (idx === -1) return null
  return { itemId: rowId.slice(0, idx), stageId: rowId.slice(idx + 1) }
}

function computeGridShape(container: HTMLElement): GridShape {
  const cells = Array.from(container.querySelectorAll<HTMLElement>('[data-grid-cell]'))
  const rows: GridShape = []
  for (const cell of cells) {
    const rowId = cell.dataset.rowId
    const col = cell.dataset.col
    if (!rowId || !col) continue
    const last = rows[rows.length - 1]
    if (last && last.rowId === rowId) last.cols.push(col)
    else rows.push({ rowId, cols: [col] })
  }
  return rows
}

function isPrintable(e: React.KeyboardEvent): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
}

export function useGridNavigation({ rowsRef, savedRef, patchRow, api, rows }: UseGridNavigationParams) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<GridState>(createGridState)

  function findItemRow(itemId: string): BudgetItemRow | undefined {
    return rowsRef.current.find((r) => r.id === itemId)
  }

  function getRawValue(cell: CellId): string {
    const period = parsePeriodRowId(cell.rowId)
    if (period) {
      const row = findItemRow(period.itemId)
      if (!row) return ''
      if (cell.col === 'periodNet') return String(row.periodNet[period.stageId] ?? row.unitNet)
      if (cell.col === 'periodRepeat') return String(row.periodRepeat[period.stageId] ?? row.repeat)
      if (cell.col === 'periodQty') return String(row.periodQty[period.stageId] ?? 0)
      return ''
    }
    const row = findItemRow(cell.rowId)
    if (!row) return ''
    if (cell.col === 'name') return row.name
    if (cell.col === 'unitNet') return String(row.unitNet)
    if (cell.col === 'multiplier') return String(row.multiplier)
    if (cell.col === 'repeat') return String(row.repeat)
    return ''
  }

  function seedEdit(cell: CellId, value: string) {
    const period = parsePeriodRowId(cell.rowId)
    if (period) {
      if (cell.col === 'periodNet') api.onPeriodNetChange(period.itemId, period.stageId, value)
      else if (cell.col === 'periodRepeat') api.onPeriodRepeatChange(period.itemId, period.stageId, value)
      else if (cell.col === 'periodQty') api.onPeriodChange(period.itemId, period.stageId, value)
      return
    }
    if (cell.col === 'name') api.onTextChange(cell.rowId, 'name', value)
    else if (cell.col === 'unitNet') api.onNumChange(cell.rowId, 'unitNet', value)
    else if (cell.col === 'multiplier') api.onNumChange(cell.rowId, 'multiplier', value)
    else if (cell.col === 'repeat') api.onRepeatChange(cell.rowId, value)
  }

  function commitCell(cell: CellId) {
    const period = parsePeriodRowId(cell.rowId)
    if (period) {
      if (cell.col === 'periodNet') void api.commitPeriodNet(period.itemId, period.stageId)
      else if (cell.col === 'periodRepeat') void api.commitPeriodRepeat(period.itemId, period.stageId)
      else if (cell.col === 'periodQty') void api.commitPeriod(period.itemId, period.stageId)
      return
    }
    if (cell.col === 'repeat') api.commitRepeat(cell.rowId)
    else if (cell.col === 'name' || cell.col === 'unitNet' || cell.col === 'multiplier') void api.commitField(cell.rowId, cell.col)
  }

  function cancelEdit(cell: CellId) {
    const period = parsePeriodRowId(cell.rowId)
    if (period) {
      const saved = savedRef.current[period.itemId]
      const current = findItemRow(period.itemId)
      if (!saved || !current) return
      if (cell.col === 'periodNet') patchRow(period.itemId, { periodNet: { ...current.periodNet, [period.stageId]: saved.periodNet[period.stageId] ?? null } })
      else if (cell.col === 'periodRepeat') patchRow(period.itemId, { periodRepeat: { ...current.periodRepeat, [period.stageId]: saved.periodRepeat[period.stageId] ?? null } })
      else if (cell.col === 'periodQty') patchRow(period.itemId, { periodQty: { ...current.periodQty, [period.stageId]: saved.periodQty[period.stageId] ?? 0 } })
      return
    }
    const saved = savedRef.current[cell.rowId]
    if (!saved) return
    if (cell.col === 'name') patchRow(cell.rowId, { name: saved.name })
    else if (cell.col === 'unitNet') patchRow(cell.rowId, { unitNet: saved.unitNet })
    else if (cell.col === 'multiplier') patchRow(cell.rowId, { multiplier: saved.multiplier })
    else if (cell.col === 'repeat') patchRow(cell.rowId, { repeat: saved.repeat })
  }

  function focusCell(cell: CellId | null) {
    if (!cell || !containerRef.current) return
    const el = containerRef.current.querySelector<HTMLElement>(`[data-row-id="${cell.rowId}"][data-col="${cell.col}"]`)
    el?.focus()
  }

  function dispatch(action: Parameters<typeof reduceGrid>[1], preState: GridState, cell: CellId, grid: GridShape) {
    const result = reduceGrid(preState, action, grid)
    setState(result.state)
    if (result.commit) commitCell(result.commit.cellId)
    if (action.type === 'esc' && preState.mode === 'edit') cancelEdit(cell)
    if (action.type === 'enter' && preState.mode === 'nav') seedEdit(cell, action.value)
    if (action.type === 'type') seedEdit(cell, action.char)
    focusCell(result.state.active)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (!target.dataset.gridCell) return
    const rowId = target.dataset.rowId
    const col = target.dataset.col
    if (!rowId || !col) return
    const cell: CellId = { rowId, col }
    const container = containerRef.current
    if (!container) return
    const grid = computeGridShape(container)

    if (e.key === 'Escape') {
      e.preventDefault()
      dispatch({ type: 'esc' }, state, cell, grid)
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      dispatch({ type: 'tab', shift: e.shiftKey }, state, cell, grid)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = state.mode === 'nav' ? getRawValue(cell) : ''
      dispatch({ type: 'enter', value }, state, cell, grid)
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const dir = e.key === 'ArrowUp' ? 'up' : e.key === 'ArrowDown' ? 'down' : e.key === 'ArrowLeft' ? 'left' : 'right'
      if (state.mode === 'edit' && (dir === 'left' || dir === 'right')) return
      e.preventDefault()
      dispatch({ type: 'arrow', dir }, state, cell, grid)
      return
    }
    if (state.mode === 'nav' && isPrintable(e)) {
      e.preventDefault()
      dispatch({ type: 'type', char: e.key }, state, cell, grid)
    }
  }

  function handleFocus(e: React.FocusEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (!target.dataset.gridCell) return
    const rowId = target.dataset.rowId
    const col = target.dataset.col
    if (!rowId || !col) return
    setState((s) => reduceGrid(s, { type: 'focus', cell: { rowId, col } }, []).state)
  }

  // Refetch/yeniden-siralama sonrasi odak DOM'dan dusmusse (kalici active kimlik hala
  // gecerliyken) yeniden odaklar. Bagimlilik rows: satir verisi degistiginde tetiklenir.
  useEffect(() => {
    if (!state.active || !containerRef.current) return
    const expected = containerRef.current.querySelector<HTMLElement>(
      `[data-row-id="${state.active.rowId}"][data-col="${state.active.col}"]`,
    )
    if (expected && document.activeElement !== expected) expected.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  function isActiveNav(rowId: string, col: GridCol): boolean {
    return state.mode === 'nav' && state.active !== null && state.active.rowId === rowId && state.active.col === col
  }

  function isActiveEdit(rowId: string, col: GridCol): boolean {
    return state.mode === 'edit' && state.active !== null && state.active.rowId === rowId && state.active.col === col
  }

  return { containerRef, handleKeyDown, handleFocus, isActiveNav, isActiveEdit }
}
