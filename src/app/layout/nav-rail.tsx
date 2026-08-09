import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'

export type ShellModule = 'muhasebe' | 'butce'

interface RailStop {
  key: string
  label: string
  path: string
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
    stops: [{ key: 'butce-girisi', label: 'Bütçe Girişi', path: '/butce' }],
    definitions: { key: 'tanimlar', label: 'Tanımlar', path: '/butce/tanimlar' },
  },
}

interface Props {
  module: ShellModule
}

export function NavRail({ module }: Props) {
  const { pathname } = useLocation()
  const config = RAIL_CONFIG[module]

  return (
    <nav aria-label={`${config.title} gezinmesi`} style={railStyle}>
      <div style={titleStyle}>{config.title}</div>
      <div style={stopsStyle}>
        {config.stops.map((stop) => (
          <RailStopLink key={stop.key} stop={stop} active={pathname === stop.path} />
        ))}
      </div>
      {config.definitions && (
        <>
          <div style={dividerStyle} />
          <div style={stopsStyle}>
            <RailStopLink stop={config.definitions} active={pathname === config.definitions.path} />
          </div>
        </>
      )}
    </nav>
  )
}

function RailStopLink({ stop, active }: { stop: RailStop; active: boolean }) {
  return (
    <Link
      to={stop.path}
      aria-current={active ? 'page' : undefined}
      style={{ ...stopStyle, ...(active ? activeStopStyle : {}) }}
    >
      {stop.label}
    </Link>
  )
}

const railStyle: CSSProperties = {
  width: '240px',
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
