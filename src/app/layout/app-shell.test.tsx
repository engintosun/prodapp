// @vitest-environment jsdom
// RAY-DARALTMA dilimi: sol ray daraltma dugmesinin ac/kapa davranisini ve
// localStorage kaliciligini dogrular. AppShell yalitilmis render edilir,
// AppHeader/NavRail'in kendi ic davranisina dokunulmaz.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from './app-shell'

afterEach(cleanup)

function renderShell() {
  render(
    <MemoryRouter>
      <AppShell
        module="muhasebe"
        userEmail="test@kaapa.dev"
        projectName="Test Proje"
        notificationCount={0}
        theme="dark"
        onToggleTheme={() => {}}
        onSignOut={() => {}}
      >
        <div>masa</div>
      </AppShell>
    </MemoryRouter>,
  )
}

describe('AppShell — sol ray daraltma dugmesi', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('varsayilanda ray gorunur, dugme acik durumu bildirir', () => {
    renderShell()
    expect(screen.getByText('Bekleyen')).toBeTruthy()
    const btn = screen.getByRole('button', { name: 'Rayı kapat' })
    expect(btn.getAttribute('aria-expanded')).toBe('true')
  })

  it('dugmeye basinca ray kapanir, duraklar kaybolur, aria degerleri degisir', () => {
    renderShell()
    const btn = screen.getByRole('button', { name: 'Rayı kapat' })
    fireEvent.click(btn)
    expect(screen.queryByText('Bekleyen')).toBeNull()
    const reopenBtn = screen.getByRole('button', { name: 'Rayı aç' })
    expect(reopenBtn.getAttribute('aria-expanded')).toBe('false')
  })

  it('tekrar basinca ray geri gelir', () => {
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Rayı kapat' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rayı aç' }))
    expect(screen.getByText('Bekleyen')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rayı kapat' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('localStorage kapali yazilmissa kabuk kapali acilir', () => {
    localStorage.setItem('kaapa-rail-collapsed', 'true')
    renderShell()
    expect(screen.queryByText('Bekleyen')).toBeNull()
    expect(screen.getByRole('button', { name: 'Rayı aç' })).toBeTruthy()
  })

  it('localStorage erisimi hata firlatirsa kabuk yine de cizilir (varsayilan acik)', () => {
    const original = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('erisim engellendi')
      },
    })
    try {
      renderShell()
      expect(screen.getByText('Bekleyen')).toBeTruthy()
    } finally {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: original })
    }
  })

  it('ray kapaliyken durak linkleri DOM da durur ve aria-label ile durak adini tasir', () => {
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Rayı kapat' }))
    const link = screen.getByRole('link', { name: 'Bekleyen' })
    expect(link).toBeTruthy()
    expect(link.getAttribute('aria-label')).toBe('Bekleyen')
  })

  it('ray kapaliyken modul adi basligi gorunmez', () => {
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Rayı kapat' }))
    const nav = screen.getByRole('navigation', { name: 'Muhasebe gezinmesi' })
    expect(within(nav).queryByText('Muhasebe')).toBeNull()
  })

  it('ray acikken durak adlari yaziyla gorunur', () => {
    renderShell()
    expect(screen.getByText('Bekleyen')).toBeTruthy()
    expect(screen.getByText('Dönem')).toBeTruthy()
  })

  it('dugmenin aria-expanded degeri iki durumda da dogru', () => {
    renderShell()
    expect(screen.getByRole('button', { name: 'Rayı kapat' }).getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Rayı kapat' }))
    expect(screen.getByRole('button', { name: 'Rayı aç' }).getAttribute('aria-expanded')).toBe('false')
  })
})
