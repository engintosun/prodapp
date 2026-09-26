// TETIGIN YANINDA YERLESIM (TASARIM-KARARLARI bolum 9, 24 Eylul 2026, Engin karari K1): saf hesap.
// Pencere tetigin ALTINDA acilir; icerik altta sigmiyorsa ve ustte daha cok yer varsa tetigin
// USTUNDE acilir. Sol kenar tetigin sol kenarina hizalanir, alanin sagindan tasacaksa sola kayar.
// Boy secilen taraftaki yerle sinirlidir; fazlasi pencerenin icinde kayar.
// ALAN (25 Eylul 2026, Engin karari): yer tarayicinin tamamina gore degil, pencerenin
// durabilecegi alana (frame: tablonun gorunen alani) gore hesaplanir. bottom degeri CSS
// konumlamasi icin tarayici yuksekligine gore verilir (position: fixed).
export interface SheetPlacementInput {
  anchor: { top: number; bottom: number; left: number }
  frame: { top: number; bottom: number; left: number; right: number }
  panelWidth: number
  panelHeight: number
  viewportHeight: number
  margin: number
  gap: number
  // ONCE USTU DENE (25 Eylul 2026, Dilim 1b-1): 'above' verilirse icerik ustte sigiyorsa ustte,
  // sigmiyorsa hangi tarafta daha cok yer varsa orada acilir. Varsayilan 'below' (bugunku kural).
  prefer?: 'below' | 'above'
  // SATIRI ORTEREK (25 Eylul 2026, Dilim 1b-1 duzeltmesi, Engin karari): verilirse ustte acilirken
  // pencerenin alt kenari satirin ALT cizgisine, altta acilirken ust kenari satirin UST cizgisine
  // oturur; bosluk (gap) birakilmaz. Baslik penceresi ekleme satirindan boyle acilir.
  cover?: boolean
}

export interface SheetPlacement {
  side: 'below' | 'above'
  top: number | null
  bottom: number | null
  left: number
  width: number
  maxHeight: number
}

export function placeSheet(input: SheetPlacementInput): SheetPlacement {
  const { anchor, frame, panelWidth, panelHeight, viewportHeight, margin, gap, prefer = 'below', cover = false } = input
  const width = Math.max(0, Math.min(panelWidth, frame.right - frame.left - 2 * margin))
  const left = Math.max(frame.left + margin, Math.min(anchor.left, frame.right - margin - width))
  // aboveBase: ustte acilan pencerenin alt kenarinin oturdugu cizgi; belowBase: altta acilanin ust kenari.
  const aboveBase = cover ? anchor.bottom : anchor.top - gap
  const belowBase = cover ? anchor.top : anchor.bottom + gap
  const spaceBelow = Math.max(0, frame.bottom - belowBase - margin)
  const spaceAbove = Math.max(0, aboveBase - frame.top - margin)
  const goBelow =
    prefer === 'above'
      ? panelHeight > spaceAbove && spaceBelow > spaceAbove
      : panelHeight <= spaceBelow || spaceBelow >= spaceAbove
  if (goBelow) {
    return { side: 'below', top: belowBase, bottom: null, left, width, maxHeight: spaceBelow }
  }
  return { side: 'above', top: null, bottom: viewportHeight - aboveBase, left, width, maxHeight: spaceAbove }
}
