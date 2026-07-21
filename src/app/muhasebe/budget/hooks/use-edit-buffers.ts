import { useMemo, useCallback, useState, useRef } from 'react'
import type { MutableRefObject } from 'react'
import {
  updateItemField,
  setItemPeriodQuantity,
  setItemPeriodNet,
  updateItemPeriodUnit,
  updateItemPeriodRepeat,
  copyMainToFirstPeriod,
  copyLastPeriodToMain,
  getItemBurdensAndVat,
} from '../../../../shared/supabase/budget-service'
import type { BudgetItemRow, CardView, EditableField, StageRow } from '../../../../shared/supabase/budget-service'
import { deriveBordroFields } from '../../../../shared/supabase/payroll-read'
import type { MinimumWageThresholds } from '../../../../shared/supabase/payroll-read'
import { useToast } from '../../../../shared/components/toast'
import { bordroReasonMessage, parseNumericDraft, effectiveWarning } from '../format'
import type { ValueWarning } from '../format'
import type { BordroSheetEntry } from '../components/burden-sheet'

// commitField'in PARSE GUVENCESI dalinda (K10 revize + TD-16, 2026-07-18) hangi alanlar
// sayisal - yalniz bunlar buffer'dan parse edilip garanti altina alinir; 'name' gibi metin
// alanlari bu denetimden gecmez.
const NUMERIC_EDITABLE_FIELDS = new Set<EditableField>(['unitNet', 'multiplier', 'repeat', 'vatRate'])

export type EditApi = {
  onTextChange: (id: string, field: 'name', value: string) => void
  onNumChange: (id: string, field: 'unitNet' | 'multiplier' | 'vatRate', raw: string) => void
  onPeriodChange: (id: string, stageId: string, raw: string) => void
  onPeriodNetChange: (itemId: string, stageId: string, raw: string) => void
  onPeriodRepeatChange: (itemId: string, stageId: string, raw: string) => void
  onStatusChange: (id: string, value: string) => Promise<void>
  onUnitChange: (id: string, unitId: string) => Promise<void>
  onPeriodUnitChange: (itemId: string, stageId: string, unitId: string) => Promise<void>
  commitNote: (id: string, field: EditableField, value: string) => Promise<void>
  commitField: (id: string, field: EditableField) => Promise<void>
  commitPeriod: (id: string, stageId: string) => Promise<void>
  commitPeriodNet: (itemId: string, stageId: string) => Promise<void>
  commitPeriodRepeat: (itemId: string, stageId: string) => Promise<void>
  onAddPeriod: (itemId: string, stageId: string) => Promise<void>
  onRemovePeriod: (itemId: string, stageId: string) => Promise<void>
  onRepeatChange: (id: string, raw: string) => void
  commitRepeat: (id: string) => void
}

interface UseEditBuffersParams {
  rowsRef: MutableRefObject<BudgetItemRow[]>
  savedRef: MutableRefObject<Record<string, BudgetItemRow>>
  cardRef: MutableRefObject<CardView | null>
  stagesRef: MutableRefObject<StageRow[]>
  unitLabelByIdRef: MutableRefObject<Map<string, string>>
  unitCodeByIdRef: MutableRefObject<Map<string, string>>
  minWageThresholdsRef: MutableRefObject<MinimumWageThresholds | null>
  patchRow: (id: string, patch: Partial<BudgetItemRow>) => void
}

export function useEditBuffers({
  rowsRef,
  savedRef,
  cardRef,
  stagesRef,
  unitLabelByIdRef,
  unitCodeByIdRef,
  minWageThresholdsRef,
  patchRow,
}: UseEditBuffersParams) {
  const { addToast } = useToast()
  const [buffers, setBuffers] = useState<Record<string, string>>({})
  // api useMemo deps=[] ile bir kere kurulur (asagida); buffers STATE'i o kapaniste bayatlar,
  // commit yolunun taslak metnini okuyabilmesi icin ayrica bir REF'te (her zaman guncel) tutulur.
  const buffersRef = useRef<Record<string, string>>({})
  const [bordroData, setBordroData] = useState<Record<string, BordroSheetEntry>>({})
  // TD-14 ucuncu duzeltme (2026-07-18): tek-donemli kalemin KENDI satiri icin (itemId anahtarli).
  const [itemWarnings, setItemWarnings] = useState<Record<string, ValueWarning>>({})
  // Cok-donemli kalemde HER DONEM SATIRI icin (itemId+':'+stageId anahtarli, bufKey deseniyle ayni).
  const [periodWarnings, setPeriodWarnings] = useState<Record<string, ValueWarning>>({})

  function setBuf(key: string, value: string) {
    buffersRef.current = { ...buffersRef.current, [key]: value }
    setBuffers(buffersRef.current)
  }

  // TD-14 ucuncu duzeltme (2026-07-18, Engin karari): Net/X/Miktar uyarisi tek-donemli kalemin
  // KENDI satirinda hesaplanir. rowsRef.current bu cagrinin ANINDA guncel olmasi GEREKIR (cagiran
  // taraf onceki patchRow'lardan sonra en az bir render/useLayoutEffect dongusu gecmis olmali -
  // commitField'de saglanir: field'in kendi patch'i onNumChange/onRepeatChange'te YAZIM SIRASINDA
  // olmustur, commitField icinde YENIDEN patchRow YOKTUR).
  // TD-18 (Engin karari 2026-07-20): Birim koduna gore (day/week/month) ilgili esigi doner; kod
  // taninmiyorsa (bordroda artik zaten secilemeyen bolum/sabit) veya esikler henuz yuklenmediyse
  // null - effectiveWarning null'da kontrolu sessizce atlar.
  function minWageThresholdFor(unitId: string): number | null {
    const code = unitCodeByIdRef.current.get(unitId)
    const t = minWageThresholdsRef.current
    if (!t || (code !== 'day' && code !== 'week' && code !== 'month')) return null
    return t[code]
  }

  function checkItemWarning(itemId: string) {
    const row = rowsRef.current.find((r) => r.id === itemId)
    if (!row) return
    const isBordro = row.paymentStatus === 'bordro'
    const threshold = isBordro ? minWageThresholdFor(row.unitId) : null
    setItemWarnings((w) => ({
      ...w,
      [itemId]: effectiveWarning(row.unitNet, row.multiplier, row.repeat, isBordro, threshold),
    }))
  }

  // Donem-satiri kontrolu. override: cagiran taraf AYNI ES-ZAMANLI (senkron) fonksiyon icinde
  // biraz once patchRow ile yazdigi TAZE degeri veriyorsa buradan gecirir - rowsRef.current bir
  // render dongusu gecmeden guncellenmedigi icin (patchRow -> setRows asenkron), patch'ten hemen
  // sonraki senkron okuma STALE olur; override bu riski yapisal olarak kapatir.
  function checkPeriodWarning(
    itemId: string,
    stageId: string,
    override?: {
      periodNet?: Record<string, number | null>
      periodQty?: Record<string, number>
      periodRepeat?: Record<string, number | null>
    },
  ) {
    const row = rowsRef.current.find((r) => r.id === itemId)
    if (!row) return
    const periodNet = override?.periodNet ?? row.periodNet
    const periodQty = override?.periodQty ?? row.periodQty
    const periodRepeat = override?.periodRepeat ?? row.periodRepeat
    const net = periodNet[stageId] ?? row.unitNet
    const x = periodQty[stageId] ?? 0
    const miktar = periodRepeat[stageId] ?? row.repeat
    const isBordro = row.paymentStatus === 'bordro'
    const effectiveUnitId = row.periodUnit[stageId] ?? row.unitId
    const threshold = isBordro ? minWageThresholdFor(effectiveUnitId) : null
    setPeriodWarnings((w) => ({
      ...w,
      [itemId + ':' + stageId]: effectiveWarning(net, x, miktar, isBordro, threshold),
    }))
  }

  // Bordro motoru sunucu tarafinda (deriva-BordroFields) DB'den okur; yerel buffer/keystroke degil,
  // yalniz basarili commit sonrasi cagrilir (K5: motor pahali, her render'da degil sadece gerekince kosar).
  const refreshBordro = useCallback(async (itemId: string) => {
    setBordroData((b) => ({ ...b, [itemId]: { loading: true, data: b[itemId]?.data ?? null, error: null } }))
    try {
      const result = await deriveBordroFields(itemId)
      setBordroData((b) => ({ ...b, [itemId]: { loading: false, data: result, error: null } }))
    } catch (e) {
      const reason = e instanceof Error ? e.message : ''
      // Taze bordro kaleminde Birim Net yoklugu HATA degil beklenen durumdur (karar 2026-07-15):
      // toast yok, satirda sessiz gosterge (missingNet). Diger sebepler gercek hata olarak kalir.
      if (reason === 'invalid_net') {
        setBordroData((b) => ({ ...b, [itemId]: { loading: false, data: null, error: null, missingNet: true } }))
        return
      }
      const message = bordroReasonMessage(reason)
      setBordroData((b) => ({ ...b, [itemId]: { loading: false, data: null, error: message } }))
      addToast(message, 'error')
    }
  }, [addToast])

  const api = useMemo<EditApi>(() => {
    function clearBuf(key: string) {
      const c = { ...buffersRef.current }
      delete c[key]
      buffersRef.current = c
      setBuffers(c)
    }

    function onTextChange(id: string, field: 'name', value: string) {
      patchRow(id, { [field]: value } as Partial<BudgetItemRow>)
    }

    function onNumChange(id: string, field: 'unitNet' | 'multiplier' | 'vatRate', raw: string) {
      setBuf(id + ':' + field, raw)
      const n = Number(raw.replace(',', '.'))
      patchRow(id, { [field]: Number.isFinite(n) ? n : 0 } as Partial<BudgetItemRow>)
    }

    function onPeriodChange(id: string, stageId: string, raw: string) {
      setBuf(id + ':stage:' + stageId, raw)
      const n = Number(raw.replace(',', '.'))
      const current = rowsRef.current.find((r) => r.id === id)
      if (!current) return
      patchRow(id, { periodQty: { ...current.periodQty, [stageId]: Number.isFinite(n) ? n : 0 } })
    }

    function onPeriodNetChange(itemId: string, stageId: string, raw: string) {
      setBuf(itemId + ':pnet:' + stageId, raw)
      const current = rowsRef.current.find((r) => r.id === itemId)
      if (!current) return
      const n = Number(raw.replace(',', '.'))
      const newNet = raw.trim() === '' ? null : Number.isFinite(n) ? n : (current.periodNet[stageId] ?? null)
      patchRow(itemId, { periodNet: { ...current.periodNet, [stageId]: newNet } })
    }

    function onPeriodRepeatChange(itemId: string, stageId: string, raw: string) {
      setBuf(itemId + ':prepeat:' + stageId, raw)
      const current = rowsRef.current.find((r) => r.id === itemId)
      if (!current) return
      const n = Number(raw.replace(',', '.'))
      const newRepeat = raw.trim() === '' ? null : Number.isFinite(n) ? n : (current.periodRepeat[stageId] ?? null)
      patchRow(itemId, { periodRepeat: { ...current.periodRepeat, [stageId]: newRepeat } })
    }

    async function onStatusChange(id: string, value: string) {
      const newStatus = value === '' ? null : value
      patchRow(id, { paymentStatus: newStatus })
      const saved = savedRef.current[id]
      if (saved && saved.paymentStatus === newStatus) return
      try {
        await updateItemField(id, 'paymentStatus', value)
        if (saved) {
          savedRef.current[id] = {
            ...saved,
            paymentStatus: newStatus,
            periodQty: { ...saved.periodQty },
            periodNet: { ...saved.periodNet },
            periodUnit: { ...saved.periodUnit },
            periodRepeat: { ...saved.periodRepeat },
          }
        }
        const fresh = await getItemBurdensAndVat(id)
        patchRow(id, { burdens: fresh.burdens, vatRate: fresh.vatRate })
        // TD-14 (2026-07-18): deger degismese de statu degisince metin secimi (bordro/digerleri)
        // yeniden hesaplanmasi gerekir - zararsiz, checkItemWarning idempotent.
        checkItemWarning(id)
        if (newStatus === 'bordro') void refreshBordro(id)
      } catch (e) {
        if (saved) patchRow(id, { paymentStatus: saved.paymentStatus })
        addToast(e instanceof Error ? e.message : 'Kaydedilemedi', 'error')
      }
    }

    async function onUnitChange(id: string, unitId: string) {
      const saved = savedRef.current[id]
      const newLabel = unitLabelByIdRef.current.get(unitId) ?? ''
      patchRow(id, { unitId, unitLabel: newLabel })
      if (saved && saved.unitId === unitId) return
      try {
        await updateItemField(id, 'unitId', unitId)
        if (rowsRef.current.find((r) => r.id === id)?.paymentStatus === 'bordro') void refreshBordro(id)
        checkItemWarning(id)
        if (saved) {
          savedRef.current[id] = {
            ...saved,
            unitId,
            unitLabel: newLabel,
            periodQty: { ...saved.periodQty },
            periodNet: { ...saved.periodNet },
            periodUnit: { ...saved.periodUnit },
            periodRepeat: { ...saved.periodRepeat },
          }
        }
      } catch (e) {
        if (saved) patchRow(id, { unitId: saved.unitId, unitLabel: saved.unitLabel })
        addToast(e instanceof Error ? e.message : 'Birim kaydedilemedi', 'error')
      }
    }

    async function onPeriodUnitChange(itemId: string, stageId: string, unitId: string) {
      const row = rowsRef.current.find((r) => r.id === itemId)
      if (!row) return
      const prevUnit = row.periodUnit[stageId] ?? null
      patchRow(itemId, { periodUnit: { ...row.periodUnit, [stageId]: unitId } })
      try {
        await updateItemPeriodUnit(itemId, stageId, unitId)
        const saved = savedRef.current[itemId]
        if (saved) {
          savedRef.current[itemId] = {
            ...saved,
            periodUnit: { ...saved.periodUnit, [stageId]: unitId },
            periodQty: { ...saved.periodQty },
            periodNet: { ...saved.periodNet },
            periodRepeat: { ...saved.periodRepeat },
          }
        }
        if (row.paymentStatus === 'bordro') void refreshBordro(itemId)
        checkPeriodWarning(itemId, stageId)
      } catch (e) {
        const current = rowsRef.current.find((r) => r.id === itemId)
        if (current) patchRow(itemId, { periodUnit: { ...current.periodUnit, [stageId]: prevUnit } })
        addToast(e instanceof Error ? e.message : 'Birim kaydedilemedi', 'error')
      }
    }

    async function commitNote(id: string, field: EditableField, value: string) {
      try {
        await updateItemField(id, field, value)
        const norm = value.trim() === '' ? null : value.trim()
        patchRow(id, { [field]: norm } as Partial<BudgetItemRow>)
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Not kaydedilemedi', 'error')
      }
    }

    async function commitField(id: string, field: EditableField) {
      const row = rowsRef.current.find((r) => r.id === id)
      if (!row) return
      const saved = savedRef.current[id]
      const bufKey = id + ':' + field
      // PARSE GUVENCESI (K10 revize + TD-16, 2026-07-18): sayisal alanda taslak metni
      // ayristirilamiyorsa (veya repeat<=0, mevcut onRepeatChange kurali korunur) kasadaki
      // eski (saved) deger AYNEN geri yazilir, servise hic gidilmez.
      if (NUMERIC_EDITABLE_FIELDS.has(field)) {
        const raw = buffersRef.current[bufKey]
        if (raw !== undefined) {
          const parsed = parseNumericDraft(raw)
          const invalid = parsed === null || (field === 'repeat' && parsed <= 0)
          if (invalid) {
            if (saved) patchRow(id, { [field]: saved[field] } as Partial<BudgetItemRow>)
            clearBuf(bufKey)
            return
          }
        }
      }
      const value = (row[field] ?? '') as string | number
      if (saved && saved[field] === value) {
        if (field === 'unitNet' || field === 'multiplier' || field === 'repeat') checkItemWarning(id)
        clearBuf(bufKey)
        return
      }
      try {
        await updateItemField(id, field, value)
        savedRef.current[id] = {
          ...(saved ?? row),
          [field]: value,
          periodQty: { ...(saved?.periodQty ?? row.periodQty) },
          periodNet: { ...(saved?.periodNet ?? row.periodNet) },
          periodUnit: { ...(saved?.periodUnit ?? row.periodUnit) },
          periodRepeat: { ...(saved?.periodRepeat ?? row.periodRepeat) },
        } as BudgetItemRow
        // TD-14 ucuncu duzeltme (2026-07-18, Engin karari): Net/X/Miktar uc alaninin UCUNDE de
        // commit sonrasi tam kontrol - statuden BAGIMSIZ (KAAPA harcanacak parayi hesaplar, 0
        // hesaplanacak rakam degildir). Metin statuye/alana gore item-row.tsx'te secilir.
        // refreshBordro (motor) yalniz bordro icindir - bordro-disi hesap 0 bedelle ENGELLENMEZ.
        if (field === 'unitNet' || field === 'multiplier' || field === 'repeat') checkItemWarning(id)
        if (row.paymentStatus === 'bordro' && (field === 'unitNet' || field === 'multiplier' || field === 'repeat')) void refreshBordro(id)
      } catch (e) {
        if (saved) patchRow(id, { [field]: saved[field] } as Partial<BudgetItemRow>)
        addToast(e instanceof Error ? e.message : 'Kaydedilemedi', 'error')
      } finally {
        clearBuf(bufKey)
      }
    }

    async function commitPeriod(id: string, stageId: string) {
      const card = cardRef.current
      if (!card) return
      const row = rowsRef.current.find((r) => r.id === id)
      if (!row) return
      const saved = savedRef.current[id]
      const bufKey = id + ':stage:' + stageId
      const raw = buffersRef.current[bufKey]
      if (raw !== undefined && parseNumericDraft(raw) === null) {
        const savedVal = saved?.periodQty[stageId] ?? 0
        const current = rowsRef.current.find((r) => r.id === id) ?? row
        patchRow(id, { periodQty: { ...current.periodQty, [stageId]: savedVal } })
        clearBuf(bufKey)
        return
      }
      const value = row.periodQty[stageId] ?? 0
      const savedVal = saved?.periodQty[stageId] ?? 0
      if (savedVal === value) {
        checkPeriodWarning(id, stageId)
        clearBuf(bufKey)
        return
      }
      try {
        await setItemPeriodQuantity(card.budgetId, id, stageId, value)
        const sp = { ...(saved?.periodQty ?? {}) }
        if (value === 0) delete sp[stageId]
        else sp[stageId] = value
        savedRef.current[id] = {
          ...(saved ?? row),
          periodQty: sp,
          periodNet: { ...(saved?.periodNet ?? row.periodNet) },
          periodUnit: { ...(saved?.periodUnit ?? row.periodUnit) },
          periodRepeat: { ...(saved?.periodRepeat ?? row.periodRepeat) },
        } as BudgetItemRow
        // TD-14 ucuncu duzeltme (2026-07-18): bu fonksiyon periodQty'yi kendi basarili yolunda
        // YENIDEN patchRow'lamiyor (deger onPeriodChange'de yazim sirasinda zaten islendi) -
        // rowsRef.current burada guncel, override GEREKMEZ.
        checkPeriodWarning(id, stageId)
        if (row.paymentStatus === 'bordro') void refreshBordro(id)
      } catch (e) {
        const current = rowsRef.current.find((r) => r.id === id)
        if (current) patchRow(id, { periodQty: { ...current.periodQty, [stageId]: savedVal } })
        addToast(e instanceof Error ? e.message : 'X kaydedilemedi', 'error')
      } finally {
        clearBuf(bufKey)
      }
    }

    async function commitPeriodNet(itemId: string, stageId: string) {
      const row = rowsRef.current.find((r) => r.id === itemId)
      if (!row) return
      const saved = savedRef.current[itemId]
      const bufKey = itemId + ':pnet:' + stageId
      const raw = buffersRef.current[bufKey]
      // Bos taslak ('') KASITLI: override'i temizleyip kaleme mirasi geri verir (asagida
      // hedef=null olarak zaten dogru islenir). PARSE GUVENCESI yalniz BOS-OLMAYAN, sayiya
      // cevrilemeyen ('abc', '€') taslaklari yakalar.
      if (raw !== undefined && raw.trim() !== '' && parseNumericDraft(raw) === null) {
        const savedOverride = saved?.periodNet?.[stageId] ?? null
        const current = rowsRef.current.find((r) => r.id === itemId) ?? row
        patchRow(itemId, { periodNet: { ...current.periodNet, [stageId]: savedOverride } })
        clearBuf(bufKey)
        return
      }
      const currentVal = row.periodNet[stageId] ?? null
      const hedef: number | null = currentVal
      const savedOverride = saved?.periodNet?.[stageId] ?? null
      if (savedOverride === hedef) {
        checkPeriodWarning(itemId, stageId, { periodNet: { ...row.periodNet, [stageId]: hedef } })
        clearBuf(bufKey)
        return
      }
      try {
        await setItemPeriodNet(itemId, stageId, hedef === null ? '' : hedef)
        if (saved) {
          savedRef.current[itemId] = {
            ...saved,
            periodNet: { ...saved.periodNet, [stageId]: hedef },
            periodQty: { ...saved.periodQty },
            periodUnit: { ...saved.periodUnit },
            periodRepeat: { ...saved.periodRepeat },
          }
        }
        const current = rowsRef.current.find((r) => r.id === itemId) ?? row
        patchRow(itemId, { periodNet: { ...current.periodNet, [stageId]: hedef } })
        // TD-14 (2026-07-18, TUM STATULERE GENISLEDI): tarama statuden BAGIMSIZ calisir;
        // refreshBordro (motor) yalniz bordro icindir.
        // TD-14 ucuncu duzeltme (2026-07-18): patchRow biraz once BU fonksiyonda yeniden yazildi
        // (hedef ile) - rowsRef.current henuz bir render dongusu gecmedigi icin STALE olabilir;
        // override ile taze periodNet dogrudan gecirilir (yapisal guvence, spekulatif degil).
        checkPeriodWarning(itemId, stageId, { periodNet: { ...current.periodNet, [stageId]: hedef } })
        if (row.paymentStatus === 'bordro') void refreshBordro(itemId)
      } catch (e) {
        const current = rowsRef.current.find((r) => r.id === itemId) ?? row
        patchRow(itemId, { periodNet: { ...current.periodNet, [stageId]: savedOverride } })
        addToast(e instanceof Error ? e.message : 'Net override kaydedilemedi', 'error')
      } finally {
        clearBuf(bufKey)
      }
    }

    async function commitPeriodRepeat(itemId: string, stageId: string) {
      const row = rowsRef.current.find((r) => r.id === itemId)
      if (!row) return
      const saved = savedRef.current[itemId]
      const bufKey = itemId + ':prepeat:' + stageId
      const raw = buffersRef.current[bufKey]
      if (raw !== undefined && raw.trim() !== '' && parseNumericDraft(raw) === null) {
        const savedOverride = saved?.periodRepeat?.[stageId] ?? null
        const current = rowsRef.current.find((r) => r.id === itemId) ?? row
        patchRow(itemId, { periodRepeat: { ...current.periodRepeat, [stageId]: savedOverride } })
        clearBuf(bufKey)
        return
      }
      const currentVal = row.periodRepeat[stageId] ?? null
      const hedef: number | null = currentVal
      const savedOverride = saved?.periodRepeat?.[stageId] ?? null
      if (savedOverride === hedef) {
        checkPeriodWarning(itemId, stageId, { periodRepeat: { ...row.periodRepeat, [stageId]: hedef } })
        clearBuf(bufKey)
        return
      }
      try {
        await updateItemPeriodRepeat(itemId, stageId, hedef === null ? '' : hedef)
        if (saved) {
          savedRef.current[itemId] = {
            ...saved,
            periodRepeat: { ...saved.periodRepeat, [stageId]: hedef },
            periodQty: { ...saved.periodQty },
            periodNet: { ...saved.periodNet },
            periodUnit: { ...saved.periodUnit },
          }
        }
        const current = rowsRef.current.find((r) => r.id === itemId) ?? row
        patchRow(itemId, { periodRepeat: { ...current.periodRepeat, [stageId]: hedef } })
        // TD-14 ucuncu duzeltme (2026-07-18): ayni staleness gerekcesi (bkz. commitPeriodNet) -
        // taze periodRepeat override ile gecirilir.
        checkPeriodWarning(itemId, stageId, { periodRepeat: { ...current.periodRepeat, [stageId]: hedef } })
        if (row.paymentStatus === 'bordro') void refreshBordro(itemId)
      } catch (e) {
        const current = rowsRef.current.find((r) => r.id === itemId) ?? row
        patchRow(itemId, { periodRepeat: { ...current.periodRepeat, [stageId]: savedOverride } })
        addToast(e instanceof Error ? e.message : 'Miktar override kaydedilemedi', 'error')
      } finally {
        clearBuf(bufKey)
      }
    }

    async function onAddPeriod(itemId: string, stageId: string) {
      const card = cardRef.current
      if (!card) return
      const row = rowsRef.current.find((r) => r.id === itemId)
      if (!row) return
      const saved = savedRef.current[itemId]
      const existingStageIds = Object.keys(row.periodQty)
      const willBecomeMulti = existingStageIds.length === 1
      const needsExplicitDefaults = existingStageIds.length >= 1
      const oldStageId = existingStageIds[0]
      try {
        await setItemPeriodQuantity(card.budgetId, itemId, stageId, 1)
        if (willBecomeMulti) {
          await copyMainToFirstPeriod(itemId, oldStageId, row.unitNet, row.unitId, row.multiplier, row.repeat)
        }
        let sourceUnitId: string | null = null
        if (needsExplicitDefaults) {
          const sourceStageId = stagesRef.current.find((s) => existingStageIds.includes(s.id))?.id ?? existingStageIds[0]
          sourceUnitId = row.periodUnit[sourceStageId] ?? row.unitId
          await updateItemPeriodUnit(itemId, stageId, sourceUnitId)
          await updateItemPeriodRepeat(itemId, stageId, 1)
          await setItemPeriodNet(itemId, stageId, 0)
        }
        const current = rowsRef.current.find((r) => r.id === itemId) ?? row
        const pq = { ...current.periodQty, [stageId]: needsExplicitDefaults ? 0 : 1 }
        const pn = { ...current.periodNet }
        const pu = { ...current.periodUnit }
        const pr = { ...current.periodRepeat }
        if (willBecomeMulti) {
          pn[oldStageId] = current.unitNet
          pu[oldStageId] = current.unitId
          pq[oldStageId] = current.multiplier
          pr[oldStageId] = current.repeat
        }
        if (needsExplicitDefaults) {
          pn[stageId] = 0
          pu[stageId] = sourceUnitId
          pr[stageId] = 1
        }
        patchRow(itemId, { periodQty: pq, periodNet: pn, periodUnit: pu, periodRepeat: pr })
        if (saved) {
          savedRef.current[itemId] = {
            ...saved,
            periodQty: {
              ...saved.periodQty,
              [stageId]: needsExplicitDefaults ? 0 : 1,
              ...(willBecomeMulti ? { [oldStageId]: row.multiplier } : {}),
            },
            periodNet: {
              ...saved.periodNet,
              ...(willBecomeMulti ? { [oldStageId]: row.unitNet } : {}),
              ...(needsExplicitDefaults ? { [stageId]: 0 } : {}),
            },
            periodUnit: {
              ...saved.periodUnit,
              ...(willBecomeMulti ? { [oldStageId]: row.unitId } : {}),
              ...(needsExplicitDefaults ? { [stageId]: sourceUnitId } : {}),
            },
            periodRepeat: {
              ...saved.periodRepeat,
              ...(willBecomeMulti ? { [oldStageId]: row.repeat } : {}),
              ...(needsExplicitDefaults ? { [stageId]: 1 } : {}),
            },
          }
        }
        // TD-14 ucuncu duzeltme (2026-07-18, Engin talebi): yeni donem X=0 ile dogabilir
        // (needsExplicitDefaults dalinda net=0/qty=0/repeat=1) - ANINDA isaretlenir, hem
        // willBecomeMulti hem needsExplicitDefaults yollarinda gecerli tek pq/pn/pr uzerinden.
        checkPeriodWarning(itemId, stageId, { periodNet: pn, periodQty: pq, periodRepeat: pr })
        if (row.paymentStatus === 'bordro') void refreshBordro(itemId)
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Dönem eklenemedi', 'error')
      }
    }

    async function onRemovePeriod(itemId: string, stageId: string) {
      const card = cardRef.current
      if (!card) return
      const ok = window.confirm('Bu dönemi kaldırmak istiyor musun?')
      if (!ok) return
      const row = rowsRef.current.find((r) => r.id === itemId)
      if (!row) return
      const saved = savedRef.current[itemId]
      const remainingStageIds = Object.keys(row.periodQty).filter((sid) => sid !== stageId)
      const willCollapseToSingle = Object.keys(row.periodQty).length === 2 && remainingStageIds.length === 1
      const lastStageId = remainingStageIds[0]
      try {
        await setItemPeriodQuantity(card.budgetId, itemId, stageId, 0)
        let mainPatch: Partial<BudgetItemRow> = {}
        if (willCollapseToSingle) {
          const lastNet = row.periodNet[lastStageId] ?? null
          const lastUnit = row.periodUnit[lastStageId] ?? null
          const lastQty = row.periodQty[lastStageId]
          const lastRepeat = row.periodRepeat[lastStageId] ?? null
          await copyLastPeriodToMain(itemId, lastStageId)
          mainPatch = {
            unitNet: lastNet ?? row.unitNet,
            unitId: lastUnit ?? row.unitId,
            unitLabel: unitLabelByIdRef.current.get(lastUnit ?? row.unitId) ?? row.unitLabel,
            multiplier: lastQty,
            repeat: lastRepeat ?? row.repeat,
          }
        }
        const current = rowsRef.current.find((r) => r.id === itemId) ?? row
        const pq = { ...current.periodQty }
        const pn = { ...current.periodNet }
        const pu = { ...current.periodUnit }
        const pr = { ...current.periodRepeat }
        delete pq[stageId]
        delete pn[stageId]
        delete pu[stageId]
        delete pr[stageId]
        patchRow(itemId, { periodQty: pq, periodNet: pn, periodUnit: pu, periodRepeat: pr, ...mainPatch })
        if (saved) {
          const sp = { ...saved.periodQty }
          const sn = { ...saved.periodNet }
          const su = { ...saved.periodUnit }
          const sr = { ...saved.periodRepeat }
          delete sp[stageId]
          delete sn[stageId]
          delete su[stageId]
          delete sr[stageId]
          savedRef.current[itemId] = {
            ...saved,
            periodQty: sp,
            periodNet: sn,
            periodUnit: su,
            periodRepeat: sr,
            ...mainPatch,
          }
        }
        clearBuf(itemId + ':stage:' + stageId)
        clearBuf(itemId + ':pnet:' + stageId)
        clearBuf(itemId + ':prepeat:' + stageId)
        if (willCollapseToSingle) {
          clearBuf(itemId + ':stage:' + lastStageId)
          clearBuf(itemId + ':pnet:' + lastStageId)
          clearBuf(itemId + ':prepeat:' + lastStageId)
        }
        if (row.paymentStatus === 'bordro') void refreshBordro(itemId)
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Dönem kaldırılamadı', 'error')
      }
    }

    function onRepeatChange(id: string, raw: string) {
      setBuf(id + ':repeat', raw)
      const n = Number(raw.replace(',', '.'))
      if (Number.isFinite(n) && n > 0) patchRow(id, { repeat: n })
    }

    function commitRepeat(id: string) {
      void commitField(id, 'repeat')
    }

    return {
      onTextChange,
      onNumChange,
      onPeriodChange,
      onPeriodNetChange,
      onPeriodRepeatChange,
      onStatusChange,
      onUnitChange,
      onPeriodUnitChange,
      commitNote,
      commitField,
      commitPeriod,
      commitPeriodNet,
      commitPeriodRepeat,
      onAddPeriod,
      onRemovePeriod,
      onRepeatChange,
      commitRepeat,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { buffers, bordroData, itemWarnings, periodWarnings, refreshBordro, api }
}
