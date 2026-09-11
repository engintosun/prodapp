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
import { unzipSync, strFromU8 } from 'fflate'
import { createPersonLabels } from '../../../shared/supabase/person-label-service'

type ColumnKind = 'Rol' | 'Oyuncu' | 'Alma'
// Bir dosya birden cok kaynak tasiyabilir: Excel'de sayfa, Word'de tablo.
// CSV ve JSON tek kaynaklidir, tek elemanli liste olarak gelir.
type Sheet = { name: string; rows: string[][] }
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
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  gap: 'var(--space-2)',
}

// SURUKLEME DONUSU (surukleme kutunun UZERINDEYKEN cerceve ve zemin degisir): mevcut
// token kumesinden odunc alinir, yeni token TANIMLANMAZ.
const dropBoxActiveStyle = {
  ...dropBoxStyle,
  border: '1px dashed var(--color-primary)',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
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

// Sandbox turu 6 Eylul 2026: getSheets TUM sayfalari tek cagrida veriyor ve tek
// sayfali dosyada da ayni bicimi donduruyor.
// ONCEKI HALI KUSURLUYDU: duz cagri yalniz ILK sayfayi aliyordu ve kullaniciya
// soylemiyordu; uc sayfali bir dosyada "Kapak" sayfasi iceri aliniyordu.
// { sheet: n } ve { sheet: 'Ad' } bu yapida CALISMIYOR (ikisi de ilk sayfayi
// donduruyor), o yuzden kullanilmiyor.
// TIP DONUSUMU GEREKCESI: getSheets calisma zamaninda calisiyor (olculdu) ama
// paketin Options tipinde TANIMLI DEGIL; nesne degismezi oldugu gibi verilirse
// TypeScript bilinmeyen alan diye reddeder. Donusum bu bosluk icindir, baska bir
// sey icin degil.
type XlsxSheetOut = { sheet?: string; data?: XlsxRow[] }
async function readXlsxSheets(file: File): Promise<Sheet[]> {
  const readAll = readXlsxFile as unknown as (f: File, o: { getSheets: true }) => Promise<unknown>
  const out: unknown = await readAll(file, { getSheets: true })
  const list: XlsxSheetOut[] = Array.isArray(out) ? (out as XlsxSheetOut[]) : []
  return list.map((s, i) => ({
    name: s.sheet ?? `Sayfa ${i + 1}`,
    rows: (s.data ?? []).map((r) => r.map(toCell)),
  }))
}

// docx bir zip'tir; govde word/document.xml icindedir. Tablo <w:tbl>, satir <w:tr>,
// hucre <w:tc>, metin <w:t>. XML icin PAKET YOK: tarayicinin DOMParser'i kullanilir.
// YALNIZ TABLO okunur: duz metinde kolon yoktur, ayirici tahmin etmek gerekirdi.
// IC ICE TABLO TUZAGI (olculdu, sandbox 6 Eylul 2026): getElementsByTagName
// OZYINELEMELIDIR, ic tablonun satirlarini dis tabloya karistirir. Bu yuzden her
// seviyede yalniz DOGRUDAN COCUK gezilir ve ust seviye tablolar suzulur.
function directChildren(el: Element, name: string): Element[] {
  return Array.from(el.children).filter((c) => c.tagName === name)
}

// Hucre metni w:p > w:r > w:t derinliginde durur, o yuzden derine inilir; ama IC
// TABLONUN icine GIRILMEZ, yoksa ic tablonun metni dis hucreye sizar.
function docxCellText(tc: Element): string {
  const parts: string[] = []
  const walk = (node: Element) => {
    for (const c of Array.from(node.children)) {
      if (c.tagName === 'w:tbl') continue
      if (c.tagName === 'w:t') parts.push(c.textContent ?? '')
      else walk(c)
    }
  }
  walk(tc)
  return parts.join('').trim()
}

async function readDocxTables(file: File): Promise<Sheet[]> {
  const buf = await file.arrayBuffer()
  const files = unzipSync(new Uint8Array(buf))
  const doc = files['word/document.xml']
  if (!doc) throw new Error('Belge gövdesi okunamadı')
  const xml = new DOMParser().parseFromString(strFromU8(doc), 'application/xml')
  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Belge çözülemedi')
  }
  const all = Array.from(xml.getElementsByTagName('w:tbl'))
  const top = all.filter((t) => !all.some((o) => o !== t && o.contains(t)))
  if (top.length === 0) throw new Error('Belgede tablo bulunamadı')
  return top.map((tbl, i) => ({
    name: `Tablo ${i + 1}`,
    rows: directChildren(tbl, 'w:tr').map((tr) => directChildren(tr, 'w:tc').map(docxCellText)),
  }))
}

// EN COK SATIRLI kaynak onerilir: kadro genelde en uzun tablodur, kapak ve not
// sayfalari kisadir. Kullanici degistirebilir.
function suggestSheet(sheets: Sheet[]): number {
  let best = 0
  for (let i = 1; i < sheets.length; i += 1) {
    if (sheets[i].rows.length > sheets[best].rows.length) best = i
  }
  return best
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
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [sheetIndex, setSheetIndex] = useState(0)
  const [rows, setRows] = useState<string[][]>([])
  const [headerRow, setHeaderRow] = useState(0)
  const [columnMap, setColumnMap] = useState<ColumnKind[]>([])
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setPhase('reading')
    try {
      const lower = file.name.toLowerCase()
      let found: Sheet[]
      if (lower.endsWith('.xlsx')) {
        found = await readXlsxSheets(file)
      } else if (lower.endsWith('.docx')) {
        found = await readDocxTables(file)
      } else if (lower.endsWith('.csv')) {
        const text = await file.text()
        found = [{ name: 'CSV', rows: parseCsv(text).map((r) => r.map(toCell)) }]
      } else if (lower.endsWith('.json')) {
        const text = await file.text()
        found = [{ name: 'JSON', rows: parseJson(text) }]
      } else {
        throw new Error('Yalnızca .xlsx, .docx, .csv ve .json okunur')
      }
      const nonEmpty = found.filter((s) => s.rows.length > 0)
      if (nonEmpty.length === 0) {
        throw new Error('Dosyada satır bulunamadı')
      }
      const pick = suggestSheet(nonEmpty)
      const parsed = nonEmpty[pick].rows
      const suggested = suggestHeaderRow(parsed)
      setSheets(nonEmpty)
      setSheetIndex(pick)
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

  // Kaynak degisince baslik satiri ve kolon eslestirmesi YENIDEN onerilir: onceki
  // kaynagin secimleri yeni kaynakta anlamsizdir.
  const onSheetChange = useCallback(
    (newIndex: number) => {
      const next = sheets[newIndex]?.rows ?? []
      const suggested = suggestHeaderRow(next)
      setSheetIndex(newIndex)
      setRows(next)
      setHeaderRow(suggested)
      setColumnMap((next[suggested] ?? []).map((c) => suggestColumnKind(c)))
    },
    [sheets],
  )

  const onFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (file) void handleFile(file)
    },
    [handleFile],
  )

  const onDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  // TUZAK (prompta yazili): onDragLeave kutunun ICINDEKI her cocuga geciste de
  // atesleniyor, sayac olmadan kutu surukleme boyunca yanip soner. Sayac yerine
  // relatedTarget denetimi secildi: imlecin GERCEKTEN kutunun disina cikip cikmadigini
  // sorar, cocuk sayisina bagli bir durum tutmaz.
  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
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
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          style={isDragging ? dropBoxActiveStyle : dropBoxStyle}
        >
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            Excel (.xlsx), Word (.docx), CSV veya JSON dosyası seçin
          </p>
          <p style={{ margin: 0 }}>Dosyayı buraya sürükleyin</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={buttonStyle}>
            Dosya seç
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.docx,.csv,.json"
          onChange={onFileInputChange}
          style={{ display: 'none' }}
        />
        <div style={rowStyle}>
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

      {sheets.length > 1 && (
        <div style={rowStyle}>
          <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>Kaynak</label>
          <select
            value={sheetIndex}
            onChange={(e) => onSheetChange(Number(e.target.value))}
            style={selectStyle}
          >
            {sheets.map((s, i) => (
              <option key={i} value={i}>
                {`${s.name} (${s.rows.length} satır)`}
              </option>
            ))}
          </select>
        </div>
      )}

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
