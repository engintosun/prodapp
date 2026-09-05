import type { BudgetItemRow } from '../../../../shared/supabase/budget-service'
import type { PersonLabel } from '../../../../shared/supabase/person-label-service'
import { BottomSheet } from './bottom-sheet'

// KART tarafi kisi secimi GOREV hanesine gore suzulur (Engin karari, 6 Eylul 2026):
// YON TEK TARAFLI, kart listeden OKUR, liste karta YAZMAZ. Bilesenin imzasi hicbir kart
// koduna baglanmaz (I1, kart-ozel dal YASAK) - pano yalniz dutyCodes ve rowCatalogCode alir.
export function PersonPickSheet({
  item,
  labels,
  dutyCodes,
  rowCatalogCode,
  onCommit,
  onClose,
}: {
  item: BudgetItemRow
  labels: PersonLabel[]
  dutyCodes: ReadonlySet<string>
  rowCatalogCode: string | null
  onCommit: (id: string, field: 'personObjectId', value: string) => void | Promise<void>
  onClose: () => void
}) {
  const pick = (value: string) => {
    void onCommit(item.id, 'personObjectId', value)
    onClose()
  }

  // Gorevi bos birakilmis kisi (dutyCode null) HER satirda gorunur - yoksa gorevini
  // secmemis kullanici hicbir satira kisi koyamaz, kilitlenir.
  const isDutyRow = rowCatalogCode !== null && dutyCodes.has(rowCatalogCode)
  const filteredLabels = isDutyRow ? labels.filter((l) => l.dutyCode === rowCatalogCode || l.dutyCode === null) : labels

  return (
    <BottomSheet title={<>#{item.itemCode} {item.name}</>} onClose={onClose}>
      <ul style={{ margin: 0, marginTop: 0, padding: 0, listStyle: 'none' }}>
        {filteredLabels.length === 0 && (
          <li style={{ padding: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Bu görevde kayıtlı kişi yok - Üretim Kayıtları'ndan ekleyin.
          </li>
        )}
        {filteredLabels.map((l) => {
          const active = item.personObjectId === l.id
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => pick(l.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--space-2)',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                  fontSize: 'var(--text-sm)',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-primary)' : 'var(--color-text)',
                }}
              >
                {l.name}
                {l.roleName ? ` (${l.roleName})` : ''}
              </button>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => pick('')}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: 'var(--space-2)',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              fontSize: 'var(--text-sm)',
              fontWeight: item.personObjectId === null ? 600 : 400,
              color: item.personObjectId === null ? 'var(--color-primary)' : 'var(--color-text)',
            }}
          >
            Kişisiz
          </button>
        </li>
      </ul>
    </BottomSheet>
  )
}
