// @vitest-environment jsdom
// RAY-DARALTMA dilimi: sol ray daraltma dugmesinin ac/kapa davranisini ve
// localStorage kaliciligini dogrular. AppShell yalitilmis render edilir,
// AppHeader/NavRail'in kendi ic davranisina dokunulmaz.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
})
