import type { User } from '@supabase/supabase-js'
import { signOut } from '../../shared/supabase/auth-service'

interface AuthenticatedShellProps {
  user: User
}

export function AuthenticatedShell({ user }: AuthenticatedShellProps) {
  async function handleSignOut() {
    try {
      await signOut()
    } catch (_e) {
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
