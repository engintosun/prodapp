import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Theme } from '../../shared/theme'
import type { UserRole } from '../../shared/types/domain'
import { signOut } from '../../shared/supabase/auth-service'
import { AppHeader } from '../layout/app-header'
import { BottomNav, NAV_ITEMS } from '../layout/bottom-nav'
import { OfflineBanner } from '../../shared/components/offline-banner'
import { EmptyState } from '../../shared/components/empty-state'

interface Props {
  user: User
  theme: Theme
  onToggleTheme: () => void
}

export function AuthenticatedShell({ user, theme, onToggleTheme }: Props) {
  const role = (user.app_metadata?.role as UserRole) ?? 'saha'
  const [activeKey, setActiveKey] = useState(NAV_ITEMS[role][0].key)

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
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSignOut={handleSignOut}
      />
      <main style={{ padding: 'var(--space-4)', paddingBottom: '96px', minHeight: '100dvh' }}>
        <EmptyState title={activeLabel} description="Bu ekran yakında (M2.3+)" />
      </main>
      <BottomNav role={role} activeKey={activeKey} onSelect={setActiveKey} />
    </>
  )
}
