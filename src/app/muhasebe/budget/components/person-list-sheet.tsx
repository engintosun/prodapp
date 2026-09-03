import { useEffect, useRef } from 'react'
import type { DutyOption, PersonLabel, PersonLabelPatch } from '../../../../shared/supabase/person-label-service'
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

// Panonun bilesen imzasi hicbir kart koduna baglanmaz: yalniz labels, dutyOptions ve geri
// cagrilar alir (I1, kart-ozel dal YASAK). budgetId ve servis cagrilari CAGIRAN tarafta yasar.
export function PersonListSheet({
  labels,
  dutyOptions,
  onUpdate,
  onCreate,
  onClose,
}: {
  labels: PersonLabel[]
  dutyOptions: DutyOption[]
  onUpdate: (id: string, patch: PersonLabelPatch) => void | Promise<void>
  onCreate: () => Promise<string | null>
  onClose: () => void
}) {
  // Yeni satir eklendiginde odak yeni satirin Oyuncu hanesine gider (m5-m6: kayit dugmesi
  // YOK, onBlur ile kaydedilir). Girdiler kontrolsuz (defaultValue) oldugu icin odak DOM
  // referansindan yonetilir, React state'ten degil.
  const pendingFocusIdRef = useRef<string | null>(null)
  const nameInputsRef = useRef<Map<string, HTMLInputElement>>(new Map())

  useEffect(() => {
    const id = pendingFocusIdRef.current
    if (!id) return
    const el = nameInputsRef.current.get(id)
    if (!el) return
    pendingFocusIdRef.current = null
    el.focus()
  }, [labels])

  const handleCreate = async () => {
    const newId = await onCreate()
    if (newId) pendingFocusIdRef.current = newId
  }

  return (
    <BottomSheet title="Oyuncular listesi" onClose={onClose}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Rol</th>
            <th style={thStyle}>Oyuncu</th>
            <th style={thStyle}>Görev</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((l) => (
            <tr key={l.id}>
              <td style={tdStyle}>
                <input
                  defaultValue={l.roleName ?? ''}
                  onBlur={(e) => void onUpdate(l.id, { roleName: e.target.value })}
                  style={inputStyle}
                />
              </td>
              <td style={tdStyle}>
                <input
                  ref={(el) => {
                    if (el) nameInputsRef.current.set(l.id, el)
                    else nameInputsRef.current.delete(l.id)
                  }}
                  defaultValue={l.name}
                  onBlur={(e) => void onUpdate(l.id, { name: e.target.value })}
                  style={inputStyle}
                />
              </td>
              <td style={tdStyle}>
                <select
                  defaultValue={l.dutyCode ?? ''}
                  onChange={(e) => void onUpdate(l.id, { dutyCode: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Görev seç</option>
                  {dutyOptions.map((d) => (
                    <option key={d.catalogCode} value={d.catalogCode}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() => void handleCreate()}
        style={{
          marginTop: 'var(--space-3)',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-1) var(--space-3)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text)',
          cursor: 'pointer',
        }}
      >
        + Kişi ekle
      </button>
    </BottomSheet>
  )
}
