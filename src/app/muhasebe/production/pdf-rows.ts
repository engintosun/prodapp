// BOY: tek is = PDF'ten okunan yazi parcalarini satir ve kolona dizmek. Saf islev,
// paket bilmez: okuma import-panel.tsx icindedir. OCR gelirse ayni girdiyi (yazi +
// sayfadaki konum) verecegi icin bu modul onun da dizme katmanidir.
// Kararlarin evi: docs/butce/BUTCE-EKRAN-KARARLARI.md bolum 20, ICE AKTARMA PDF maddesi.

export type PdfTextItem = {
  text: string
  x: number
  y: number
  height: number
  page: number
}

// Ayni kolonun sol kenari satirdan satira birkac nokta kayabilir (sandbox 24 Eylul 2026).
const COLUMN_TOLERANCE = 3
// Bir sol kenar ancak yeterince satirda gorunuyorsa kolondur: baslik bandi ve tek
// satirlik notlar kolon uretmesin.
const MIN_COLUMN_SHARE = 0.2
const MIN_COLUMN_COUNT = 3
// Numara kolonu: dolu hucrelerinin en az bu kadari sayi olan en soldaki kolon
// (24 Eylul 2026 karari). Numarasiz listede birlestirme YAPILMAZ.
const NUMBER_COLUMN_SHARE = 0.8
const NUMBER_CELL = /^\d+[.)]?$/

type Line = { page: number; y: number; items: PdfTextItem[] }

// Sayfa sirasiyla, sayfa icinde yukaridan asagi. Ayni satir: ayni sayfa ve dikey
// fark yazi yuksekliginin yarisindan az.
function groupLines(items: PdfTextItem[]): Line[] {
  const sorted = [...items].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)
  const lines: Line[] = []
  for (const it of sorted) {
    const last = lines[lines.length - 1]
    if (last && last.page === it.page && Math.abs(last.y - it.y) < it.height * 0.5) {
      last.items.push(it)
    } else {
      lines.push({ page: it.page, y: it.y, items: [it] })
    }
  }
  return lines
}

// Kolonlar butun sayfalarin sol kenarlarindan bir kez cikarilir: sayfalar TEK liste.
function columnAnchors(items: PdfTextItem[], lineCount: number): number[] {
  const xs = items.map((i) => i.x).sort((a, b) => a - b)
  const clusters: { min: number; last: number; count: number }[] = []
  for (const x of xs) {
    const c = clusters[clusters.length - 1]
    if (c && x - c.last <= COLUMN_TOLERANCE) {
      c.last = x
      c.count += 1
    } else {
      clusters.push({ min: x, last: x, count: 1 })
    }
  }
  const minCount = Math.max(MIN_COLUMN_COUNT, Math.floor(lineCount * MIN_COLUMN_SHARE))
  const anchors = clusters.filter((c) => c.count >= minCount).map((c) => c.min)
  return anchors.length > 0 ? anchors : [xs[0]]
}

// Parca, sol kenari kendisinden once gelen EN SAGDAKI kolona duser; ilk kolonun
// solundaki parca ilk kolona duser. Ayni hucreye dusen parcalar boslukla birlesir.
function lineToRow(line: Line, anchors: number[]): string[] {
  const row = anchors.map(() => '')
  const ordered = [...line.items].sort((a, b) => a.x - b.x)
  for (const it of ordered) {
    let k = 0
    for (let i = 0; i < anchors.length; i += 1) {
      if (it.x >= anchors[i] - COLUMN_TOLERANCE) k = i
    }
    row[k] = row[k] === '' ? it.text : `${row[k]} ${it.text}`
  }
  return row
}

function hasNumberColumn(rows: string[][]): boolean {
  const filled = rows.map((r) => r[0]).filter((v) => v !== '')
  if (filled.length === 0) return false
  const numbers = filled.filter((v) => NUMBER_CELL.test(v)).length
  return numbers >= filled.length * NUMBER_COLUMN_SHARE
}

// Hucre icinde alt satira kirilan yazi PDF'te ayri satir olarak gelir; satir araligi
// ayirt etmiyor (olculdu). Numara hucresi bos satir ustteki satirin devamidir, yazisi
// ustteki satirin AYNI kolonlarina eklenir.
function mergeContinuations(rows: string[][]): string[][] {
  const out: string[][] = []
  for (const row of rows) {
    const prev = out[out.length - 1]
    if (prev && row[0] === '') {
      row.forEach((v, i) => {
        if (v !== '') prev[i] = prev[i] === '' ? v : `${prev[i]} ${v}`
      })
    } else {
      out.push([...row])
    }
  }
  return out
}

export function pdfItemsToRows(items: PdfTextItem[]): string[][] {
  if (items.length === 0) return []
  const lines = groupLines(items)
  const anchors = columnAnchors(items, lines.length)
  const rows = lines.map((l) => lineToRow(l, anchors))
  return hasNumberColumn(rows) ? mergeContinuations(rows) : rows
}
