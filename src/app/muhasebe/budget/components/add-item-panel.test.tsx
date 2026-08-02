// @vitest-environment jsdom
// TD-23 (2 Agustos 2026): ilk bilesen testi. Ortam DOSYA BASI acilir, genel ortam node kalir
// (ARCHITECTURE 3.5) - saf testler DOM-suz ve hizli kalsin diye.
// Olculen sey D3c-3 capraz-kart bilgisinin EKRANDAKI hali: gorunur mu, susar mi, numara basar mi.
// Eslesme kurallarinin KENDISI format.test.ts icinde saf katmanda test edilir, burada TEKRARLANMAZ.
import { createRef } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
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
}

function renderPanel(overrides: { query?: string; options?: RoomOption[]; crossCardNames?: string[] } = {}) {
  const inputRef = createRef<HTMLInputElement>()
  render(
    <AddItemPanel
      query={overrides.query ?? 'Isik Sefi'}
      options={overrides.options ?? []}
      highlightIndex={-1}
      inputRef={inputRef}
      onQueryChange={() => {}}
      onHighlightChange={() => {}}
      onSelect={() => {}}
      crossCardNames={overrides.crossCardNames ?? []}
      onCreateFree={() => {}}
      onClose={() => {}}
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
