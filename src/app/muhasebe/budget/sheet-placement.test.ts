import { describe, it, expect } from 'vitest'
import { placeSheet } from './sheet-placement'

const base = { panelWidth: 480, frame: { top: 0, bottom: 800, left: 0, right: 1200 }, viewportHeight: 800, margin: 8, gap: 4 }

describe('placeSheet', () => {
  it('opens below the trigger when the content fits below', () => {
    const p = placeSheet({ ...base, anchor: { top: 100, bottom: 120, left: 300 }, panelHeight: 200 })
    expect(p).toEqual({ side: 'below', top: 124, bottom: null, left: 300, width: 480, maxHeight: 668 })
  })

  it('opens below when the content exactly fills the space below', () => {
    const p = placeSheet({ ...base, anchor: { top: 100, bottom: 120, left: 300 }, panelHeight: 668 })
    expect(p.side).toBe('below')
  })

  it('opens above when the content does not fit below and there is more space above', () => {
    const p = placeSheet({ ...base, anchor: { top: 700, bottom: 720, left: 300 }, panelHeight: 300 })
    expect(p).toEqual({ side: 'above', top: null, bottom: 104, left: 300, width: 480, maxHeight: 688 })
  })

  it('stays below and scrolls inside when the content does not fit but below has more space', () => {
    const p = placeSheet({ ...base, anchor: { top: 60, bottom: 80, left: 300 }, panelHeight: 2000 })
    expect(p).toEqual({ side: 'below', top: 84, bottom: null, left: 300, width: 480, maxHeight: 708 })
  })

  it('shifts left when the panel would overflow the right edge', () => {
    const p = placeSheet({ ...base, anchor: { top: 100, bottom: 120, left: 1000 }, panelHeight: 200 })
    expect(p.left).toBe(712)
  })

  it('keeps the left margin when the trigger sits closer to the left edge', () => {
    const p = placeSheet({ ...base, anchor: { top: 100, bottom: 120, left: 2 }, panelHeight: 200 })
    expect(p.left).toBe(8)
  })

  it('narrows the panel to the viewport minus margins on a narrow screen', () => {
    const p = placeSheet({ ...base, frame: { top: 0, bottom: 800, left: 0, right: 400 }, anchor: { top: 100, bottom: 120, left: 100 }, panelHeight: 200 })
    expect(p.width).toBe(384)
    expect(p.left).toBe(8)
  })

  it('alan tarayicidan kucukse yer alana gore hesaplanir: altta alan bitiyorsa ustte acilir', () => {
    const p = placeSheet({ ...base, frame: { top: 100, bottom: 600, left: 50, right: 900 }, anchor: { top: 500, bottom: 520, left: 300 }, panelHeight: 150 })
    expect(p).toEqual({ side: 'above', top: null, bottom: 304, left: 300, width: 480, maxHeight: 388 })
  })

  it('alanin sag kenarina gore sola kayar', () => {
    const p = placeSheet({ ...base, frame: { top: 100, bottom: 600, left: 50, right: 900 }, anchor: { top: 200, bottom: 220, left: 700 }, panelHeight: 150 })
    expect(p.left).toBe(412)
  })

  it('once ustu dene: icerik ustte sigiyorsa ustte acilir', () => {
    const p = placeSheet({ ...base, prefer: 'above', anchor: { top: 500, bottom: 520, left: 300 }, panelHeight: 150 })
    expect(p).toEqual({ side: 'above', top: null, bottom: 304, left: 300, width: 480, maxHeight: 488 })
  })

  it('once ustu dene: ustte sigmiyor ve altta daha cok yer varsa altta acilir', () => {
    const p = placeSheet({ ...base, prefer: 'above', anchor: { top: 100, bottom: 120, left: 300 }, panelHeight: 200 })
    expect(p).toEqual({ side: 'below', top: 124, bottom: null, left: 300, width: 480, maxHeight: 668 })
  })

  it('once ustu dene: iki tarafa da sigmiyor ve ustte daha cok yer varsa ustte kalir', () => {
    const p = placeSheet({ ...base, prefer: 'above', anchor: { top: 700, bottom: 720, left: 300 }, panelHeight: 2000 })
    expect(p).toEqual({ side: 'above', top: null, bottom: 104, left: 300, width: 480, maxHeight: 688 })
  })
})
