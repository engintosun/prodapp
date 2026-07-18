import { netToplamDonemli, brutToplamDonemli, kisiyeBanka } from '../../../../shared/cfe'
import type { Yuk, DonemKalemi } from '../../../../shared/cfe'
import { fmt, buildDonemler } from '../format'
import type { BudgetItemRow, StageRow } from '../../../../shared/supabase/budget-service'
import type { BordroDerivedFields } from '../../../../shared/supabase/payroll-read'
import { BottomSheet } from './bottom-sheet'

export type BordroSheetEntry = { loading: boolean; data: BordroDerivedFields | null; error: string | null; missingNet?: boolean; zeroNet?: boolean }

export function BurdenSheet({
  item,
  stageId,
  stage,
  bordro,
  onClose,
}: {
  item: BudgetItemRow
  stageId: string | null
  stage: StageRow | null
  bordro: BordroSheetEntry | undefined
  onClose: () => void
}) {
  const isBordroSheet = item.paymentStatus === 'bordro'
  const bdSheet = bordro
  const sheetStage = stage
  let dDonemler: DonemKalemi[]
  if (stageId !== null) {
    const sid = stageId
    const qty = item.periodQty[sid] ?? 0
    const netOverride = item.periodNet[sid] ?? null
    const effectiveNet = netOverride ?? item.unitNet
    const repeatOverride = item.periodRepeat[sid] ?? null
    const effectiveRepeat = repeatOverride ?? item.repeat
    dDonemler = [{ net: effectiveNet, qty, carpan: effectiveRepeat }]
  } else {
    dDonemler = buildDonemler(item)
  }
  const dYukler: Yuk[] = item.burdens.map((b) => ({ ratePercent: b.rate, kind: b.kind }))
  const dNet = netToplamDonemli(dDonemler)
  const dBrutYuk = brutToplamDonemli(dDonemler, dYukler)
  const dKdv = kisiyeBanka(dNet, dBrutYuk, item.vatRate).kdv

  return (
    <BottomSheet title={<>{item.name}{sheetStage ? ' (' + sheetStage.name + ')' : ''}</>} onClose={onClose}>
      {isBordroSheet ? (
        <>
          {bdSheet?.loading && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Hesaplanıyor…</p>
          )}
          {bdSheet?.error && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger, #c0392b)' }}>{bdSheet.error}</p>
          )}
          {bdSheet?.data && (
            <>
              {bdSheet.data.signals.some((s) => s.code === 'SNL-YIL-ASIMI') && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)' }}>
                  Bu kalem yıl sınırını aşıyor; kümülatif vergi matrahı yıl geçişinde sıfırlanmadan buna göre hesaplanmıştır.
                </p>
              )}
              {bdSheet.data.signals.some((s) => s.code === 'SNL-ADET-DEGISIM') && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)' }}>
                  Bu kalemde aylar arasında kişi sayısı (X) değişiyor; aylık döküm buna göre değişkenlik gösterir.
                </p>
              )}
              {bdSheet.data.signals.some((s) => s.code === 'SNL-TAKVIM-VARSAYILAN') && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)' }}>
                  Bu dönemin tarihi girilmediği için ihtiyatlı (en yüksek maliyetli) varsayım kullanıldı. Tarih girildiğinde rakam yalnız aşağı inebilir.
                </p>
              )}
              {[
                { label: 'SGK işçi', amount: bdSheet.data.bucketBreakdown.socialSecurityEmployee },
                { label: 'İşsizlik işçi', amount: bdSheet.data.bucketBreakdown.unemploymentEmployee },
                { label: 'Gelir vergisi', amount: bdSheet.data.bucketBreakdown.incomeTax },
                { label: 'Damga vergisi', amount: bdSheet.data.bucketBreakdown.stampDuty },
                { label: 'SGK işveren', amount: bdSheet.data.bucketBreakdown.socialSecurityEmployer },
                { label: 'İşsizlik işveren', amount: bdSheet.data.bucketBreakdown.unemploymentEmployer },
              ].map(({ label, amount }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  <span>{label}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                <span>Yasal yük</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(bdSheet.data.totalGross - bdSheet.data.totalNet)}</span>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {item.burdens.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              <span>{b.label} %{fmt(b.rate)}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(b.kind === 'deduction' ? Math.round(dBrutYuk * b.rate / 100) : Math.round(dNet * b.rate / 100))}</span>
            </div>
          ))}
          {item.vatRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              <span>KDV %{fmt(item.vatRate)}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(dKdv)}</span>
            </div>
          )}
        </>
      )}
    </BottomSheet>
  )
}
