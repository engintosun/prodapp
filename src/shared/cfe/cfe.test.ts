import { describe, it, expect } from 'vitest'
import { brutBirim, satirToplam, satirToplamDonemli, kdvAyristir, zincirToplam, dokum, brutStopaj, netToplamDonemli, brutToplamDonemli, kisiyeBanka, type Yuk } from './cfe'

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

describe('CFE — dönem-bazlı satır toplamı', () => {
  it('tek dönem: mevcut satirToplam ile eşit sonuç', () => {
    expect(satirToplamDonemli([{ net: 8250, qty: 1.75, carpan: 2 }], [33])).toBe(38404)
  })
  it('çoklu dönem aynı net, adet farklı', () => {
    expect(satirToplamDonemli([{ net: 1000, qty: 2, carpan: 1 }, { net: 1000, qty: 3, carpan: 1 }], [])).toBe(5000)
  })
  it('çoklu dönem farklı net', () => {
    expect(satirToplamDonemli([{ net: 1000, qty: 2, carpan: 1 }, { net: 2000, qty: 1, carpan: 1 }], [])).toBe(4000)
  })
  it('boş dizi → 0', () => {
    expect(satirToplamDonemli([], [33])).toBe(0)
  })
})

describe('CFE — cinse göre brüt (DILIM-2c)', () => {
  it('smm: net bölü 0.80 (stopaj %20 kesinti)', () => {
    expect(brutToplamDonemli([{ net: 80000, qty: 1, carpan: 1 }], [{ ratePercent: 20, kind: 'deduction' }])).toBe(100000)
  })
  it('telif: net bölü 0.83 (stopaj %17 kesinti)', () => {
    expect(brutToplamDonemli([{ net: 83000, qty: 1, carpan: 1 }], [{ ratePercent: 17, kind: 'deduction' }])).toBe(100000)
  })
  it('ekleme (SGK-tipi) eski additive ile birebir', () => {
    expect(brutToplamDonemli([{ net: 8250, qty: 1.75, carpan: 2 }], [{ ratePercent: 33, kind: 'additive' }])).toBe(38404)
  })
  it('karışık: %10 ekleme + %20 kesinti', () => {
    expect(brutToplamDonemli([{ net: 1000, qty: 1, carpan: 1 }], [{ ratePercent: 10, kind: 'additive' }, { ratePercent: 20, kind: 'deduction' }])).toBe(1375)
  })
  it('boş kova (sirket): net = brüt', () => {
    expect(brutToplamDonemli([{ net: 5000, qty: 2, carpan: 1 }], [])).toBe(10000)
    expect(netToplamDonemli([{ net: 5000, qty: 2, carpan: 1 }])).toBe(10000)
  })
  it('net çizelge toplamı: Miktar uygulanır, yüksüz', () => {
    expect(netToplamDonemli([{ net: 1000, qty: 1, carpan: 3 }])).toBe(3000)
    expect(netToplamDonemli([])).toBe(0)
  })
  it('kesinti yuvarlama: %33 → tam TL yarı-yukarı', () => {
    expect(brutToplamDonemli([{ net: 1000, qty: 1, carpan: 1 }], [{ ratePercent: 33, kind: 'deduction' }])).toBe(1493)
  })
  it('kesinti %100+ → hata fırlatır (sessiz hata yasak)', () => {
    expect(() => brutToplamDonemli([{ net: 1000, qty: 1, carpan: 1 }], [{ ratePercent: 100, kind: 'deduction' }])).toThrow()
  })
  it('donem-bazli Miktar dogru sonuc verir', () => {
    const donemler = [{ net: 30000, qty: 4, carpan: 1 }, { net: 35000, qty: 8, carpan: 2 }]
    expect(netToplamDonemli(donemler)).toBe(30000 * 4 + 35000 * 8 * 2)
  })
  it('Miktar default 1 ile eski davranis uyumlu', () => {
    const donemler = [{ net: 1000, qty: 5, carpan: 1 }]
    expect(netToplamDonemli(donemler)).toBe(5000)
  })
  it('brutToplamDonemli additive yuk ile Miktar-bazli net uzerinde', () => {
    const donemler = [{ net: 1000, qty: 1, carpan: 2 }]
    const yukler: Yuk[] = [{ ratePercent: 20, kind: 'additive' }]
    expect(brutToplamDonemli(donemler, yukler)).toBe(2400)
  })
  it('brutToplamDonemli deduction yuk ile Miktar-bazli net uzerinde', () => {
    const donemler = [{ net: 1000, qty: 1, carpan: 2 }]
    const yukler: Yuk[] = [{ ratePercent: 20, kind: 'deduction' }]
    expect(brutToplamDonemli(donemler, yukler)).toBe(2500)
  })
})

describe('CFE — kisiye banka odemesi (B18)', () => {
  it('smm: net 5000, brut 6250, vat 20 -> { kdv: 1250, toplam: 6250 }', () => {
    expect(kisiyeBanka(5000, 6250, 20)).toEqual({ kdv: 1250, toplam: 6250 })
  })
  it('sirket: net=brut 5000, vat 20 -> { kdv: 1000, toplam: 6000 }', () => {
    expect(kisiyeBanka(5000, 5000, 20)).toEqual({ kdv: 1000, toplam: 6000 })
  })
  it('kdvsiz statu: net=brut 5000, vat 0 -> { kdv: 0, toplam: 5000 }', () => {
    expect(kisiyeBanka(5000, 5000, 0)).toEqual({ kdv: 0, toplam: 5000 })
  })
})
