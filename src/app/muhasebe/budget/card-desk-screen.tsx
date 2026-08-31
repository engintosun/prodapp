import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../../../shared/components/loading'
import { EmptyState } from '../../../shared/components/empty-state'
import { ErrorMessage } from '../../../shared/components/error-message'
import { getOrOpenBudget, fetchBudgetCards, fetchBudgetItemRowsByCard } from '../../../shared/supabase/budget-service'
import type { BudgetCardRef, BudgetItemRow } from '../../../shared/supabase/budget-service'
import { deriveBordroFieldsBatch } from '../../../shared/supabase/payroll-read'
import { fmt, bordroReasonMessage } from './format'
import { cardTotals } from './totals'
import type { BordroSheetEntry } from './components/burden-sheet'

interface Props {
  budgetId?: string
}

// KART MASASI — KABUK-KARARLARI 12.3. Tek akis (etap/donem basligi YOK), izgara dizilis,
// kapakta KART ADI + TEK RAKAM (Maliyet, 31 Agustos 2026'da net'ten degisti - bkz. asagidaki
// yukleme akisi). Kart veya katalog NUMARASI hicbir yerde gorunmez.
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
        const [list, rowsByCard] = await Promise.all([fetchBudgetCards(bid), fetchBudgetItemRowsByCard(bid)])
        if (cancelled) return

        // Kapaktaki rakam Maliyet'tir (Ara toplam + Yasal Yuk); kart tablosunun toplam seridiyle
        // AYNI fonksiyondan (cardTotals) beslenir - ikinci tanim yok (KABUK-KARARLARI 12.3).
        // Bordro motoru butce basina TEK dalgada cagrilir (deriveBordroFieldsBatch, perf dilimi
        // 16ba2c6) - kalem basina degil, ag panelinde kalem sayisindan bagimsiz kalir.
        const allRows: BudgetItemRow[] = Object.values(rowsByCard).flat()
        const bordroItemIds = allRows.filter((r) => r.paymentStatus === 'bordro').map((r) => r.id)
        const bordroData: Record<string, BordroSheetEntry> = {}
        if (bordroItemIds.length > 0) {
          // Masada kalem basina uyari CIKMAZ: motor bir kalemde hata verse bile masa cizilir,
          // yalniz o kartin rakami eksik hesaplanir (use-edit-buffers.refreshBordroMany'deki
          // reason esleme kurallariyla AYNI; masada toast yuzeyi zaten yok).
          const results = await deriveBordroFieldsBatch(bordroItemIds)
          for (const id of bordroItemIds) {
            const res = results.get(id)
            if (!res || !res.ok) {
              const reason = res ? res.reason : 'unknown'
              if (reason === 'invalid_net') {
                bordroData[id] = { loading: false, data: null, error: null, missingNet: true }
              } else {
                bordroData[id] = { loading: false, data: null, error: bordroReasonMessage(reason) }
              }
            } else {
              bordroData[id] = { loading: false, data: res.data, error: null }
            }
          }
        }

        const costs: Record<string, number> = {}
        for (const card of list) {
          costs[card.id] = cardTotals(rowsByCard[card.id] ?? [], bordroData).maliyet
        }

        setCards(list)
        setTotals(costs)
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
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-medium)' }}>{c.name}</span>
          <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)' }}>{fmt(totals[c.id] ?? 0)}</span>
        </button>
      ))}
    </div>
  )
}
