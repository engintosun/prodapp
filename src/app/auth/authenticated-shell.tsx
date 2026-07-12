import { useState, useEffect } from 'react'
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

export function AuthenticatedShell({ user, theme, onToggleTheme }: Props) {
  const role = (user.app_metadata?.role as UserRole) ?? 'saha'
  const [activeKey, setActiveKey] = useState(NAV_ITEMS[role][0].key)
  const projectId = user.app_metadata?.project_id as string | undefined
  const [projectName, setProjectName] = useState('')
  const [setupState, setSetupState] = useState<SetupState>(role === 'muhasebe' ? 'checking' : 'none')
  const { addToast } = useToast()

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
  }, [projectId])

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
  }, [role, projectId])

  async function handleSignOut() {
    try {
      await signOut()
    } catch (_e) {
      alert('Çıkış hatası, tekrar deneyin')
    }
  }

  const activeLabel = NAV_ITEMS[role].find(i => i.key === activeKey)?.label ?? ''

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
        {role === 'saha'
          ? <SahaScreen activeKey={activeKey} />
          : role === 'muhasebe' && activeKey === 'davet'
            ? <InviteScreen />
            : role === 'muhasebe' && activeKey === 'butce'
              ? <CardTableScreen />
              : role === 'muhasebe' && activeKey === 'tanimlar'
                ? <DefinitionsScreen projectId={projectId as string} userId={user.id} />
                : (role === 'dept' && activeKey === 'bekleyen') || (role === 'muhasebe' && activeKey === 'masa')
                ? <ReviewerScreen role={role} />
                : <EmptyState title={activeLabel} description="Bu ekran yakında (M2.3+)" />}
      </main>
      <BottomNav role={role} activeKey={activeKey} onSelect={setActiveKey} />
    </>
  )
}
