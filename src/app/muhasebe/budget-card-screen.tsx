import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { getOrOpenBudget, getFirstCard } from '../../shared/supabase/budget-service'
import type { CardView } from '../../shared/supabase/budget-service'
import { satirToplam, dokum } from '../../shared/cfe'
import { Loading } from '../../shared/components/loading'
import { EmptyState } from '../../shared/components/empty-state'
import { ErrorMessage } from '../../shared/components/error-message'

const thStyle: CSSProperties = {
  textAlign: 'left',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  fontWeight: 600,
  padding: 'var(--space-2)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}
const tdStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  padding: 'var(--space-2)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}
const numStyle: CSSProperties = { ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
const thNum: CSSProperties = { ...thStyle, textAlign: 'right' }

function fmt(n: number): string {
  const dp = Number.isInteger(n) ? 0 : 2
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n)
}

export function BudgetCardScreen() {
  const [card, setCard] = useState<CardView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        setError(null)
        const budgetId = await getOrOpenBudget()
        const c = await getFirstCard(budgetId)
        if (!cancelled) setCard(c)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Bütçe yüklenemedi')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload])

  if (loading) return <Loading label="Bütçe yükleniyor..." />
  if (error) return <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
  if (!card || card.items.length === 0)
    return <EmptyState title="Kart boş" description="Bu bütçede kalem yok." />

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text)', margin: '0 0 var(--space-1)' }}>
        {card.cardName}
      </h2>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
        Salt görünüm (2b-1) — düzenleme sonraki dilimde. Açılışta birim net ve miktar 0; toplamlar CFE'den
        türetilir. Satırın üstüne gelince döküm görünür.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 720 }}>
          <thead>
            <tr>
              <th style={thStyle}>Kod</th>
              <th style={thStyle}>Sebep</th>
              <th style={thStyle}>Ayrıntı</th>
              <th style={thNum}>Birim net</th>
              <th style={thNum}>Miktar</th>
              <th style={thStyle}>Birim</th>
              <th style={thNum}>Adet</th>
              <th style={thNum}>Yük</th>
              <th style={thNum}>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {card.items.map((it) => {
              const total = satirToplam(it.unitNet, it.ratesPercent, it.quantity, it.multiplier)
              const yuk = it.ratesPercent.reduce((a, r) => a + r, 0)
              const aciklama = dokum({
                unitNet: it.unitNet,
                ratesPercent: it.ratesPercent,
                unitLabel: it.unitLabel,
                quantity: it.quantity,
                multiplier: it.multiplier,
              })
              return (
                <tr key={it.id} title={aciklama}>
                  <td style={tdStyle}>{it.itemCode}</td>
                  <td style={tdStyle}>{it.name}</td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{it.detail ?? '—'}</td>
                  <td style={numStyle}>{fmt(it.unitNet)}</td>
                  <td style={numStyle}>{fmt(it.quantity)}</td>
                  <td style={tdStyle}>{it.unitLabel}</td>
                  <td style={numStyle}>{it.multiplier === 1 ? '—' : fmt(it.multiplier)}</td>
                  <td style={numStyle}>{yuk === 0 ? '—' : '%' + fmt(yuk)}</td>
                  <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
