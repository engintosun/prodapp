import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Department } from '../../shared/types/domain'
import { useToast } from '../../shared/components/toast'
import { getDepartments } from '../../shared/supabase/invitation-service'
import { setProjectBudget, setProjectDeptBudget } from '../../shared/supabase/onboarding-service'

interface Props {
  projectId: string
  userId: string
  onDone: () => void
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-1)',
}

const inputStyle: CSSProperties = {
  boxSizing: 'border-box',
  minHeight: 'var(--touch-min)',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '0 var(--space-3)',
  fontSize: 'var(--text-md)',
}

const primaryButtonStyle: CSSProperties = {
  minHeight: 'var(--touch-min)',
  background: 'var(--color-primary)',
  color: 'var(--color-primary-text)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-md)',
  fontWeight: 'var(--weight-bold)',
  cursor: 'pointer',
}

const textButtonStyle: CSSProperties = {
  minHeight: 'var(--touch-min)',
  background: 'transparent',
  color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-md)',
  cursor: 'pointer',
}

function parseAmount(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const normalized = trimmed.replace(',', '.')
  const num = Number(normalized)
  if (isNaN(num) || num < 0) return null
  return num
}

export function BudgetStep({ projectId, userId, onDone }: Props) {
  const { addToast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [totalStr, setTotalStr] = useState('')
  const [deptAmounts, setDeptAmounts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((e) => addToast((e as Error).message, 'error'))
  }, [])

  const hasAnyInput = totalStr.trim() !== '' || departments.some((d) => (deptAmounts[d.id] ?? '').trim() !== '')
  const totalForCalc = parseAmount(totalStr) ?? 0
  const deptSum = departments.reduce((sum, d) => sum + (parseAmount(deptAmounts[d.id] ?? '') ?? 0), 0)
  const remaining = totalForCalc - deptSum

  async function handleSaveAndContinue() {
    const totalParsed = parseAmount(totalStr)
    if (totalStr.trim() !== '' && totalParsed === null) {
      addToast('Gecersiz tutar: Proje toplam butcesi', 'warning')
    }

    const deptWrites: { deptId: string; amount: number }[] = []
    for (const dept of departments) {
      const raw = deptAmounts[dept.id] ?? ''
      if (raw.trim() === '') continue
      const amount = parseAmount(raw)
      if (amount === null) {
        addToast('Gecersiz tutar: ' + dept.name, 'warning')
        continue
      }
      deptWrites.push({ deptId: dept.id, amount })
    }

    setSaving(true)
    try {
      if (totalParsed !== null) {
        await setProjectBudget(projectId, totalParsed, 'TRY', userId)
      }
      for (const write of deptWrites) {
        await setProjectDeptBudget(projectId, write.deptId, write.amount, userId)
      }
      onDone()
    } catch (e) {
      addToast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)' }}>
        Butce
      </span>

      <div>
        <label style={labelStyle}>Proje toplam butcesi (TL)</label>
        <input
          style={inputStyle}
          inputMode="decimal"
          value={totalStr}
          onChange={(e) => setTotalStr(e.target.value)}
          placeholder="0"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {departments.map((dept) => (
          <div key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ flex: 1, color: 'var(--color-text)', fontSize: 'var(--text-md)' }}>{dept.name}</span>
            <input
              style={{ ...inputStyle, width: '140px' }}
              inputMode="decimal"
              value={deptAmounts[dept.id] ?? ''}
              onChange={(e) => setDeptAmounts((prev) => ({ ...prev, [dept.id]: e.target.value }))}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {hasAnyInput && (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Dagitilmamis: {remaining.toLocaleString('tr-TR')} TL
        </span>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button onClick={onDone} disabled={saving} style={{ ...textButtonStyle, flex: 1, opacity: saving ? 0.6 : 1 }}>
          Simdilik gec
        </button>
        <button
          onClick={handleSaveAndContinue}
          disabled={saving}
          style={{ ...primaryButtonStyle, flex: 1, opacity: saving ? 0.6 : 1, cursor: saving ? 'default' : 'pointer' }}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet ve devam'}
        </button>
      </div>
    </div>
  )
}
