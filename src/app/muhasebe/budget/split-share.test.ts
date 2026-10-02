import { describe, it, expect } from 'vitest'
import { sharePercentOf, splitsOverThreshold } from './split-share'

describe('hak devri payi (duz satir, 2 Ekim 2026)', () => {
  it('pay = hak devri / (Hizmet Bedeli + hak devri)', () => {
    expect(sharePercentOf(500000, 1000000)).toBe(50)
    expect(sharePercentOf(550000, 1000000)).toBe(55)
    expect(sharePercentOf(300000, 800000)).toBe(37.5)
  })

  it('taban 0 iken pay 0', () => {
    expect(sharePercentOf(100, 0)).toBe(0)
    expect(sharePercentOf(0, 0)).toBe(0)
  })
})

describe('%50 uyarisi (1500 Dilim 2c-2)', () => {
  it('esigi gecenler: yalniz esikten buyuk olan', () => {
    const over = splitsOverThreshold(new Map([['a', 50], ['b', 60], ['c', 49.99]]), 50)
    expect(over).toEqual(new Set(['b']))
  })

  it('bos harita bos kume verir', () => {
    expect(splitsOverThreshold(new Map(), 50)).toEqual(new Set())
  })
})
