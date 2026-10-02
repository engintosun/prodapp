import { describe, it, expect } from 'vitest'
import { splitNetFrom } from './split-share'

describe('hak devri iki kural (split-share)', () => {
  it('splitNetFrom: Hizmet Bedeli x oran / (100 - oran)', () => {
    expect(splitNetFrom(500000, 50)).toBe(500000)
    expect(splitNetFrom(700000, 30)).toBe(300000)
    expect(splitNetFrom(500000, 0)).toBe(0)
  })
})
