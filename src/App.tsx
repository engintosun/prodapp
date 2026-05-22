import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './shared/supabase/client'
import { LoginPage } from './app/auth/login-page'
import { AuthenticatedShell } from './app/auth/authenticated-shell'

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

  if (session) {
    return <AuthenticatedShell user={session.user} />
  }

  return <LoginPage />
}

export default App
