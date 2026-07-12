import { Fragment, useCallback, useEffect, useState } from 'react'
import { Loading } from '../../../shared/components/loading'
import { EmptyState } from '../../../shared/components/empty-state'
import { ErrorMessage } from '../../../shared/components/error-message'
import { useCardRows } from './hooks/use-card-rows'
import { useEditBuffers } from './hooks/use-edit-buffers'
import { isMultiPeriod } from './format'
import { thStyle, thNum } from './components/table-styles'
import { ItemRow } from './components/item-row'
import { PeriodRow } from './components/period-row'
import { BurdenSheet } from './components/burden-sheet'
import { StatusInfoSheet } from './components/status-info-sheet'
import { NoteSheet } from './components/note-sheet'

export function CardTableScreen() {
  const { card, rows, stages, units, loading, error, refetch, patchRow, rowsRef, savedRef, cardRef, stagesRef, unitLabelByIdRef } =
    useCardRows()
  const { buffers, bordroData, refreshBordro, api } = useEditBuffers({
    rowsRef,
    savedRef,
    cardRef,
    stagesRef,
    unitLabelByIdRef,
    patchRow,
  })
  const [openBurden, setOpenBurden] = useState<{ itemId: string; stageId: string | null } | null>(null)
  const [openNoteItemId, setOpenNoteItemId] = useState<string | null>(null)
  const [openStatusInfo, setOpenStatusInfo] = useState(false)

  useEffect(() => {
    for (const it of rows) {
      if (it.paymentStatus === 'bordro') void refreshBordro(it.id)
    }
    // card degistiginde (fresh yukleme) bir kere calisir; rows her keystroke de degisir
    // ama bu efekt sadece card kimligine bagli oldugu icin edit sirasinda yeniden tetiklenmez (K5).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, refreshBordro])

  const onOpenBurden = useCallback((itemId: string, stageId: string | null) => {
    setOpenBurden({ itemId, stageId })
  }, [])

  const onOpenNote = useCallback((itemId: string) => {
    setOpenNoteItemId(itemId)
  }, [])

  const onOpenStatusInfo = useCallback(() => {
    setOpenStatusInfo(true)
  }, [])

  if (loading) return <Loading label="Bütçe yükleniyor..." />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />
  if (!card || rows.length === 0)
    return <EmptyState title="Kart boş" description="Bu bütçede kalem yok." />

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text)', margin: '0 0 var(--space-1)' }}>
        {card.cardName}
      </h2>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
        Dönem eklemek için Dönemler hücresinden seç; her dönem için X (adet) gir. Hücreden çıkınca otomatik kaydeder.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1000 }}>
          <thead>
            <tr>
              <th style={thStyle}>Kod</th>
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
            {rows.map((it) => {
              const multi = isMultiPeriod(it)
              const addedStageIds = Object.keys(it.periodQty)
              const periodKeys = new Set(addedStageIds)
              const addedStages = stages.filter((s) => periodKeys.has(s.id))
              return (
                <Fragment key={it.id}>
                  <ItemRow
                    item={it}
                    stages={stages}
                    units={units}
                    api={api}
                    bordro={bordroData[it.id]}
                    onOpenBurden={onOpenBurden}
                    onOpenNote={onOpenNote}
                    bufUnitNet={buffers[it.id + ':unitNet']}
                    bufMultiplier={buffers[it.id + ':multiplier']}
                    bufRepeat={buffers[it.id + ':repeat']}
                  />
                  {multi &&
                    addedStages.map((s) => (
                      <PeriodRow
                        key={`${it.id}:${s.id}`}
                        item={it}
                        stage={s}
                        api={api}
                        units={units}
                        bordro={bordroData[it.id]}
                        onOpenBurden={onOpenBurden}
                        bufQty={buffers[it.id + ':stage:' + s.id]}
                        bufNet={buffers[it.id + ':pnet:' + s.id]}
                        bufRepeat={buffers[it.id + ':prepeat:' + s.id]}
                      />
                    ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
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
