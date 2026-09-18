import { useEffect, useState } from 'react'
import { supabase } from '../../shared/supabase/client'
import { useToast } from '../../shared/components/toast'
import { CompanyProfileForm } from '../../shared/components/company-profile-form'
import { resolveSgkScenarioCode } from '../../shared/supabase/payroll-read'
import { getCompanyProfileForProject } from '../../shared/supabase/company-profile-service'

interface Props {
  projectId: string
  userId: string
}

interface ReferenceRow {
  label: string
  code: string
  ratePercent: number | null
  amountTl: number | null
  validFrom: string
}

interface RateCatalogRow {
  rate_percent: number | null
  amount_tl: number | null
  value_kind: string
  valid_from: string
  burden_components: { label: string; code: string } | null
}

const sectionHeadingStyle = {
  fontSize: 'var(--text-lg)',
  color: 'var(--color-text)',
  margin: '0 0 var(--space-3)',
  fontWeight: 'var(--weight-bold)',
} as const

// Tanimlar ekrani iskeleti (EKRAN-MUHASEBE §19, 2026-07-10): REFERANS (rate_catalog salt-okunur,
// hardcode YOK) + SIRKET TANIMI (Kurulum Modu ile ayni form, her zaman duzenlenebilir).
export function DefinitionsScreen({ projectId, userId }: Props) {
  const { addToast } = useToast()
  const [rows, setRows] = useState<ReferenceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSgkCode, setActiveSgkCode] = useState<string | null>(null)
  const [profileMissing, setProfileMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    const today = new Date().toISOString().slice(0, 10)
    supabase
      .from('rate_catalog')
      .select('rate_percent, amount_tl, value_kind, valid_from, burden_components(label, code)')
      .lte('valid_from', today)
      .order('valid_from', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          addToast(error.message, 'error')
          setLoading(false)
          return
        }
        const seen = new Set<string>()
        const list: ReferenceRow[] = []
        for (const r of (data ?? []) as unknown as RateCatalogRow[]) {
          if (r.value_kind === 'tarife') continue
          const label = r.burden_components?.label
          const code = r.burden_components?.code
          if (!label || !code || seen.has(label)) continue
          seen.add(label)
          list.push({ label, code, ratePercent: r.rate_percent, amountTl: r.amount_tl, validFrom: r.valid_from })
        }
        list.sort((a, b) => a.label.localeCompare(b.label, 'tr'))
        setRows(list)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [addToast])

  // Bu sirkette hangi SGK isveren senaryosunun gecerli oldugunu isaretlemek icin bordro
  // yolunun kullandigi AYNI cozumleyiciyi cagirir (resolveSgkScenarioCode, payroll-read.ts).
  useEffect(() => {
    let cancelled = false
    Promise.all([resolveSgkScenarioCode(projectId), getCompanyProfileForProject(projectId)])
      .then(([code, profile]) => {
        if (cancelled) return
        setActiveSgkCode(code)
        setProfileMissing(profile === null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        addToast(error instanceof Error ? error.message : 'Senaryo okunamadı', 'error')
      })
    return () => {
      cancelled = true
    }
  }, [projectId, addToast])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={sectionHeadingStyle}>Referans</h2>
        {loading ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Yükleniyor…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {rows.map((r) => (
              <div
                key={r.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-text)' }}>{r.label}</span>
                  {r.code === activeSgkCode && (
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {profileMissing ? 'Bu şirkette geçerli (Şirket Tanımı boş, varsayılan)' : 'Bu şirkette geçerli'}
                    </span>
                  )}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {r.ratePercent !== null ? `%${r.ratePercent}` : r.amountTl !== null ? `${r.amountTl} TL` : '—'}
                  {' · '}
                  {r.validFrom}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={sectionHeadingStyle}>Şirket Tanımı</h2>
        <CompanyProfileForm
          projectId={projectId}
          userId={userId}
          onSaved={() => addToast('Kaydedildi', 'success')}
          submitLabel="Kaydet"
        />
      </div>
    </div>
  )
}
