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
  deletePersonLabel,
  deletePersonLabels,
  fetchDutyOptions,
} from '../../../shared/supabase/person-label-service'
import type { PersonLabel, PersonLabelPatch, DutyOption } from '../../../shared/supabase/person-label-service'
import { ImportPanel } from './import-panel'

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

// Sutun genislikleri CIVILI (Engin karari, 6 Eylul 2026). Sebep: tablo genisligini
// icerige birakinca ajans/menajer ad hanesi dogdugunda butun tablo yeniden ciziliyor,
// dokunulmamis satirlar da oynuyordu. Olcek emsali kart masasidir
// (budget/components/table-styles.ts) ama o dosya IMPORT EDILMEZ: bu ekran butceyi
// hic gormez, bagimsiz kalmasi yuzeyin tasinabilirliginin sartidir.
// Esneklik tek sutunda: Oyuncu (kart masasindaki adMin ile ayni is, ayni sayi).
const colWidths = {
  // 32 = kart masasindaki No sutunuyla ayni sayi: uc haneli rakam ve hucre dolgusu
  // bu olcuye oturur. Daha genis olmasi istenmedi (Engin, 6 Eylul 2026).
  no: 32,
  rol: 160,
  oyuncuMin: 212,
  gorev: 160,
  ajans: 190,
  menajer: 190,
  // 28 = kart masasindaki silme sutunuyla ayni sayi. Sec ve sil sutunlari ayni anda
  // GORUNMEZ, o yuzden tablo tabanina bir kez eklenir.
  sil: 28,
} as const

const tableMinWidth =
  colWidths.no + colWidths.rol + colWidths.oyuncuMin + colWidths.gorev + colWidths.ajans + colWidths.menajer + colWidths.sil

// Rakam satirin geri kalaniyla ayni boyda okunsun: hucrelerdeki girdiler text-sm
// kullaniyor, tablo govdesi kendi basina birakilirsa rakam onlardan iri cikar.
// Renk/ton bu turun disinda, dokunulmuyor.
const noCellStyle = {
  padding: 'var(--space-1) var(--space-1)',
  fontSize: 'var(--text-sm)',
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

// Civili hucrede ad kutusu tasmasin: onay kutusu kuculmez, ad kutusu kalani alir ve
// kendi asgari genisliginin ALTINA inebilir. minWidth 0 olmadan flex kutuyu kucultmez.
const tickBoxStyle = {
  flexShrink: 0,
}

const tickNameInputStyle = {
  ...inputStyle,
  width: 'auto',
  flex: '1 1 0',
  minWidth: 0,
}

const deleteButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: 'var(--text-sm)',
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
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

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

  const onDelete = useCallback(
    async (id: string) => {
      // Emsal: kart masasi (card-table-screen.tsx 298) ayni soruyu window.confirm ile soruyor.
      const ok = window.confirm('Bu kişiyi silmek istiyor musun?')
      if (!ok) return
      try {
        await deletePersonLabel(id)
        await refreshLabels()
        refreshCount()
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Kişi silinemedi', 'error')
      }
    },
    [addToast, refreshLabels, refreshCount],
  )

  const onDeleteSelected = useCallback(async () => {
    const ids = selectedIds
    if (ids.length === 0) return
    const ok = window.confirm(`${ids.length} kişiyi silmek istiyor musun?`)
    if (!ok) return
    try {
      const { deleted, blocked } = await deletePersonLabels(ids)
      setSelectMode(false)
      setSelectedIds([])
      await refreshLabels()
      refreshCount()
      if (deleted === 0) {
        addToast('Seçilenlerin hepsi bütçede kullanılıyor, silinemedi', 'error')
      } else if (blocked > 0) {
        addToast(`${deleted} silindi, ${blocked} tanesi bütçede kullanıldığı için kaldı`, 'warning')
      } else {
        addToast(`${deleted} kişi silindi`, 'success')
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Silme başarısız', 'error')
    }
  }, [addToast, refreshLabels, refreshCount, selectedIds])

  // Hiyerarsi kutuphaneden gelir, burada UYDURULMAZ: fetchDutyOptions gorevleri
  // catalog_code sirasinda cekiyor (1601 Basrol, 1602 Yardimci, 1603 Gunluk, sonra
  // Dublor basliginin gorevleri), yani dutyOptions dizisindeki SIRA hiyerarsinin
  // kendisidir. Ikinci bir siralama alani acilmadi.
  // Gorevi secilmemis kisi SONA duser: kisi "+ Kisi ekle" ile listenin altinda dogar
  // ve adi orada yazilir; uste tasinsaydi satir elden kacardi.
  // Ayni gorevtekiler arasinda servisin getirdigi sira KORUNUR (yazim sirasi):
  // Array.prototype.sort kararlidir, ikinci anahtar gerekmez.
  // Siralama EKRANIN ICINDE yapilir; fetchPersonLabels kart masasinin kisi panosu
  // tarafindan da cagriliyor, servise dokunulursa oranin sirasi da degisirdi.
  const dutyRank = new Map(dutyOptions.map((d, i): [string, number] => [d.catalogCode, i]))
  const rankOf = (code: string | null) => dutyRank.get(code ?? '') ?? dutyOptions.length
  const sortedLabels = labels.slice().sort((a, b) => rankOf(a.dutyCode) - rankOf(b.dutyCode))

  if (importOpen && view !== 'desk') {
    return (
      <ImportPanel
        onCancel={() => setImportOpen(false)}
        onImported={(n) => {
          setImportOpen(false)
          addToast(`${n} kişi eklendi`, 'success')
          void refreshLabels()
          void refreshCount()
        }}
      />
    )
  }

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
          <table style={{ width: '100%', minWidth: tableMinWidth, borderCollapse: 'collapse', tableLayout: 'fixed', marginTop: 'var(--space-3)' }}>
            <colgroup>
              <col style={{ width: selectMode ? colWidths.sil : colWidths.no }} />
              {selectMode && <col style={{ width: colWidths.no }} />}
              <col style={{ width: colWidths.rol }} />
              <col style={{ minWidth: colWidths.oyuncuMin }} />
              <col style={{ width: colWidths.gorev }} />
              <col style={{ width: colWidths.ajans }} />
              <col style={{ width: colWidths.menajer }} />
              {!selectMode && <col style={{ width: colWidths.sil }} />}
            </colgroup>
            <thead>
              <tr>
                {selectMode && <th style={thStyle}></th>}
                <th style={thStyle}>No</th>
                <th style={thStyle}>Rol</th>
                <th style={thStyle}>Oyuncu</th>
                <th style={thStyle}>Görev</th>
                <th style={thStyle}>Ajans</th>
                <th style={thStyle}>Menajer</th>
                {!selectMode && <th style={thStyle}></th>}
              </tr>
            </thead>
            <tbody>
              {sortedLabels.map((l, i) => (
                <tr key={l.id}>
                  {selectMode && (
                    <td style={tdStyle}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(l.id)}
                        style={tickBoxStyle}
                        onChange={(e) =>
                          setSelectedIds((prev) =>
                            e.target.checked ? [...prev, l.id] : prev.filter((v) => v !== l.id),
                          )
                        }
                      />
                    </td>
                  )}
                  <td style={noCellStyle}>{i + 1}</td>
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
                        style={tickBoxStyle}
                        onChange={(e) => void onUpdate(l.id, e.target.checked ? { hasAgency: true } : { hasAgency: false, agencyName: '' })}
                      />
                      {l.hasAgency && (
                        <input
                          defaultValue={l.agencyName ?? ''}
                          onBlur={(e) => void onUpdate(l.id, { agencyName: e.target.value })}
                          placeholder="Ajans adı"
                          style={tickNameInputStyle}
                        />
                      )}
                    </label>
                  </td>
                  <td style={tdStyle}>
                    <label style={tickLabelStyle}>
                      <input
                        type="checkbox"
                        checked={l.hasManager}
                        style={tickBoxStyle}
                        onChange={(e) => void onUpdate(l.id, e.target.checked ? { hasManager: true } : { hasManager: false, managerName: '' })}
                      />
                      {l.hasManager && (
                        <input
                          defaultValue={l.managerName ?? ''}
                          onBlur={(e) => void onUpdate(l.id, { managerName: e.target.value })}
                          placeholder="Menajer adı"
                          style={tickNameInputStyle}
                        />
                      )}
                    </label>
                  </td>
                  {!selectMode && (
                    <td style={tdStyle}>
                      <button type="button" onClick={() => void onDelete(l.id)} style={deleteButtonStyle} title="Sil">
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {selectMode ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedIds(sortedLabels.map((l) => l.id))}
                style={addButtonStyle}
              >
                Hepsini seç
              </button>
              <button
                type="button"
                onClick={() => void onDeleteSelected()}
                disabled={selectedIds.length === 0}
                style={addButtonStyle}
              >
                Sil ({selectedIds.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectMode(false)
                  setSelectedIds([])
                }}
                style={addButtonStyle}
              >
                Vazgeç
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => void onCreate()} style={addButtonStyle}>
                + Kişi ekle
              </button>
              <button type="button" onClick={() => setImportOpen(true)} style={addButtonStyle}>
                İçe aktar
              </button>
              <button type="button" onClick={() => setSelectMode(true)} style={addButtonStyle}>
                Seç
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
