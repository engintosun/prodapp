import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getOrOpenBudget, getCard, loadUnits } from '../../../../shared/supabase/budget-service'
import type { BudgetItemRow, CardView, StageRow, UnitRow } from '../../../../shared/supabase/budget-service'
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

  rowsRef.current = rows
  cardRef.current = card
  stagesRef.current = stages
  const unitLabelById = useMemo(() => new Map<string, string>(units.map((u) => [u.id, u.label])), [units])
  unitLabelByIdRef.current = unitLabelById

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
  }
}
