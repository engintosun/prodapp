import { useState } from 'react'
import { signOut } from '../../shared/supabase/auth-service'
import { InviteScreen } from '../muhasebe/invite-screen'
import { DepartmentStep } from './department-step'
import { PeriodStep } from './period-step'
import { BudgetStep } from './budget-step'

interface Props {
  projectId: string
  projectName: string
  userId: string
  initialStep: 0 | 1
  onFinish: () => void
}

const STEP_LABELS = ['Departman', 'Dönem', 'Bütçe', 'Davet']

export function OnboardingFlow({ projectId, projectName, userId, initialStep, onFinish }: Props) {
  const [step, setStep] = useState<number>(initialStep)

  async function handleSignOut() {
    try {
      await signOut()
    } catch (_e) {
      alert('Çıkış hatası, tekrar deneyin')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}>
        <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
          {projectName}
        </span>
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Çıkış
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}>
        {STEP_LABELS.map((label, idx) => (
          <span
            key={label}
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: idx === step ? 'var(--weight-bold)' : 'var(--weight-regular)',
              color: idx < step
                ? 'var(--color-success)'
                : idx === step
                  ? 'var(--color-text)'
                  : 'var(--color-text-muted)',
            }}
          >
            {idx < step ? '✓ ' : ''}{label}
          </span>
        ))}
      </div>

      <main style={{ flex: 1, padding: 'var(--space-4)', paddingBottom: '96px' }}>
        {step === 0 && <DepartmentStep projectId={projectId} onDone={() => setStep(1)} />}
        {step === 1 && <PeriodStep projectId={projectId} userId={userId} onDone={() => setStep(2)} />}
        {step === 2 && <BudgetStep projectId={projectId} userId={userId} onDone={() => setStep(3)} />}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <InviteScreen />
            <button
              onClick={onFinish}
              style={{
                minHeight: 'var(--touch-min)',
                background: 'var(--color-primary)',
                color: 'var(--color-primary-text)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-bold)',
                cursor: 'pointer',
              }}
            >
              Kurulumu bitir
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
