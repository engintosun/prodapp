import { describe, it, expect } from 'vitest'
import { createGridState, reduceGrid, resolveKeyAction } from './grid-navigation-core'
import type { ColumnEquivalenceGroups, GridShape, GridState, KeyEventLike } from './grid-navigation-core'

const GRID_3X3: GridShape = [
  { rowId: 'r1', cols: ['c1', 'c2', 'c3'] },
  { rowId: 'r2', cols: ['c1', 'c2', 'c3'] },
  { rowId: 'r3', cols: ['c1', 'c2', 'c3'] },
]

const GRID_SINGLE_ROW: GridShape = [{ rowId: 'r1', cols: ['c1', 'c2', 'c3'] }]

const GRID_SINGLE_COL: GridShape = [
  { rowId: 'r1', cols: ['c1'] },
  { rowId: 'r2', cols: ['c1'] },
  { rowId: 'r3', cols: ['c1'] },
]

const GRID_EMPTY: GridShape = []

// Aradaki r2'nin editable kolonu yok (PeriodRow'un tum hucreleri salt-okunur oldugu
// nadir/teorik durumu temsil eder) - Tab sarmasinin bu satiri atlamasini test eder.
const GRID_RAGGED: GridShape = [
  { rowId: 'r1', cols: ['c1', 'c2'] },
  { rowId: 'r2', cols: [] },
  { rowId: 'r3', cols: ['c1'] },
]

function navAt(rowId: string, col: string): GridState {
  return { mode: 'nav', active: { rowId, col }, draft: null }
}

function editAt(rowId: string, col: string, draft: string): GridState {
  return { mode: 'edit', active: { rowId, col }, draft }
}

describe('createGridState', () => {
  it('bos gridde nav modunda active null baslar', () => {
    expect(createGridState()).toEqual({ mode: 'nav', active: null, draft: null })
  })
})

describe('nav modu - ok tuslari', () => {
  it('sag ok bir kolon ilerletir', () => {
    const r = reduceGrid(navAt('r1', 'c1'), { type: 'arrow', dir: 'right' }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c2' })
    expect(r.commit).toBeNull()
  })

  it('sol ok satirin ilk kolonunda kenarda durur (sarma yok)', () => {
    const r = reduceGrid(navAt('r1', 'c1'), { type: 'arrow', dir: 'left' }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c1' })
  })

  it('sag ok satirin son kolonunda kenarda durur (sarma yok)', () => {
    const r = reduceGrid(navAt('r1', 'c3'), { type: 'arrow', dir: 'right' }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c3' })
  })

  it('asagi ok bir sonraki satirin ayni kolonuna gider', () => {
    const r = reduceGrid(navAt('r1', 'c2'), { type: 'arrow', dir: 'down' }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r2', col: 'c2' })
  })

  it('yukari ok ilk satirda kenarda durur', () => {
    const r = reduceGrid(navAt('r1', 'c2'), { type: 'arrow', dir: 'up' }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c2' })
  })

  it('asagi ok son satirda kenarda durur', () => {
    const r = reduceGrid(navAt('r3', 'c2'), { type: 'arrow', dir: 'down' }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r3', col: 'c2' })
  })

  it('tek kolonlu satirda sol/sag her zaman kenarda durur', () => {
    const left = reduceGrid(navAt('r1', 'c1'), { type: 'arrow', dir: 'left' }, GRID_SINGLE_COL)
    const right = reduceGrid(navAt('r1', 'c1'), { type: 'arrow', dir: 'right' }, GRID_SINGLE_COL)
    expect(left.state.active).toEqual({ rowId: 'r1', col: 'c1' })
    expect(right.state.active).toEqual({ rowId: 'r1', col: 'c1' })
  })

  it('tek satirda yukari/asagi kenarda durur', () => {
    const up = reduceGrid(navAt('r1', 'c2'), { type: 'arrow', dir: 'up' }, GRID_SINGLE_ROW)
    const down = reduceGrid(navAt('r1', 'c2'), { type: 'arrow', dir: 'down' }, GRID_SINGLE_ROW)
    expect(up.state.active).toEqual({ rowId: 'r1', col: 'c2' })
    expect(down.state.active).toEqual({ rowId: 'r1', col: 'c2' })
  })

  it('bos gridde ok tusu no-op (active null kalir)', () => {
    const r = reduceGrid(createGridState(), { type: 'arrow', dir: 'right' }, GRID_EMPTY)
    expect(r.state.active).toBeNull()
    expect(r.commit).toBeNull()
  })
})

describe('nav modu - Tab / Shift+Tab', () => {
  it('Tab satir icinde ilerletir', () => {
    const r = reduceGrid(navAt('r1', 'c1'), { type: 'tab', shift: false }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c2' })
  })

  it('Tab satir sonunda sonraki satirin basina sarar', () => {
    const r = reduceGrid(navAt('r1', 'c3'), { type: 'tab', shift: false }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r2', col: 'c1' })
  })

  it('Shift+Tab satir basinda onceki satirin sonuna sarar', () => {
    const r = reduceGrid(navAt('r2', 'c1'), { type: 'tab', shift: true }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c3' })
  })

  it('Tab grid sonunda (son satir son kolon) kenarda durur', () => {
    const r = reduceGrid(navAt('r3', 'c3'), { type: 'tab', shift: false }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r3', col: 'c3' })
  })

  it('Shift+Tab grid basinda (ilk satir ilk kolon) kenarda durur', () => {
    const r = reduceGrid(navAt('r1', 'c1'), { type: 'tab', shift: true }, GRID_3X3)
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c1' })
  })

  it('Tab editable-hucresiz araya giren satiri atlar', () => {
    const r = reduceGrid(navAt('r1', 'c2'), { type: 'tab', shift: false }, GRID_RAGGED)
    expect(r.state.active).toEqual({ rowId: 'r3', col: 'c1' })
  })

  it('Shift+Tab editable-hucresiz araya giren satiri geriye atlar', () => {
    const r = reduceGrid(navAt('r3', 'c1'), { type: 'tab', shift: true }, GRID_RAGGED)
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c2' })
  })

  it('tek kolonlu satirlarda Tab bir sonraki satira gecer', () => {
    const r = reduceGrid(navAt('r1', 'c1'), { type: 'tab', shift: false }, GRID_SINGLE_COL)
    expect(r.state.active).toEqual({ rowId: 'r2', col: 'c1' })
  })
})

describe('nav -> edit gecisi', () => {
  it('Enter duzenlemeye girer, draft mevcut degeri korur', () => {
    const r = reduceGrid(navAt('r1', 'c1'), { type: 'enter', value: '5000000' }, GRID_3X3)
    expect(r.state.mode).toBe('edit')
    expect(r.state.draft).toBe('5000000')
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c1' })
    expect(r.commit).toBeNull()
  })

  it('yazdirilabilir karakter duzenlemeye girer, draft basilan karakteri ustune yazar', () => {
    const r = reduceGrid(navAt('r1', 'c1'), { type: 'type', char: '7' }, GRID_3X3)
    expect(r.state.mode).toBe('edit')
    expect(r.state.draft).toBe('7')
  })

  it('active hucre yokken Enter/type no-op', () => {
    const s = createGridState()
    const enterR = reduceGrid(s, { type: 'enter', value: 'x' }, GRID_3X3)
    const typeR = reduceGrid(s, { type: 'type', char: 'x' }, GRID_3X3)
    expect(enterR.state.mode).toBe('nav')
    expect(typeR.state.mode).toBe('nav')
  })

  it('nav modunda Esc etkisizdir', () => {
    const s = navAt('r1', 'c1')
    const r = reduceGrid(s, { type: 'esc' }, GRID_3X3)
    expect(r.state).toEqual(s)
    expect(r.commit).toBeNull()
  })
})

describe('edit modu - commit gecisleri', () => {
  it('Enter commit uretir, bir alt hucreye iner, nav moduna doner', () => {
    const r = reduceGrid(editAt('r1', 'c2', '123'), { type: 'enter', value: 'unused' }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r1', col: 'c2' }, value: '123' })
    expect(r.state).toEqual({ mode: 'nav', active: { rowId: 'r2', col: 'c2' }, draft: null })
  })

  it('Enter son satirda commit eder ama ayni hucrede kalir', () => {
    const r = reduceGrid(editAt('r3', 'c2', '9'), { type: 'enter', value: 'unused' }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r3', col: 'c2' }, value: '9' })
    expect(r.state.active).toEqual({ rowId: 'r3', col: 'c2' })
    expect(r.state.mode).toBe('nav')
  })

  it('Tab commit eder + saga gecer + nav', () => {
    const r = reduceGrid(editAt('r1', 'c1', 'v'), { type: 'tab', shift: false }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r1', col: 'c1' }, value: 'v' })
    expect(r.state).toEqual({ mode: 'nav', active: { rowId: 'r1', col: 'c2' }, draft: null })
  })

  it('Shift+Tab commit eder + sola/satir sonuna sarar + nav', () => {
    const r = reduceGrid(editAt('r2', 'c1', 'v'), { type: 'tab', shift: true }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r2', col: 'c1' }, value: 'v' })
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c3' })
  })

  it('ArrowDown commit eder + asagi gecer + nav', () => {
    const r = reduceGrid(editAt('r1', 'c1', 'v'), { type: 'arrow', dir: 'down' }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r1', col: 'c1' }, value: 'v' })
    expect(r.state.active).toEqual({ rowId: 'r2', col: 'c1' })
    expect(r.state.mode).toBe('nav')
  })

  it('ArrowUp ilk satirda kenarda commit eder ama ayni hucrede kalir', () => {
    const r = reduceGrid(editAt('r1', 'c1', 'v'), { type: 'arrow', dir: 'up' }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r1', col: 'c1' }, value: 'v' })
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c1' })
    expect(r.state.mode).toBe('nav')
  })

  it('ArrowLeft/ArrowRight edit modunda cekirdege ulasmaz (no-op)', () => {
    const s = editAt('r1', 'c2', 'v')
    const left = reduceGrid(s, { type: 'arrow', dir: 'left' }, GRID_3X3)
    const right = reduceGrid(s, { type: 'arrow', dir: 'right' }, GRID_3X3)
    expect(left).toEqual({ state: s, commit: null })
    expect(right).toEqual({ state: s, commit: null })
  })

  it('Esc draftı gercekten atar, orijinal hucrede nav moduna doner', () => {
    const r = reduceGrid(editAt('r1', 'c1', 'degistirilmis'), { type: 'esc' }, GRID_3X3)
    expect(r.state).toEqual({ mode: 'nav', active: { rowId: 'r1', col: 'c1' }, draft: null })
    expect(r.commit).toBeNull()
  })

  it('Blur commit eder, nav moduna doner, aktif hucre degismez', () => {
    const r = reduceGrid(editAt('r1', 'c1', 'v'), { type: 'blur' }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r1', col: 'c1' }, value: 'v' })
    expect(r.state).toEqual({ mode: 'nav', active: { rowId: 'r1', col: 'c1' }, draft: null })
  })
})

describe('setDraft', () => {
  it('edit modunda draft degerini gunceller', () => {
    const r = reduceGrid(editAt('r1', 'c1', '5'), { type: 'setDraft', value: '50' }, GRID_3X3)
    expect(r.state.draft).toBe('50')
    expect(r.state.mode).toBe('edit')
    expect(r.commit).toBeNull()
  })

  it('nav modunda no-op', () => {
    const s = navAt('r1', 'c1')
    const r = reduceGrid(s, { type: 'setDraft', value: '50' }, GRID_3X3)
    expect(r.state).toEqual(s)
  })

  it('setDraft sonrasi Esc guncellenmis draftı da atar', () => {
    const withDraft = reduceGrid(editAt('r1', 'c1', '5'), { type: 'setDraft', value: '50' }, GRID_3X3).state
    const r = reduceGrid(withDraft, { type: 'esc' }, GRID_3X3)
    expect(r.state.draft).toBeNull()
    expect(r.state.mode).toBe('nav')
  })
})

// KLV-K8: KAAPA'ya benzer heterojen satirlar - tek-donemli ItemRow 4 kutu tasir,
// cok-donemli ItemRow yalniz 'name', PeriodRow isim tasimaz. Gercek eslesme
// tablosuyla ayni (bkz. use-grid-navigation.ts COLUMN_EQUIVALENCE_GROUPS).
const KAAPA_GROUPS: ColumnEquivalenceGroups = [
  ['name'],
  ['unitNet', 'periodNet'],
  ['repeat', 'periodRepeat'],
  ['multiplier', 'periodQty'],
]

describe('dikey gezinme - kolon esdegerlik grubu (KLV-K8)', () => {
  it('unitNet den asagi inince bir sonraki ayni-grup kolona duser, name-only satiri atlar', () => {
    const grid: GridShape = [
      { rowId: 'item-single', cols: ['name', 'unitNet', 'repeat', 'multiplier'] },
      { rowId: 'item-multi', cols: ['name'] },
      { rowId: 'period-1', cols: ['periodNet', 'periodRepeat', 'periodQty'] },
    ]
    const r = reduceGrid(navAt('item-single', 'unitNet'), { type: 'arrow', dir: 'down' }, grid, KAAPA_GROUPS)
    expect(r.state.active).toEqual({ rowId: 'period-1', col: 'periodNet' })
  })

  it('name den asagi inince period satirlarini atlayip bir sonraki name e duser', () => {
    const grid: GridShape = [
      { rowId: 'item-a', cols: ['name', 'unitNet', 'repeat', 'multiplier'] },
      { rowId: 'period-a1', cols: ['periodNet', 'periodRepeat', 'periodQty'] },
      { rowId: 'item-b', cols: ['name', 'unitNet', 'repeat', 'multiplier'] },
    ]
    const r = reduceGrid(navAt('item-a', 'name'), { type: 'arrow', dir: 'down' }, grid, KAAPA_GROUPS)
    expect(r.state.active).toEqual({ rowId: 'item-b', col: 'name' })
  })

  it('ardisik name-only VE 4-kolon satirlar karisik dizildiginde unitNet e giden yol bulunur (index-kilitlenmesi yok)', () => {
    const grid: GridShape = [
      { rowId: 'item-1', cols: ['name', 'unitNet', 'repeat', 'multiplier'] },
      { rowId: 'item-2-multi', cols: ['name'] },
      { rowId: 'item-3-multi', cols: ['name'] },
      { rowId: 'item-4', cols: ['name', 'unitNet', 'repeat', 'multiplier'] },
    ]
    const r = reduceGrid(navAt('item-1', 'unitNet'), { type: 'arrow', dir: 'down' }, grid, KAAPA_GROUPS)
    expect(r.state.active).toEqual({ rowId: 'item-4', col: 'unitNet' })
  })

  it('grid ucunda esdeger kolon hic yoksa yerinde kalir', () => {
    const grid: GridShape = [
      { rowId: 'item-1', cols: ['name', 'unitNet', 'repeat', 'multiplier'] },
      { rowId: 'item-2-multi', cols: ['name'] },
    ]
    const r = reduceGrid(navAt('item-1', 'unitNet'), { type: 'arrow', dir: 'down' }, grid, KAAPA_GROUPS)
    expect(r.state.active).toEqual({ rowId: 'item-1', col: 'unitNet' })
  })

  it('grup verilmezse (undefined) eski index-clamp davranisi aynen calisir', () => {
    const grid: GridShape = [
      { rowId: 'item-1', cols: ['name', 'unitNet', 'repeat', 'multiplier'] },
      { rowId: 'item-2-multi', cols: ['name'] },
      { rowId: 'period-1', cols: ['periodNet', 'periodRepeat', 'periodQty'] },
    ]
    // groups verilmedi -> eski davranis: bir alttaki satirin ayni INDEKSine (clamp) duser.
    // item-2-multi tek kolonlu (index 0), unitNet index 1 -> clamp edilip index 0'a (name) duser.
    const r = reduceGrid(navAt('item-1', 'unitNet'), { type: 'arrow', dir: 'down' }, grid)
    expect(r.state.active).toEqual({ rowId: 'item-2-multi', col: 'name' })
  })

  it('Enter in asagi adimi da (edit modunda commit sonrasi) esdegerlik grubunu kullanir', () => {
    const grid: GridShape = [
      { rowId: 'item-1', cols: ['name', 'unitNet', 'repeat', 'multiplier'] },
      { rowId: 'item-2-multi', cols: ['name'] },
      { rowId: 'period-1', cols: ['periodNet', 'periodRepeat', 'periodQty'] },
    ]
    const r = reduceGrid(editAt('item-1', 'unitNet', '500'), { type: 'enter', value: 'unused' }, grid, KAAPA_GROUPS)
    expect(r.commit).toEqual({ cellId: { rowId: 'item-1', col: 'unitNet' }, value: '500' })
    expect(r.state.active).toEqual({ rowId: 'period-1', col: 'periodNet' })
  })
})

describe('focus (dis senkron - tiklama)', () => {
  it('herhangi bir durumdan nav moduna, verilen hucreye gecer', () => {
    const r = reduceGrid(editAt('r2', 'c3', 'v'), { type: 'focus', cell: { rowId: 'r1', col: 'c1' } }, GRID_3X3)
    expect(r.state).toEqual({ mode: 'nav', active: { rowId: 'r1', col: 'c1' }, draft: null })
    expect(r.commit).toBeNull()
  })
})

// Tus Sozlesmesi (K10 revize + TD-16, 2026-07-18): reducer-seviyesi Shift+Enter (yukari) ve
// MOD+Enter (yerinde kal) davranislari - dogrudan action.shift/action.stay ile.
describe('edit modu - Shift+Enter ve MOD+Enter (Tus Sozlesmesi K10 revize)', () => {
  it('Shift+Enter commit eder + K8 grubunda YUKARI gecer', () => {
    const r = reduceGrid(editAt('r2', 'c2', 'v'), { type: 'enter', value: 'unused', shift: true }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r2', col: 'c2' }, value: 'v' })
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c2' })
    expect(r.state.mode).toBe('nav')
  })

  it('Shift+Enter ilk satirda kenarda commit eder ama ayni hucrede kalir', () => {
    const r = reduceGrid(editAt('r1', 'c2', 'v'), { type: 'enter', value: 'unused', shift: true }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r1', col: 'c2' }, value: 'v' })
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c2' })
  })

  it('MOD+Enter (stay) commit eder + odak AYNI hucrede kalir', () => {
    const r = reduceGrid(editAt('r1', 'c1', 'v'), { type: 'enter', value: 'unused', stay: true }, GRID_3X3)
    expect(r.commit).toEqual({ cellId: { rowId: 'r1', col: 'c1' }, value: 'v' })
    expect(r.state).toEqual({ mode: 'nav', active: { rowId: 'r1', col: 'c1' }, draft: null })
  })

  it('nav modunda Shift+Enter yutulur (duzenlemeye girmez, no-op)', () => {
    const s = navAt('r1', 'c1')
    const r = reduceGrid(s, { type: 'enter', value: '5', shift: true }, GRID_3X3)
    expect(r.state).toEqual(s)
    expect(r.commit).toBeNull()
  })

  it('nav modunda MOD+Enter duzenli Enter ile ayni acilir (stay yerinde kalacak sey olmadigindan etkisiz)', () => {
    const r = reduceGrid(navAt('r1', 'c1'), { type: 'enter', value: '5', stay: true }, GRID_3X3)
    expect(r.state.mode).toBe('edit')
    expect(r.state.draft).toBe('5')
    expect(r.state.active).toEqual({ rowId: 'r1', col: 'c1' })
  })
})

// ---------------------------------------------------------------------------------------
// resolveKeyAction - Tus Sozlesmesi siniflandiricisi (K10 revize + TD-16, 2026-07-18)
// ---------------------------------------------------------------------------------------

function keyEvent(partial: Partial<KeyEventLike> & { key: string }): KeyEventLike {
  return { ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...partial }
}

describe('resolveKeyAction - Enter varyantlari', () => {
  it('Shift+Enter nav modunda yutulur (action yok, preventDefault var)', () => {
    const r = resolveKeyAction(keyEvent({ key: 'Enter', shiftKey: true }), 'nav', '5')
    expect(r).toEqual({ action: null, preventDefault: true })
  })

  it('Shift+Enter edit modunda commit + shift:true uretir', () => {
    const r = resolveKeyAction(keyEvent({ key: 'Enter', shiftKey: true }), 'edit', '')
    expect(r).toEqual({ action: { type: 'enter', value: '', shift: true, stay: false }, preventDefault: true })
  })

  it('MOD+Enter (ctrlKey) edit modunda stay:true uretir', () => {
    const r = resolveKeyAction(keyEvent({ key: 'Enter', ctrlKey: true }), 'edit', '')
    expect(r).toEqual({ action: { type: 'enter', value: '', shift: false, stay: true }, preventDefault: true })
  })

  it('MOD+Enter (metaKey) edit modunda stay:true uretir', () => {
    const r = resolveKeyAction(keyEvent({ key: 'Enter', metaKey: true }), 'edit', '')
    expect(r).toEqual({ action: { type: 'enter', value: '', shift: false, stay: true }, preventDefault: true })
  })

  it('duz Enter nav modunda mevcut ham degeri seed olarak tasir', () => {
    const r = resolveKeyAction(keyEvent({ key: 'Enter' }), 'nav', '5000000')
    expect(r).toEqual({ action: { type: 'enter', value: '5000000', shift: false, stay: false }, preventDefault: true })
  })
})

describe('resolveKeyAction - Backspace/Delete', () => {
  it('nav modunda bos taslakla (type char="") edit acar - rakam tuslamakla ayni yol', () => {
    const backspace = resolveKeyAction(keyEvent({ key: 'Backspace' }), 'nav', '5000')
    const del = resolveKeyAction(keyEvent({ key: 'Delete' }), 'nav', '5000')
    expect(backspace).toEqual({ action: { type: 'type', char: '' }, preventDefault: true })
    expect(del).toEqual({ action: { type: 'type', char: '' }, preventDefault: true })
  })

  it('edit modunda dokunmaz (input dogal davranisi)', () => {
    const r = resolveKeyAction(keyEvent({ key: 'Backspace' }), 'edit', '')
    expect(r).toEqual({ action: null, preventDefault: false })
  })
})

describe('resolveKeyAction - MOD+Z / MOD+Y (tarayici undo/redo devre disi)', () => {
  it('MOD+Z (ctrlKey) her iki modda da yutulur', () => {
    expect(resolveKeyAction(keyEvent({ key: 'z', ctrlKey: true }), 'nav', '')).toEqual({ action: null, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'z', ctrlKey: true }), 'edit', '')).toEqual({ action: null, preventDefault: true })
  })

  it('MOD+Z (metaKey) her iki modda da yutulur', () => {
    expect(resolveKeyAction(keyEvent({ key: 'z', metaKey: true }), 'nav', '')).toEqual({ action: null, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'z', metaKey: true }), 'edit', '')).toEqual({ action: null, preventDefault: true })
  })

  it('MOD+Y her iki modda da yutulur', () => {
    expect(resolveKeyAction(keyEvent({ key: 'y', ctrlKey: true }), 'nav', '')).toEqual({ action: null, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'y', metaKey: true }), 'edit', '')).toEqual({ action: null, preventDefault: true })
  })
})

describe('resolveKeyAction - AltGr karakter girisi', () => {
  it('AltGr (ctrlKey+altKey+tek karakter, orn. TR AltGr+E=€) nav modunda kisayol DEGIL karakter girisidir', () => {
    const r = resolveKeyAction(keyEvent({ key: '€', ctrlKey: true, altKey: true }), 'nav', '')
    expect(r).toEqual({ action: { type: 'type', char: '€' }, preventDefault: true })
  })

  it('AltGr karakteri MOD+Z/X/C kombinasyonlarindan ONCE degerlendirilir (yanlislikla yutulmaz)', () => {
    // AltGr+Z gibi bir kombinasyon MOD+Z kuralina denk gelmemeli - key farkli oldugu icin zaten
    // carpismaz, ama AltGr yolu MOD kontrollerinden ONCE calisir (siralama garantisi).
    const r = resolveKeyAction(keyEvent({ key: 'ß', ctrlKey: true, altKey: true }), 'nav', '')
    expect(r).toEqual({ action: { type: 'type', char: 'ß' }, preventDefault: true })
  })
})

describe('resolveKeyAction - varsayilan yasak + sayfa-duzeyi kisayollar', () => {
  it('tanimsiz tus (nav) hucre degerine islemez, preventDefault YAPILMAZ', () => {
    const r = resolveKeyAction(keyEvent({ key: 'F2' }), 'nav', '')
    expect(r).toEqual({ action: null, preventDefault: false })
  })

  it('sayfa-duzeyi kisayollara (MOD+S, MOD+P, MOD+F, MOD+R, F5) dokunulmaz', () => {
    expect(resolveKeyAction(keyEvent({ key: 's', ctrlKey: true }), 'nav', '')).toEqual({ action: null, preventDefault: false })
    expect(resolveKeyAction(keyEvent({ key: 'p', ctrlKey: true }), 'nav', '')).toEqual({ action: null, preventDefault: false })
    expect(resolveKeyAction(keyEvent({ key: 'f', ctrlKey: true }), 'nav', '')).toEqual({ action: null, preventDefault: false })
    expect(resolveKeyAction(keyEvent({ key: 'r', ctrlKey: true }), 'nav', '')).toEqual({ action: null, preventDefault: false })
    expect(resolveKeyAction(keyEvent({ key: 'F5' }), 'nav', '')).toEqual({ action: null, preventDefault: false })
  })

  it('duz yazdirilabilir karakter nav modunda type action uretir (mevcut davranis)', () => {
    const r = resolveKeyAction(keyEvent({ key: '7' }), 'nav', '')
    expect(r).toEqual({ action: { type: 'type', char: '7' }, preventDefault: true })
  })
})

describe('resolveKeyAction - MOD+C / MOD+X (nav)', () => {
  it('MOD+C nav modunda action uretmez ama copyRaw isaretler', () => {
    const r = resolveKeyAction(keyEvent({ key: 'c', ctrlKey: true }), 'nav', '5000')
    expect(r).toEqual({ action: null, preventDefault: true, copyRaw: true })
  })

  it('MOD+X nav modunda yutulur', () => {
    const r = resolveKeyAction(keyEvent({ key: 'x', ctrlKey: true }), 'nav', '')
    expect(r).toEqual({ action: null, preventDefault: true })
  })

  it('MOD+X edit modunda dokunmaz (native kes)', () => {
    const r = resolveKeyAction(keyEvent({ key: 'x', ctrlKey: true }), 'edit', '')
    expect(r).toEqual({ action: null, preventDefault: false })
  })
})

describe('resolveKeyAction - Home/End/PageUp/PageDown', () => {
  it('nav modunda yutulur', () => {
    expect(resolveKeyAction(keyEvent({ key: 'Home' }), 'nav', '')).toEqual({ action: null, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'End' }), 'nav', '')).toEqual({ action: null, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'PageUp' }), 'nav', '')).toEqual({ action: null, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'PageDown' }), 'nav', '')).toEqual({ action: null, preventDefault: true })
  })

  it('edit modunda input dogal davranisi (dokunulmaz)', () => {
    expect(resolveKeyAction(keyEvent({ key: 'Home' }), 'edit', '')).toEqual({ action: null, preventDefault: false })
  })
})

// Bolum 17 GEDIK A (2026-07-24): select/buton hucreler grid duragi ama edit moduna
// hic girmez - Tab (buton icin +ok) motor karari doner, geri kalan HER SEY native.
describe('resolveKeyAction cellKind', () => {
  describe('select', () => {
    it('Tab motor karari doner (preventDefault true)', () => {
      const r = resolveKeyAction(keyEvent({ key: 'Tab' }), 'nav', '', 'select')
      expect(r).toEqual({ action: { type: 'tab', shift: false }, preventDefault: true })
    })

    it('Shift+Tab motor karari doner (preventDefault true)', () => {
      const r = resolveKeyAction(keyEvent({ key: 'Tab', shiftKey: true }), 'nav', '', 'select')
      expect(r).toEqual({ action: { type: 'tab', shift: true }, preventDefault: true })
    })

    it('ArrowUp/Down/Left/Right native kalir (action null, preventDefault false)', () => {
      expect(resolveKeyAction(keyEvent({ key: 'ArrowUp' }), 'nav', '', 'select')).toEqual({ action: null, preventDefault: false })
      expect(resolveKeyAction(keyEvent({ key: 'ArrowDown' }), 'nav', '', 'select')).toEqual({ action: null, preventDefault: false })
      expect(resolveKeyAction(keyEvent({ key: 'ArrowLeft' }), 'nav', '', 'select')).toEqual({ action: null, preventDefault: false })
      expect(resolveKeyAction(keyEvent({ key: 'ArrowRight' }), 'nav', '', 'select')).toEqual({ action: null, preventDefault: false })
    })

    it('Enter native kalir (edit moduna girmez)', () => {
      expect(resolveKeyAction(keyEvent({ key: 'Enter' }), 'nav', '', 'select')).toEqual({ action: null, preventDefault: false })
    })

    it('Escape native kalir', () => {
      expect(resolveKeyAction(keyEvent({ key: 'Escape' }), 'nav', '', 'select')).toEqual({ action: null, preventDefault: false })
    })

    it('yazdirilabilir karakter (rakam) native kalir, edit acmaz', () => {
      expect(resolveKeyAction(keyEvent({ key: '7' }), 'nav', '', 'select')).toEqual({ action: null, preventDefault: false })
    })
  })

  describe('buton', () => {
    it('Tab motor karari doner', () => {
      const r = resolveKeyAction(keyEvent({ key: 'Tab' }), 'nav', '', 'button')
      expect(r).toEqual({ action: { type: 'tab', shift: false }, preventDefault: true })
    })

    it('dort ok motor karari doner', () => {
      expect(resolveKeyAction(keyEvent({ key: 'ArrowUp' }), 'nav', '', 'button')).toEqual({ action: { type: 'arrow', dir: 'up' }, preventDefault: true })
      expect(resolveKeyAction(keyEvent({ key: 'ArrowDown' }), 'nav', '', 'button')).toEqual({ action: { type: 'arrow', dir: 'down' }, preventDefault: true })
      expect(resolveKeyAction(keyEvent({ key: 'ArrowLeft' }), 'nav', '', 'button')).toEqual({ action: { type: 'arrow', dir: 'left' }, preventDefault: true })
      expect(resolveKeyAction(keyEvent({ key: 'ArrowRight' }), 'nav', '', 'button')).toEqual({ action: { type: 'arrow', dir: 'right' }, preventDefault: true })
    })

    it('Enter native click yolu (action null, preventDefault false)', () => {
      expect(resolveKeyAction(keyEvent({ key: 'Enter' }), 'nav', '', 'button')).toEqual({ action: null, preventDefault: false })
    })

    it('Space native click yolu', () => {
      expect(resolveKeyAction(keyEvent({ key: ' ' }), 'nav', '', 'button')).toEqual({ action: null, preventDefault: false })
    })
  })

  describe('geriye uyum', () => {
    it('cellKind verilmeden cagri mevcut input davranisiyla ayni (yazdirilabilir karakter type acar)', () => {
      const r = resolveKeyAction(keyEvent({ key: '7' }), 'nav', '')
      expect(r).toEqual({ action: { type: 'type', char: '7' }, preventDefault: true })
    })

    it('cellKind="input" acikca verilse de mevcut Tab davranisiyla ayni', () => {
      const r = resolveKeyAction(keyEvent({ key: 'Tab' }), 'nav', '', 'input')
      expect(r).toEqual({ action: { type: 'tab', shift: false }, preventDefault: true })
    })
  })
})

describe('resolveKeyAction - Esc/Tab/Arrow mevcut davranis degismedi', () => {
  it('Escape her modda esc action uretir', () => {
    expect(resolveKeyAction(keyEvent({ key: 'Escape' }), 'nav', '')).toEqual({ action: { type: 'esc' }, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'Escape' }), 'edit', '')).toEqual({ action: { type: 'esc' }, preventDefault: true })
  })

  it('Tab/Shift+Tab tab action uretir', () => {
    expect(resolveKeyAction(keyEvent({ key: 'Tab' }), 'nav', '')).toEqual({ action: { type: 'tab', shift: false }, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'Tab', shiftKey: true }), 'nav', '')).toEqual({ action: { type: 'tab', shift: true }, preventDefault: true })
  })

  it('ArrowLeft/Right edit modunda dokunmaz (imlec input icinde hareket eder)', () => {
    expect(resolveKeyAction(keyEvent({ key: 'ArrowLeft' }), 'edit', '')).toEqual({ action: null, preventDefault: false })
    expect(resolveKeyAction(keyEvent({ key: 'ArrowRight' }), 'edit', '')).toEqual({ action: null, preventDefault: false })
  })

  it('ArrowUp/Down her modda arrow action uretir', () => {
    expect(resolveKeyAction(keyEvent({ key: 'ArrowUp' }), 'nav', '')).toEqual({ action: { type: 'arrow', dir: 'up' }, preventDefault: true })
    expect(resolveKeyAction(keyEvent({ key: 'ArrowDown' }), 'edit', '')).toEqual({ action: { type: 'arrow', dir: 'down' }, preventDefault: true })
  })
})
