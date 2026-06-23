import { describe, it, expect } from 'vitest'
import { brutBirim, satirToplam, kdvAyristir, zincirToplam, dokum, brutStopaj } from './cfe'

describe('CFE — öngörülen tarafı', () => {
  it('brüt birim yuvarlanmaz', () => {
    expect(brutBirim(8250, [33])).toBe(10972.5)
    expect(brutBirim(75000, [33])).toBe(99750)
  })
  it('satır toplamı tam TL, yarı yukarı', () => {
    expect(satirToplam(8250, [33], 1.75, 2)).toBe(38404)
    expect(satirToplam(75000, [33], 1.75, 1)).toBe(174563)
    expect(satirToplam(1000, [23.45], 1, 1)).toBe(1235)
    expect(satirToplam(1000, [23.449], 1, 1)).toBe(1234)
  })
  it('çoklu yük bileşeni toplanır (17+16=33)', () => {
    expect(satirToplam(8250, [17, 16], 1.75, 2)).toBe(38404)
  })
  it('0 kalem toplama 0 katar', () => {
    expect(satirToplam(0, [33], 5, 5)).toBe(0)
  })
  it('önce-yuvarla-sonra-topla: iki satır 100,40 → 200 (201 değil)', () => {
    const a = satirToplam(100.40, [], 1, 1)
    const b = satirToplam(100.40, [], 1, 1)
    expect(a).toBe(100)
    expect(b).toBe(100)
    expect(a + b).toBe(200)
  })
})

describe('CFE — gerçekleşen (belge) tarafı', () => {
  it('KDV kuruşta, net+KDV=brüt birebir', () => {
    const r1 = kdvAyristir(1000, 20)
    expect(r1.net).toBe(833.33)
    expect(r1.vat).toBe(166.67)
    expect(r1.net + r1.vat).toBeCloseTo(1000, 2)
    const r2 = kdvAyristir(1234.56, 20)
    expect(r2.net).toBe(1028.80)
    expect(r2.vat).toBe(205.76)
    expect(r2.net + r2.vat).toBeCloseTo(1234.56, 2)
  })
})

describe('CFE — zincir (B12)', () => {
  it('sıralı, her adım tam TL', () => {
    const z = zincirToplam(1234567, 7.5, 12)
    expect(z.totalCost).toBe(1327160)
    expect(z.grandTotal).toBe(1486419)
  })
})

describe('CFE — döküm', () => {
  it('ekrandaki cümle', () => {
    expect(dokum({ unitNet: 8250, ratesPercent: [33], unitLabel: 'hafta', quantity: 1.75, multiplier: 2 }))
      .toBe('8.250 net + %33 yük = 10.972,50 × 1,75 hafta × 2 adet = 38.404')
    expect(dokum({ unitNet: 75000, ratesPercent: [33], unitLabel: 'hafta', quantity: 1.75, multiplier: 1 }))
      .toBe('75.000 net + %33 yük = 99.750 × 1,75 hafta = 174.563')
  })
})

describe('CFE — stopaj şişmesi (net garanti)', () => {
  it('brüt = net bölü (1 - oran), yuvarlanmaz', () => {
    expect(brutStopaj(80000, 20)).toBe(100000)
    expect(brutStopaj(83000, 17)).toBe(100000)
    expect(brutStopaj(500000, 20)).toBe(625000)
    expect(brutStopaj(123456, 0)).toBe(123456)
  })
})
