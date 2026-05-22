import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../shared/supabase/client'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('Email veya şifre hatalı')
      }
    } catch {
      setError('Bağlantı hatası, tekrar deneyin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <h1 style={{ margin: 0 }}>PRODAPP</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: '8px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: '8px', fontSize: '16px' }}
        />
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: '10px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  )
}
