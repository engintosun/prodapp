import { describe, it, expect, vi, beforeEach } from 'vitest'

const calls = vi.hoisted(() => ({
  eq: [] as [string, unknown][],
  rpc: [] as [string, Record<string, unknown>][],
  update: [] as Record<string, unknown>[],
  inArgs: [] as { col: string; ids: unknown[] }[],
  selectRows: [] as Record<string, unknown>[],
  updatedRows: [] as Record<string, unknown>[],
  rpcResult: { data: null as unknown, error: null as { message: string } | null },
}))

vi.mock('./budget-service', () => ({ getProjectId: () => Promise.resolve('p1') }))

vi.mock('./client', () => {
  const selectChain = {
    eq(col: string, val: unknown) {
      calls.eq.push([col, val])
      return selectChain
    },
    order() {
      return Promise.resolve({ data: calls.selectRows, error: null })
    },
  }
  return {
    supabase: {
      from: () => ({
        select: () => selectChain,
        update: (payload: Record<string, unknown>) => {
          calls.update.push(payload)
          return {
            in: (col: string, ids: unknown[]) => {
              calls.inArgs.push({ col, ids })
              return { select: () => Promise.resolve({ data: calls.updatedRows, error: null }) }
            },
          }
        },
      }),
      rpc: (name: string, args: Record<string, unknown>) => {
        calls.rpc.push([name, args])
        return Promise.resolve(calls.rpcResult)
      },
    },
  }
})

import { fetchUserHeadings, openUserHeading, moveItemsToHeading } from './user-heading-service'

beforeEach(() => {
  calls.eq = []
  calls.rpc = []
  calls.update = []
  calls.inArgs = []
  calls.selectRows = []
  calls.updatedRows = []
  calls.rpcResult = { data: null, error: null }
})

describe('fetchUserHeadings', () => {
  it('proje ve kart kodu ile suzer, satirlari esler', async () => {
    calls.selectRows = [{ id: 'h1', name: 'Istanbul Masraflari' }]
    const result = await fetchUserHeadings('1100')
    expect(calls.eq).toEqual([['project_id', 'p1'], ['card_code', '1100']])
    expect(result).toEqual([{ id: 'h1', name: 'Istanbul Masraflari' }])
  })
})

describe('openUserHeading', () => {
  it('kirpilmis adi, projeyi ve karti isleve gonderir, kimligi dondurur', async () => {
    calls.rpcResult = { data: 'h1', error: null }
    const id = await openUserHeading('1100', '  Ekip Yemek  ')
    expect(calls.rpc).toEqual([
      ['fn_open_user_heading', { p_project: 'p1', p_card_code: '1100', p_name: 'Ekip Yemek' }],
    ])
    expect(id).toBe('h1')
  })

  it('bos ad veritabanina gitmeden reddedilir', async () => {
    await expect(openUserHeading('1100', '   ')).rejects.toThrow()
    expect(calls.rpc).toEqual([])
  })

  it('veritabani hatasi yutulmaz', async () => {
    calls.rpcResult = { data: null, error: { message: 'Kart bu projede yok' } }
    await expect(openUserHeading('1100', 'Ekip Yemek')).rejects.toThrow('Kart bu projede yok')
  })
})

describe('moveItemsToHeading', () => {
  it('secilen kalemleri tek istekte gonderir', async () => {
    calls.updatedRows = [{ id: 'a' }, { id: 'b' }]
    await moveItemsToHeading(['a', 'b'], 'h1')
    expect(calls.update).toEqual([{ heading_code: 'h1' }])
    expect(calls.inArgs).toEqual([{ col: 'id', ids: ['a', 'b'] }])
  })

  it('null Basliksiz demektir', async () => {
    calls.updatedRows = [{ id: 'a' }]
    await moveItemsToHeading(['a'], null)
    expect(calls.update).toEqual([{ heading_code: null }])
  })

  it('bos secim veritabanina gitmeden reddedilir', async () => {
    await expect(moveItemsToHeading([], 'h1')).rejects.toThrow()
    expect(calls.update).toEqual([])
  })

  it('eksik guncellenen kalem sessiz gecilmez', async () => {
    calls.updatedRows = [{ id: 'a' }]
    await expect(moveItemsToHeading(['a', 'b'], 'h1')).rejects.toThrow()
  })
})
