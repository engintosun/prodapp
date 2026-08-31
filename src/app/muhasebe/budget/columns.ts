export type BudgetColumnAlign = 'text' | 'num'

export interface BudgetColumn {
  key: string
  label: string
  align: BudgetColumnAlign
}

export const BUDGET_COLUMNS: readonly BudgetColumn[] = [
  { key: 'kod', label: 'No', align: 'text' },
  { key: 'ad', label: 'Ad', align: 'text' },
  { key: 'statu', label: 'Statü', align: 'text' },
  { key: 'donemler', label: 'Dönemler', align: 'text' },
  { key: 'birim', label: 'Birim', align: 'text' },
  { key: 'birimNet', label: 'Birim net', align: 'num' },
  { key: 'miktar', label: 'Miktar', align: 'num' },
  { key: 'x', label: 'X', align: 'num' },
  { key: 'araToplam', label: 'Ara toplam', align: 'num' },
  { key: 'yasalYuk', label: 'Yasal Yük', align: 'num' },
  { key: 'maliyet', label: 'Maliyet', align: 'num' },
  { key: 'kdv', label: 'KDV', align: 'num' },
  { key: 'brutToplam', label: 'Toplam', align: 'num' },
]
