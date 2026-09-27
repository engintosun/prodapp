// HUCRE ADRESI (TASARIM-KARARLARI bolum 9, K1 ve K4): tablodaki her hucre satir ve sutun
// isaretiyle bulunur. Pencerenin tetigi (K1) ve hucreye bagli mesaj (K4) ayni adresi kullanir.
export function cellSelector(rowId: string, col: string): string {
  return `[data-row-id="${rowId}"][data-col="${col}"]`
}
