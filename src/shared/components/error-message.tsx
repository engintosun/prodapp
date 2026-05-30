interface Props {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-3)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-danger)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--color-danger)',
      fontSize: 'var(--text-sm)',
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-danger)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            padding: '0',
            textDecoration: 'underline',
            minHeight: 'var(--touch-min)',
          }}
        >
          Tekrar dene
        </button>
      )}
    </div>
  )
}
