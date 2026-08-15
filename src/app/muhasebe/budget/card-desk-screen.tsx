import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../../../shared/components/loading'
import { EmptyState } from '../../../shared/components/empty-state'
import { ErrorMessage } from '../../../shared/components/error-message'
import { getOrOpenBudget, fetchBudgetCards, fetchCardNetTotals } from '../../../shared/supabase/budget-service'
import type { BudgetCardRef } from '../../../shared/supabase/budget-service'
import { fmt } from './format'

interface Props {
  budgetId?: string
}

// KART MASASI — KABUK-KARARLARI 12.3. Tek akis (etap/donem basligi YOK), izgara dizilis,
// kapakta KART ADI + TEK RAKAM (net). Kart veya katalog NUMARASI hicbir yerde gorunmez.
// Kart sayisi artinca kart KUCULMEZ, masa asagi uzar.
// BU DILIMIN KAPSAMI DISINDA (Engin karari 15 Agustos 2026): isaret, kisiye ozel dizilis
// (cek-birak + ilk duzene don), icmal secimi / soluk kart. Ucu de veri ister, bu turda yok.
// Karttan masaya donus RAY ile olur; ince serit "Kart adi" ayri turda konusulacak.
export function CardDeskScreen({ budgetId: paramBudgetId }: Props) {
  const navigate = useNavigate()
  const [cards, setCards] = useState<BudgetCardRef[]>([])
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        setError(null)
        const bid = paramBudgetId ?? (await getOrOpenBudget())
        const [list, nets] = await Promise.all([fetchBudgetCards(bid), fetchCardNetTotals(bid)])
        if (cancelled) return
        setCards(list)
        setTotals(nets)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Masa yuklenemedi')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [paramBudgetId, reload])

  if (loading) return <Loading label="Kartlar yükleniyor..." />
  if (error) return <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
  if (cards.length === 0) return <EmptyState title="Kart yok" description="Bu bütçede kart bulunamadı." />

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        alignContent: 'start',
      }}
    >
      {cards.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => navigate('/butce?' + (paramBudgetId ? 'budgetId=' + paramBudgetId + '&' : '') + 'cardId=' + c.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            minHeight: 112,
            padding: 'var(--space-3)',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            textAlign: 'left',
            font: 'inherit',
            color: 'var(--color-text)',
          }}
        >
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)' }}>{c.name}</span>
          <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)' }}>{fmt(totals[c.id] ?? 0)}</span>
        </button>
      ))}
    </div>
  )
}
