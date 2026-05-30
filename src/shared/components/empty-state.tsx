import type { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-5)',
      gap: 'var(--space-3)',
      textAlign: 'center',
    }}>
      {icon && <div>{icon}</div>}
      <span style={{
        color: 'var(--color-text)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--weight-medium)',
      }}>
        {title}
      </span>
      {description && (
        <span style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}>
          {description}
        </span>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
