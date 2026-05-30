import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error(error)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <span style={{ color: 'var(--color-text)', fontSize: 'var(--text-md)' }}>
            Bir şeyler ters gitti
          </span>
          <button
            onClick={() => window.location.reload()}
            style={{
              minHeight: 'var(--touch-min)',
              padding: '0 var(--space-4)',
              background: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            Tekrar dene
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
