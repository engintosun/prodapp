import { EmptyState } from '../../shared/components/empty-state'
import { SahaHomeScreen } from './saha-home-screen'

interface Props {
  activeKey: string
}

// Saha ekran-router: alt-nav activeKey'ine gore saha ekranini secer.
// src/app/saha/ = saha ekranlarinin evi (C5 donem ekrani vb. buraya gelir).
export function SahaScreen({ activeKey }: Props) {
  switch (activeKey) {
    case 'ana':
      return <SahaHomeScreen />
    case 'donem':
      // TODO-SPEC: Saha donem ekrani = C5 (EKRAN-SAHA.md §7). Bu dilimde placeholder.
      return <EmptyState title="Dönem" description="Yakında (C5)" />
    case 'ara':
      // TODO-SPEC: Arama = Faz 2 / M3 (EKRAN-SAHA.md §8).
      return <EmptyState title="Ara" description="Faz 2'de (M3)" />
    case 'mesajlar':
      // TODO-SPEC: Mesajlar = Faz 2 / M3 (EKRAN-SAHA.md §9).
      return <EmptyState title="Mesajlar" description="Faz 2'de (M3)" />
    default:
      return <EmptyState title="—" />
  }
}
