// BOY: tek is = Uretim Kayitlari icin Excel/CSV ice aktarma ara ekrani (dosya sec ->
// oku -> baslik satiri ve kolon eslestirmesini onayla -> createPersonLabels ile toplu
// doger). Bu dosya production-records-screen.tsx'i DEGISTIRMEZ, ayri bir panel olarak
// acilir/kapanir (sozlesme: onCancel/onImported). CSS belirtecleri bu ekrandan
// ODUNC alinir, YENI belirtec UYDURULMAZ.
import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
// read-excel-file 9.3.10'da paket kokunde export YOK (package.json "exports" haritasi
// yalniz alt yollari taniyor); "browser yapisini kullan, /node DEGIL" karari bu yuzden
// alt yol olarak yazildi - bare import derlenmiyordu (gercek paket, tahmin edilen kod
// degil kazandi).
import readXlsxFile from 'read-excel-file/browser'
import { createPersonLabels } from '../../../shared/supabase/person-label-service'

type ColumnKind = 'Rol' | 'Oyuncu' | 'Alma'
type Phase = 'pick' | 'reading' | 'preview' | 'error'

const panelStyle = {
  padding: 'var(--space-4)',
}

const dropBoxStyle = {
  border: '1px dashed var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-4)',
  textAlign: 'center' as const,
  color: 'var(--color-text-muted)',
  fontSize: 'var(--text-sm)',
}

const buttonStyle = {
  background: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-3)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  cursor: 'pointer',
}

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.5,
  cursor: 'not-allowed' as const,
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center' as const,
  gap: 'var(--space-2)',
  marginTop: 'var(--space-3)',
}

const selectStyle = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  fontFamily: 'inherit',
}

const tdStyle = {
  padding: 'var(--space-1) var(--space-1)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  borderBottom: '1px solid var(--color-border)',
}

// Hucre daima string'e cevrilir: xlsx sayi/tarih/boolean dondurebilir, csv zaten
// string dondurur ama trim burada tek yerde yapilir.
function toCell(cell: unknown): string {
  return cell == null ? '' : String(cell).trim()
}

// JSON'da kolon YOKTUR, ANAHTAR vardir. Anahtarlar kolon yerine gecer: donen dizinin
// 0. satiri anahtarlardan, sonrakiler degerlerden kurulur. Ara ekran boylece hic
// degismeden calisir.
// Ic ice deger (nesne/dizi) hucreye YAZILMAZ, bos birakilir: String({}) "[object
// Object]" uretirdi ve bu kullaniciya gosterilecek bir sey degil.
function jsonCell(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'object') return ''
  return String(v).trim()
}

// TAHMIN SINIRI: yalniz nesne dizisi. Tek anahtarli sarmal acilir (belirsizlik yok);
// birden cok dizi varsa hangisinin kadro oldugu tahmin olurdu, hata verilir.
function parseJson(text: string): string[][] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Dosya geçerli bir JSON değil')
  }
  let list: unknown = data
  if (!Array.isArray(list) && data !== null && typeof data === 'object') {
    const arrays = Object.values(data as Record<string, unknown>).filter((v) => Array.isArray(v))
    if (arrays.length !== 1) {
      throw new Error('JSON içinde tek bir kayıt listesi bulunamadı')
    }
    list = arrays[0]
  }
  if (!Array.isArray(list)) {
    throw new Error('JSON içinde kayıt listesi bulunamadı')
  }
  if (list.length === 0) return []
  const bozuk = list.some((r) => r === null || typeof r !== 'object' || Array.isArray(r))
  if (bozuk) {
    throw new Error('JSON listesindeki her kayıt bir nesne olmalı')
  }
  const rows = list as Record<string, unknown>[]
  // Anahtar kumesi TUM kayitlarin birlesimidir, ilk gorulme sirasiyla: kayitlarin
  // anahtar takimi farkli olabilir, yalniz ilkine bakmak kolon dusururdu.
  const keys: string[] = []
  for (const r of rows) {
    for (const k of Object.keys(r)) {
      if (!keys.includes(k)) keys.push(k)
    }
  }
  if (keys.length === 0) return []
  return [keys, ...rows.map((r) => keys.map((k) => jsonCell(r[k])))]
}

// Ayirici TAHMIN edilmez, OLCULUR: ilk satirdaki ';' sayisi ','dan fazlaysa ';'
// kullanilir. Turkce Excel CSV'yi noktali virgulle yazar (sandbox turu 6 Eylul 2026).
// Cift tirnak icindeki ayirici ve satir sonu alan icinde sayilir; "" ikili tirnak
// tek tirnak demektir. \r\n ve \n ikisi de satir sonu sayilir.
function parseCsv(text: string): string[][] {
  const withoutBom = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const firstLineEnd = withoutBom.search(/\r\n|\n/)
  const firstLine = firstLineEnd === -1 ? withoutBom : withoutBom.slice(0, firstLineEnd)
  const semiCount = (firstLine.match(/;/g) ?? []).length
  const commaCount = (firstLine.match(/,/g) ?? []).length
  const delimiter = semiCount > commaCount ? ';' : ','

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const n = withoutBom.length
  while (i < n) {
    const ch = withoutBom[i]
    if (inQuotes) {
      if (ch === '"') {
        if (withoutBom[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }
    if (ch === '"') {
      inQuotes = true
      i += 1
      continue
    }
    if (ch === delimiter) {
      row.push(field)
      field = ''
      i += 1
      continue
    }
    if (ch === '\r' && withoutBom[i + 1] === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 2
      continue
    }
    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 1
      continue
    }
    field += ch
    i += 1
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

type XlsxCell = string | number | boolean | Date | null
type XlsxRow = XlsxCell[]

// Sandbox turu 6 Eylul 2026: donen deger duz satir dizisi DEGIL, sayfa sarmali
// ({sheet, data}) olabiliyor. Savunmaci normalize burada, tek yerde.
async function readXlsxRows(file: File): Promise<string[][]> {
  const out: unknown = await readXlsxFile(file)
  const first = Array.isArray(out) ? out[0] : undefined
  const sheetRows: XlsxRow[] = Array.isArray(first)
    ? (out as XlsxRow[])
    : ((first as { data?: XlsxRow[] } | undefined)?.data ?? [])
  return sheetRows.map((r) => r.map(toCell))
}

// Baslik metnine gore Rol/Oyuncu/Alma onerisi. toLocaleLowerCase('tr') kullanilir:
// JS'in varsayilan kucultmesi 'I' harfinde Turkce icin yanlis sonuc verir.
// SIRA ONEMLI: "Karakter Adi" once Rol kuralina, "Oyuncu Adi" Oyuncu kuralina dusmeli.
function suggestColumnKind(headerText: string): ColumnKind {
  const t = headerText.toLocaleLowerCase('tr')
  if (['karakter', 'rol', 'role', 'character'].some((k) => t.includes(k))) return 'Rol'
  if (['oyuncu', 'cast', 'actor', 'artist', 'sanatci', 'isim', 'ad'].some((k) => t.includes(k))) return 'Oyuncu'
  return 'Alma'
}

// Baslik satiri onerisi: bos olmayan hucresi 2+ olan ILK satir (ilk 10 aday icinde,
// dropdown zaten bununla sinirli). Yoksa satir 1 (index 0).
function suggestHeaderRow(rows: string[][]): number {
  const candidateCount = Math.min(10, rows.length)
  for (let i = 0; i < candidateCount; i++) {
    const nonEmpty = rows[i].filter((c) => c !== '').length
    if (nonEmpty >= 2) return i
  }
  return 0
}

export function ImportPanel({
  onCancel,
  onImported,
}: {
  onCancel: () => void
  onImported: (count: number) => void
}) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [errorMsg, setErrorMsg] = useState('')
  const [rows, setRows] = useState<string[][]>([])
  const [headerRow, setHeaderRow] = useState(0)
  const [columnMap, setColumnMap] = useState<ColumnKind[]>([])
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setPhase('reading')
    try {
      const lower = file.name.toLowerCase()
      let parsed: string[][]
      if (lower.endsWith('.xlsx')) {
        parsed = await readXlsxRows(file)
      } else if (lower.endsWith('.csv')) {
        const text = await file.text()
        parsed = parseCsv(text).map((r) => r.map(toCell))
      } else if (lower.endsWith('.json')) {
        const text = await file.text()
        parsed = parseJson(text)
      } else {
        throw new Error('Yalnızca .xlsx, .csv ve .json okunur')
      }
      if (parsed.length === 0) {
        throw new Error('Dosyada satır bulunamadı')
      }
      const suggested = suggestHeaderRow(parsed)
      setRows(parsed)
      setHeaderRow(suggested)
      setColumnMap((parsed[suggested] ?? []).map((c) => suggestColumnKind(c)))
      setPhase('preview')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Dosya okunamadı')
      setPhase('error')
    }
  }, [])

  // Baslik satiri elle degistirilince kolon eslestirmesi BASTAN onerilir: baslik
  // hucreleri degisti, oneri de onunla birlikte degismeli. setHeaderRow ve
  // setColumnMap AYNI olay isleyicisinde birlikte yazilir - araya bir render
  // girip eski eslestirmeyi yeni baslikla eslesmemis halde gostermesin diye.
  const onHeaderRowChange = useCallback(
    (newIndex: number) => {
      setHeaderRow(newIndex)
      setColumnMap((rows[newIndex] ?? []).map((c) => suggestColumnKind(c)))
    },
    [rows],
  )

  const onFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (file) void handleFile(file)
    },
    [handleFile],
  )

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) void handleFile(file)
    },
    [handleFile],
  )

  const oyuncuIdx = columnMap.findIndex((k) => k === 'Oyuncu')
  const rolIdx = columnMap.findIndex((k) => k === 'Rol')
  const dataRows = rows.slice(headerRow + 1)
  const foundCount = oyuncuIdx === -1 ? 0 : dataRows.filter((r) => (r[oyuncuIdx] ?? '') !== '').length

  const onImportClick = useCallback(async () => {
    if (oyuncuIdx === -1) return
    const toImport = dataRows
      .filter((r) => (r[oyuncuIdx] ?? '') !== '')
      .map((r) => ({
        name: r[oyuncuIdx] ?? '',
        roleName: rolIdx === -1 ? null : (r[rolIdx] ?? ''),
      }))
    setImporting(true)
    setImportError(null)
    try {
      const count = await createPersonLabels(toImport)
      onImported(count)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'İçe aktarma başarısız')
    } finally {
      setImporting(false)
    }
  }, [oyuncuIdx, rolIdx, dataRows, onImported])

  if (phase === 'pick') {
    return (
      <div style={panelStyle}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
          Excel (.xlsx), CSV veya JSON dosyası seçin
        </p>
        <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} style={dropBoxStyle}>
          Dosyayı buraya sürükleyin
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.json"
          onChange={onFileInputChange}
          style={{ display: 'none' }}
        />
        <div style={rowStyle}>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={buttonStyle}>
            Dosya seç
          </button>
          <button type="button" onClick={onCancel} style={buttonStyle}>
            Vazgeç
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'reading') {
    return (
      <div style={panelStyle}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Dosya okunuyor…</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div style={panelStyle}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{errorMsg}</p>
        <div style={rowStyle}>
          <button type="button" onClick={() => setPhase('pick')} style={buttonStyle}>
            Başka dosya seç
          </button>
          <button type="button" onClick={onCancel} style={buttonStyle}>
            Vazgeç
          </button>
        </div>
      </div>
    )
  }

  // phase === 'preview'
  const headerCells = rows[headerRow] ?? []
  const headerCandidateCount = Math.min(10, rows.length)

  return (
    <div style={panelStyle}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.slice(0, 6).map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci} style={tdStyle}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={rowStyle}>
        <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>Başlık satırı</label>
        <select
          value={headerRow}
          onChange={(e) => onHeaderRowChange(Number(e.target.value))}
          style={selectStyle}
        >
          {Array.from({ length: headerCandidateCount }, (_, i) => i).map((i) => (
            <option key={i} value={i}>
              {`Satır ${i + 1}: ${rows[i].slice(0, 3).join(' ')}`}
            </option>
          ))}
        </select>
      </div>

      {/* Kolon sayisi secili satirin hucre sayisidir; veri satirlarinda bastan
          TASAN hucreler okunmaz - adsiz kolonun ne oldugu bilinmez, tahmin edilmez. */}
      <div style={{ marginTop: 'var(--space-3)' }}>
        {headerCells.map((cell, i) => (
          <div key={i} style={rowStyle}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', minWidth: 120 }}>
              {cell || `Kolon ${i + 1}`}
            </span>
            <select
              value={columnMap[i] ?? 'Alma'}
              onChange={(e) =>
                setColumnMap((prev) => prev.map((v, idx) => (idx === i ? (e.target.value as ColumnKind) : v)))
              }
              style={selectStyle}
            >
              <option value="Rol">Rol</option>
              <option value="Oyuncu">Oyuncu</option>
              <option value="Alma">Alma</option>
            </select>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
        {oyuncuIdx === -1 ? 'Oyuncu kolonunu seçin' : `${foundCount} kişi bulundu`}
      </p>

      {importError && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{importError}</p>}

      {/* BILEREK YAPILMADI: ayni ad listede varsa uyari yok, ikinci kez eklenir - ayni
          ad iki gercek kisi olabilir, birlestirmek de engellemek de tahmin olurdu.
          Gorev/Ajans/Menajer TAHMIN EDILMEZ, bos gelir. Duzenleme/silme/satir cikarma
          yok - bu ekranda yapilan tek is satir ve kolon secimidir. */}
      <div style={rowStyle}>
        <button
          type="button"
          onClick={() => void onImportClick()}
          disabled={oyuncuIdx === -1 || importing}
          style={oyuncuIdx === -1 || importing ? disabledButtonStyle : buttonStyle}
        >
          Aktar
        </button>
        <button type="button" onClick={onCancel} style={buttonStyle}>
          Vazgeç
        </button>
      </div>
    </div>
  )
}
