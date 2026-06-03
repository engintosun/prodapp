import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Theme } from '../../shared/theme'
import type { UserRole } from '../../shared/types/domain'
import { signOut } from '../../shared/supabase/auth-service'
import { supabase } from '../../shared/supabase/client'
import { useToast } from '../../shared/components/toast'
import { AppHeader } from '../layout/app-header'
import { BottomNav, NAV_ITEMS } from '../layout/bottom-nav'
import { OfflineBanner } from '../../shared/components/offline-banner'
import { EmptyState } from '../../shared/components/empty-state'
import { SahaScreen } from '../saha/saha-screen'
import { ReviewerScreen } from '../reviewer/reviewer-screen'
import { InviteScreen } from '../muhasebe/invite-screen'

interface Props {
  user: User
  theme: Theme
  onToggleTheme: () => void
}

export function AuthenticatedShell({ user, theme, onToggleTheme }: Props) {
  const role = (user.app_metadata?.role as UserRole) ?? 'saha'
  const [activeKey, setActiveKey] = useState(NAV_ITEMS[role][0].key)
  const projectId = user.app_metadata?.project_id as string | undefined
  const [projectName, setProjectName] = useState('')
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

  async function handleSignOut() {
    try {
      await signOut()
    } catch (_e) {
      alert('Çıkış hatası, tekrar deneyin')
    }
  }

  const activeLabel = NAV_ITEMS[role].find(i => i.key === activeKey)?.label ?? ''

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
            : (role === 'dept' && activeKey === 'bekleyen') || (role === 'muhasebe' && activeKey === 'masa')
              ? <ReviewerScreen role={role} />
              : <EmptyState title={activeLabel} description="Bu ekran yakında (M2.3+)" />}
      </main>
      <BottomNav role={role} activeKey={activeKey} onSelect={setActiveKey} />
    </>
  )
}
