import { describe, it, expect } from 'vitest'
import { assembleBordroInput } from './payroll-read'

// Bu dosya YALNIZ assembleBordroInput'u test eder (saf fonksiyon, DB gerekmez). Motorun
// matematigi (computeBordroFields) ve DB okumasi (deriveBordroFieldsBatch/deriveBordroFields)
// bu dosyanin konusu DEGIL - onlar sirasiyla budget-service.test.ts ve gercek Supabase yolunda
// dogrulanir.

const UNIT_CODE_BY_ID = new Map<string, string>([
  ['unit-day', 'day'],
  ['unit-week', 'week'],
  ['unit-month', 'month'],
])

const STAGE_BY_ID = new Map<string, { startDate: string | null; isUndated: boolean; sortOrder: number }>([
  ['stage-1', { startDate: '2026-03-01', isUndated: false, sortOrder: 1 }],
  ['stage-2', { startDate: '2026-06-01', isUndated: false, sortOrder: 2 }],
])

function itemRow(
  overrides: Partial<{ unit_net: number; unit_id: string; multiplier: number; repeat: number }> = {},
) {
  return {
    unit_net: 5000,
    unit_id: 'unit-month',
    multiplier: 2,
    repeat: 3,
    ...overrides,
  }
}

function periodRow(
  overrides: Partial<{
    stage_id: string | null
    quantity: number
    repeat_override: number | null
    unit_id_override: string | null
    unit_net_override: number | null
  }> = {},
) {
  return {
    stage_id: 'stage-1',
    quantity: 1,
    repeat_override: null,
    unit_id_override: null,
    unit_net_override: null,
    ...overrides,
  }
}

describe('assembleBordroInput', () => {
  it('tek donemsiz kalem: item alanlari ve legs dogru cikar', () => {
    const { item, periodRows, legs } = assembleBordroInput(
      itemRow({ unit_net: 8000, unit_id: 'unit-week', multiplier: 4, repeat: 2 }),
      [],
      ['sgk_isci', 'issizlik_isci', 'sgk_isveren', 'issizlik_isveren'],
      UNIT_CODE_BY_ID,
      STAGE_BY_ID,
    )
    expect(item).toEqual({ unitNet: 8000, unitCode: 'week', multiplier: 4, repeat: 2 })
    expect(periodRows).toEqual([])
    expect(legs).toEqual({
      socialSecurityEmployee: true,
      unemploymentEmployee: true,
      socialSecurityEmployer: true,
      unemploymentEmployer: true,
    })
  })

  it('cok donemli kalem: periodRows sirasi ve stage alanlari dogru esler', () => {
    const { periodRows } = assembleBordroInput(
      itemRow(),
      [periodRow({ stage_id: 'stage-1', quantity: 1 }), periodRow({ stage_id: 'stage-2', quantity: 2 })],
      [],
      UNIT_CODE_BY_ID,
      STAGE_BY_ID,
    )
    expect(periodRows).toHaveLength(2)
    expect(periodRows[0]).toMatchObject({
      stageId: 'stage-1',
      quantity: 1,
      sortOrder: 1,
      startDate: '2026-03-01',
      isUndated: false,
    })
    expect(periodRows[1]).toMatchObject({
      stageId: 'stage-2',
      quantity: 2,
      sortOrder: 2,
      startDate: '2026-06-01',
      isUndated: false,
    })
  })

  it("donem override'lari dogru tasiniyor; null olanlar null kaliyor", () => {
    const { periodRows } = assembleBordroInput(
      itemRow(),
      [
        periodRow({ stage_id: 'stage-1' }),
        periodRow({ stage_id: 'stage-2', repeat_override: 5, unit_id_override: 'unit-day', unit_net_override: 1200 }),
      ],
      [],
      UNIT_CODE_BY_ID,
      STAGE_BY_ID,
    )
    expect(periodRows[0]).toMatchObject({ repeatOverride: null, unitCodeOverride: null, unitNetOverride: null })
    expect(periodRows[1]).toMatchObject({ repeatOverride: 5, unitCodeOverride: 'day', unitNetOverride: 1200 })
  })

  it("bilinmeyen unit_id: unitCode varsayilani 'month' oluyor", () => {
    const { item } = assembleBordroInput(itemRow({ unit_id: 'unit-bilinmeyen' }), [], [], UNIT_CODE_BY_ID, STAGE_BY_ID)
    expect(item.unitCode).toBe('month')
  })

  it('eksik stage: sortOrder 0, isUndated true varsayilanlari uygulaniyor', () => {
    const { periodRows } = assembleBordroInput(
      itemRow(),
      [periodRow({ stage_id: 'stage-bilinmeyen' })],
      [],
      UNIT_CODE_BY_ID,
      STAGE_BY_ID,
    )
    expect(periodRows[0]).toMatchObject({ stageId: 'stage-bilinmeyen', sortOrder: 0, startDate: null, isUndated: true })
  })

  it("burdenCodes'tan PayrollLegs esleme dogru (dort bacagin her biri)", () => {
    const { legs } = assembleBordroInput(itemRow(), [], ['sgk_isci', 'issizlik_isveren'], UNIT_CODE_BY_ID, STAGE_BY_ID)
    expect(legs).toEqual({
      socialSecurityEmployee: true,
      unemploymentEmployee: false,
      socialSecurityEmployer: false,
      unemploymentEmployer: true,
    })
  })
})
