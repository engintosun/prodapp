import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'kaapa-rail-collapsed'

function getInitialCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // ozel sekme / erisim engeli - varsayilana (acik ray) dus, uygulama cokmesin
    return false
  }
}

export function useRailCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(getInitialCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // yazma basarisiz olabilir (ozel sekme) - ray durumu bu oturumda bellekte kalir
    }
  }, [collapsed])

  const toggleRailCollapsed = useCallback(() => {
    setCollapsed((c) => !c)
  }, [])

  return { collapsed, toggleRailCollapsed }
}
