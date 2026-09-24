import { describe, expect, it } from 'vitest'
import { pdfItemsToRows } from './pdf-rows'
import type { PdfTextItem } from './pdf-rows'

// Satir kurucu: her hucre [x, yazi]; y yukaridan asagi azalir (PDF koordinati).
function line(page: number, y: number, cells: [number, string][]): PdfTextItem[] {
  return cells.map(([x, text]) => ({ text, x, y, height: 10, page }))
}

describe('pdfItemsToRows', () => {
  it('bos girdi bos liste dondurur', () => {
    expect(pdfItemsToRows([])).toEqual([])
  })

  it('ayni hizadaki parcalar kolona dizilir, Turkce karakter korunur', () => {
    const items = [
      ...line(1, 700, [[50, 'No'], [100, 'Rol'], [250, 'Oyuncu']]),
      ...line(1, 685, [[50, '1'], [100, 'Şükrü'], [250, 'Çağatay Özdemir']]),
      ...line(1, 670, [[50, '2'], [100, 'Gülşen'], [250, 'İpek Ilgın']]),
    ]
    expect(pdfItemsToRows(items)).toEqual([
      ['No', 'Rol', 'Oyuncu'],
      ['1', 'Şükrü', 'Çağatay Özdemir'],
      ['2', 'Gülşen', 'İpek Ilgın'],
    ])
  })

  it('sayfalar tek listede sayfa sirasiyla birlesir', () => {
    const items = [
      ...line(2, 700, [[50, '3'], [100, 'Bekçi'], [250, 'Doğa Güneş']]),
      ...line(1, 700, [[50, '1'], [100, 'Şükrü'], [250, 'Ece Karagöz']]),
      ...line(1, 685, [[50, '2'], [100, 'Muhtar'], [250, 'Barış Ünal']]),
    ]
    expect(pdfItemsToRows(items).map((r) => r[0])).toEqual(['1', '2', '3'])
  })

  it('kolon kaymasi toleransta kalirsa ayni kolona duser', () => {
    const items = [
      ...line(1, 700, [[50, '1'], [100, 'Şükrü'], [250, 'Ece Karagöz']]),
      ...line(1, 685, [[50, '2'], [102, 'Muhtar'], [249, 'Barış Ünal']]),
      ...line(1, 670, [[50, '3'], [101, 'Bekçi'], [251, 'Doğa Güneş']]),
    ]
    expect(pdfItemsToRows(items)[1]).toEqual(['2', 'Muhtar', 'Barış Ünal'])
  })

  it('tek satirlik baslik bandi kolon uretmez, solundaki kolona duser', () => {
    const items = [
      ...line(1, 760, [[180, 'KARANLIK SULAR']]),
      ...line(1, 700, [[50, '1'], [100, 'Şükrü'], [250, 'Ece Karagöz']]),
      ...line(1, 685, [[50, '2'], [100, 'Muhtar'], [250, 'Barış Ünal']]),
      ...line(1, 670, [[50, '3'], [100, 'Bekçi'], [250, 'Doğa Güneş']]),
    ]
    const rows = pdfItemsToRows(items)
    expect(rows[0]).toEqual(['', 'KARANLIK SULAR', ''])
    expect(rows[1]).toHaveLength(3)
  })

  it('numarali listede numarasi bos satir ustteki satirin devamidir', () => {
    const items = [
      ...line(1, 700, [[50, '1'], [100, 'Öğretmen Işık'], [250, 'İpek Ilgın']]),
      ...line(1, 688, [[100, '(flashback']]),
      ...line(1, 676, [[100, 'sahnesi)']]),
      ...line(1, 660, [[50, '2'], [100, 'Muhtar'], [250, 'Barış Ünal']]),
      ...line(1, 645, [[50, '3'], [100, 'Bekçi'], [250, 'Doğa Güneş']]),
    ]
    expect(pdfItemsToRows(items)).toEqual([
      ['1', 'Öğretmen Işık (flashback sahnesi)', 'İpek Ilgın'],
      ['2', 'Muhtar', 'Barış Ünal'],
      ['3', 'Bekçi', 'Doğa Güneş'],
    ])
  })

  it('numarasiz listede ilk hucresi bos satir birlestirilmez', () => {
    const items = [
      ...line(1, 700, [[100, 'Öğretmen Işık'], [250, 'İpek Ilgın']]),
      ...line(1, 685, [[250, 'Ece Karagöz']]),
      ...line(1, 670, [[100, 'Muhtar'], [250, 'Barış Ünal']]),
      ...line(1, 655, [[100, 'Bekçi'], [250, 'Doğa Güneş']]),
    ]
    const rows = pdfItemsToRows(items)
    expect(rows).toHaveLength(4)
    expect(rows[1]).toEqual(['', 'Ece Karagöz'])
  })
})
