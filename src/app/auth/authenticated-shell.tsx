import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import type { Theme } from '../../shared/theme'
import type { UserRole } from '../../shared/types/domain'
import { signOut } from '../../shared/supabase/auth-service'
import { supabase } from '../../shared/supabase/client'
import { getDepartments } from '../../shared/supabase/invitation-service'
import { hasOpenPeriod } from '../../shared/supabase/onboarding-service'
import { useToast } from '../../shared/components/toast'
import { Loading } from '../../shared/components/loading'
import { AppHeader } from '../layout/app-header'
import { BottomNav, NAV_ITEMS } from '../layout/bottom-nav'
import { OfflineBanner } from '../../shared/components/offline-banner'
import { EmptyState } from '../../shared/components/empty-state'
import { SahaScreen } from '../saha/saha-screen'
import { ReviewerScreen } from '../reviewer/reviewer-screen'
import { InviteScreen } from '../muhasebe/invite-screen'
import { CardTableScreen } from '../muhasebe/budget/card-table-screen'
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
}

const SAHA_KEYS = ['ana', 'donem', 'ara', 'mesajlar']

// NAV_ITEMS anahtarlari (bottom-nav.tsx) DEGISMEZ; adres segmenti anahtardan farkli
// olabilir ("masa" -> /muhasebe/bekleyen) veya modul kokunun disina cikabilir
// ("butce" -> /butce, ust seviye). Eslesme burada, tek yerde tutulur.
const DEPT_ROUTES: RouteEntry[] = [
  { key: 'bekleyen', path: '/dept/bekleyen', kind: 'reviewer' },
  { key: 'fisler', path: '/dept/fisler', kind: 'empty' },
  { key: 'donem', path: '/dept/donem', kind: 'empty' },
]

const MUHASEBE_ROUTES: RouteEntry[] = [
  { key: 'masa', path: '/muhasebe/bekleyen', kind: 'reviewer' },
  { key: 'donem', path: '/muhasebe/donem', kind: 'empty' },
  { key: 'rapor', path: '/muhasebe/rapor', kind: 'empty' },
  { key: 'davet', path: '/muhasebe/davet', kind: 'invite' },
  { key: 'butce', path: '/butce', kind: 'budget' },
  { key: 'tanimlar', path: '/muhasebe/tanimlar', kind: 'definitions' },
]

// Rol-bagimsiz: bu adres UYGULAMANIN herhangi bir yerinde tanimli mi (baska
// bir rolun adresi olabilir). Bilinmiyorsa "Adres bulunamadi"; biliniyor ama
// bu role ait degilse kendi rolunun ilk duragina yonlendirme.
function isAnyKnownPath(pathname: string): boolean {
  if (SAHA_KEYS.some((k) => pathname === `/saha/${k}`)) return true
  if (DEPT_ROUTES.some((r) => r.path === pathname)) return true
  if (MUHASEBE_ROUTES.some((r) => r.path === pathname)) return true
  return false
}

function firstPathForRole(role: UserRole): string {
  if (role === 'saha') return '/saha/ana'
  if (role === 'dept') return DEPT_ROUTES[0].path
  return MUHASEBE_ROUTES[0].path
}

function pathForKey(role: UserRole, key: string): string {
  if (role === 'saha') return `/saha/${key}`
  const routes = role === 'dept' ? DEPT_ROUTES : MUHASEBE_ROUTES
  return routes.find((r) => r.key === key)?.path ?? firstPathForRole(role)
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

  // Rota cozumu tek yerde: adresten hangi ekranin acilacagi ve BottomNav'da hangi
  // anahtarin vurgulanacagi burada okunur (ic ice ucli operator yerine).
  const pathname = location.pathname
  let activeKey = NAV_ITEMS[role][0].key
  let content: ReactNode

  if (role === 'saha') {
    const sahaKey = SAHA_KEYS.find((k) => pathname === `/saha/${k}`)
    if (sahaKey) {
      activeKey = sahaKey
      content = <SahaScreen activeKey={sahaKey} />
    } else if (isAnyKnownPath(pathname)) {
      content = <Navigate to={firstPathForRole(role)} replace />
    } else {
      content = <EmptyState title="Adres bulunamadı" description={pathname} />
    }
  } else {
    const routes = role === 'dept' ? DEPT_ROUTES : MUHASEBE_ROUTES
    const match = routes.find((r) => r.path === pathname)
    if (match) {
      activeKey = match.key
      const label = NAV_ITEMS[role].find((i) => i.key === match.key)?.label ?? ''
      if (match.kind === 'reviewer') {
        content = <ReviewerScreen role={role} />
      } else if (match.kind === 'invite') {
        content = <InviteScreen />
      } else if (match.kind === 'definitions') {
        content = <DefinitionsScreen projectId={projectId as string} userId={user.id} />
      } else if (match.kind === 'budget') {
        const budgetId = searchParams.get('budgetId') ?? undefined
        const cardId = searchParams.get('cardId') ?? undefined
        content = <CardTableScreen budgetId={budgetId} cardId={cardId} />
      } else {
        content = <EmptyState title={label} description="Bu ekran yakında (M2.3+)" />
      }
    } else if (isAnyKnownPath(pathname)) {
      content = <Navigate to={firstPathForRole(role)} replace />
    } else {
      content = <EmptyState title="Adres bulunamadı" description={pathname} />
    }
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
