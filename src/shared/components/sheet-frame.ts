// PENCERE KENAR PAYLARI VE DURABILECEGI ALAN (25 Eylul 2026): ortak pencere parcasi
// (bottom-sheet.tsx) ve kalem ekleme odasi (add-item-panel.tsx) ayni olcuyle calisir; bu dosya
// TEK kaynaktir. Bilesen dosyasindan disa aktarilmaz (react-refresh/only-export-components).
export const SHEET_MARGIN = 8
export const SHEET_GAP = 4

// PENCERENIN DURABILECEGI ALAN (25 Eylul 2026, Engin karari, TASARIM-KARARLARI bolum 9 K1):
// tetigin icinde durdugu KAYDIRILAN kutularin (kabuk icerik alani, varsa tablonun kaydirma
// kutusu) kaydirma cubuklari haric gorunen kisimlarinin tarayiciyla kesisimi. Yalniz auto/scroll
// sayilir: hidden/clip sayilmaz, cunku yaziyi "..." ile kesen hucreler de hidden'dir ve Not
// penceresini hucrenin icine sikistirirdi. Alan bozuksa (bos) tarayicinin tamami kullanilir.
export function visibleFrame(el: HTMLElement): { top: number; bottom: number; left: number; right: number } {
  const viewport = { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth }
  let frame = viewport
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (!/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)) continue
    const r = node.getBoundingClientRect()
    const top = r.top + node.clientTop
    const left = r.left + node.clientLeft
    frame = {
      top: Math.max(frame.top, top),
      bottom: Math.min(frame.bottom, top + node.clientHeight),
      left: Math.max(frame.left, left),
      right: Math.min(frame.right, left + node.clientWidth),
    }
  }
  if (frame.bottom - frame.top < 1 || frame.right - frame.left < 1) return viewport
  return frame
}
