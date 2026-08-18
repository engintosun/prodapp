import { describe, it, expect, vi } from 'vitest'

// DILIM 1100-A: fetchCardLibrary/fetchAllLibrary artik is_group alanini da secer;
// fetchCardLibrary baslik satirlarini (is_group=true) sonuctan cikarir, fetchAllLibrary
// cikarmaz (findCrossCardMatches kendi is_group denetimini format.ts icinde yapar).
const ROWS = [
  {
    id: 'g1',
    catalog_code: '1101',
    name: 'Hikâye, Senaryo, Haklar',
    name_en: 'Story & Screenplay',
    default_payment_status: 'sirket',
    default_unit_code: 'flat',
    aliases: [],
    is_group: true,
  },
  {
    id: 'a1',
    catalog_code: '1101-01',
    name: 'Hak Satın Alma',
    name_en: 'Story Rights Purchase',
    default_payment_status: 'telif_belgeli',
    default_unit_code: 'flat',
    aliases: [],
    is_group: false,
  },
]

vi.mock('./client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        like: () => ({
          order: () => Promise.resolve({ data: ROWS, error: null }),
        }),
        order: () => Promise.resolve({ data: ROWS, error: null }),
      }),
    }),
  },
}))

import { fetchCardLibrary, fetchAllLibrary } from './library-service'

describe('fetchCardLibrary — kalemler ve basliklar AYRI listelerde doner', () => {
  it('items yalniz atomu tasir, headings yalniz basligi', async () => {
    const result = await fetchCardLibrary('1101')
    expect(result.items.map((r) => r.catalogCode)).toEqual(['1101-01'])
    expect(result.headings.map((r) => r.catalogCode)).toEqual(['1101'])
  })

  it('baslik adi cekimden gelir', async () => {
    const result = await fetchCardLibrary('1101')
    expect(result.headings[0].name).toBe('Hikâye, Senaryo, Haklar')
  })
})

describe('fetchAllLibrary — tam kutuphane, baslik dahil (capraz-kart taraması kendi is_group denetimini format.ts icinde yapar)', () => {
  it('baslik satiri da doner, isGroup alaniyla isaretli', async () => {
    const result = await fetchAllLibrary()
    const group = result.find((r) => r.catalogCode === '1101')
    expect(group?.isGroup).toBe(true)
    expect(result.map((r) => r.catalogCode)).toEqual(['1101', '1101-01'])
  })
})
