interface Props {
  label?: string
  size?: number
}

export function Loading({ label, size = 24 }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
    }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--color-text-muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      {label && (
        <span style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
