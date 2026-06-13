import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../shared/supabase/client'

interface SignupPageProps {
  token: string
}

export function SignupPage({ token }: SignupPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.includes('@')) {
      setError('Gecerli bir e-posta adresi girin.')
      return
    }
    if (password.length < 8) {
      setError('Sifre en az 8 karakter olmali.')
      return
    }
    if (password !== confirm) {
      setError('Sifreler eslesmiyor.')
      return
    }

    setLoading(true)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('accept-invitation', {
        body: { token, email, password },
      })

      if (fnError) {
        let msg = 'Davet kabul edilemedi.'
        try {
          const b = await (fnError as { context?: { json?: () => Promise<{ error?: string }> } }).context?.json?.()
          if (b?.error) msg = b.error
        } catch { /* en iyi çaba; hata bilerek yutuluyor */ }
        setError(msg)
        setLoading(false)
        return
      }

      if (!data?.ok) {
        setError(data?.error ?? 'Davet kabul edilemedi.')
        setLoading(false)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      window.history.replaceState(null, '', window.location.pathname)
    } catch {
      setError('Beklenmeyen hata, tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <h1 style={{ margin: 0 }}>KAAPA</h1>
        <p style={{ margin: 0 }}>Hesabini Olustur</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Davetle katiliyorsun.</p>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: '8px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Sifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: '8px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Sifre (tekrar)"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={{ padding: '8px', fontSize: '16px' }}
        />
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: '10px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Olusturuluyor...' : 'Hesabi Olustur'}
        </button>
      </form>
    </div>
  )
}
