import { describe, it, expect } from 'vitest'
import { resolveCollapsed, toggleCollapse, openBlock } from './collapse-state'
import type { CollapseState } from './collapse-state'

const EMPTY: CollapseState = new Map()

describe('resolveCollapsed', () => {
  it('dokunulmamis tek kalemli kisi blogu KAPALI', () => {
    expect(resolveCollapsed('p:1', EMPTY, true)).toBe(true)
  })

  it('dokunulmamis cok kalemli kisi blogu ACIK', () => {
    expect(resolveCollapsed('p:1', EMPTY, false)).toBe(false)
  })

  it('dokunulmamis baslik ACIK (varsayilani false)', () => {
    expect(resolveCollapsed('h:1600-01', EMPTY, false)).toBe(false)
  })
})

describe('toggleCollapse', () => {
  it('kullanici tek kalemli blogu ACTIKTAN sonra varsayilan aciga donerse blok ACIK KALIR (asil kusur buydu)', () => {
    const opened = toggleCollapse('p:1', EMPTY, true)
    expect(resolveCollapsed('p:1', opened, true)).toBe(false)
    // Bloga ikinci kalem geldi, varsayilan artik acik (false) - ama kullanicinin
    // birakigi hal (acik) ONCELIKLIDIR, eski bayrak semantiginde bu satir kapaniyordu.
    expect(resolveCollapsed('p:1', opened, false)).toBe(false)
  })

  it('kullanici cok kalemli blogu KAPATTIKTAN sonra varsayilan kapaliya donerse KAPALI KALIR', () => {
    const closed = toggleCollapse('p:2', EMPTY, false)
    expect(resolveCollapsed('p:2', closed, false)).toBe(true)
    // Varsayilan sonradan kapaliya donse bile (blok tek kalemli hale geldi), kullanicinin
    // birakigi hal (kapali) aynen kalir.
    expect(resolveCollapsed('p:2', closed, true)).toBe(true)
  })
})

describe('openBlock', () => {
  it('kapali blogu acar, acik blogu bozmaz', () => {
    const closedState: CollapseState = new Map([['p:1', true]])
    const opened = openBlock('p:1', closedState)
    expect(resolveCollapsed('p:1', opened, true)).toBe(false)

    const openState: CollapseState = new Map([['p:2', false]])
    const stillOpen = openBlock('p:2', openState)
    expect(resolveCollapsed('p:2', stillOpen, true)).toBe(false)
  })
})
