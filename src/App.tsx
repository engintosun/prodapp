import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './shared/supabase/client'
import { LoginPage } from './app/auth/login-page'
import { AuthenticatedShell } from './app/auth/authenticated-shell'
import { ProjectSelectionPage } from './app/auth/project-selection-page'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return null

  if (!session) return <LoginPage />

  const hasProject = session.user.app_metadata?.project_id
  if (!hasProject) return <ProjectSelectionPage />

  return <AuthenticatedShell user={session.user} />
}

export default App
