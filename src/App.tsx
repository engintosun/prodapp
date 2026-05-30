import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './shared/supabase/client'
import { useTheme } from './shared/theme'
import { ErrorBoundary } from './shared/components/error-boundary'
import { ToastProvider } from './shared/components/toast'
import { LoginPage } from './app/auth/login-page'
import { AuthenticatedShell } from './app/auth/authenticated-shell'
import { ProjectSelectionPage } from './app/auth/project-selection-page'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  function renderRoute() {
    if (loading) return null
    if (!session) return <LoginPage />
    const hasProject = session.user.app_metadata?.project_id
    if (!hasProject) return <ProjectSelectionPage />
    return <AuthenticatedShell user={session.user} theme={theme} onToggleTheme={toggleTheme} />
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        {renderRoute()}
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
