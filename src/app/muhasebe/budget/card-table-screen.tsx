// BOY: tek iş = kart tablosu ekranının orkestrasyonu (veri hook'ları + grid navigasyon + ekleme paneli + satır bileşenlerini birbirine bağlar), sebep = tek ekranın tüm kablolaması aynı yerde görülmeli; bölünürse durum parçalara dağılır, okunabilirlik artmaz.
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loading } from '../../../shared/components/loading'
import { EmptyState } from '../../../shared/components/empty-state'
import { ErrorMessage } from '../../../shared/components/error-message'
import { useCardRows } from './hooks/use-card-rows'
import { useEditBuffers } from './hooks/use-edit-buffers'
import { useGridNavigation } from './hooks/use-grid-navigation'
import { isMultiPeriod, fmt, matchLibraryItems, buildRoomOptions, findCrossCardMatches, groupRowsByHeading } from './format'
import type { RoomOption } from './format'
import { cardTotals } from './totals'
import { addBudgetItem, softDeleteBudgetItem } from '../../../shared/supabase/budget-service'
import { useToast } from '../../../shared/components/toast'
import { thStyle, thNum, tdStyle, numStyle, colWidths, tableMinWidth } from './components/table-styles'
import { BUDGET_COLUMNS } from './columns'
import { ItemRow } from './components/item-row'
import { PeriodRow } from './components/period-row'
import { HeadingRow } from './components/heading-row'
import { BurdenSheet } from './components/burden-sheet'
import { StatusInfoSheet } from './components/status-info-sheet'
import { NoteSheet } from './components/note-sheet'
import { HeadingSheet } from './components/heading-sheet'
import { AddItemRow, ADD_ROW_ID } from './components/add-item-row'
import { AddItemPanel } from './components/add-item-panel'

export function CardTableScreen({ budgetId, cardId }: { budgetId?: string; cardId?: string } = {}) {
  const {
    card,
    rows,
    stages,
    units,
    library,
    headings,
    allLibrary,
    budgetCards,
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
  const { buffers, bordroData, itemWarnings, periodWarnings, refreshBordroMany, api } = useEditBuffers({
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
  // Yeni eklenen kalemler. Her id KENDI 2 saniyesini yakar (Engin karari 2026-07-31):
  // pes pese eklemede onceki cerceve hemen sonmez, birden fazlasi ayni anda yanabilir.
  // Sayac kalem EKLENDIGINDE baslar, satirin ekrana gelmesi beklenmez - bilincli tercih,
  // sonraki bir turda "satir gelince baslasin" diye degistirilmez (Engin karari 2026-07-31).
  const [justAddedIds, setJustAddedIds] = useState<string[]>([])
  const pendingScrollIdRef = useRef<string | null>(null)

  // D3c-2: oda listesi artik kutuphane + kartin MEVCUT serbest kalemlerinden kurulur
  // (AYIKLAMA KURALI: kutuphaneden dogmus satirlar ikinci kez GIRMEZ). Sorgu bos iken TUMU
  // doner (Engin karari 2026-07-24: liste odakta gorunur, ilk tusta degil).
  const addOptions = useMemo(() => {
    // units GERCEK state'tir (ref degil) - degisince useMemo yeniden hesaplar.
    const unitCodeById = new Map(units.map((u) => [u.id, u.code]))
    return matchLibraryItems(
      buildRoomOptions(
        library,
        rows.map((r) => ({
          catalogCode: r.catalogCode,
          libraryItemId: r.libraryItemId,
          name: r.name,
          // D2-e: ayni catalogCode icindeki satirlar arasinda item_code sirasi sort_order
          // sirasiyla AYNIdir (order by catalog_code, item_code) - "ilk dogan" tie-break budur;
          // sort_order'in kendisi rows'a hic tasinmiyor.
          sortNo: r.itemCode,
          paymentStatusCode: r.paymentStatus ?? '',
          unitCode: unitCodeById.get(r.unitId) ?? '',
        })),
      ),
      addQuery,
    )
  }, [library, rows, units, addQuery])

  // D3c-3: capraz-kart bilgisi - yazilan ad bu butcedeki BASKA bir kartin kutuphanesinde TAM AD
  // ile varsa o kartin adi bilgi olarak cikar (BUTCE-EKRAN-KARARLARI bolum 16 + 202).
  const cardCode = card?.cardCode
  const crossCardNames = useMemo(() => {
    if (!cardCode) return []
    return findCrossCardMatches(addQuery, allLibrary, cardCode, budgetCards)
  }, [addQuery, allLibrary, cardCode, budgetCards])

  const onSelectLibraryItem = useCallback(
    async (o: RoomOption) => {
      if (!cardRef.current || adding) return
      try {
        setAdding(true)
        // D3c-2: kutuphane secenegi bugunku davranisin AYNISI; kart secenegi (kartin mevcut
        // serbest kalemi) AYNI kodla + ilk satirin statu/birimini DEVRALARAK ikinci satir doger.
        const newItemId =
          o.source === 'library'
            ? await addBudgetItem(cardRef.current.groupId, { catalogCode: o.catalogCode })
            : await addBudgetItem(cardRef.current.groupId, {
                existingCode: o.catalogCode,
                name: o.name,
                paymentStatus: o.paymentStatus,
                unitCode: o.unitCode,
              })
        setAddQuery('')
        setAddHighlight(-1)
        pendingScrollIdRef.current = newItemId
        setJustAddedIds((prev) => [...prev, newItemId])
        window.setTimeout(() => {
          setJustAddedIds((prev) => prev.filter((id) => id !== newItemId))
        }, 2000)
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

  // D3c-1: serbest kalem GUVENLI VARSAYILANLARLA dogar (Engin karari 2026-07-24): statu
  // Fatura (sirket) - Bordro DEGIL, cunku yeni dogan satirin kendiliginden yasal yuk hesabina
  // girmesi yanlis olur; birim gun (day). Kod (muhtelif blogu) ve library_item_id NULL sunucu
  // tarafinda cozulur, buradan gonderilmez. Ekleme sonrasi akis kutuphane yolunun AYNISI:
  // yazi alani temizlenir, oda kapanmaz, kaydirma ve 2 saniyelik cerceve isareti devralinir.
  const onCreateFreeItem = useCallback(
    async (name: string) => {
      if (!cardRef.current || adding) return
      try {
        setAdding(true)
        const newItemId = await addBudgetItem(cardRef.current.groupId, {
          name,
          paymentStatus: 'sirket',
          unitCode: 'day',
        })
        setAddQuery('')
        setAddHighlight(-1)
        pendingScrollIdRef.current = newItemId
        setJustAddedIds((prev) => [...prev, newItemId])
        window.setTimeout(() => {
          setJustAddedIds((prev) => prev.filter((id) => id !== newItemId))
        }, 2000)
        refetch({ silent: true })
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
  const [openHeadingItemId, setOpenHeadingItemId] = useState<string | null>(null)
  const [openStatusInfo, setOpenStatusInfo] = useState(false)
  const didInitialFocusRef = useRef(false)

  useEffect(() => {
    const bordroItemIds = rows.filter((it) => it.paymentStatus === 'bordro').map((it) => it.id)
    void refreshBordroMany(bordroItemIds)
    // card degistiginde (fresh yukleme) bir kere calisir; rows her keystroke de degisir
    // ama bu efekt sadece card kimligine bagli oldugu icin edit sirasinda yeniden tetiklenmez (K5).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, refreshBordroMany])

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

  const onOpenHeading = useCallback((itemId: string) => {
    setOpenHeadingItemId(itemId)
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

  const totals = useMemo(() => cardTotals(rows, bordroData), [rows, bordroData])
  const groups = useMemo(() => groupRowsByHeading(rows, headings), [rows, headings])
  // DILIM 1100-B: No kolonu TEK sayac, CIZIM SIRASINDA artar; basliklar sayaci ETKILEMEZ
  // (BUTCE-SEMA-KARARLARI satir 105). Immutable kurulum (react-hooks/immutability): render
  // sirasinda sayac ARTTIRILMAZ, sira groups'tan duz-cekilip bir kere Map'e donusturulur.
  const rowNoById = useMemo(
    () => new Map(groups.flatMap((g) => g.rows).map((r, i) => [r.id, i + 1])),
    [groups],
  )

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
            <col style={{ width: colWidths.statu }} />
            <col style={{ width: colWidths.donemler }} />
            <col style={{ width: colWidths.birim }} />
            <col style={{ width: colWidths.birimNet }} />
            <col style={{ width: colWidths.miktar }} />
            <col style={{ width: colWidths.x }} />
            <col style={{ width: colWidths.araToplam }} />
            <col style={{ width: colWidths.yasalYuk }} />
            <col style={{ width: colWidths.maliyet }} />
            <col style={{ width: colWidths.kdv }} />
            <col style={{ width: colWidths.brutToplam }} />
          </colgroup>
          <thead>
            <tr>
              {BUDGET_COLUMNS.map((column) => (
                <th key={column.key} style={column.align === 'num' ? thNum : thStyle}>
                  {column.key === 'statu' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      {column.label}
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
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group, groupIdx) => (
              <Fragment key={groupIdx}>
                {group.heading !== null && (
                  <HeadingRow name={group.heading.name} totals={cardTotals(group.rows, bordroData)} />
                )}
                {group.rows.map((it) => {
                  const multi = isMultiPeriod(it)
                  const addedStageIds = Object.keys(it.periodQty)
                  const periodKeys = new Set(addedStageIds)
                  const addedStages = stages.filter((s) => periodKeys.has(s.id))
                  return (
                    <Fragment key={it.id}>
                      <ItemRow
                        item={it}
                        rowNo={rowNoById.get(it.id) ?? 0}
                        stages={stages}
                        units={units}
                        api={api}
                        bordro={bordroData[it.id]}
                        warning={itemWarnings[it.id] ?? null}
                        onOpenBurden={onOpenBurden}
                        onOpenNote={onOpenNote}
                        onOpenHeading={onOpenHeading}
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
              </Fragment>
            ))}
            <AddItemRow disabled={adding} onOpen={onOpenAddPanel} />
          </tbody>
        </table>
      </div>
      {/* Serit zemini tablo kadar genis olmali: sarmalayici blok eleman oldugu icin
          varsayilan genisligi GORUNUR alan kadardir, tablo ise minWidth ile 1358px'e
          uzuyordu; aradaki fark boyasiz kalip alttaki satirlarin sizmasina yol aciyordu
          (13.08.2026). TD-25'ten ayri kusur: orada token yanlisti, burada genislik. */}
      <div style={{ position: 'sticky', bottom: 0, minWidth: tableMinWidth, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: tableMinWidth, tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: colWidths.kod }} />
            <col style={{ minWidth: colWidths.adMin }} />
            <col style={{ width: colWidths.statu }} />
            <col style={{ width: colWidths.donemler }} />
            <col style={{ width: colWidths.birim }} />
            <col style={{ width: colWidths.birimNet }} />
            <col style={{ width: colWidths.miktar }} />
            <col style={{ width: colWidths.x }} />
            <col style={{ width: colWidths.araToplam }} />
            <col style={{ width: colWidths.yasalYuk }} />
            <col style={{ width: colWidths.maliyet }} />
            <col style={{ width: colWidths.kdv }} />
            <col style={{ width: colWidths.brutToplam }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, fontWeight: 600 }} colSpan={8}>
                Kart toplamı
              </td>
              <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.net)}</td>
              <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.yasalYuk)}</td>
              <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.maliyet)}</td>
              <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.kdv)}</td>
              <td style={{ ...numStyle, fontWeight: 600 }}>{fmt(totals.brut)}</td>
            </tr>
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
          crossCardNames={crossCardNames}
          onCreateFree={onCreateFreeItem}
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
      {openHeadingItemId !== null && (() => {
        const item = rows.find((r) => r.id === openHeadingItemId)
        if (!item) return null
        return (
          <HeadingSheet key={item.id} item={item} headings={headings} onCommit={api.commitNote} onClose={() => setOpenHeadingItemId(null)} />
        )
      })()}
      {openStatusInfo && <StatusInfoSheet onClose={() => setOpenStatusInfo(false)} />}
    </div>
  )
}
