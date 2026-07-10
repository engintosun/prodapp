import { CompanyProfileForm } from '../../shared/components/company-profile-form'

interface Props {
  projectId: string
  userId: string
  onDone: () => void
}

export function CompanyProfileStep({ projectId, userId, onDone }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
        Şirket Tanımı
      </span>
      <CompanyProfileForm projectId={projectId} userId={userId} onSaved={onDone} submitLabel="Devam" showSkip />
    </div>
  )
}
