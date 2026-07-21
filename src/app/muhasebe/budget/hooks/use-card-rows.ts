import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getOrOpenBudget, getCard, loadUnits } from '../../../../shared/supabase/budget-service'
import type { BudgetItemRow, CardView, StageRow, UnitRow } from '../../../../shared/supabase/budget-service'
import { fetchMinimumWageThresholds } from '../../../../shared/supabase/payroll-read'
import type { MinimumWageThresholds } from '../../../../shared/supabase/payroll-read'
import { useToast } from '../../../../shared/components/toast'

export function useCardRows(params?: { budgetId?: string; cardId?: string }) {
  const { budgetId: paramBudgetId, cardId } = params ?? {}
  const { addToast } = useToast()
  const [card, setCard] = useState<CardView | null>(null)
  const [rows, setRows] = useState<BudgetItemRow[]>([])
  const [stages, setStages] = useState<StageRow[]>([])
  const [units, setUnits] = useState<UnitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const savedRef = useRef<Record<string, BudgetItemRow>>({})
  const rowsRef = useRef<BudgetItemRow[]>([])
  const cardRef = useRef<CardView | null>(null)
  const stagesRef = useRef<StageRow[]>([])
  const unitLabelByIdRef = useRef<Map<string, string>>(new Map())
  // TD-18: id->code (label degil) - esik secimi (day/week/month) kodla yapilir, TR gorunen metinle degil.
  const unitCodeByIdRef = useRef<Map<string, string>>(new Map())
  // TD-18: kart acilirken BIR KEZ cekilir (asagidaki useEffect), her tus vurusunda DEGIL.
  const minWageThresholdsRef = useRef<MinimumWageThresholds | null>(null)

  const unitLabelById = useMemo(() => new Map<string, string>(units.map((u) => [u.id, u.label])), [units])
  const unitCodeById = useMemo(() => new Map<string, string>(units.map((u) => [u.id, u.code])), [units])

  useLayoutEffect(() => {
    rowsRef.current = rows
    cardRef.current = card
    stagesRef.current = stages
    unitLabelByIdRef.current = unitLabelById
    unitCodeByIdRef.current = unitCodeById
  })

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        setError(null)
        const budgetId = paramBudgetId ?? (await getOrOpenBudget())
        const c = await getCard(budgetId, cardId)
        if (cancelled) return
        setCard(c)
        setRows(c?.items ?? [])
        setStages(c?.stages ?? [])
        savedRef.current = {}
        for (const it of c?.items ?? []) {
          savedRef.current[it.id] = {
            ...it,
            periodQty: { ...it.periodQty },
            periodNet: { ...it.periodNet },
            periodUnit: { ...it.periodUnit },
            periodRepeat: { ...it.periodRepeat },
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Bütçe yüklenemedi')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload, paramBudgetId, cardId])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const u = await loadUnits()
        if (!cancelled) setUnits(u)
      } catch (e) {
        if (!cancelled) addToast(e instanceof Error ? e.message : 'Birimler yüklenemedi', 'error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [addToast])

  // TD-18 (Engin karari 2026-07-20): asgari ucret esikleri kart acilirken BIR KEZ cekilir (units
  // fetch'iyle ayni desende, birbirinden bagimsiz). Basarisizlik SESSIZ (console.warn) - bu yalniz
  // ikincil bir uyari kaynagi, ana bordro hesabini (deriveBordroFields) ETKILEMEZ.
  useEffect(() => {
    if (!card?.budgetId) return
    let cancelled = false
    void (async () => {
      try {
        const t = await fetchMinimumWageThresholds(card.budgetId)
        if (!cancelled) minWageThresholdsRef.current = t
      } catch (e) {
        console.warn('Asgari ucret esikleri yuklenemedi:', e instanceof Error ? e.message : e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [card?.budgetId])

  const patchRow = useCallback((id: string, patch: Partial<BudgetItemRow>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }, [])

  const refetch = useCallback(() => {
    setReload((n) => n + 1)
  }, [])

  return {
    card,
    rows,
    stages,
    units,
    unitLabelById,
    loading,
    error,
    refetch,
    patchRow,
    rowsRef,
    savedRef,
    cardRef,
    stagesRef,
    unitLabelByIdRef,
    unitCodeByIdRef,
    minWageThresholdsRef,
  }
}
