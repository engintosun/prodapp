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
  | { type: 'enter'; value: string; shift?: boolean; stay?: boolean }
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
        // Shift+Enter nav modunda yutulur (Tus Sozlesmesi K10 revize, 2026-07-18) - duzenlemeye
        // GIRMEZ, MOD+Enter ise duzenli Enter ile ayni acilir (nav'da "yerinde kal" kavraminin
        // anlami yok, henuz commit edilecek bir sey yok).
        if (action.shift) return noop(state)
        return { state: { ...state, mode: 'edit', draft: action.value }, commit: null }
      }
      const commit: GridCommit = { cellId: state.active, value: state.draft ?? '' }
      // MOD+Enter: kaydet + odak AYNI hucrede kalir (Shift'ten oncelikli - ikisi ayni anda
      // basilirsa "yerinde kal" davranisi kazanir). Shift+Enter: K8 grubunda YUKARI.
      if (action.stay) {
        return { state: { mode: 'nav', active: state.active, draft: null }, commit }
      }
      const dir = action.shift ? 'up' : 'down'
      const nextActive = stepArrow(grid, state.active, dir, columnGroups)
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

// ---------------------------------------------------------------------------------------
// Tus Sozlesmesi (K10 revize + TD-16, 2026-07-18). DOM'suz saf siniflandirici: bir tus
// olayinin (KeyEventLike) mevcut modda NE anlama geldigine TEK yerde karar verir - hook
// (use-grid-navigation.ts) bu karari aynen uygular (preventDefault + varsa dispatch),
// kendi tus-ozel dallanma icermez. Sozlesmede olmayan hicbir tus/kombinasyon nav modunda
// hucre degerine islemez (varsayilan yasak); sayfa-duzeyi kisayollara (MOD+S/P/F/R, F5 vb.)
// bu fonksiyon HICBIR SEKILDE dokunmaz (taniMSIZ dal preventDefault=false doner).
// ---------------------------------------------------------------------------------------

export interface KeyEventLike {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
}

// Bolum 17 GEDIK A (2026-07-24): grid duragi olan hucrelerin hepsi input degil - native
// select (Statu/Donemler/Birim) ve buton (Not/Yasal Yuk) hucreler de motora katildi.
// cellKind resolveKeyAction'a NE karari uygulanacagini soyler; select/buton icin native
// tus davranisi (ok tuslari, Enter, harfler) korunur, yalniz gezinme (Tab, buton icin +ok)
// motor karari doner - bu iki tip edit moduna HIC girmez (K7-r2, BUTCE-UI-MIMARISI I7).
export type CellKind = 'input' | 'select' | 'button'

export interface KeyResolution {
  action: GridAction | null
  preventDefault: boolean
  // MOD+C (nav): panoya YAZILACAK ham deger cagiran tarafta hazir - core I/O yapmaz.
  copyRaw?: boolean
}

function isMod(e: KeyEventLike): boolean {
  return e.ctrlKey || e.metaKey
}

// AltGr (Windows) tarayiciya ctrlKey+altKey birlikte basili olarak gelir. Kombinasyon TEK
// yazdirilabilir karakter uretiyorsa (orn. TR klavyede AltGr+E = '€') bu KISAYOL degil
// KARAKTER GIRISIDIR - MOD-kombinasyonu kurallarindan ONCE kontrol edilir. macOS'ta Option'lu
// karakterler ctrl bayragi tasimadan geldigi icin bu ayrim kendiliginden gerekmez.
function isAltGrCharacterInput(e: KeyEventLike): boolean {
  return e.ctrlKey && e.altKey && !e.metaKey && e.key.length === 1
}

export function isPrintableKey(e: KeyEventLike): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
}

export function resolveKeyAction(
  e: KeyEventLike,
  mode: GridMode,
  currentRawValue: string,
  cellKind: CellKind = 'input',
): KeyResolution {
  if (cellKind === 'select') {
    if (e.key === 'Tab') return { action: { type: 'tab', shift: e.shiftKey }, preventDefault: true }
    return { action: null, preventDefault: false }
  }

  if (cellKind === 'button') {
    if (e.key === 'Tab') return { action: { type: 'tab', shift: e.shiftKey }, preventDefault: true }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const dir = e.key === 'ArrowUp' ? 'up' : e.key === 'ArrowDown' ? 'down' : e.key === 'ArrowLeft' ? 'left' : 'right'
      return { action: { type: 'arrow', dir }, preventDefault: true }
    }
    return { action: null, preventDefault: false }
  }

  const mod = isMod(e)

  if (e.key === 'Escape') return { action: { type: 'esc' }, preventDefault: true }
  if (e.key === 'Tab') return { action: { type: 'tab', shift: e.shiftKey }, preventDefault: true }

  if (e.key === 'Enter') {
    if (mode === 'nav' && e.shiftKey) return { action: null, preventDefault: true }
    const value = mode === 'nav' ? currentRawValue : ''
    return { action: { type: 'enter', value, shift: e.shiftKey, stay: mod }, preventDefault: true }
  }

  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const dir = e.key === 'ArrowUp' ? 'up' : e.key === 'ArrowDown' ? 'down' : e.key === 'ArrowLeft' ? 'left' : 'right'
    if (mode === 'edit' && (dir === 'left' || dir === 'right')) return { action: null, preventDefault: false }
    return { action: { type: 'arrow', dir }, preventDefault: true }
  }

  if (isAltGrCharacterInput(e)) {
    if (mode === 'nav') return { action: { type: 'type', char: e.key }, preventDefault: true }
    return { action: null, preventDefault: false }
  }

  // Backspace/Delete (nav): rakam tuslamakla AYNI yol - bos taslakla (draft='') edit acar.
  // Edit modunda input'un dogal davranisi, dokunmaz.
  if ((e.key === 'Backspace' || e.key === 'Delete') && !mod && !e.altKey) {
    if (mode === 'nav') return { action: { type: 'type', char: '' }, preventDefault: true }
    return { action: null, preventDefault: false }
  }

  // MOD+Z / MOD+Y: HER IKI modda yutulur - tarayici undo'su devre disi, ileride uygulama-
  // duzeyi geri alma icin rezerve (simdilik islevsiz).
  if (mod && (e.key === 'z' || e.key === 'Z' || e.key === 'y' || e.key === 'Y')) {
    return { action: null, preventDefault: true }
  }

  if (mod && (e.key === 'x' || e.key === 'X') && mode === 'nav') {
    return { action: null, preventDefault: true }
  }

  if (mod && (e.key === 'c' || e.key === 'C') && mode === 'nav') {
    return { action: null, preventDefault: true, copyRaw: true }
  }

  if ((e.key === 'Home' || e.key === 'End' || e.key === 'PageUp' || e.key === 'PageDown') && mode === 'nav') {
    return { action: null, preventDefault: true }
  }

  if (mode === 'nav' && isPrintableKey(e)) {
    return { action: { type: 'type', char: e.key }, preventDefault: true }
  }

  // Varsayilan yasak: sozlesmede olmayan tus - hucre degerine islemez, sayfa-duzeyi
  // kisayollara (MOD+S/P/F/R, F5 vb.) dokunmamak icin preventDefault YAPILMAZ.
  return { action: null, preventDefault: false }
}
