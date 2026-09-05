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

function dutyName(dutyCode: string | null, dutyOptions: DutyOption[]): string {
  if (!dutyCode) return ''
  return dutyOptions.find((d) => d.catalogCode === dutyCode)?.name ?? dutyCode
}

// Panonun bilesen imzasi hicbir kart koduna baglanmaz: yalniz labels, dutyOptions ve geri
// cagrilar alir (I1, kart-ozel dal YASAK). budgetId ve servis cagrilari CAGIRAN tarafta yasar.
// URETIM KAYITLARI duragi geldikten sonra (6 Eylul 2026, KABUK-KARARLARI 12.1) kisi girisi
// oradan yapilir: Rol/Oyuncu/Gorev burada SALT OKUNUR, yalniz ajans ve menajer tikleri
// (ve tik isaretliyken ad haneleri) karttan duzenlenebilir kalir. "+ Kisi ekle" KALKTI.
export function PersonListSheet({
  labels,
  dutyOptions,
  onUpdate,
  onClose,
}: {
  labels: PersonLabel[]
  dutyOptions: DutyOption[]
  onUpdate: (id: string, patch: PersonLabelPatch) => void | Promise<void>
  onClose: () => void
}) {
  return (
    <BottomSheet title="Oyuncular listesi" onClose={onClose}>
      <p style={noteStyle}>Kişi girişi artık Üretim Kayıtları'ndan yapılır.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
            </tr>
          ))}
        </tbody>
      </table>
    </BottomSheet>
  )
}
