import type { CSSProperties } from 'react'

// KLV-0 / TD-27 (13 Agustos 2026): sabit kolon genislik semasi — OLCULMUS degerler.
// Canli olcum (Segoe UI 14px): "999.999.999,99" = 92,1px · "Konaklama/Yemek" = 113,5px.
// OLCUM (31 Agustos 2026, Windows + Chrome, gercek pencere; scripts/statu-genislik-olcumu.html):
// en genis statu etiketi "Konaklama" = 67,84px; select'in toplam ihtiyaci = 105px
// (kenarlik 2 + dolgu 16 + metin 67,84 + ok 19). statu 128'den 106'ya indirildi: bir piksel
// pay yuvarlama icin. Statu hucresi ayni turda tdStyle'dan selectTd'ye gecti, boylece <td>
// dolgusu (4+4) kalkti ve select tam 106'yi aliyor.
// MAC'TE DOGRULANMADI. system-ui Windows'ta Segoe UI'a, Mac'te San Francisco'ya duser;
// "Konaklama" orada farkli genislikte olabilir. Kirpma gorulurse bu deger yukari cekilir.
// Ok isaretinin bedeli bu platformda 20px (appearance:none ile ayni select 85px istiyordu).
// Hucre kutusu: td padding 4+4 (13.08.2026 cift-padding temizligi; onceden 8+8);
// input/select ayrica border 1+1 + padding 8+8; select oku OLCULDU: 20px (31 Agustos
// 2026, Windows + Chrome). Pay dusurulurken
// kolonlar ayni miktarda daraltildi, metin alani birebir korundu.
// Tutar kolonlari (yasalYuk/araToplam/brutToplam) 112 = olculen 108,1 + KUR-1 icin tek
// isaretlik (TL/$/EUR) pay. Para birimi SATIR verisidir (KUR-1 madde 1), o yuzden pay birakildi.
// statu 128 BILEREK yetersiz: gercek ihtiyac 166, kirpma kabul edildi (Engin karari 13.08.2026).
// DUZELTME (31 Agustos 2026): bu 166 rakami "Konaklama/Yemek" etiketi varken alinmisti;
// etiket 31 Agustos'ta ikiye ayrilinca gecersiz kaldi, yerine yukaridaki OLCUM gecerlidir.
// donemler 150: icerigi kullanicinin yazdigi etap adi, en kotu durum turetilemez.
// Ad kolonu kalan genisligi alir: colgroup'ta tek minWidth tanimli kolon odur
// (bkz card-table-screen colgroup).
export const colWidths = {
  kod: 32,
  statu: 106,
  donemler: 142,
  birim: 68,
  birimNet: 108,
  miktar: 70,
  x: 50,
  yasalYuk: 112,
  araToplam: 112,
  brutToplam: 112,
  adMin: 212,
  maliyet: 112,
  kdv: 112,
  sil: 28,
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
  colWidths.araToplam +
  colWidths.brutToplam +
  colWidths.adMin +
  colWidths.maliyet +
  colWidths.kdv +
  colWidths.sil

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
// SALT-OKUNUR OZET HIZASI (31 Agustos 2026, kolon hizasi turu): Birim / Birim net /
// Miktar / X kolonlarinda hucre bazen bir denetim (yazi kutusu ya da acilir liste),
// bazen duz ozet yazi tasir. Denetimin kendi ic payi kenarlik 1 + dolgu 8 = 9px.
// Uc hal ayni hizada dursun diye hucre dolgusu YATAYDA sifirlanir ve duz yazi ayni
// 9px payi kendisi tasir. 9 yeni bir deger DEGIL: donem satirlari (periodRowInputTd)
// Temmuz 2026, statu ve birim select hucreleri 31 Agustos 2026 cift-dolgu turundan
// beri oradadir. KURAL: bir kolon denetim ile duz yazi arasinda gidip geliyorsa
// ikisinin yazi payi AYNI olmak zorundadir.
const CONTROL_INSET = 9
export const numFlushTd: CSSProperties = { ...numStyle, paddingLeft: 0, paddingRight: 0 }
export const readOnlyNumTd: CSSProperties = { ...numStyle, paddingLeft: 0, paddingRight: CONTROL_INSET }
export const readOnlyTextTd: CSSProperties = { ...tdStyle, paddingLeft: CONTROL_INSET, paddingRight: 0 }
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
// Ad input'u: kalan genisligi alir, tasarsa ellipsis (odaksizken).
export const cellInputEllipsis: CSSProperties = { ...cellInput, overflow: 'hidden', textOverflow: 'ellipsis' }
export const periodRowStyle: CSSProperties = { ...tdStyle, background: 'var(--color-surface-2)' }
export const periodRowNumStyle: CSSProperties = { ...numStyle, background: 'var(--color-surface-2)' }
export const periodRowInputTd: CSSProperties = { ...periodRowNumStyle, padding: 0 }
// Birim (unit) hucreleri: select kendi border+padding'ini tasir; disaridaki td padding
// uygularsa cift-padding olusur (167d5c8'deki Net/Miktar/X deseniyle ayni kok neden).
export const selectTd: CSSProperties = { ...tdStyle, padding: 0 }
export const periodRowSelectTd: CSSProperties = { ...periodRowStyle, padding: 0 }
// 14. hane (silme seridi): dugme hucrenin ortasinda durur; Toplam rakami ile arasindaki
// bosluk iki hucrenin 4+4 dolgusundan gelir ve eski flex gap ile birebir aynidir (8px).
// silButton iki yerde (item-row, period-row) birebir ayni oldugu icin tek yerde yasar.
export const silTd: CSSProperties = { ...tdStyle, textAlign: 'center' }
export const periodRowSilTd: CSSProperties = { ...periodRowStyle, textAlign: 'center' }
export const silButton: CSSProperties = {
  display: 'inline-flex',
  width: 20,
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: 'var(--text-md)',
  padding: 0,
  lineHeight: 1,
}
