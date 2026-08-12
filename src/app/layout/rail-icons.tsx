// Ray durak ikonlari: KABUK-KARARLARI 12.2 tek-tonluluk kurali geregi renk
// tasimazlar, currentColor uzerinden gelir. Emsal: app-header.tsx BellIcon
// (elle yazilmis SVG, ikon kutuphanesi kurulmadi).
export function BudgetEntryIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="8.5" x2="21" y2="8.5" />
      <line x1="9" y1="8.5" x2="9" y2="21" />
      <line x1="3" y1="13.5" x2="21" y2="13.5" />
      <line x1="3" y1="17.5" x2="21" y2="17.5" />
    </svg>
  )
}

export function DefinitionsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <path d="M3 17 L21 17" />
      <line x1="7" y1="21" x2="7" y2="17" />
      <line x1="17" y1="21" x2="17" y2="17" />
    </svg>
  )
}
