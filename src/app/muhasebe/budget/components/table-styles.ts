import type { CSSProperties } from 'react'

// KLV-0: sabit kolon genislik semasi. En kotu durum icerige gore hesaplandi.
// Tutar kolonlari (yasalYuk/netToplam/brutToplam): sahada yuz milyonlu tutarlar
// gorulebilir -> "999.999.999,99" (14 karakter) + KUR-1 gelecekteki kur payi.
// birimNet biraz daha dar (birim fiyat, toplam kadar buyumez).
// Aciklama kolonu kasitli disarida: kalan genisligi alir (bkz card-table-screen colgroup).
export const colWidths = {
  kod: 56,
  statu: 128,
  donemler: 150,
  birim: 88,
  birimNet: 130,
  miktar: 76,
  x: 68,
  yasalYuk: 150,
  netToplam: 150,
  brutToplam: 150,
  aciklamaMin: 220,
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
  colWidths.aciklamaMin

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
// Aciklama (ad) input'u: kalan genisligi alir, tasarsa ellipsis (odaksizken).
export const cellInputEllipsis: CSSProperties = { ...cellInput, overflow: 'hidden', textOverflow: 'ellipsis' }
export const periodRowStyle: CSSProperties = { ...tdStyle, background: 'var(--color-surface-2)' }
export const periodRowNumStyle: CSSProperties = { ...numStyle, background: 'var(--color-surface-2)' }
