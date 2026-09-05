import { describe, it, expect, vi } from 'vitest'

// countPersonLabels satirlari CEKMEZ, yalniz sayar (head:true count:'exact'). Mock zinciri
// budget_cost_objects sorgusunun uc .eq() cagrisini (project_id, kind, is_active) tasir,
// builder kendisi thenable (gercek supabase query builder deseninin ayni davranisi).
vi.mock('./client', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: { user: { app_metadata: { project_id: 'proj-1' } } } }, error: null }),
    },
    from: () => ({
      select: () => {
        const builder = {
          eq: () => builder,
          then: (resolve: (v: { count: number | null; error: null }) => void) => resolve({ count: 3, error: null }),
        }
        return builder
      },
    }),
  },
}))

import { countPersonLabels } from './person-label-service'

describe('countPersonLabels — uretim kayitlari masa kapagi', () => {
  it('satirlari CEKMEDEN kisi sayisini doner', async () => {
    const result = await countPersonLabels()
    expect(result).toBe(3)
  })
})
