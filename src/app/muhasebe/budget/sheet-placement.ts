// TETIGIN YANINDA YERLESIM (TASARIM-KARARLARI bolum 9, 24 Eylul 2026, Engin karari K1): saf hesap.
// Pencere tetigin ALTINDA acilir; icerik altta sigmiyorsa ve ustte daha cok yer varsa tetigin
// USTUNDE acilir. Sol kenar tetigin sol kenarina hizalanir, ekranin sagindan tasacaksa sola kayar.
// Boy secilen taraftaki yerle sinirlidir; fazlasi pencerenin icinde kayar.
export interface SheetPlacementInput {
  anchor: { top: number; bottom: number; left: number }
  panelWidth: number
  panelHeight: number
  viewportWidth: number
  viewportHeight: number
  margin: number
  gap: number
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
  const { anchor, panelWidth, panelHeight, viewportWidth, viewportHeight, margin, gap } = input
  const width = Math.max(0, Math.min(panelWidth, viewportWidth - 2 * margin))
  const left = Math.max(margin, Math.min(anchor.left, viewportWidth - margin - width))
  const spaceBelow = Math.max(0, viewportHeight - anchor.bottom - gap - margin)
  const spaceAbove = Math.max(0, anchor.top - gap - margin)
  if (panelHeight <= spaceBelow || spaceBelow >= spaceAbove) {
    return { side: 'below', top: anchor.bottom + gap, bottom: null, left, width, maxHeight: spaceBelow }
  }
  return { side: 'above', top: null, bottom: viewportHeight - anchor.top + gap, left, width, maxHeight: spaceAbove }
}
