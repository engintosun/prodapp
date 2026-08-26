import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import type { Theme } from '../../shared/theme'
import type { UserRole } from '../../shared/types/domain'
import { signOut, clearClaims } from '../../shared/supabase/auth-service'
import { supabase } from '../../shared/supabase/client'
import { getDepartments } from '../../shared/supabase/invitation-service'
import { hasOpenPeriod } from '../../shared/supabase/onboarding-service'
import { useToast } from '../../shared/components/toast'
import { Loading } from '../../shared/components/loading'
import { AppHeader } from '../layout/app-header'
import { AppShell } from '../layout/app-shell'
import { BottomNav } from '../layout/bottom-nav'
import type { ShellModule } from '../layout/nav-rail'
import { OfflineBanner } from '../../shared/components/offline-banner'
import { EmptyState } from '../../shared/components/empty-state'
import { SahaScreen } from '../saha/saha-screen'
import { ReviewerScreen } from '../reviewer/reviewer-screen'
import { InviteScreen } from '../muhasebe/invite-screen'
import { CardTableScreen } from '../muhasebe/budget/card-table-screen'
import { CardDeskScreen } from '../muhasebe/budget/card-desk-screen'
import { DefinitionsScreen } from '../muhasebe/definitions-screen'
import { OnboardingFlow } from '../onboarding/onboarding-flow'

interface Props {
  user: User
  theme: Theme
  onToggleTheme: () => void
}

type SetupState = 'checking' | 'departman' | 'donem' | 'none'

type ScreenKind = 'reviewer' | 'invite' | 'definitions' | 'budget' | 'empty'

interface RouteEntry {
  key: string
  path: string
  kind: ScreenKind
  label: string
}

const SAHA_KEYS = ['ana', 'donem', 'ara', 'mesajlar']

// Rol adres semasi tek yerde. Muhasebe rolu artik IKI modul tasir (muhasebe +
// butce, KABUK-KARARLARI bolum 4); modul, /butce ile baslayip baslamamasina
// gore pathname'den okunur (moduleForPath). Tanimlar dilim 2'de /muhasebe'den
// /butce'ye tasindi (butce tanimlaridir) — /muhasebe/tanimlar adresi KALKTI.
const DEPT_ROUTES: RouteEntry[] = [
  { key: 'bekleyen', path: '/dept/bekleyen', kind: 'reviewer', label: 'Bekleyen' },
  { key: 'fisler', path: '/dept/fisler', kind: 'empty', label: 'Fişler' },
  { key: 'donem', path: '/dept/donem', kind: 'empty', label: 'Dönem' },
]

const MUHASEBE_ROUTES: RouteEntry[] = [
  { key: 'bekleyen', path: '/muhasebe/bekleyen', kind: 'reviewer', label: 'Bekleyen' },
  { key: 'donem', path: '/muhasebe/donem', kind: 'empty', label: 'Dönem' },
  { key: 'rapor', path: '/muhasebe/rapor', kind: 'empty', label: 'Rapor' },
  { key: 'davet', path: '/muhasebe/davet', kind: 'invite', label: 'Davet' },
]

const BUTCE_ROUTES: RouteEntry[] = [
  { key: 'butce-girisi', path: '/butce', kind: 'budget', label: 'Bütçe Girişi' },
  { key: 'tanimlar', path: '/butce/tanimlar', kind: 'definitions', label: 'Tanımlar' },
]

function moduleForPath(pathname: string): ShellModule {
  return pathname.startsWith('/butce') ? 'butce' : 'muhasebe'
}

// Rol-bagimsiz: bu adres UYGULAMANIN herhangi bir yerinde tanimli mi (baska
// bir rolun adresi olabilir). Bilinmiyorsa "Adres bulunamadi"; biliniyor ama
// bu role ait degilse kendi rolunun ilk duragina yonlendirme.
function isAnyKnownPath(pathname: string): boolean {
  if (SAHA_KEYS.some((k) => pathname === `/saha/${k}`)) return true
  if (DEPT_ROUTES.some((r) => r.path === pathname)) return true
  if (MUHASEBE_ROUTES.some((r) => r.path === pathname)) return true
  if (BUTCE_ROUTES.some((r) => r.path === pathname)) return true
  return false
}

function firstPathForRole(role: UserRole): string {
  if (role === 'saha') return '/saha/ana'
  if (role === 'dept') return DEPT_ROUTES[0].path
  return MUHASEBE_ROUTES[0].path
}

function pathForKey(role: UserRole, key: string): string {
  if (role === 'saha') return `/saha/${key}`
  return DEPT_ROUTES.find((r) => r.key === key)?.path ?? firstPathForRole(role)
}

function screenForMatch(
  match: RouteEntry,
  role: Extract<UserRole, 'dept' | 'muhasebe'>,
  projectId: string | undefined,
  userId: string,
  searchParams: URLSearchParams,
): ReactNode {
  if (match.kind === 'reviewer') return <ReviewerScreen role={role} />
  if (match.kind === 'invite') return <InviteScreen />
  if (match.kind === 'definitions') return <DefinitionsScreen projectId={projectId as string} userId={userId} />
  if (match.kind === 'budget') {
    const budgetId = searchParams.get('budgetId') ?? undefined
    const cardId = searchParams.get('cardId') ?? undefined
    // KABUK-KARARLARI 12.3: masa sol raydaki Butce Girisi duraginin ICIDIR, ayri durak yoktur.
    // Adreste cardId yoksa masa acilir, varsa o kart. cardId UUID oldugu icin kart NUMARASI
    // adres cubuguna da dusmez.
    if (!cardId) return <CardDeskScreen budgetId={budgetId} />
    return <CardTableScreen budgetId={budgetId} cardId={cardId} />
  }
  return <EmptyState title={match.label} description="Bu ekran yakında (M2.3+)" />
}

export function AuthenticatedShell({ user, theme, onToggleTheme }: Props) {
  const role = (user.app_metadata?.role as UserRole) ?? 'saha'
  const projectId = user.app_metadata?.project_id as string | undefined
  const [projectName, setProjectName] = useState('')
  const [setupState, setSetupState] = useState<SetupState>(role === 'muhasebe' ? 'checking' : 'none')
  const { addToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!projectId) return
    supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Project name fetch error:', error)
          addToast('Proje adı yüklenemedi', 'error')
          setProjectName('—')
        } else {
          setProjectName(data.name as string)
        }
      })
  }, [projectId, addToast])

  useEffect(() => {
    if (role !== 'muhasebe' || !projectId) return
    let cancelled = false
    getDepartments()
      .then(async (departments) => {
        if (departments.length === 0) {
          if (!cancelled) setSetupState('departman')
          return
        }
        const openPeriodExists = await hasOpenPeriod(projectId)
        if (!cancelled) setSetupState(openPeriodExists ? 'none' : 'donem')
      })
      .catch((e) => {
        console.error('Setup check error:', e)
        if (!cancelled) {
          addToast('Kurulum durumu kontrol edilemedi', 'error')
          setSetupState('none')
        }
      })
    return () => { cancelled = true }
  }, [role, projectId, addToast])

  async function handleSignOut() {
    try {
      await signOut()
    } catch (_e) {
      alert('Çıkış hatası, tekrar deneyin')
    }
  }

  async function handleSwitchProject() {
    navigate('/', { replace: true })
    try {
      await clearClaims()
    } catch (_e) {
      addToast('Proje değiştirilemedi, tekrar deneyin', 'error')
    }
  }

  if (setupState === 'checking') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <Loading label="Yükleniyor..." />
      </div>
    )
  }

  if (setupState === 'departman' || setupState === 'donem') {
    return (
      <>
        <OfflineBanner />
        <OnboardingFlow
          projectId={projectId as string}
          projectName={projectName}
          userId={user.id}
          initialStep={setupState === 'departman' ? 0 : 2}
          onFinish={() => setSetupState('none')}
        />
      </>
    )
  }

  // Rota cozumu tek yerde: adresten hangi ekranin acilacagi burada okunur (ic
  // ice ucli operator yerine). Muhasebe rolu icin ayrica hangi MODULDE
  // (muhasebe/butce) oldugumuz pathname'den okunur — AppShell/NavRail bunu kullanir.
  const pathname = location.pathname
  let activeKey = ''
  let activeModule: ShellModule = 'muhasebe'
  let content: ReactNode

  if (role === 'saha') {
    const sahaKey = SAHA_KEYS.find((k) => pathname === `/saha/${k}`)
    if (sahaKey) {
      activeKey = sahaKey
      content = <SahaScreen activeKey={sahaKey} />
    } else if (pathname === '/') {
      content = <Navigate to={firstPathForRole(role)} replace />
    } else if (isAnyKnownPath(pathname)) {
      content = <Navigate to={firstPathForRole(role)} replace />
    } else {
      content = <EmptyState title="Adres bulunamadı" description={pathname} />
    }
  } else if (role === 'dept') {
    const match = DEPT_ROUTES.find((r) => r.path === pathname)
    if (match) {
      activeKey = match.key
      content = screenForMatch(match, role, projectId, user.id, searchParams)
    } else if (pathname === '/') {
      content = <Navigate to={firstPathForRole(role)} replace />
    } else if (isAnyKnownPath(pathname)) {
      content = <Navigate to={firstPathForRole(role)} replace />
    } else {
      content = <EmptyState title="Adres bulunamadı" description={pathname} />
    }
  } else {
    activeModule = moduleForPath(pathname)
    const routes = activeModule === 'butce' ? BUTCE_ROUTES : MUHASEBE_ROUTES
    const match = routes.find((r) => r.path === pathname)
    if (match) {
      content = screenForMatch(match, role, projectId, user.id, searchParams)
    } else if (pathname === '/') {
      content = <Navigate to={firstPathForRole(role)} replace />
    } else if (isAnyKnownPath(pathname)) {
      content = <Navigate to={firstPathForRole(role)} replace />
    } else {
      content = <EmptyState title="Adres bulunamadı" description={pathname} />
    }
  }

  if (role === 'muhasebe') {
    return (
      <>
        <OfflineBanner />
        <AppShell
          module={activeModule}
          userEmail={user.email ?? ''}
          projectName={projectName}
          notificationCount={0}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onSignOut={handleSignOut}
          onSwitchProject={handleSwitchProject}
        >
          {content}
        </AppShell>
      </>
    )
  }

  return (
    <>
      <OfflineBanner />
      <AppHeader
        userEmail={user.email ?? ''}
        projectName={projectName}
        notificationCount={0}
        onSwitchProject={undefined}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSignOut={handleSignOut}
      />
      <main style={{ padding: 'var(--space-4)', paddingBottom: '96px', minHeight: '100dvh' }}>
        {content}
      </main>
      <BottomNav role={role} activeKey={activeKey} onSelect={(key) => navigate(pathForKey(role, key))} />
    </>
  )
}
