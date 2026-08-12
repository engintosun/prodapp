import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Theme } from '../../shared/theme'
import { useRailCollapsed } from '../../shared/rail-state'
import { AppHeader } from './app-header'
import { NavRail } from './nav-rail'
import type { ShellModule } from './nav-rail'

interface Props {
  module: ShellModule
  userEmail: string
  projectName: string
  notificationCount: number
  theme: Theme
  onToggleTheme: () => void
  onSignOut: () => void
  children: ReactNode
}

// Kabuk: sol ray + ust baglam (iki serit) + orta masa. Dort bolgeden sag referans
// bu dilimde yok (KABUK-KARARLARI bolum 6, dilim 3'un isi). Bolge sirasi/yukseklik
// modul degisince degismez (12.4) — module gore degisen yalniz rayin duraklari ve
// ince seridin icerigi (bu dilimde ince serit icerigi bos).
export function AppShell({
  module,
  userEmail,
  projectName,
  notificationCount,
  theme,
  onToggleTheme,
  onSignOut,
  children,
}: Props) {
  const { collapsed, toggleRailCollapsed } = useRailCollapsed()
  return (
    <div style={shellStyle}>
      <div style={railColumnStyle}>
        <div style={railToggleRowStyle}>
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Rayı aç' : 'Rayı kapat'}
            onClick={toggleRailCollapsed}
            style={railToggleButtonStyle}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
        {!collapsed && <NavRail module={module} />}
      </div>
      <div style={columnStyle}>
        <AppHeader
          layout="shell"
          userEmail={userEmail}
          projectName={projectName}
          notificationCount={notificationCount}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onSignOut={onSignOut}
          moduleSwitcher={<ModuleSwitcher active={module} />}
        />
        {/* ince serit — her modulde durur, icerik sonraki tur (donem secici, kaydetme durumu) */}
        <div data-testid="thin-context-strip" style={thinStripStyle} />
        <main style={workspaceStyle}>{children}</main>
      </div>
    </div>
  )
}

function ModuleSwitcher({ active }: { active: ShellModule }) {
  return (
    <div role="group" aria-label="Modül anahtarı" style={switcherStyle}>
      <Link
        to="/muhasebe/bekleyen"
        style={{ ...switcherItemStyle, ...(active === 'muhasebe' ? switcherActiveStyle : {}) }}
      >
        Muhasebe
      </Link>
      <Link
        to="/butce"
        style={{ ...switcherItemStyle, ...(active === 'butce' ? switcherActiveStyle : {}) }}
      >
        Bütçe
      </Link>
    </div>
  )
}

const shellStyle: CSSProperties = {
  display: 'flex',
  height: '100dvh',
  overflow: 'hidden',
}

// Daraltma dugmesi rayin degil KABUGUN ogesidir (KABUK-KARARLARI 12.2): rayin
// USTUNDE, kendi satirinda durur - ray kapaninca NavRail kaybolur ama bu satir
// aynen kalir, dugme ekranda zipmaz, yalniz masanin acilan alani genisler.
const railColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  flexShrink: 0,
}

const railToggleRowStyle: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  padding: 'var(--space-2) var(--space-3)',
}

const railToggleButtonStyle: CSSProperties = {
  flexShrink: 0,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  minHeight: 'var(--touch-min)',
  minWidth: 'var(--touch-min)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-base)',
}

const columnStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
}

const thinStripStyle: CSSProperties = {
  flexShrink: 0,
  height: '40px',
  borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
}

// Orta masa kendi kaydirma alanidir — kabuk ogelerinin (ray, seritler) altinda
// hicbir satir kalmaz, tasan icerik burada kaydirilir (dilim 1'in 404 sonrasi
// yenileme hatasindan ayri, ama ayni sinif bir hata: sabit alt serit icerigin
// ustune biniyordu — kabukta artik alt serit yok, masa kendi ekseninde kayar).
const workspaceStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: 'var(--space-4)',
}

const switcherStyle: CSSProperties = {
  display: 'flex',
  flexShrink: 0,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
}

const switcherItemStyle: CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-muted)',
  textDecoration: 'none',
  minHeight: 'var(--touch-min)',
  display: 'flex',
  alignItems: 'center',
}

const switcherActiveStyle: CSSProperties = {
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
  fontWeight: 'var(--weight-bold)',
}
