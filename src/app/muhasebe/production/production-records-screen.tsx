// BOY: tek is = Uretim Kayitlari duraginin ekran orkestrasyonu (masa + Oyuncular listesi),
// sebep = KABUK-KARARLARI 12.1b/12.3 desenini izler - masa TEK ekranda, karta tiklaninca
// masayi kaplar (alttan pano DEGIL). Bu ekran BUTCEYI HIC GORMEZ (BUTCE-EKRAN-KARARLARI 339):
// budgetId almaz, budget-service'ten hicbir sey cagirmaz, yalniz person-label-service kullanir.
// Bu dilimde ajans/menajer tikleri YALNIZ VERIDIR - hicbir butce satiri dogurmaz.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Loading } from '../../../shared/components/loading'
import { useToast } from '../../../shared/components/toast'
import {
  countPersonLabels,
  fetchPersonLabels,
  createPersonLabel,
  updatePersonLabel,
  fetchDutyOptions,
} from '../../../shared/supabase/person-label-service'
import type { PersonLabel, PersonLabelPatch, DutyOption } from '../../../shared/supabase/person-label-service'

type View = 'desk' | 'oyuncular'

const cardStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start' as const,
  justifyContent: 'space-between' as const,
  gap: 'var(--space-3)',
  minHeight: 112,
  padding: 'var(--space-3)',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  textAlign: 'left' as const,
  font: 'inherit',
  color: 'var(--color-text)',
}

const backButtonStyle = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  fontSize: 'var(--text-sm)',
  color: 'var(--color-primary)',
  cursor: 'pointer',
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
}

const addButtonStyle = {
  marginTop: 'var(--space-3)',
  background: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-3)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  cursor: 'pointer',
}

export function ProductionRecordsScreen() {
  const { addToast } = useToast()
  const [view, setView] = useState<View>('desk')
  const [personCount, setPersonCount] = useState<number | null>(null)
  const [labels, setLabels] = useState<PersonLabel[]>([])
  const [dutyOptions, setDutyOptions] = useState<DutyOption[]>([])
  const [listLoading, setListLoading] = useState(false)

  const refreshCount = useCallback(() => {
    countPersonLabels()
      .then(setPersonCount)
      .catch((e) => addToast(e instanceof Error ? e.message : 'Kişi sayısı alınamadı', 'error'))
  }, [addToast])

  useEffect(() => {
    refreshCount()
  }, [refreshCount])

  const refreshLabels = useCallback(() => {
    fetchPersonLabels()
      .then(setLabels)
      .catch((e) => addToast(e instanceof Error ? e.message : 'Kişi listesi alınamadı', 'error'))
  }, [addToast])

  const onOpenOyuncular = useCallback(() => {
    setView('oyuncular')
    setListLoading(true)
    Promise.all([fetchPersonLabels(), fetchDutyOptions()])
      .then(([l, d]) => {
        setLabels(l)
        setDutyOptions(d)
      })
      .catch((e) => addToast(e instanceof Error ? e.message : 'Liste alınamadı', 'error'))
      .finally(() => setListLoading(false))
  }, [addToast])

  const onBack = useCallback(() => setView('desk'), [])

  // Girdiler kontrolsuz (defaultValue), odak DOM referansindan yonetilir - emsal:
  // person-list-sheet.tsx (kayit dugmesi YOK, onBlur ile kaydedilir).
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

  const onUpdate = useCallback(
    async (id: string, patch: PersonLabelPatch) => {
      try {
        await updatePersonLabel(id, patch)
        refreshLabels()
        refreshCount()
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Kişi kaydedilemedi', 'error')
      }
    },
    [addToast, refreshLabels, refreshCount],
  )

  const onCreate = useCallback(async () => {
    try {
      const created = await createPersonLabel('Yeni Oyuncu')
      pendingFocusIdRef.current = created.id
      refreshLabels()
      refreshCount()
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Kişi eklenemedi', 'error')
    }
  }, [addToast, refreshLabels, refreshCount])

  if (view === 'desk') {
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
        <button type="button" onClick={onOpenOyuncular} style={cardStyle}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-medium)' }}>Oyuncular</span>
          <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)' }}>
            {personCount === null ? '…' : `${personCount} kişi`}
          </span>
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <button type="button" onClick={onBack} style={backButtonStyle}>
        ‹ Oyuncular
      </button>
      {listLoading ? (
        <Loading label="Liste yükleniyor..." />
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 'var(--space-3)' }}>
            <thead>
              <tr>
                <th style={thStyle}>Rol</th>
                <th style={thStyle}>Oyuncu</th>
                <th style={thStyle}>Görev</th>
                <th style={thStyle}>Ajans</th>
                <th style={thStyle}>Menajer</th>
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
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => void onCreate()} style={addButtonStyle}>
            + Kişi ekle
          </button>
        </>
      )}
    </div>
  )
}
