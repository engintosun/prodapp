import { useMemo, useState } from 'react'
import type { DutyOption, PersonLabel, PersonLabelPatch } from '../../../../shared/supabase/person-label-service'
import type { BudgetItemRow } from '../../../../shared/supabase/budget-service'
import { personCardPresence, sortPersonsByDuty } from '../person-bring'
import { BottomSheet } from './bottom-sheet'

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

const thStyle = {
  textAlign: 'left' as const,
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  fontWeight: 600,
  padding: 'var(--space-1) var(--space-1)',
}

const tdStyle = {
  padding: 'var(--space-1) var(--space-1)',
}

const tickLabelStyle = {
  display: 'flex',
  alignItems: 'center' as const,
  gap: 'var(--space-1)',
}

const noteStyle = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  margin: '0 0 var(--space-3)',
}

const mutedCellStyle = {
  color: 'var(--color-text-muted)',
  fontSize: 'var(--text-xs)',
}

const toolbarStyle = {
  display: 'flex',
  alignItems: 'center' as const,
  gap: 'var(--space-2)',
  margin: '0 0 var(--space-3)',
}

const bringButtonStyle = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text)',
  cursor: 'pointer',
}

function dutyName(dutyCode: string | null, dutyOptions: DutyOption[]): string {
  if (!dutyCode) return ''
  return dutyOptions.find((d) => d.catalogCode === dutyCode)?.name ?? dutyCode
}

// Panonun bilesen imzasi hicbir kart koduna baglanmaz: yalniz labels, dutyOptions, rows ve
// geri cagrilar alir (I1, kart-ozel dal YASAK). budgetId, groupId ve servis cagrilari
// CAGIRAN tarafta yasar; pano yalniz onBring(pairs) cagirir.
// URETIM KAYITLARI duragi geldikten sonra (6 Eylul 2026, KABUK-KARARLARI 12.1) kisi girisi
// oradan yapilir: Rol/Oyuncu/Gorev burada SALT OKUNUR, yalniz ajans ve menajer tikleri
// (ve tik isaretliyken ad haneleri) karttan duzenlenebilir kalir. "+ Kisi ekle" KALKTI.
// GETIRME YOLU (9 Eylul 2026): sira sortPersonsByDuty'den gelir, kartta olma durumu
// personCardPresence'tan gelir (ikisi de saf modul, person-bring.ts).
export function PersonListSheet({
  labels,
  dutyOptions,
  rows,
  onUpdate,
  onBring,
  onClose,
}: {
  labels: PersonLabel[]
  dutyOptions: DutyOption[]
  rows: BudgetItemRow[]
  onUpdate: (id: string, patch: PersonLabelPatch) => void | Promise<void>
  onBring: (pairs: { catalogCode: string; personObjectId: string }[]) => void | Promise<void>
  onClose: () => void
}) {
  const sortedLabels = useMemo(() => sortPersonsByDuty(labels, dutyOptions), [labels, dutyOptions])
  const presence = useMemo(() => personCardPresence(rows, labels), [rows, labels])
  const bringableIds = useMemo(
    () => sortedLabels.filter((l) => !presence.inCard[l.id] && l.dutyCode !== null).map((l) => l.id),
    [sortedLabels, presence],
  )
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [bringing, setBringing] = useState(false)

  const allChecked = bringableIds.length > 0 && bringableIds.every((id) => checked.has(id))

  const toggleAll = () => {
    setChecked(allChecked ? new Set() : new Set(bringableIds))
  }

  const toggleOne = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBring = async () => {
    const pairs = sortedLabels
      .filter((l) => checked.has(l.id) && l.dutyCode !== null)
      .map((l) => ({ catalogCode: l.dutyCode as string, personObjectId: l.id }))
    if (pairs.length === 0) return
    setBringing(true)
    try {
      await onBring(pairs)
    } finally {
      setBringing(false)
    }
  }

  return (
    <BottomSheet title="Oyuncular listesi" onClose={onClose}>
      <p style={noteStyle}>Kişi girişi artık Üretim Kayıtları'ndan yapılır.</p>
      {bringableIds.length > 0 && (
        <div style={toolbarStyle}>
          <label style={tickLabelStyle}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            Hepsini seç
          </label>
          <span style={mutedCellStyle}>{checked.size} kişi getirilecek</span>
          <button
            type="button"
            disabled={checked.size === 0 || bringing}
            onClick={() => void handleBring()}
            style={{ ...bringButtonStyle, opacity: checked.size === 0 || bringing ? 0.5 : 1 }}
          >
            {bringing ? 'Getiriliyor...' : 'Getir'}
          </button>
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Rol</th>
            <th style={thStyle}>Oyuncu</th>
            <th style={thStyle}>Görev</th>
            <th style={thStyle}>Ajans</th>
            <th style={thStyle}>Menajer</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {sortedLabels.map((l) => (
            <tr key={l.id}>
              <td style={tdStyle}>{l.roleName ?? ''}</td>
              <td style={tdStyle}>{l.name}</td>
              <td style={tdStyle}>{dutyName(l.dutyCode, dutyOptions)}</td>
              <td style={tdStyle}>
                <label style={tickLabelStyle}>
                  <input
                    type="checkbox"
                    checked={l.hasAgency}
                    onChange={(e) => void onUpdate(l.id, e.target.checked ? { hasAgency: true } : { hasAgency: false, agencyName: '' })}
                  />
                  {l.hasAgency && (
                    <input
                      defaultValue={l.agencyName ?? ''}
                      onBlur={(e) => void onUpdate(l.id, { agencyName: e.target.value })}
                      placeholder="Ajans adı"
                      style={inputStyle}
                    />
                  )}
                </label>
              </td>
              <td style={tdStyle}>
                <label style={tickLabelStyle}>
                  <input
                    type="checkbox"
                    checked={l.hasManager}
                    onChange={(e) => void onUpdate(l.id, e.target.checked ? { hasManager: true } : { hasManager: false, managerName: '' })}
                  />
                  {l.hasManager && (
                    <input
                      defaultValue={l.managerName ?? ''}
                      onBlur={(e) => void onUpdate(l.id, { managerName: e.target.value })}
                      placeholder="Menajer adı"
                      style={inputStyle}
                    />
                  )}
                </label>
              </td>
              <td style={tdStyle}>
                {presence.inCard[l.id] ? (
                  <span style={mutedCellStyle}>kartta</span>
                ) : l.dutyCode !== null ? (
                  <input type="checkbox" checked={checked.has(l.id)} onChange={() => toggleOne(l.id)} />
                ) : (
                  <span style={mutedCellStyle}>görevi yok</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </BottomSheet>
  )
}
