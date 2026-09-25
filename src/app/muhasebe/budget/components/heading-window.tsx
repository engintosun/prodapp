import { useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { BudgetItemRow } from '../../../../shared/supabase/budget-service'
import type { UserHeading } from '../../../../shared/supabase/user-heading-service'
import { openUserHeading, moveItemsToHeading } from '../../../../shared/supabase/user-heading-service'
import { useToast } from '../../../../shared/components/toast'
import { BottomSheet } from './bottom-sheet'
import { buildWindowGroups, filterHeadingOptions, undoBatches } from '../heading-window'
import type { HeadingOption, SendRecord } from '../heading-window'

// BASLIK PENCERESI (BUTCE-EKRAN-KARARLARI bolum 19, 21-23 Eylul 2026, Engin kararlari).
// Solda kartin serbest kalemleri bulunduklari basligin altinda (Basliksiz en ustte), sagda
// hedef. Hepsini sec (emsal: person-list-sheet.tsx). Disina tiklama ve Esc pencere ailesiyle
// ayni kapatir; kayip yalniz gonderilmemis isaretlerdir, her gonderim o an kaydedilir.
// Ctrl+Z KURULMAZ: son gonderim "Geri al" satiriyla geri alinir, her kalem geldigi yere
// doner; pencere kapaninca satir da gider. Dar ekranda iki sutun alt alta duser (flex-wrap),
// liste ustte kalir.
// GENISLIK (25 Eylul 2026, Engin karari): iki sutunun en az genisligi (280 + 240) + aradaki bosluk (16) + kenarlar (32) = 568; eskiden 760, artan yer yalniz bosluktu.
const PANEL_WIDTH = 568

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  fontFamily: 'inherit',
}

const tickLabelStyle = {
  display: 'flex',
  alignItems: 'center' as const,
  gap: 'var(--space-1)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  padding: 'var(--space-1) 0',
}

const groupTitleStyle = {
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  margin: 'var(--space-2) 0 var(--space-1)',
}

const mutedStyle = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
}

const sendButtonStyle = {
  background: 'var(--color-primary)',
  color: 'var(--color-primary-text)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-3)',
  fontSize: 'var(--text-xs)',
}

const linkButtonStyle = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--color-primary)',
  fontSize: 'var(--text-xs)',
  fontFamily: 'inherit',
}

function optionStyle(active: boolean) {
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: 'var(--space-2)',
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    fontSize: 'var(--text-sm)',
    fontFamily: 'inherit',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--color-primary)' : 'var(--color-text)',
  }
}

export function HeadingWindow({
  rows,
  rowNoById,
  libraryHeadings,
  userHeadings,
  cardCode,
  onChanged,
  anchor,
  anchorLeft,
  onClose,
}: {
  rows: readonly BudgetItemRow[]
  // NUMARA tablonun No sutunundan gelir (card-table-screen itemRowNoById); ozetin altindaki
  // satirin numarasi yoktur, o satirda numara yazilmaz.
  rowNoById: ReadonlyMap<string, number>
  libraryHeadings: readonly { catalogCode: string; name: string }[]
  userHeadings: readonly UserHeading[]
  cardCode: string
  onChanged: () => void
  anchor?: () => HTMLElement | null
  anchorLeft?: () => HTMLElement | null
  onClose: () => void
}) {
  const { addToast } = useToast()
  const options = useMemo<HeadingOption[]>(
    () => [
      ...libraryHeadings.map((h) => ({ key: h.catalogCode, name: h.name })),
      ...userHeadings.map((h) => ({ key: h.id, name: h.name })),
    ],
    [libraryHeadings, userHeadings],
  )
  const groups = useMemo(() => buildWindowGroups(rows, options), [rows, options])
  const fromById = useMemo(() => {
    const m = new Map<string, string | null>()
    for (const g of groups) for (const it of g.items) m.set(it.id, g.key)
    return m
  }, [groups])

  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  // null = hedef listeden secilmedi; yazilan ad veritabanina gider. { key: null } = Basliksiz.
  const [target, setTarget] = useState<{ key: string | null; name: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [lastSend, setLastSend] = useState<SendRecord | null>(null)

  const allIds = [...fromById.keys()]
  const liveChecked = [...checked].filter((id) => fromById.has(id))
  const allChecked = allIds.length > 0 && liveChecked.length === allIds.length
  const shown = filterHeadingOptions(options, query)
  const canSend = !busy && liveChecked.length > 0 && (target !== null || query.trim() !== '')

  const toggleOne = (id: string) =>
    setChecked((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(allIds))

  const send = async () => {
    if (!canSend) return
    setBusy(true)
    try {
      let targetKey: string | null
      let targetName: string
      if (target !== null) {
        targetKey = target.key
        targetName = target.name
      } else {
        targetName = query.trim()
        targetKey = await openUserHeading(cardCode, targetName)
      }
      const moves = liveChecked
        .map((id) => ({ id, from: fromById.get(id) ?? null }))
        .filter((m) => m.from !== targetKey)
      if (moves.length === 0) {
        addToast('Seçilen kalemler zaten bu başlıkta', 'info')
      } else {
        await moveItemsToHeading(
          moves.map((m) => m.id),
          targetKey,
        )
        setLastSend({ targetKey, targetName, moves })
        onChanged()
      }
      setChecked(new Set())
      setQuery('')
      setTarget(null)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Başlığa gönderilemedi', 'error')
    } finally {
      setBusy(false)
    }
  }

  const undo = async () => {
    if (busy || lastSend === null) return
    setBusy(true)
    try {
      for (const b of undoBatches(lastSend.moves)) await moveItemsToHeading(b.ids, b.headingCode)
      setLastSend(null)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Geri alınamadı', 'error')
    } finally {
      setBusy(false)
      onChanged()
    }
  }

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    void send()
  }

  const sentText =
    lastSend === null
      ? ''
      : lastSend.targetKey === null
        ? `${lastSend.moves.length} kalem Başlıksız'a gitti`
        : `${lastSend.moves.length} kalem "${lastSend.targetName}" başlığına gitti`

  return (
    <BottomSheet title="Başlık" maxWidth={PANEL_WIDTH} anchor={anchor} anchorLeft={anchorLeft} prefer="above" cover onClose={onClose}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          {allIds.length === 0 ? (
            <p style={mutedStyle}>Bu kartta elle girilmiş kalem yok.</p>
          ) : (
            <>
              <label style={tickLabelStyle}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                Hepsini seç
              </label>
              {groups.map((g) => (
                <div key={g.key ?? '__none'}>
                  <div style={groupTitleStyle}>{g.name}</div>
                  {g.items.map((it) => (
                    <label key={it.id} style={tickLabelStyle}>
                      <input type="checkbox" checked={checked.has(it.id)} onChange={() => toggleOne(it.id)} />
                      {rowNoById.has(it.id) ? `#${rowNoById.get(it.id)} ` : ''}
                      {it.name}
                    </label>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <input
            type="text"
            value={query}
            placeholder="Başlık adı"
            onChange={(e) => {
              setQuery(e.target.value)
              setTarget(null)
            }}
            onKeyDown={onInputKeyDown}
            style={inputStyle}
          />
          <ul style={{ margin: 'var(--space-2) 0', padding: 0, listStyle: 'none' }}>
            <li>
              <button
                type="button"
                onClick={() => {
                  setTarget({ key: null, name: 'Başlıksız' })
                  setQuery('')
                }}
                style={optionStyle(target !== null && target.key === null)}
              >
                Başlıksız
              </button>
            </li>
            {shown.map((o) => (
              <li key={o.key}>
                <button
                  type="button"
                  onClick={() => {
                    setTarget({ key: o.key, name: o.name })
                    setQuery(o.name)
                  }}
                  style={optionStyle(target !== null && target.key === o.key)}
                >
                  {o.name}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!canSend}
            onClick={() => void send()}
            style={{ ...sendButtonStyle, opacity: canSend ? 1 : 0.5, cursor: canSend ? 'pointer' : 'not-allowed' }}
          >
            {busy ? 'Gönderiliyor...' : 'Gönder'}
          </button>
          {lastSend !== null && (
            <div style={{ ...mutedStyle, marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <span>{sentText} —</span>
              <button type="button" disabled={busy} onClick={() => void undo()} style={linkButtonStyle}>
                Geri al
              </button>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
