import { netToplamDonemli, brutToplamDonemli } from '../../../../shared/cfe'
import type { Yuk, DonemKalemi } from '../../../../shared/cfe'
import { fmt, buildDonemler, splitIntoTwoLines } from '../format'
import type { BudgetItemRow, StageRow } from '../../../../shared/supabase/budget-service'
import type { BordroDerivedFields } from '../../../../shared/supabase/payroll-read'
import { BottomSheet } from './bottom-sheet'

export type BordroSheetEntry = { loading: boolean; data: BordroDerivedFields | null; error: string | null; missingNet?: boolean }

// UYARI YAZISI (24 Eylul 2026, Engin karari, BUTCE-EKRAN-KARARLARI bolum 8): bordro uyarilari iki
// esit satira kirilir ve ortalanir; pencerenin genisligini tek satirlik uzunluk degil iki satirin
// uzunu belirler. Sira eski sirayla ayni. SNL-TAKVIM-VARSAYILAN metni Engin'in metnidir.
const BORDRO_SIGNAL_TEXTS: ReadonlyArray<{ code: string; text: string }> = [
  { code: 'SNL-YIL-ASIMI', text: 'Bu kalem yıl sınırını aşıyor; kümülatif vergi matrahı yıl geçişinde sıfırlanmadan buna göre hesaplanmıştır.' },
  { code: 'SNL-ADET-DEGISIM', text: 'Bu kalemde aylar arasında kişi sayısı (X) değişiyor; aylık döküm buna göre değişkenlik gösterir.' },
  { code: 'SNL-TAKVIM-VARSAYILAN', text: 'Tarih girilmediği için ihtiyatlı (en yüksek maliyetli) varsayım kullanıldı. Tarih girildiğinde rakam yalnız aşağı inebilir.' },
]

export function BurdenSheet({
  item,
  stageId,
  stage,
  bordro,
  name,
  anchor,
  onClose,
}: {
  item: BudgetItemRow
  stageId: string | null
  stage: StageRow | null
  bordro: BordroSheetEntry | undefined
  name: string
  anchor?: () => HTMLElement | null
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
  return (
    <BottomSheet title={<>{name}{sheetStage ? ' (' + sheetStage.name + ')' : ''}</>} anchor={anchor} fitWidth={{ min: 240 }} onClose={onClose}>
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
              {BORDRO_SIGNAL_TEXTS.filter(({ code }) => bdSheet?.data?.signals.some((s) => s.code === code)).map(({ code, text }) => (
                <p key={code} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
                  {splitIntoTwoLines(text).filter((line) => line !== '').map((line) => (
                    <span key={line} style={{ display: 'block' }}>{line}</span>
                  ))}
                </p>
              ))}
              {[
                { label: 'SGK işçi', amount: bdSheet.data.bucketBreakdown.socialSecurityEmployee },
                { label: 'İşsizlik işçi', amount: bdSheet.data.bucketBreakdown.unemploymentEmployee },
                { label: 'Gelir vergisi', amount: bdSheet.data.bucketBreakdown.incomeTax },
                { label: 'Damga vergisi', amount: bdSheet.data.bucketBreakdown.stampDuty },
                { label: 'SGK işveren', amount: bdSheet.data.bucketBreakdown.socialSecurityEmployer },
                { label: 'İşsizlik işveren', amount: bdSheet.data.bucketBreakdown.unemploymentEmployer },
              ].map(({ label, amount }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', padding: 'var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  <span>{label}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', paddingTop: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                <span>Yasal yük</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(bdSheet.data.totalGross - bdSheet.data.totalNet)}</span>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {item.burdens.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', padding: 'var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              <span>{b.label} %{fmt(b.rate)}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(b.kind === 'deduction' ? Math.round(dBrutYuk * b.rate / 100) : Math.round(dNet * b.rate / 100))}</span>
            </div>
          ))}
          {/* KDV DOKUMDE YER ALMAZ (22 Agustos 2026 net/brut doktrini): KDV yasal yukun
              parcasi degildir, kendi kolonunda yasar. Bu blok karardan once yazilmisti ve
              kullaniciya ayni tutari iki yerde gosteriyordu. GERI EKLENMEMELIDIR. */}
        </>
      )}
    </BottomSheet>
  )
}
