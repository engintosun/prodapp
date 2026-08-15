// @vitest-environment jsdom
// KABUK sprint dilim 1: adres semasinin AuthenticatedShell icindeki cozumunu dogrular.
// Ekranlarin kendisi (ReviewerScreen/CardTableScreen/SahaScreen) mock'lanir -
// olculen sey HANGI ekranin acildigi ve rol/adres eslesmesi, ekranlarin kendi
// Supabase davranisi degil (bu dosyada ag istegi atilmaz).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { ToastProvider } from '../../shared/components/toast'
import type { UserRole } from '../../shared/types/domain'
import { AuthenticatedShell } from './authenticated-shell'

afterEach(cleanup)

vi.mock('../../shared/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { name: 'Test Proje' }, error: null }),
        }),
      }),
    }),
  },
}))

vi.mock('../../shared/supabase/invitation-service', () => ({
  getDepartments: () => Promise.resolve([{ id: 'd1', name: 'Departman' }]),
}))

vi.mock('../../shared/supabase/onboarding-service', () => ({
  hasOpenPeriod: () => Promise.resolve(true),
}))

vi.mock('../reviewer/reviewer-screen', () => ({
  ReviewerScreen: ({ role }: { role: string }) => <div data-testid="reviewer-screen">{role}</div>,
}))

vi.mock('../muhasebe/budget/card-table-screen', () => ({
  CardTableScreen: () => <div data-testid="card-table-screen">butce</div>,
}))

vi.mock('../muhasebe/budget/card-desk-screen', () => ({
  CardDeskScreen: () => <div data-testid="card-desk-screen">masa</div>,
}))

vi.mock('../saha/saha-screen', () => ({
  SahaScreen: ({ activeKey }: { activeKey: string }) => <div data-testid="saha-screen">{activeKey}</div>,
}))

function renderShell(initialPath: string, role: UserRole) {
  const user = {
    id: 'user-1',
    email: 'test@kaapa.dev',
    app_metadata: { role, project_id: 'proj-1' },
  } as unknown as User

  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ToastProvider>
        <AuthenticatedShell user={user} theme="dark" onToggleTheme={() => {}} />
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('AuthenticatedShell — adres semasi (KABUK sprint dilim 1)', () => {
  it('/muhasebe/bekleyen adresi ReviewerScreen acar (muhasebe rolu)', async () => {
    renderShell('/muhasebe/bekleyen', 'muhasebe')
    const el = await screen.findByTestId('reviewer-screen')
    expect(el.textContent).toBe('muhasebe')
  })

  it('/butce adresi cardId yokken masayi acar (KABUK-KARARLARI 12.3)', async () => {
    renderShell('/butce', 'muhasebe')
    await screen.findByTestId('card-desk-screen')
  })

  it('/butce adresi cardId varken o karti acar', async () => {
    renderShell('/butce?cardId=11111111-2222-3333-4444-555555555555', 'muhasebe')
    await screen.findByTestId('card-table-screen')
  })

  it('tanimsiz adres sessiz kalmaz, acik karsilik doner', async () => {
    renderShell('/hic-boyle-bir-adres-yok', 'saha')
    const el = await screen.findByText('Adres bulunamadı')
    expect(el).toBeTruthy()
  })

  it('rolune ait olmayan bilinen adrese giden kullanici kendi ilk duragina yonlendirilir', async () => {
    renderShell('/muhasebe/bekleyen', 'saha')
    const el = await screen.findByTestId('saha-screen')
    expect(el.textContent).toBe('ana')
  })
})

describe('AuthenticatedShell — kabuk iskeleti (KABUK sprint dilim 2)', () => {
  it('muhasebe adresinde sol ray gorunur, alt serit (BottomNav) gorunmez', async () => {
    renderShell('/muhasebe/bekleyen', 'muhasebe')
    await screen.findByTestId('reviewer-screen')
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(screen.getByRole('navigation', { name: /gezinmesi/i })).toBeTruthy()
  })

  it('saha rolunde alt serit gorunur, sol ray gorunmez', async () => {
    renderShell('/saha/ana', 'saha')
    await screen.findByTestId('saha-screen')
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(screen.queryByRole('navigation', { name: /gezinmesi/i })).toBeNull()
  })

  it('modul anahtari butceye gecirince adres /butce olur, ray butce duraklarini gosterir', async () => {
    renderShell('/muhasebe/bekleyen', 'muhasebe')
    await screen.findByTestId('reviewer-screen')
    fireEvent.click(screen.getByRole('link', { name: 'Bütçe' }))
    await screen.findByTestId('card-desk-screen')
    expect(screen.getByRole('navigation', { name: 'Bütçe gezinmesi' })).toBeTruthy()
    expect(screen.getByText('Bütçe Girişi')).toBeTruthy()
    expect(screen.getByText('Tanımlar')).toBeTruthy()
  })

  it('ince serit her iki modulde de vardir, modul degisince kaybolmaz', async () => {
    renderShell('/muhasebe/bekleyen', 'muhasebe')
    await screen.findByTestId('reviewer-screen')
    expect(screen.getByTestId('thin-context-strip')).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Bütçe' }))
    await screen.findByTestId('card-desk-screen')
    expect(screen.getByTestId('thin-context-strip')).toBeTruthy()
  })
})

describe('AppHeader — layout siniri (11 Agustos 2026, EKRAN-SAHA satir 15 duzeltmesi)', () => {
  it('saha basliginda kullanici avatari proje adindan once gelir (classic yerlesim)', async () => {
    renderShell('/saha/ana', 'saha')
    await screen.findByTestId('saha-screen')
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    const children = Array.from(header!.children)
    const avatarButton = header!.querySelector('button:not([aria-label])')
    expect(avatarButton).toBeTruthy()
    const projectSpan = children.find((c) => c.tagName === 'SPAN')
    expect(projectSpan).toBeTruthy()
    const avatarIndex = children.findIndex((c) => c.contains(avatarButton))
    const projectIndex = children.indexOf(projectSpan!)
    expect(avatarIndex).toBeLessThan(projectIndex)
  })

  it('muhasebe basliginda modul anahtari proje adindan once, kullanici avatari en sonda gelir (shell yerlesim)', async () => {
    renderShell('/muhasebe/bekleyen', 'muhasebe')
    await screen.findByTestId('reviewer-screen')
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    const children = Array.from(header!.children)
    const moduleSwitcher = children.find((c) => c.getAttribute('role') === 'group')
    expect(moduleSwitcher).toBeTruthy()
    const projectSpan = children.find((c) => c.tagName === 'SPAN')
    expect(projectSpan).toBeTruthy()
    const avatarButton = header!.querySelector('button:not([aria-label])')
    expect(avatarButton).toBeTruthy()
    const moduleIndex = children.indexOf(moduleSwitcher!)
    const projectIndex = children.indexOf(projectSpan!)
    const avatarIndex = children.findIndex((c) => c.contains(avatarButton))
    expect(moduleIndex).toBeLessThan(projectIndex)
    expect(avatarIndex).toBe(children.length - 1)
  })
})
