import type { CSSProperties } from 'react'

// KLV-0: sabit kolon genislik semasi. En kotu durum icerige gore hesaplandi.
// Tutar kolonlari (yasalYuk/netToplam/brutToplam): sahada yuz milyonlu tutarlar
// gorulebilir -> "999.999.999,99" (14 karakter) + KUR-1 gelecekteki kur payi.
// birimNet biraz daha dar (birim fiyat, toplam kadar buyumez).
// Ad kolonu kalan genisligi alir: colgroup'ta tek minWidth tanimli kolon odur
// (bkz card-table-screen colgroup). Aciklama sabit genislikte, listenin icinde.
export const colWidths = {
  kod: 40,
  statu: 128,
  donemler: 150,
  birim: 88,
  birimNet: 130,
  miktar: 76,
  x: 68,
  yasalYuk: 150,
  netToplam: 150,
  brutToplam: 150,
  adMin: 220,
  aciklama: 220,
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
  padding: 'var(--space-2)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}
export const thNum: CSSProperties = { ...thStyle, textAlign: 'right' }
export const tdStyle: CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  padding: 'var(--space-2)',
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
