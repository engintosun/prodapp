// @vitest-environment jsdom
// TD-23 (2 Agustos 2026): ilk bilesen testi. Ortam DOSYA BASI acilir, genel ortam node kalir
// (ARCHITECTURE 3.5) - saf testler DOM-suz ve hizli kalsin diye.
// Olculen sey D3c-3 capraz-kart bilgisinin EKRANDAKI hali: gorunur mu, susar mi, numara basar mi.
// Eslesme kurallarinin KENDISI format.test.ts icinde saf katmanda test edilir, burada TEKRARLANMAZ.
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { AddItemPanel } from './add-item-panel'
import type { RoomOption } from '../format'

afterEach(cleanup)

const LIBRARY_OPTION: RoomOption = {
  key: '1500001',
  name: 'Yonetmen',
  aliases: [],
  source: 'library',
  catalogCode: '1500001',
  paymentStatus: 'bordro',
  unitCode: 'day',
  asksPerson: false,
  attachesTo: [],
}

function renderPanel(
  overrides: {
    query?: string
    options?: RoomOption[]
    crossCardNames?: string[]
    onSelect?: (item: RoomOption, personObjectId?: string, parentItemId?: string) => void
    anchorRowsFor?: (option: RoomOption) => { id: string; name: string }[]
  } = {},
) {
  const inputRef = createRef<HTMLInputElement>()
  render(
    <AddItemPanel
      query={overrides.query ?? 'Isik Sefi'}
      options={overrides.options ?? []}
      highlightIndex={-1}
      inputRef={inputRef}
      onQueryChange={() => {}}
      onHighlightChange={() => {}}
      onSelect={overrides.onSelect ?? (() => {})}
      crossCardNames={overrides.crossCardNames ?? []}
      onCreateFree={() => {}}
      onClose={() => {}}
      persons={[]}
      anchorRowsFor={overrides.anchorRowsFor ?? (() => [])}
    />,
  )
  return screen.getByRole('dialog')
}

describe('AddItemPanel capraz-kart bilgisi (D3c-3 ekran katmani)', () => {
  it('baska kartta tam ad varsa o kartin ADI ekranda gorunur', () => {
    const dialog = renderPanel({ crossCardNames: ['Kamera'] })
    expect(dialog.textContent).toContain('Kamera')
    expect(dialog.textContent).toContain('kütüphanesinde var')
  })

  it('eslesme yoksa ekran susar', () => {
    const dialog = renderPanel({ crossCardNames: [] })
    expect(dialog.textContent).not.toContain('kütüphanesinde var')
  })

  it('liste doluyken bilgi hic cizilmez (serbest ekleme bolgesiyle birlikte yasar)', () => {
    const dialog = renderPanel({ options: [LIBRARY_OPTION], crossCardNames: ['Kamera'] })
    expect(dialog.textContent).not.toContain('Kamera')
    expect(dialog.textContent).not.toContain('kütüphanesinde var')
  })

  it('bilgi gorunurken hicbir numara basilmaz', () => {
    const dialog = renderPanel({ crossCardNames: ['Kamera'] })
    expect(dialog.textContent).toContain('kütüphanesinde var')
    expect(dialog.textContent).not.toMatch(/[0-9]/)
  })
})

describe('Kime? zimba (1500 Dilim 2a-3b)', () => {
  const ATTACH_OPTION: RoomOption = {
    ...LIBRARY_OPTION,
    key: '1501-01',
    catalogCode: '1501-01',
    name: 'Yönetmen Hak Devri',
    attachesTo: ['1501', '1509'],
  }
  const ANCHOR_ROWS = [
    { id: 'r1', name: 'Yönetmen 1' },
    { id: 'r2', name: 'Ayşe Yılmaz' },
  ]

  it('secenege tiklaninca ikinci adim acilir ve satirlar Kime? adlariyla listelenir', () => {
    const dialog = renderPanel({ options: [ATTACH_OPTION], anchorRowsFor: () => ANCHOR_ROWS })
    fireEvent.click(screen.getByText('Yönetmen Hak Devri'))
    expect(dialog.getAttribute('aria-label')).toBe('Kime?')
    expect(dialog.textContent).toContain('Yönetmen 1')
    expect(dialog.textContent).toContain('Ayşe Yılmaz')
  })

  it('listeden satir secilince onSelect (secenek, undefined, satir kimligi) ile cagrilir', () => {
    const onSelect = vi.fn()
    renderPanel({ options: [ATTACH_OPTION], onSelect, anchorRowsFor: () => ANCHOR_ROWS })
    fireEvent.click(screen.getByText('Yönetmen Hak Devri'))
    fireEvent.click(screen.getByText('Ayşe Yılmaz'))
    expect(onSelect).toHaveBeenCalledWith(ATTACH_OPTION, undefined, 'r2')
  })

  it('anchorRowsFor bos donerse baglanacak satir yok yazisi gorunur', () => {
    const dialog = renderPanel({ options: [ATTACH_OPTION], anchorRowsFor: () => [] })
    fireEvent.click(screen.getByText('Yönetmen Hak Devri'))
    expect(dialog.textContent).toContain('Bu kartta bu kalemin bağlanacağı satır yok.')
  })

  it('asksPerson secenegi bos kisi listesinde eski metni gosterir', () => {
    const asksOption: RoomOption = { ...LIBRARY_OPTION, key: '1611', catalogCode: '1611', name: 'Mesai', asksPerson: true }
    const dialog = renderPanel({ options: [asksOption] })
    fireEvent.click(screen.getByText('Mesai'))
    expect(dialog.textContent).toContain('Bu kartta aktif satırı olan kimse yok.')
  })
})
