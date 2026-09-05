// @vitest-environment jsdom
// Kart tarafi kisi secimi GOREV hanesine gore suzulur (6 Eylul 2026). Olculen sey: pano
// dutyCodes ve rowCatalogCode'a gore hangi kisileri gosteriyor - suzme kuralinin KENDISI
// burada, bilesenin gercek render'i uzerinde test edilir.
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { PersonPickSheet } from './person-pick-sheet'
import type { BudgetItemRow } from '../../../../shared/supabase/budget-service'
import type { PersonLabel } from '../../../../shared/supabase/person-label-service'

afterEach(cleanup)

function makeItem(overrides: Partial<BudgetItemRow> = {}): BudgetItemRow {
  return {
    id: 'item-1',
    itemCode: 1,
    catalogCode: 'X.001',
    headingCode: null,
    libraryItemId: null,
    name: 'Test kalem',
    nameEn: null,
    unitNet: 1000,
    unitId: 'unit-1',
    unitLabel: 'gun',
    multiplier: 1,
    repeat: 1,
    vatRate: 20,
    ratesPercent: [],
    burdens: [],
    periodQty: {},
    periodNet: {},
    periodUnit: {},
    periodRepeat: {},
    paymentStatus: 'sirket',
    internalNote: null,
    publicNote: null,
    personObjectId: null,
    deriveRate: null,
    ...overrides,
  }
}

function makeLabel(overrides: Partial<PersonLabel> = {}): PersonLabel {
  return {
    id: 'label-1',
    code: 1,
    name: 'Test Oyuncu',
    roleName: null,
    dutyCode: null,
    isActive: true,
    hasAgency: false,
    agencyName: null,
    hasManager: false,
    managerName: null,
    ...overrides,
  }
}

const BASROL = makeLabel({ id: 'l-basrol', name: 'Basrol Oyuncu', dutyCode: 'basrol' })
const GOREVSIZ = makeLabel({ id: 'l-gorevsiz', name: 'Gorevsiz Oyuncu', dutyCode: null })
const DUBLOR = makeLabel({ id: 'l-dublor', name: 'Dublor Oyuncu', dutyCode: 'dublor' })

function renderSheet(overrides: {
  labels?: PersonLabel[]
  dutyCodes?: ReadonlySet<string>
  rowCatalogCode?: string | null
} = {}) {
  render(
    <PersonPickSheet
      item={makeItem()}
      labels={overrides.labels ?? [BASROL, GOREVSIZ, DUBLOR]}
      dutyCodes={overrides.dutyCodes ?? new Set(['basrol', 'dublor'])}
      rowCatalogCode={overrides.rowCatalogCode === undefined ? 'basrol' : overrides.rowCatalogCode}
      onCommit={() => {}}
      onClose={() => {}}
    />,
  )
  return screen.getByRole('dialog')
}

describe('PersonPickSheet - gorev hanesine gore suzme (6 Eylul 2026)', () => {
  it('gorev satirinda yalniz o gorevdeki kisiler ve gorevi null olanlar gorunur', () => {
    const dialog = renderSheet({ rowCatalogCode: 'basrol' })
    expect(dialog.textContent).toContain('Basrol Oyuncu')
    expect(dialog.textContent).toContain('Gorevsiz Oyuncu')
    expect(dialog.textContent).not.toContain('Dublor Oyuncu')
  })

  it('gorev OLMAYAN satirda liste tam gelir', () => {
    const dialog = renderSheet({ rowCatalogCode: 'mesai' })
    expect(dialog.textContent).toContain('Basrol Oyuncu')
    expect(dialog.textContent).toContain('Gorevsiz Oyuncu')
    expect(dialog.textContent).toContain('Dublor Oyuncu')
  })

  it('rowCatalogCode null iken liste tam gelir', () => {
    const dialog = renderSheet({ rowCatalogCode: null })
    expect(dialog.textContent).toContain('Basrol Oyuncu')
    expect(dialog.textContent).toContain('Dublor Oyuncu')
  })

  it('suzme sonrasi bos kalinca bilgi metni cikar', () => {
    const dialog = renderSheet({ labels: [DUBLOR], rowCatalogCode: 'basrol' })
    expect(dialog.textContent).not.toContain('Dublor Oyuncu')
    expect(dialog.textContent).toContain('Bu görevde kayıtlı kişi yok')
  })

  it('Kisisiz secenegi gorev satirinda da durur', () => {
    renderSheet({ rowCatalogCode: 'basrol' })
    expect(screen.getByRole('button', { name: 'Kişisiz' })).toBeTruthy()
  })

  it('Kisisiz secenegi gorevsiz satirda da durur', () => {
    renderSheet({ rowCatalogCode: 'mesai' })
    expect(screen.getByRole('button', { name: 'Kişisiz' })).toBeTruthy()
  })

  it('Kisisiz secenegi liste bos kaldiginda da durur', () => {
    renderSheet({ labels: [DUBLOR], rowCatalogCode: 'basrol' })
    expect(screen.getByRole('button', { name: 'Kişisiz' })).toBeTruthy()
  })
})
