import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loading } from '../../../shared/components/loading'
import { EmptyState } from '../../../shared/components/empty-state'
import { ErrorMessage } from '../../../shared/components/error-message'
import { useCardRows } from './hooks/use-card-rows'
import { useEditBuffers } from './hooks/use-edit-buffers'
import { useGridNavigation } from './hooks/use-grid-navigation'
import { isMultiPeriod, fmt, matchLibraryItems } from './format'
import { addBudgetItem, softDeleteBudgetItem } from '../../../shared/supabase/budget-service'
import type { LibraryItem } from '../../../shared/supabase/library-service'
import { useToast } from '../../../shared/components/toast'
import { thStyle, thNum, colWidths, tableMinWidth } from './components/table-styles'
import { ItemRow } from './components/item-row'
import { PeriodRow } from './components/period-row'
import { BurdenSheet } from './components/burden-sheet'
import { StatusInfoSheet } from './components/status-info-sheet'
import { NoteSheet } from './components/note-sheet'
import { AddItemRow, ADD_ROW_ID } from './components/add-item-row'
import { AddItemPanel } from './components/add-item-panel'

export function CardTableScreen({ budgetId, cardId }: { budgetId?: string; cardId?: string } = {}) {
  const {
    card,
    rows,
    stages,
    units,
    library,
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
  } = useCardRows({ budgetId, cardId })
  const { buffers, bordroData, itemWarnings, periodWarnings, refreshBordro, api } = useEditBuffers({
    rowsRef,
    savedRef,
    cardRef,
    stagesRef,
    unitLabelByIdRef,
    unitCodeByIdRef,
    minWageThresholdsRef,
    patchRow,
  })
  const { addToast } = useToast()
  const [addQuery, setAddQuery] = useState('')
  const [addPanelOpen, setAddPanelOpen] = useState(false)
  // -1 = HICBIR secenek vurgulu degil (D3b-2d). Vurgu YALNIZ ok tusuyla baslar; odada acilma ve
  // yazarak suzme vurgu OLUSTURMAZ - aksi halde vurgusuz Enter/Tab kalem doguruyordu.
  const [addHighlight, setAddHighlight] = useState(-1)
  const [adding, setAdding] = useState(false)
  const addInputRef = useRef<HTMLInputElement>(null)
  // Yeni eklenen kalemler. Her id KENDI 1 saniyesini yakar (Engin karari 2026-07-31):
  // pes pese eklemede onceki cerceve hemen sonmez, birden fazlasi ayni anda yanabilir.
  const [justAddedIds, setJustAddedIds] = useState<string[]>([])
  const pendingScrollIdRef = useRef<string | null>(null)

  // Sorgu bos iken TUM kart kutuphanesi doner (Engin karari 2026-07-24: liste odakta gorunur,
  // ilk tusta degil - kullanici once bakar, isterse yazarak daraltir).
  const addOptions = useMemo(() => matchLibraryItems(library, addQuery), [library, addQuery])

  const onSelectLibraryItem = useCallback(
    async (item: LibraryItem) => {
      if (!cardRef.current || adding) return
      try {
        setAdding(true)
        const newItemId = await addBudgetItem(cardRef.current.groupId, { catalogCode: item.catalogCode })
        setAddQuery('')
        setAddHighlight(-1)
        pendingScrollIdRef.current = newItemId
        setJustAddedIds((prev) => [...prev, newItemId])
        window.setTimeout(() => {
          setJustAddedIds((prev) => prev.filter((id) => id !== newItemId))
        }, 1000)
        refetch({ silent: true })
        // Oda KAPANMAZ (Engin karari 2026-07-27) - pes pese kalem dokme yazmadan surer.
        // Fareyle secildiginde odak secenek dugmesine kacmis olur, yazi alanina geri alinir.
        addInputRef.current?.focus()
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Kalem eklenemedi', 'error')
      } finally {
        setAdding(false)
      }
    },
    [adding, refetch, addToast, cardRef],
  )

  const onAddQueryChange = useCallback((value: string) => {
    setAddQuery(value)
    // Yazmak vurgu OLUSTURMAZ (D3b-2d): suzulen listede de secim ok tusuyla baslar.
    setAddHighlight(-1)
  }, [])

  // YUZEY dilimi (2026-07-30): ekleme satiri artik bir dugme, kutuphane listesi odanin icinde.
  // Motorun tus dinleyicisi tabloyu saran kaba bagli oldugu icin oda kendi tuslarini yonetir;
  // kararlari yine resolveKeyAction'a sorar (bkz. add-item-panel.tsx).
  const onOpenAddPanel = useCallback(() => {
    setAddQuery('')
    setAddHighlight(-1)
    setAddPanelOpen(true)
  }, [])
  const onCloseAddPanel = useCallback(() => setAddPanelOpen(false), [])

  const { containerRef, handleKeyDown, handleFocus, handlePaste, handleDrop, handleDragOver, isActiveEdit } = useGridNavigation({ rowsRef, savedRef, patchRow, api, rows })

  // Yeni eklenen kalem sessiz yenilemeden sonra tabloya inince gorunur alana sokulur.
  // block: nearest = satir tam gorunuyorsa hicbir sey oynamaz, degilse en az hareketle
  // iceri girer; alt bosluk scroll-margin-bottom ile gelir. DIKKAT: bu efekt odaga
  // DOKUNMAZ, bu yuzden KLV-K12 dialog korumasinin ICINE ALINMAZ - oda acikken de
  // calismasi gerekir, ekleme zaten oda acikken oluyor.
  useEffect(() => {
    const pendingId = pendingScrollIdRef.current
    if (!pendingId) return
    if (!rows.some((r) => r.id === pendingId)) return
    pendingScrollIdRef.current = null
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-item-id="${pendingId}"]`)
    if (!el) return
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [rows, containerRef])

  const [openBurden, setOpenBurden] = useState<{ itemId: string; stageId: string | null } | null>(null)
  const [openNoteItemId, setOpenNoteItemId] = useState<string | null>(null)
  const [openStatusInfo, setOpenStatusInfo] = useState(false)
  const didInitialFocusRef = useRef(false)

  useEffect(() => {
    for (const it of rows) {
      if (it.paymentStatus === 'bordro') void refreshBordro(it.id)
    }
    // card degistiginde (fresh yukleme) bir kere calisir; rows her keystroke de degisir
    // ama bu efekt sadece card kimligine bagli oldugu icin edit sirasinda yeniden tetiklenmez (K5).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, refreshBordro])

  // D3b-2b: kosul rows.length'ten card'a tasindi - kalemi olmayan kartta da tablo (ve "+ kalem
  // ekle" satiri) cizilir, acilis odagi oraya duser.
  useEffect(() => {
    if (didInitialFocusRef.current || !card) return
    didInitialFocusRef.current = true
    containerRef.current?.querySelector<HTMLElement>('[data-col="name"]')?.focus()
  }, [rows, card, containerRef])

  const onOpenBurden = useCallback((itemId: string, stageId: string | null) => {
    setOpenBurden({ itemId, stageId })
  }, [])

  const onOpenNote = useCallback((itemId: string) => {
    setOpenNoteItemId(itemId)
  }, [])

  const onRemoveItem = useCallback(
    async (itemId: string) => {
      const ok = window.confirm('Bu kalemi silmek istiyor musun?')
      if (!ok) return
      try {
        const list = rowsRef.current
        const idx = list.findIndex((r) => r.id === itemId)
        const neighbour = idx > 0 ? list[idx - 1] : list[idx + 1]
        await softDeleteBudgetItem(itemId)
        refetch({ silent: true })
        // Silinen satir gozden kayboluyor, odak bosta kalmasin (Engin karari 2026-07-27):
        // bir USTTEKI kaleme gider; ilk satir siliniyorsa alttakine; kart tamamen bosaliyorsa
        // kalem ekleme kutusuna. Hedef DOM dugumu bu anda hala duruyor (sessiz yenileme henuz
        // render etmedi) ve ayni id ile yeniden kullanilacagi icin odak korunur.
        const container = containerRef.current
        const target = neighbour
          ? container?.querySelector<HTMLElement>(`[data-row-id="${neighbour.id}"][data-col="itemRemove"]`)
          : container?.querySelector<HTMLElement>(`[data-row-id="${ADD_ROW_ID}"][data-col="name"]`)
        target?.focus()
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Kalem silinemedi', 'error')
      }
    },
    [refetch, addToast, rowsRef, containerRef],
  )

  const onOpenStatusInfo = useCallback(() => {
    setOpenStatusInfo(true)
  }, [])

  if (loading) return <Loading label="Bütçe yükleniyor..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  // D3b-2b: rows.length===0 erken donusu KALDIRILDI - kalemsiz kartta "+ kalem ekle" satirina
  // ulasilamiyordu (cikmaz sokak). Tablo satir sayisindan BAGIMSIZ cizilir.
  if (!card) return <EmptyState title="Kart bulunamadı" description="Bu bütçede kart yok." />

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text)', margin: '0 0 var(--space-1)' }}>
        {card.cardName}
      </h2>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
        Dönem eklemek için Dönemler hücresinden seç; her dönem için X (adet) gir. Hücreden çıkınca otomatik kaydeder.
      </p>
      <div ref={containerRef} onKeyDown={handleKeyDown} onFocus={handleFocus} onPaste={handlePaste} onDrop={handleDrop} onDragOver={handleDragOver}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: tableMinWidth, tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: colWidths.kod }} />
            <col style={{ minWidth: colWidths.adMin }} />
            <col style={{ width: colWidths.aciklama }} />
            <col style={{ width: colWidths.statu }} />
            <col style={{ width: colWidths.donemler }} />
            <col style={{ width: colWidths.birim }} />
            <col style={{ width: colWidths.birimNet }} />
            <col style={{ width: colWidths.miktar }} />
            <col style={{ width: colWidths.x }} />
            <col style={{ width: colWidths.yasalYuk }} />
            <col style={{ width: colWidths.netToplam }} />
            <col style={{ width: colWidths.brutToplam }} />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle}>No</th>
              <th style={thStyle}>Ad</th>
              <th style={thStyle}>Açıklama</th>
              <th style={thStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  Statü
                  <button
                    type="button"
                    title="Statü rehberi"
                    onClick={onOpenStatusInfo}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '1px solid var(--color-text-muted)',
                      background: 'transparent',
                      color: 'var(--color-text-muted)',
                      fontSize: 10,
                      lineHeight: 1,
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    ?
                  </button>
                </span>
              </th>
              <th style={thStyle}>Dönemler</th>
              <th style={thStyle}>Birim</th>
              <th style={thNum}>Birim net</th>
              <th style={thNum}>Miktar</th>
              <th style={thNum}>X</th>
              <th style={thNum}>Yasal Yük</th>
              <th style={thNum}>Net toplam</th>
              <th style={thNum}>Brut toplam</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((it, idx) => {
              const multi = isMultiPeriod(it)
              const addedStageIds = Object.keys(it.periodQty)
              const periodKeys = new Set(addedStageIds)
              const addedStages = stages.filter((s) => periodKeys.has(s.id))
              return (
                <Fragment key={it.id}>
                  <ItemRow
                    item={it}
                    rowNo={idx + 1}
                    stages={stages}
                    units={units}
                    api={api}
                    bordro={bordroData[it.id]}
                    warning={itemWarnings[it.id] ?? null}
                    onOpenBurden={onOpenBurden}
                    onOpenNote={onOpenNote}
                    onRemove={onRemoveItem}
                    justAdded={justAddedIds.includes(it.id)}
                    bufUnitNet={buffers[it.id + ':unitNet']}
                    bufMultiplier={buffers[it.id + ':multiplier']}
                    bufRepeat={buffers[it.id + ':repeat']}
                    navUnitNet={isActiveEdit(it.id, 'unitNet') ? undefined : fmt(it.unitNet)}
                    navMultiplier={isActiveEdit(it.id, 'multiplier') ? undefined : fmt(it.multiplier)}
                    navRepeat={isActiveEdit(it.id, 'repeat') ? undefined : fmt(it.repeat)}
                  />
                  {multi &&
                    addedStages.map((s) => {
                      const periodRowId = `${it.id}:${s.id}`
                      const netVal = it.periodNet[s.id] ?? it.unitNet
                      const repeatVal = it.periodRepeat[s.id] ?? it.repeat
                      const qtyVal = it.periodQty[s.id] ?? 0
                      return (
                        <PeriodRow
                          key={periodRowId}
                          item={it}
                          stage={s}
                          api={api}
                          units={units}
                          bordro={bordroData[it.id]}
                          warning={periodWarnings[it.id + ':' + s.id] ?? null}
                          onOpenBurden={onOpenBurden}
                          bufQty={buffers[it.id + ':stage:' + s.id]}
                          bufNet={buffers[it.id + ':pnet:' + s.id]}
                          bufRepeat={buffers[it.id + ':prepeat:' + s.id]}
                          navNet={isActiveEdit(periodRowId, 'periodNet') ? undefined : fmt(netVal)}
                          navRepeat={isActiveEdit(periodRowId, 'periodRepeat') ? undefined : fmt(repeatVal)}
                          navQty={isActiveEdit(periodRowId, 'periodQty') ? undefined : fmt(qtyVal)}
                        />
                      )
                    })}
                </Fragment>
              )
            })}
            <AddItemRow disabled={adding} onOpen={onOpenAddPanel} />
          </tbody>
        </table>
      </div>
      {addPanelOpen && (
        <AddItemPanel
          query={addQuery}
          options={addOptions}
          highlightIndex={addHighlight}
          inputRef={addInputRef}
          onQueryChange={onAddQueryChange}
          onHighlightChange={setAddHighlight}
          onSelect={onSelectLibraryItem}
          onClose={onCloseAddPanel}
        />
      )}
      {openBurden !== null && (() => {
        const item = rows.find((r) => r.id === openBurden.itemId)
        if (!item) return null
        const sheetStage = openBurden.stageId !== null ? (stages.find((s) => s.id === openBurden.stageId) ?? null) : null
        return (
          <BurdenSheet
            item={item}
            stageId={openBurden.stageId}
            stage={sheetStage}
            bordro={bordroData[item.id]}
            onClose={() => setOpenBurden(null)}
          />
        )
      })()}
      {openNoteItemId !== null && (() => {
        const item = rows.find((r) => r.id === openNoteItemId)
        if (!item) return null
        return (
          <NoteSheet key={item.id} item={item} onCommit={api.commitNote} onClose={() => setOpenNoteItemId(null)} />
        )
      })()}
      {openStatusInfo && <StatusInfoSheet onClose={() => setOpenStatusInfo(false)} />}
    </div>
  )
}
