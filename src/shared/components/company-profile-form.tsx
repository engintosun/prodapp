import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useToast } from './toast'
import {
  getCompanyProfileForProject,
  updateCompanyProfileForProject,
} from '../supabase/company-profile-service'

interface Props {
  projectId: string
  userId: string
  onSaved: () => void
  submitLabel: string
  showSkip?: boolean
}

const LEGAL_TYPES: { value: string; label: string }[] = [
  { value: 'sahis', label: 'Şahıs' },
  { value: 'adi_ortaklik', label: 'Adi Ortaklık' },
  { value: 'kollektif', label: 'Kollektif' },
  { value: 'komandit', label: 'Komandit' },
  { value: 'ltd', label: 'Ltd' },
  { value: 'anonim', label: 'A.Ş.' },
  { value: 'kooperatif', label: 'Kooperatif' },
  { value: 'diger', label: 'Diğer' },
]

const inputStyle: CSSProperties = {
  boxSizing: 'border-box',
  minHeight: 'var(--touch-min)',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '0 var(--space-3)',
  fontSize: 'var(--text-md)',
  width: '100%',
}

const primaryButtonStyle: CSSProperties = {
  minHeight: 'var(--touch-min)',
  background: 'var(--color-primary)',
  color: 'var(--color-primary-text)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-md)',
  fontWeight: 'var(--weight-bold)',
  padding: '0 var(--space-4)',
  cursor: 'pointer',
}

const secondaryButtonStyle: CSSProperties = {
  minHeight: 'var(--touch-min)',
  background: 'transparent',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  padding: '0 var(--space-3)',
  cursor: 'pointer',
}

const toggleButtonStyle = (active: boolean): CSSProperties => ({
  minHeight: 'var(--touch-min)',
  flex: 1,
  background: active ? 'var(--color-primary)' : 'var(--color-surface-2)',
  color: active ? 'var(--color-primary-text)' : 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: active ? 'var(--weight-bold)' : 'var(--weight-regular)',
  cursor: 'pointer',
})

interface YesNoQuestionProps {
  question: string
  info: string
  value: boolean
  onChange: (v: boolean) => void
}

function YesNoQuestion({ question, info, value, onChange }: YesNoQuestionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <span style={{ fontSize: 'var(--text-md)', color: 'var(--color-text)', fontWeight: 'var(--weight-bold)' }}>
        {question}
      </span>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button type="button" style={toggleButtonStyle(value)} onClick={() => onChange(true)}>
          Evet
        </button>
        <button type="button" style={toggleButtonStyle(!value)} onClick={() => onChange(false)}>
          Hayır
        </button>
      </div>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{info}</span>
    </div>
  )
}

// Sirket Tanimi formu: Kurulum Modu 1. adiminda (Devam/Simdi atla) ve Tanimlar ekraninda
// (her zaman duzenlenebilir, Kaydet) AYNI form - iki yuzey de bu bileseni kullanir.
export function CompanyProfileForm({ projectId, userId, onSaved, submitLabel, showSkip = false }: Props) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [legalType, setLegalType] = useState<string>('')
  const [kulturGirisimBelgeli, setKulturGirisimBelgeli] = useState(false)
  const [kulturYatirimBelgeli, setKulturYatirimBelgeli] = useState(false)
  const [sgkBorcuYok, setSgkBorcuYok] = useState(true)

  useEffect(() => {
    let cancelled = false
    getCompanyProfileForProject(projectId)
      .then((profile) => {
        if (cancelled || !profile) return
        setLegalType(profile.legalType ?? '')
        setKulturGirisimBelgeli(profile.kulturGirisimBelgeli)
        setKulturYatirimBelgeli(profile.kulturYatirimBelgeli)
        setSgkBorcuYok(profile.sgkBorcuYok)
      })
      .catch((e) => addToast((e as Error).message, 'error'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [projectId, addToast])

  async function save(answers: { legalType: string | null; kulturGirisimBelgeli: boolean; kulturYatirimBelgeli: boolean; sgkBorcuYok: boolean }) {
    setSaving(true)
    try {
      await updateCompanyProfileForProject(projectId, userId, answers)
      onSaved()
    } catch (e) {
      addToast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleSubmit() {
    void save({
      legalType: legalType === '' ? null : legalType,
      kulturGirisimBelgeli,
      kulturYatirimBelgeli,
      sgkBorcuYok,
    })
  }

  function handleSkip() {
    void save({
      legalType: legalType === '' ? null : legalType,
      kulturGirisimBelgeli: false,
      kulturYatirimBelgeli: false,
      sgkBorcuYok: true,
    })
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
          Şirket türü
        </label>
        <select style={inputStyle} value={legalType} onChange={(e) => setLegalType(e.target.value)}>
          <option value="">Seçiniz</option>
          {LEGAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <YesNoQuestion
        question="Kültür girişim belgeniz var mı?"
        info="Bu belge SGK işveren payınızda indirim sağlar. Güncel oran hesaplamaya otomatik yansır."
        value={kulturGirisimBelgeli}
        onChange={setKulturGirisimBelgeli}
      />

      <YesNoQuestion
        question="Kültür yatırım belgeniz var mı?"
        info="Bu belge de indirim sağlar, girişim belgesinden daha yüksek oranda. Güncel oran hesaplamaya otomatik yansır."
        value={kulturYatirimBelgeli}
        onChange={setKulturYatirimBelgeli}
      />

      <YesNoQuestion
        question="SGK borcu yoktur aktivasyonunuz var mı?"
        info="Borcunuz varsa (yapılandırılmış ve düzenli ödenen borçlar hariç) yukarıdaki belgeler geçerli olmaz, daha yüksek bir oran uygulanır."
        value={sgkBorcuYok}
        onChange={setSgkBorcuYok}
      />

      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        Cevaplarınıza göre SGK işveren payı otomatik hesaplanır. Mali müşavirinizle doğrulayın.
      </span>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button onClick={handleSubmit} disabled={saving} style={{ ...primaryButtonStyle, flex: 1, opacity: saving ? 0.6 : 1 }}>
          {submitLabel}
        </button>
        {showSkip && (
          <button onClick={handleSkip} disabled={saving} style={secondaryButtonStyle}>
            Şimdi atla
          </button>
        )}
      </div>
    </div>
  )
}
