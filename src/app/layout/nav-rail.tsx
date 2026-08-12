import type { ComponentType, CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BudgetEntryIcon, DefinitionsIcon } from './rail-icons'

export type ShellModule = 'muhasebe' | 'butce'

interface RailStop {
  key: string
  label: string
  path: string
  // Kapali rayda gosterilir. Yoksa etiketin ilk harfi duser (bkz RailStopLink) -
  // muhasebenin dort duragi henuz kendi ikonunu almadi (TECH-DEBT).
  icon?: ComponentType
}

interface RailModuleConfig {
  title: string
  stops: RailStop[]
  definitions?: RailStop
}

// Ray icerigi koda gomulmez, bildirimsel tanimdan gelir (KABUK-KARARLARI bolum 11):
// modul basina durak listesi tek sabit nesnede tutulur, JSX'e dagitilmaz.
const RAIL_CONFIG: Record<ShellModule, RailModuleConfig> = {
  muhasebe: {
    title: 'Muhasebe',
    stops: [
      { key: 'bekleyen', label: 'Bekleyen', path: '/muhasebe/bekleyen' },
      { key: 'donem', label: 'Dönem', path: '/muhasebe/donem' },
      { key: 'rapor', label: 'Rapor', path: '/muhasebe/rapor' },
      { key: 'davet', label: 'Davet', path: '/muhasebe/davet' },
    ],
  },
  butce: {
    title: 'Bütçe',
    stops: [{ key: 'butce-girisi', label: 'Bütçe Girişi', path: '/butce', icon: BudgetEntryIcon }],
    definitions: { key: 'tanimlar', label: 'Tanımlar', path: '/butce/tanimlar', icon: DefinitionsIcon },
  },
}

interface Props {
  module: ShellModule
  collapsed: boolean
}

export function NavRail({ module, collapsed }: Props) {
  const { pathname } = useLocation()
  const config = RAIL_CONFIG[module]

  return (
    <nav aria-label={`${config.title} gezinmesi`} style={{ ...railStyle, width: collapsed ? railWidthCollapsed : railWidthOpen }}>
      {!collapsed && <div style={titleStyle}>{config.title}</div>}
      <div style={stopsStyle}>
        {config.stops.map((stop) => (
          <RailStopLink key={stop.key} stop={stop} active={pathname === stop.path} collapsed={collapsed} />
        ))}
      </div>
      {config.definitions && (
        <>
          <div style={dividerStyle} />
          <div style={stopsStyle}>
            <RailStopLink stop={config.definitions} active={pathname === config.definitions.path} collapsed={collapsed} />
          </div>
        </>
      )}
    </nav>
  )
}

function RailStopLink({ stop, active, collapsed }: { stop: RailStop; active: boolean; collapsed: boolean }) {
  const Icon = stop.icon
  return (
    <Link
      to={stop.path}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? stop.label : undefined}
      title={collapsed ? stop.label : undefined}
      style={{
        ...stopStyle,
        ...(collapsed ? collapsedStopStyle : {}),
        ...(active ? activeStopStyle : {}),
      }}
    >
      {collapsed ? (
        Icon ? (
          <Icon />
        ) : (
          <span style={collapsedLetterStyle} aria-hidden="true">
            {stop.label.charAt(0)}
          </span>
        )
      ) : (
        stop.label
      )}
    </Link>
  )
}

// KLV-RAY: acik rayda icerigin yarisi bosta duruyordu (en uzun etiket "Bütçe
// Girişi" ~12 karakter); genislik olcup makul bir degere indirildi (RAY-2).
// Kapali genislik yalniz ikon + dokunma alani (touch-min) tasir.
const railWidthOpen = '168px'
const railWidthCollapsed = '68px'

const railStyle: CSSProperties = {
  flexShrink: 0,
  height: '100%',
  overflowY: 'auto',
  background: 'var(--color-surface)',
  borderRight: '1px solid var(--color-border)',
  padding: 'var(--space-5) var(--space-3)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-5)',
}

const titleStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--weight-bold)',
  color: 'var(--color-text-muted)',
  padding: '0 var(--space-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const stopsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const stopStyle: CSSProperties = {
  display: 'block',
  padding: 'var(--space-3) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  textDecoration: 'none',
  minHeight: 'var(--touch-min)',
  lineHeight: 'var(--touch-min)',
}

// Kapali durak: yazi yerine tek ikon, ortalanmis, dokunma alani touch-min'de sabit.
const collapsedStopStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-2)',
  minWidth: 'var(--touch-min)',
  lineHeight: 'normal',
}

// Ikonu olmayan durak (TECH-DEBT: muhasebenin dordu) kapali rayda ilk harfle
// gorunur - ikonla ayni 20x20 kutuda, ayni hizada durur.
const collapsedLetterStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'var(--text-md)',
  fontWeight: 'var(--weight-bold)',
  lineHeight: '20px',
}

const activeStopStyle: CSSProperties = {
  background: 'var(--color-surface-2)',
  color: 'var(--color-primary)',
  fontWeight: 'var(--weight-bold)',
  boxShadow: 'inset 3px 0 0 var(--color-primary)',
}

const dividerStyle: CSSProperties = {
  height: '1px',
  background: 'var(--color-border)',
  margin: '0 var(--space-3)',
}
