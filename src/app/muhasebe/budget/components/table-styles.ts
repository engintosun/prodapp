import type { CSSProperties } from 'react'

// KLV-0 / TD-27 (13 Agustos 2026): sabit kolon genislik semasi — OLCULMUS degerler.
// Canli olcum (Segoe UI 14px): "999.999.999,99" = 92,1px · "Konaklama/Yemek" = 113,5px.
// Hucre kutusu: td padding 4+4 (13.08.2026 cift-padding temizligi; onceden 8+8);
// input/select ayrica border 1+1 + padding 8+8; select oku ~18px. Pay dusurulurken
// kolonlar ayni miktarda daraltildi, metin alani birebir korundu.
// Tutar kolonlari (yasalYuk/netToplam/brutToplam) 112 = olculen 108,1 + KUR-1 icin tek
// isaretlik (TL/$/EUR) pay. Para birimi SATIR verisidir (KUR-1 madde 1), o yuzden pay birakildi.
// statu 128 BILEREK yetersiz: gercek ihtiyac 166, kirpma kabul edildi (Engin karari 13.08.2026).
// donemler 150: icerigi kullanicinin yazdigi etap adi, en kotu durum turetilemez.
// Ad kolonu kalan genisligi alir: colgroup'ta tek minWidth tanimli kolon odur
// (bkz card-table-screen colgroup). Aciklama sabit genislikte, listenin icinde.
export const colWidths = {
  kod: 32,
  statu: 128,
  donemler: 142,
  birim: 68,
  birimNet: 108,
  miktar: 70,
  x: 50,
  yasalYuk: 112,
  netToplam: 112,
  brutToplam: 112,
  adMin: 212,
  aciklama: 212,
} as const

export const tableMinWidth =
  colWidths.kod +
  colWidths.statu +
  colWidths.donemler +
  colWidths.birim +
  colWidths.birimNet +
  colWidths.miktar +
  colWidths.x +
  colWidths.yasalYuk +
  colWidths.netToplam +
  colWidths.brutToplam +
  colWidths.adMin +
  colWidths.aciklama

export const thStyle: CSSProperties = {
  textAlign: 'left',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
  fontWeight: 600,
  padding: 'var(--space-2) var(--space-1)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}
export const thNum: CSSProperties = { ...thStyle, textAlign: 'right' }
export const tdStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  padding: 'var(--space-2) var(--space-1)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}
export const numStyle: CSSProperties = { ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
export const cellInput: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  fontFamily: 'inherit',
}
export const cellInputNum: CSSProperties = { ...cellInput, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
// TD-15 (2026-07-18): override'siz donem net hucresi kalemden MIRAS gosteriyorsa soluk -
// elle girilmis override normal renkte kalir (Kalemden miras title ipucu degismedi).
export const cellInputNumMuted: CSSProperties = { ...cellInputNum, color: 'var(--color-text-muted)' }
// Ad input'u: kalan genisligi alir, tasarsa ellipsis (odaksizken). Yeni Aciklama
// kolonu SABIT genislikte ama odaksizken ayni sekilde ellipsis gosterir (D3-UI).
export const cellInputEllipsis: CSSProperties = { ...cellInput, overflow: 'hidden', textOverflow: 'ellipsis' }
export const periodRowStyle: CSSProperties = { ...tdStyle, background: 'var(--color-surface-2)' }
export const periodRowNumStyle: CSSProperties = { ...numStyle, background: 'var(--color-surface-2)' }
export const periodRowInputTd: CSSProperties = { ...periodRowNumStyle, padding: 0 }
// Birim (unit) hucreleri: select kendi border+padding'ini tasir; disaridaki td padding
// uygularsa cift-padding olusur (167d5c8'deki Net/Miktar/X deseniyle ayni kok neden).
export const selectTd: CSSProperties = { ...tdStyle, padding: 0 }
export const periodRowSelectTd: CSSProperties = { ...periodRowStyle, padding: 0 }
