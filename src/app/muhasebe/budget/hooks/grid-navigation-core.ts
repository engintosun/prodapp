// I7 klavye motoru saf cekirdek. DOM'suz: hook bu dosyayi DOM'a baglar (use-grid-navigation).
// Geometri disaridan gelir (GridShape) - registry tutulmaz, cagiran taraf her dispatch'te
// gecerli geometriyi verir.

export interface CellId {
  rowId: string
  col: string
}

export interface GridRow {
  rowId: string
  cols: string[]
}

export type GridShape = GridRow[]

// Ayni anlama gelen kolon adlarinin listesi (ornek: unitNet ile periodNet ayni
// "birim net" alanidir, farkli satir seklinde farkli ad tasir). stepArrow dikey
// gezinmede kolon-ADI yerine bu GRUBU eslestirir; cekirdek KAAPA'ya ozgu alan
// adlarini bilmez, sadece cagiran tarafin verdigi string gruplarini kullanir.
export type ColumnEquivalenceGroups = string[][]

export type GridMode = 'nav' | 'edit'

export interface GridState {
  mode: GridMode
  active: CellId | null
  draft: string | null
}

export type GridAction =
  | { type: 'focus'; cell: CellId }
  | { type: 'arrow'; dir: 'up' | 'down' | 'left' | 'right' }
  | { type: 'tab'; shift: boolean }
  | { type: 'enter'; value: string }
  | { type: 'type'; char: string }
  | { type: 'setDraft'; value: string }
  | { type: 'esc' }
  | { type: 'blur' }

export interface GridCommit {
  cellId: CellId
  value: string
}

export interface GridResult {
  state: GridState
  commit: GridCommit | null
}

export function createGridState(): GridState {
  return { mode: 'nav', active: null, draft: null }
}

function noop(state: GridState): GridResult {
  return { state, commit: null }
}

function findRow(grid: GridShape, rowId: string): { row: GridRow; index: number } | null {
  const index = grid.findIndex((r) => r.rowId === rowId)
  if (index === -1) return null
  return { row: grid[index], index }
}

function findNextNonEmptyRow(grid: GridShape, fromIndex: number, dir: 1 | -1): GridRow | null {
  let i = fromIndex + dir
  while (i >= 0 && i < grid.length) {
    if (grid[i].cols.length > 0) return grid[i]
    i += dir
  }
  return null
}

// Dikey adim: aktif kolon bir esdegerlik grubuna aitse, o yonde satir satir
// ilerleyip GRUBA ait herhangi bir kolonu tasiyan ilk satiri hedefler (araya giren,
// gruptan hicbir kolon tasimayan satirlar atlanir). Grup verilmemis/aktif kolon
// hicbir grupta yoksa eski index-clamp davranisi degismeden calisir (geriye uyum).
function stepArrowVertical(
  grid: GridShape,
  row: GridRow,
  index: number,
  colIndex: number,
  dir: 'up' | 'down',
  groups: ColumnEquivalenceGroups | undefined,
): CellId {
  const active: CellId = { rowId: row.rowId, col: row.cols[colIndex] }
  const group = groups?.find((g) => g.includes(active.col))
  const step = dir === 'up' ? -1 : 1

  if (!group) {
    const targetRow = grid[index + step]
    if (!targetRow || targetRow.cols.length === 0) return active
    const targetColIndex = Math.min(colIndex, targetRow.cols.length - 1)
    return { rowId: targetRow.rowId, col: targetRow.cols[targetColIndex] }
  }

  let i = index + step
  while (i >= 0 && i < grid.length) {
    const match = grid[i].cols.find((c) => group.includes(c))
    if (match) return { rowId: grid[i].rowId, col: match }
    i += step
  }
  return active
}

// Ok tuslari kenarda durur, satirlar arasi sarma yok. Sol/sag ayni satirda komsu
// kolona gider (degismedi); yukari/asagi stepArrowVertical'a delege eder.
function stepArrow(
  grid: GridShape,
  active: CellId,
  dir: 'up' | 'down' | 'left' | 'right',
  groups?: ColumnEquivalenceGroups,
): CellId {
  const found = findRow(grid, active.rowId)
  if (!found) return active
  const { row, index } = found
  const colIndex = row.cols.indexOf(active.col)
  if (colIndex === -1) return active

  if (dir === 'left') {
    if (colIndex === 0) return active
    return { rowId: row.rowId, col: row.cols[colIndex - 1] }
  }
  if (dir === 'right') {
    if (colIndex === row.cols.length - 1) return active
    return { rowId: row.rowId, col: row.cols[colIndex + 1] }
  }

  return stepArrowVertical(grid, row, index, colIndex, dir, groups)
}

// Tab satir sonunda/basinda komsu satira sarar; komsu satir editable-hucresiz ise
// (nadir/savunma amacli) bir sonrakine bakar. Grid ucunda hedef yoksa yerinde kalir.
function stepTab(grid: GridShape, active: CellId, shift: boolean): CellId {
  const found = findRow(grid, active.rowId)
  if (!found) return active
  const { row, index } = found
  const colIndex = row.cols.indexOf(active.col)
  if (colIndex === -1) return active

  if (!shift) {
    if (colIndex < row.cols.length - 1) return { rowId: row.rowId, col: row.cols[colIndex + 1] }
    const nextRow = findNextNonEmptyRow(grid, index, 1)
    if (!nextRow) return active
    return { rowId: nextRow.rowId, col: nextRow.cols[0] }
  }

  if (colIndex > 0) return { rowId: row.rowId, col: row.cols[colIndex - 1] }
  const prevRow = findNextNonEmptyRow(grid, index, -1)
  if (!prevRow) return active
  return { rowId: prevRow.rowId, col: prevRow.cols[prevRow.cols.length - 1] }
}

export function reduceGrid(
  state: GridState,
  action: GridAction,
  grid: GridShape,
  columnGroups?: ColumnEquivalenceGroups,
): GridResult {
  switch (action.type) {
    case 'focus':
      return { state: { mode: 'nav', active: action.cell, draft: null }, commit: null }

    case 'esc': {
      if (state.mode !== 'edit') return noop(state)
      return { state: { ...state, mode: 'nav', draft: null }, commit: null }
    }

    case 'blur': {
      if (state.mode !== 'edit' || !state.active) return noop(state)
      const commit: GridCommit = { cellId: state.active, value: state.draft ?? '' }
      return { state: { ...state, mode: 'nav', draft: null }, commit }
    }

    case 'setDraft': {
      if (state.mode !== 'edit') return noop(state)
      return { state: { ...state, draft: action.value }, commit: null }
    }

    case 'enter': {
      if (!state.active) return noop(state)
      if (state.mode === 'nav') {
        return { state: { ...state, mode: 'edit', draft: action.value }, commit: null }
      }
      const commit: GridCommit = { cellId: state.active, value: state.draft ?? '' }
      const nextActive = stepArrow(grid, state.active, 'down', columnGroups)
      return { state: { mode: 'nav', active: nextActive, draft: null }, commit }
    }

    case 'type': {
      if (!state.active || state.mode !== 'nav') return noop(state)
      return { state: { ...state, mode: 'edit', draft: action.char }, commit: null }
    }

    case 'tab': {
      if (!state.active) return noop(state)
      if (state.mode === 'nav') {
        const nextActive = stepTab(grid, state.active, action.shift)
        return { state: { ...state, active: nextActive }, commit: null }
      }
      const commit: GridCommit = { cellId: state.active, value: state.draft ?? '' }
      const nextActive = stepTab(grid, state.active, action.shift)
      return { state: { mode: 'nav', active: nextActive, draft: null }, commit }
    }

    case 'arrow': {
      if (!state.active) return noop(state)
      if (state.mode === 'nav') {
        const nextActive = stepArrow(grid, state.active, action.dir, columnGroups)
        return { state: { ...state, active: nextActive }, commit: null }
      }
      // Sol/sag edit modunda cekirdege ulasmaz (imlec input icinde hareket eder);
      // yine de savunma amacli no-op tanimli.
      if (action.dir === 'left' || action.dir === 'right') return noop(state)
      const commit: GridCommit = { cellId: state.active, value: state.draft ?? '' }
      const nextActive = stepArrow(grid, state.active, action.dir, columnGroups)
      return { state: { mode: 'nav', active: nextActive, draft: null }, commit }
    }
  }
}
