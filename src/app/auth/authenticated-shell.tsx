import type { User } from '@supabase/supabase-js'
import { supabase } from '../../shared/supabase/client'

interface AuthenticatedShellProps {
  user: User
}

export function AuthenticatedShell({ user }: AuthenticatedShellProps) {
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('Çıkış hatası, tekrar deneyin')
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <p>{user.email}</p>
      <button onClick={handleSignOut} style={{ padding: '8px 16px', fontSize: '14px' }}>
        Çıkış Yap
      </button>
    </div>
  )
}
