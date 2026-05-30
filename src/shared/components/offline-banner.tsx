import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'var(--color-warning)',
      color: 'var(--color-bg)',
      padding: 'var(--space-2) var(--space-4)',
      fontSize: 'var(--text-sm)',
      textAlign: 'center',
      zIndex: 'var(--z-toast)',
    }}>
      İnternet bağlantısı yok
    </div>
  )
}
