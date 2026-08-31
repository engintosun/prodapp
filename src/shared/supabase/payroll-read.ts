// BOY: tek iş = bordro türetme bloğu (saf hesap: computeBordroFields + Supabase-okuyan orkestrasyon: buildPayrollRates/deriveBordroFields bir arada), sebep = 500+ — bölünme planı docs/butce/BUTCE-UI-MIMARISI.md §8'de kayıtlı, bölme ayrı turda yapılır.
import Decimal from 'decimal.js'
import { supabase } from './client'
import { resolvePayrollItem, deriveMinimumWageExemptionSeries, deriveStampDutyExemption } from '../cfe'
import type { PayrollLegs, TaxBracket, PayrollRates, PayrollMonthInput, PayrollMonthResult, PayrollSignal, PayrollEnvelope } from '../cfe'

// Birim -> gun karsiligi (bordro ay-dagilimi icin). episode/flat gibi bordroda anlamsiz birimler
// icin 30 gun varsayilir (console.warn ile isaretlenir), throw ETMEZ. Tek kaynak: hem skeleton gun
// bolusturmede hem Birim Net'i ay-esdegerine cevirmede (S1, DILIM-3e-1) kullanilir.
const UNIT_DAY_LENGTH: Record<string, number> = { day: 1, week: 7, month: 30 }

function unitDayLength(unitCode: string): number {
  const len = UNIT_DAY_LENGTH[unitCode]
  if (len === undefined) {
    console.warn(`Payroll: beklenmeyen Birim (${unitCode}), bordroda gun/hafta/ay bekleniyordu - 30 gun varsayildi`)
    return 30
  }
  return len
}

// Girilen Birim Net'i (o birimin TEK doneminde kazanilan net) ay-esdegerine cevirir (S1 duzeltmesi,
// DILIM-3e-1): motor targetNetFullMonth'u hep TAM AYLIK net bekler - hafta biriminde girilen 5000,
// 5000*30/7 aylik esdegerine cevrilmeden hic dokunulmadan motora veriliyordu (bug).
export function monthEquivalentNet(net: number, unitCode: string): number {
  return new Decimal(net).mul(30).div(unitDayLength(unitCode)).toNumber()
}

export interface MinimumWageThresholds {
  day: number
  week: number
  month: number
}

// TD-18 (Engin karari 2026-07-20): asgari ucretin NETi ayrica kayitli degil, brutten (parametre_asgari_brut)
// ve iki sabit isci-payi oranindan (sgk_isci, issizlik_isci) turer - asgari ucretli tam asgari ucret
// kazaniyorsa gelir vergisi/damga istisnasi ikisini de tam sifirlar (kanun geregi), geriye yalniz
// SGK+issizlik isci payi kalir. Gun/hafta esdegerleri motorun kendi gun-uzunlugu tablosuyla (unitDayLength)
// ayni orantidan turer - ayri bir sabit GEREKMEZ.
export function minimumWageNetThresholds(rates: PayrollRates): MinimumWageThresholds {
  const employeeDeductionPercent = rates.socialSecurityEmployeePercent + rates.unemploymentEmployeePercent
  const netMonth = new Decimal(rates.minimumWageGrossThisMonth)
    .mul(new Decimal(1).minus(new Decimal(employeeDeductionPercent).div(100)))
    .toNumber()
  return {
    day: new Decimal(netMonth).mul(unitDayLength('day')).div(30).toNumber(),
    week: new Decimal(netMonth).mul(unitDayLength('week')).div(30).toNumber(),
    month: netMonth,
  }
}

// rate_catalog'dan bu ayin yururlukteki bordro parametrelerini derler. Su an tek yurutluk-donemi
// (2026-01-01) var; coklu-vintage cozumleme (Temmuz/Ocak parametre degisimi) rate_catalog semasi
// destekler ama bu DILIM'de tek-donem veriyle calisir (K5: mekanizma hazir, veri buyudukce genisler).
// sgk_isveren item_burdens'inda daima NULL durur (fill_mode=skeleton, legs boolean'ini isaretler);
// gercek oran burada fn_resolve_sgk_scenario'nun dondugu component code'a gore CANLI okunur (Sirket
// Profili DILIMI, 2026-07-10) - projectId yoksa (eski cagri yolu) standart senaryoya duser.
export interface CatalogRateRow {
  code: string
  valueKind: 'oran' | 'tutar' | 'tarife'
  ratePercent: number | null
  amountTl: number | null
  bracketFloor: number | null
  bracketBaseTax: number | null
  validFrom: string
}

// MUHUR-2: acik (canli rate_catalog) ve kilitli (budget_rate_snapshot) okuma yollarinin PAYLASILAN
// secim cekirdegi. asOfDate: acik yolda bugun, kilitli yolda sealed_at (sabit) - bkz. fetchSealedPayrollRates.
export function buildPayrollRates(rows: CatalogRateRow[], sgkEmployerCode: string, asOfDate: string): PayrollRates {
  const all = rows
    .filter((r) => r.validFrom <= asOfDate)
    .sort((a, b) => b.validFrom.localeCompare(a.validFrom))

  function latestOran(code: string): number {
    const row = all.find((r) => r.code === code && r.valueKind === 'oran')
    if (!row) throw new Error(`Payroll: rate_catalog eksik parametre (${code}, oran)`)
    return Number(row.ratePercent)
  }
  function latestTutar(code: string): number {
    const row = all.find((r) => r.code === code && r.valueKind === 'tutar')
    if (!row) throw new Error(`Payroll: rate_catalog eksik parametre (${code}, tutar)`)
    return Number(row.amountTl)
  }
  const brackets: TaxBracket[] = all
    .filter((r) => r.code === 'gv_ucret' && r.valueKind === 'tarife')
    .map((r) => ({
      floor: Number(r.bracketFloor),
      ratePercent: Number(r.ratePercent),
      baseTax: Number(r.bracketBaseTax),
    }))
    .sort((a, b) => a.floor - b.floor)
  if (brackets.length === 0) throw new Error('Payroll: gv_ucret tarife satirlari bulunamadi')

  return {
    socialSecurityEmployeePercent: latestOran('sgk_isci'),
    unemploymentEmployeePercent: latestOran('issizlik_isci'),
    socialSecurityEmployerPercent: latestOran(sgkEmployerCode),
    unemploymentEmployerPercent: latestOran('issizlik_isveren'),
    stampDutyPercent: latestOran('damga'),
    incomeTaxBrackets: brackets,
    minimumWageGrossThisMonth: latestTutar('parametre_asgari_brut'),
    socialSecurityCeilingMultiplier: latestTutar('parametre_sgk_tavan_katsayi'),
  }
}

async function fetchPayrollRates(projectId?: string): Promise<PayrollRates> {
  const today = new Date().toISOString().slice(0, 10)
  // rate_catalog sorgusu ve senaryo RPC'si birbirinden bagimsiz - paralel baslatilir (perf, davranis ayni).
  const [{ data: rows, error }, { data: scenario, error: es }] = await Promise.all([
    supabase
      .from('rate_catalog')
      .select('rate_percent, amount_tl, bracket_floor, bracket_base_tax, valid_from, value_kind, burden_components(code)')
      .lte('valid_from', today)
      .order('valid_from', { ascending: false }),
    projectId ? supabase.rpc('fn_resolve_sgk_scenario', { p_project_id: projectId }) : Promise.resolve({ data: null, error: null }),
  ])
  if (error) throw new Error(error.message)

  let sgkEmployerCode = 'sgk_isveren'
  if (projectId) {
    if (es) throw new Error(es.message)
    if (scenario) sgkEmployerCode = scenario as string
  }

  const mapped: CatalogRateRow[] = (rows ?? []).map((r) => ({
    code: (r as { burden_components?: { code?: string } | null }).burden_components?.code ?? '',
    valueKind: r.value_kind as CatalogRateRow['valueKind'],
    ratePercent: r.rate_percent === null ? null : Number(r.rate_percent),
    amountTl: r.amount_tl === null ? null : Number(r.amount_tl),
    bracketFloor: r.bracket_floor === null ? null : Number(r.bracket_floor),
    bracketBaseTax: r.bracket_base_tax === null ? null : Number(r.bracket_base_tax),
    validFrom: r.valid_from as string,
  }))

  return buildPayrollRates(mapped, sgkEmployerCode, today)
}

// KRITIK: snapshot katalogun TAMAMINI icerir (gelecek-tarihli satirlar dahil, MUHUR-1); yururluk
// bugune gore secilirse onceden tohumlanmis bir zam satiri takvim o tarihi gecince muhurlu rakami
// sessizce oynatir; bu yuzden yururluk muhur anina (sealed_at) SABITLENIR. SGK senaryosu da canli
// fn_resolve_sgk_scenario'dan DEGIL, muhur aninda dondurulen sgk_component_code'dan okunur.
async function fetchSealedPayrollRates(budgetId: string): Promise<PayrollRates> {
  const { data, error } = await supabase
    .from('budget_versions')
    .select(
      'id, version_no, sealed_at, sgk_component_code, budget_rate_snapshot(component_code, value_kind, rate_percent, amount_tl, bracket_floor, bracket_base_tax, valid_from)',
    )
    .eq('budget_id', budgetId)
    .order('version_no', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Muhurlu butcenin versiyonu bulunamadi (is_locked=true yalniz fn_lock_budget ile olusur)')

  const asOf = (data.sealed_at as string).slice(0, 10)
  const snapshotRows = (data as unknown as { budget_rate_snapshot: Array<Record<string, unknown>> }).budget_rate_snapshot ?? []
  const mapped: CatalogRateRow[] = snapshotRows.map((r) => ({
    code: r.component_code as string,
    valueKind: r.value_kind as CatalogRateRow['valueKind'],
    ratePercent: r.rate_percent === null ? null : Number(r.rate_percent),
    amountTl: r.amount_tl === null ? null : Number(r.amount_tl),
    bracketFloor: r.bracket_floor === null ? null : Number(r.bracket_floor),
    bracketBaseTax: r.bracket_base_tax === null ? null : Number(r.bracket_base_tax),
    validFrom: r.valid_from as string,
  }))

  return buildPayrollRates(mapped, data.sgk_component_code as string, asOf)
}

// Kart acilirken BIR KEZ cagrilir (per-item deriveBordroFields'in agir tam hesabi degil, yalniz
// esik degerleri icin). Kilitli/acik ayrimi deriveBordroFields ile AYNI kaynaklardan besleniyor
// (MUHUR-2 disiplinini burada da koruyoruz).
export async function fetchMinimumWageThresholds(budgetId: string): Promise<MinimumWageThresholds> {
  const { data, error } = await supabase.from('budgets').select('project_id, is_locked').eq('id', budgetId).single()
  if (error) throw new Error(error.message)
  const isLocked = data.is_locked as boolean
  const projectId = (data.project_id as string | null) ?? undefined
  const rates = isLocked ? await fetchSealedPayrollRates(budgetId) : await fetchPayrollRates(projectId)
  return minimumWageNetThresholds(rates)
}

export interface BordroPeriodBreakdownEntry {
  periodIndex: number
  stageId: string | null
  netTotal: number
  grossTotal: number
  legalBurden: number
}

export interface BordroDerivedFields {
  totalNet: number
  totalGross: number
  monthlySeries: PayrollMonthResult[]
  signals: PayrollSignal[]
  bucketBreakdown: PayrollEnvelope['bucketBreakdown']
  periodBreakdown: BordroPeriodBreakdownEntry[]
}

export type BordroDerivationReason = 'invalid_net' | 'no_periods' | 'unknown'

export type BordroDerivationResult = { ok: true; data: BordroDerivedFields } | { ok: false; reason: BordroDerivationReason }

export interface BordroItemFields {
  unitNet: number
  unitCode: string
  multiplier: number
  repeat: number
}

export interface BordroPeriodRow {
  quantity: number
  repeatOverride: number | null
  unitCodeOverride: string | null
  unitNetOverride: number | null
  sortOrder: number
  startDate: string | null
  isUndated: boolean
  stageId: string | null
}

function anchorOf(stage: { startDate: string | null; isUndated: boolean } | undefined): { year: number; month: number; usesDefaultCalendar: boolean } {
  if (stage && !stage.isUndated && stage.startDate) {
    const d = new Date(stage.startDate)
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, usesDefaultCalendar: false }
  }
  // Tarih bilinmiyorken herkes Ocak'ta ise girmis varsayilir: istisna serisinin en dusuk degerleri ->
  // maliyet en yuksek (ihtiyat-lehine risk payi, Engin karari 07-07). Iki ozdes butce olusturulma
  // tarihinden bagimsiz AYNI rakami verir. Gercek tarih girildiginde gercek takvim kullanilir,
  // maliyet ancak asagi iner.
  return { year: new Date().getUTCFullYear(), month: 1, usesDefaultCalendar: true }
}

// Motor hatasini (Error) tipli reason'a cevirir - ham error.message asla disariya sizmaz (savunma
// kurali, DILIM-3e-1). Mesaj icerigine gore siniflandirir: "net" gecen -> gecersiz hedef net,
// "donem"/"K faktoru" gecen -> kalemin donem/Miktar/X verisi hic ay uretmedi, digerleri -> bilinmeyen.
function classifyBordroError(e: unknown): BordroDerivationReason {
  const message = e instanceof Error ? e.message : ''
  if (/net/i.test(message)) return 'invalid_net'
  if (/donem|K faktoru/i.test(message)) return 'no_periods'
  return 'unknown'
}

// Saf hesap cekirdegi (DB'ye dokunmaz, dogrudan test edilir). Kalemin donem/Miktar/X verisinden
// ay iskeleti kurar: 0/1 donemde ana satir X/Miktar/Birim'ini parametre olarak kullanir (buildDonemler
// UI ile AYNI davranis, K9 muhuru); >1 donemde her donem KENDI override'iyla ozerktir (S5 duzeltmesi -
// unit_net_override artik okunuyor). Her donemin Birim Net'i kendi Biriminden ay-esdegerine cevrilir
// (S1 duzeltmesi) - tek global hedef yok, her donem kendi sozlesmesi. Toplam sure = tum donemlerin
// (X x Miktar) duz toplami; sadece ilk donem ankorlanir (K7), sonrakiler kesintisiz devam eder.
// TD-17 (Engin karari 2026-07-20): net<=0 donem iskelete girmez (X<=0 ile ayni sessiz atlama) -
// 0-bedel doktrininin donem tanecigi: hesaplanamayan donem 0 katki verir (kirmizi uyari donem
// satirinda zaten yanar), kalemin gecerli donemleri hesaplanmaya devam eder. Atlanan donem takvim
// imlecini DE ilerletmez (A1): sonraki donemler one cekilir, net girilince duzelir; yon ihtiyat-
// lehine (erken ay = dusuk istisna = yuksek maliyet). Motor kati kalir, filtre servis katmaninda.
export function computeBordroFields(
  item: BordroItemFields,
  periodRows: BordroPeriodRow[],
  legs: PayrollLegs,
  rates: PayrollRates,
): BordroDerivedFields {
  interface PeriodSpec {
    quantity: number
    repeatVal: number
    unitCode: string
    netFullMonth: number
    stageId: string | null
  }

  let firstStage: { startDate: string | null; isUndated: boolean } | undefined
  const periods: PeriodSpec[] = []
  if (periodRows.length <= 1) {
    firstStage = periodRows[0]
    periods.push({
      quantity: item.multiplier,
      repeatVal: item.repeat,
      unitCode: item.unitCode,
      netFullMonth: monthEquivalentNet(item.unitNet, item.unitCode),
      stageId: periodRows.length === 1 ? periodRows[0].stageId : null,
    })
  } else {
    const sorted = [...periodRows].sort((a, b) => a.sortOrder - b.sortOrder)
    firstStage = sorted[0]
    for (const p of sorted) {
      const unitCode = p.unitCodeOverride ?? item.unitCode
      const netSource = p.unitNetOverride ?? item.unitNet
      periods.push({
        quantity: p.quantity,
        repeatVal: p.repeatOverride ?? item.repeat,
        unitCode,
        netFullMonth: monthEquivalentNet(netSource, unitCode),
        stageId: p.stageId,
      })
    }
  }

  const anchor = anchorOf(firstStage)
  let cursorYear = anchor.year
  let cursorMonth = anchor.month
  let usedInCursorMonth = 0

  const skeleton: {
    year: number
    month: number
    dayCount: number
    headcount: number
    targetNetFullMonth: number
    periodIndex: number
  }[] = []
  let skippedInvalidNet = false
  periods.forEach((per, periodIndex) => {
    if (per.quantity <= 0) return
    if (per.netFullMonth <= 0) {
      skippedInvalidNet = true
      return
    }
    let remainingDays = Math.round(per.repeatVal * unitDayLength(per.unitCode))
    while (remainingDays > 0) {
      const spaceLeftInMonth = 30 - usedInCursorMonth
      const chunk = Math.min(spaceLeftInMonth, remainingDays)
      // Donem ay sinirini asip birden fazla skeleton parcasina bolunse bile (bu while dongusu),
      // TUM parcalar AYNI periodIndex'i tasir - kasitli, periodBreakdown gruplamasinda birlesecekler.
      skeleton.push({
        year: cursorYear,
        month: cursorMonth,
        dayCount: chunk,
        headcount: per.quantity,
        targetNetFullMonth: per.netFullMonth,
        periodIndex,
      })
      remainingDays -= chunk
      usedInCursorMonth += chunk
      if (usedInCursorMonth >= 30) {
        usedInCursorMonth = 0
        cursorMonth += 1
        if (cursorMonth > 12) {
          cursorMonth = 1
          cursorYear += 1
        }
      }
    }
  })
  if (skeleton.length === 0) {
    // Hepsi net<=0 yuzunden elendiyse kullanicinin gercek sorunu net'tir -> mesajda "net" gecer,
    // classifyBordroError 'invalid_net' uretir (tek-donemli net=0 ile ayni reason, tutarlilik).
    if (skippedInvalidNet) throw new Error('Payroll: hedef net 0 veya negatif, hesaplanamaz')
    throw new Error('Payroll: kalemin donem/Miktar/X verisinden ay uretilemedi')
  }

  const K = skeleton.reduce((acc, s) => acc + (s.dayCount / 30) * s.headcount, 0)
  if (K <= 0) throw new Error('Payroll: K faktoru sifir veya negatif, hesaplanamaz')

  const employeeSSPercent = legs.socialSecurityEmployee ? rates.socialSecurityEmployeePercent : 0
  const employeeUnempPercent = legs.unemploymentEmployee ? rates.unemploymentEmployeePercent : 0
  const exemptionSeries = deriveMinimumWageExemptionSeries(
    rates.minimumWageGrossThisMonth,
    employeeSSPercent,
    employeeUnempPercent,
    rates.incomeTaxBrackets,
  )
  const stampExemption = deriveStampDutyExemption(rates.minimumWageGrossThisMonth, rates.stampDutyPercent)

  // Donem gecisi ay ortasindaysa ayni gercek (yil,ay) ikilisine birden fazla skeleton satiri dusebilir;
  // her satira o ayin istisnasini TAM vermek ayni ay icin istisnayi iki kere sayardi (ihtiyat-ALEYHINE
  // hata). Istisna dayCount/30 oraniyla dagitilir: tam kapsanan ay toplamda TAM istisna alir, kist ay
  // gun-oranli (eksik) alir - yon ihtiyat-lehine.
  const months: PayrollMonthInput[] = skeleton.map((s) => {
    const dayRatio = new Decimal(s.dayCount).div(30)
    return {
      year: s.year,
      month: s.month,
      dayCount: s.dayCount,
      headcount: s.headcount,
      priorCumulativeTaxBase: 0,
      incomeTaxExemptionThisMonth: new Decimal(exemptionSeries[s.month - 1])
        .mul(dayRatio)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        .toNumber(),
      stampDutyExemptionThisMonth: new Decimal(stampExemption)
        .mul(dayRatio)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        .toNumber(),
      calculationType: 'net_to_gross' as const,
      targetNetFullMonth: s.targetNetFullMonth,
      periodIndex: s.periodIndex,
      usesDefaultCalendar: anchor.usesDefaultCalendar,
    }
  })

  const envelope = resolvePayrollItem(months, legs, rates)

  // Donem-bazli gruplama: motor ay-bazli calisir (kumulatif vergi tabani ay siniriyla ilerler, K7
  // ankoru), donem-bazli DEGIL - bir donem ay sinirini asip birden fazla skeleton parcasina
  // bolunebilir (yukarida periods.forEach). Cozum donemi hesaba karistirmiyor, sadece SONUCA
  // (monthlySeries) hangi donemden geldigini periodIndex ile etiketleyip burada gruplu topluyor.
  const breakdownByIndex = new Map<number, { netTotal: Decimal; grossTotal: Decimal }>()
  for (const r of envelope.monthlySeries) {
    const hc = new Decimal(r.effectiveHeadcount)
    const acc = breakdownByIndex.get(r.periodIndex) ?? { netTotal: new Decimal(0), grossTotal: new Decimal(0) }
    acc.netTotal = acc.netTotal.plus(new Decimal(r.netPerPerson).mul(hc))
    // grossTotal burada da uretici maliyeti (costPerPerson) - S2 ile ayni mantik, kisi brutu degil.
    acc.grossTotal = acc.grossTotal.plus(new Decimal(r.costPerPerson).mul(hc))
    breakdownByIndex.set(r.periodIndex, acc)
  }
  const periodBreakdown: BordroPeriodBreakdownEntry[] = [...breakdownByIndex.entries()]
    .sort(([a], [b]) => a - b)
    .map(([periodIndex, acc]) => {
      const netTotal = acc.netTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
      const grossTotal = acc.grossTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
      const legalBurden = acc.grossTotal.minus(acc.netTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
      const stageId = periods[periodIndex]?.stageId ?? null
      return { periodIndex, stageId, netTotal, grossTotal, legalBurden }
    })

  return {
    totalNet: envelope.netTotal,
    totalGross: envelope.grossTotal,
    monthlySeries: envelope.monthlySeries,
    signals: envelope.signals,
    bucketBreakdown: envelope.bucketBreakdown,
    periodBreakdown,
  }
}

// computeBordroFields'i sarar: motor Error firlatirsa (orn. hedef net 0/negatif) ham mesaji tipli
// reason'a cevirir. Servis katmaninin temiz sozlesmesi budur - dogrudan test edilir.
export function computeBordroFieldsResult(
  item: BordroItemFields,
  periodRows: BordroPeriodRow[],
  legs: PayrollLegs,
  rates: PayrollRates,
): BordroDerivationResult {
  try {
    return { ok: true, data: computeBordroFields(item, periodRows, legs, rates) }
  } catch (e) {
    return { ok: false, reason: classifyBordroError(e) }
  }
}

// Montaj SAF fonksiyonu (DB'ye dokunmaz, dogrudan test edilir): ham DB satirlarini motorun
// bekledigi sekle cevirir. Tekli ve toplu okuma yollarinin IKISI de bunu kullanir - tek montaj
// kodu, iki cagiran.
interface BordroItemRowInput {
  unit_net: number
  unit_id: string
  multiplier: number
  repeat: number
}

interface BordroPeriodRowInput {
  stage_id: string | null
  quantity: number
  repeat_override: number | null
  unit_id_override: string | null
  unit_net_override: number | null
}

export function assembleBordroInput(
  itemRow: BordroItemRowInput,
  periodRowsRaw: BordroPeriodRowInput[],
  burdenCodes: string[],
  unitCodeById: Map<string, string>,
  stageById: Map<string, { startDate: string | null; isUndated: boolean; sortOrder: number }>,
): { item: BordroItemFields; periodRows: BordroPeriodRow[]; legs: PayrollLegs } {
  const legCodes = new Set(burdenCodes)
  const legs: PayrollLegs = {
    socialSecurityEmployee: legCodes.has('sgk_isci'),
    unemploymentEmployee: legCodes.has('issizlik_isci'),
    socialSecurityEmployer: legCodes.has('sgk_isveren'),
    unemploymentEmployer: legCodes.has('issizlik_isveren'),
  }

  const periodRows: BordroPeriodRow[] = (periodRowsRaw ?? []).map((p) => {
    const stage = stageById.get(p.stage_id as string)
    return {
      quantity: Number(p.quantity),
      repeatOverride: p.repeat_override !== null && p.repeat_override !== undefined ? Number(p.repeat_override) : null,
      unitCodeOverride: p.unit_id_override ? (unitCodeById.get(p.unit_id_override as string) ?? null) : null,
      unitNetOverride:
        p.unit_net_override !== null && p.unit_net_override !== undefined ? Number(p.unit_net_override) : null,
      sortOrder: stage?.sortOrder ?? 0,
      startDate: stage?.startDate ?? null,
      isUndated: stage?.isUndated ?? true,
      stageId: p.stage_id as string,
    }
  })

  const item: BordroItemFields = {
    unitNet: Number(itemRow.unit_net),
    unitCode: unitCodeById.get(itemRow.unit_id) ?? 'month',
    multiplier: Number(itemRow.multiplier),
    repeat: Number(itemRow.repeat),
  }

  return { item, periodRows, legs }
}

// Kart acilirken TUM bordrolu kalemler icin TEK dalga cifti (perf dilimi): kalem basina ayri
// cagri elli kalemde ~300 sorgu/~100 gidis-donus demekti; bu fonksiyon kalem sayisindan BAGIMSIZ
// olarak alti sorguya iner. Matematik DEGISMEDI - her kalem yine assembleBordroInput +
// computeBordroFieldsResult'tan gecer, yalniz DB okumasi kalem basina degil butce basina olur.
export async function deriveBordroFieldsBatch(itemIds: string[]): Promise<Map<string, BordroDerivationResult>> {
  const result = new Map<string, BordroDerivationResult>()
  if (itemIds.length === 0) return result

  // Ilk dalga: budget_items / budget_item_periods / units / item_burdens birbirinden bagimsiz -
  // paralel baslatilir (perf, davranis ayni). Hata kontrolu asagida orijinal sirayla yapilir.
  const [
    { data: itemRows, error: ei },
    { data: periodRowsRaw, error: ep },
    { data: unitRows, error: eu },
    { data: burdenRows, error: eb },
  ] = await Promise.all([
    supabase
      .from('budget_items')
      .select('id, budget_id, unit_net, unit_id, multiplier, repeat, budgets(project_id, is_locked)')
      .in('id', itemIds),
    supabase
      .from('budget_item_periods')
      .select('item_id, stage_id, quantity, repeat_override, unit_id_override, unit_net_override')
      .in('item_id', itemIds),
    supabase.from('units').select('id, code'),
    supabase
      .from('item_burdens')
      .select('item_id, burden_components(code)')
      .in('item_id', itemIds),
  ])
  if (ei) throw new Error(ei.message)
  if (ep) throw new Error(ep.message)
  if (eu) throw new Error(eu.message)
  if (eb) throw new Error(eb.message)

  const unitCodeById = new Map<string, string>((unitRows ?? []).map((u) => [u.id as string, u.code as string]))

  // Tek-butce sozlesmesi: bu fonksiyon TEK bir butcenin kalemlerini bekler (kart acilisi hep tek
  // kartin/butcenin kalemlerini gonderir). Birden fazla budget_id gelirse sessizce yanlis oran
  // kullanmak yerine acikca DURULUR.
  const budgetIds = new Set((itemRows ?? []).map((r) => r.budget_id as string))
  if (budgetIds.size > 1) {
    throw new Error('Payroll: deriveBordroFieldsBatch birden fazla butceden kalem aldi (tek-butce sozlesmesi ihlali)')
  }
  const firstItemRow = (itemRows ?? [])[0] as unknown as
    | { budget_id?: string; budgets?: { project_id?: string; is_locked?: boolean } | null }
    | undefined
  const projectId = firstItemRow?.budgets?.project_id
  const isLocked = firstItemRow?.budgets?.is_locked ?? false
  const budgetId = firstItemRow?.budget_id

  const stageIdSet = new Set<string>()
  for (const p of periodRowsRaw ?? []) {
    const sid = p.stage_id as string | null
    if (sid) stageIdSet.add(sid)
  }
  const stageIds = [...stageIdSet]

  // Ikinci dalga: budget_stages (stageIds varsa) ile oran cetveli yalniz ilk dalganin sonucuna
  // (stageIds / isLocked / projectId / budgetId) bagimli - birbirinden bagimsiz, paralel baslatilir.
  // ORANLAR BIR KEZ cekilir (butun kalemler ayni butceye ait).
  const [stagesResult, rates] = await Promise.all([
    stageIds.length
      ? supabase.from('budget_stages').select('id, start_date, is_undated, sort_order').in('id', stageIds)
      : Promise.resolve({ data: [], error: null }),
    isLocked ? fetchSealedPayrollRates(budgetId as string) : fetchPayrollRates(projectId),
  ])
  const { data: stageRows, error: es } = stagesResult
  if (es) throw new Error(es.message)
  const stageById = new Map<string, { startDate: string | null; isUndated: boolean; sortOrder: number }>()
  for (const s of stageRows ?? []) {
    stageById.set(s.id as string, {
      startDate: (s.start_date as string | null) ?? null,
      isUndated: s.is_undated as boolean,
      sortOrder: s.sort_order as number,
    })
  }

  const periodRowsByItem = new Map<string, BordroPeriodRowInput[]>()
  for (const p of periodRowsRaw ?? []) {
    const itemId = p.item_id as string
    const list = periodRowsByItem.get(itemId) ?? []
    list.push(p as unknown as BordroPeriodRowInput)
    periodRowsByItem.set(itemId, list)
  }

  const burdenCodesByItem = new Map<string, string[]>()
  for (const r of burdenRows ?? []) {
    const itemId = (r as { item_id?: string }).item_id as string
    const code = (r as { burden_components?: { code?: string } | null }).burden_components?.code
    if (!code) continue
    const list = burdenCodesByItem.get(itemId) ?? []
    list.push(code)
    burdenCodesByItem.set(itemId, list)
  }

  const itemRowById = new Map<string, BordroItemRowInput>(
    (itemRows ?? []).map((r) => [r.id as string, r as unknown as BordroItemRowInput]),
  )

  for (const itemId of itemIds) {
    const itemRow = itemRowById.get(itemId)
    if (!itemRow) {
      result.set(itemId, { ok: false, reason: 'unknown' })
      continue
    }
    const { item, periodRows, legs } = assembleBordroInput(
      itemRow,
      periodRowsByItem.get(itemId) ?? [],
      burdenCodesByItem.get(itemId) ?? [],
      unitCodeById,
      stageById,
    )
    result.set(itemId, computeBordroFieldsResult(item, periodRows, legs, rates))
  }

  return result
}

// Bordro kalemi icin DB'den okuyup computeBordroFieldsResult'i cagirir. UI (budget-card-screen.tsx)
// bu fonksiyonu try/catch ile sarar; motor hatasinda ham mesaj degil tipli reason kodu firlatilir
// (ham hata sizintisi savunmasi, DILIM-3e-1). input_mode/input_value KULLANILMAZ - kaynak her zaman
// unit_net (item veya donem override).
// Toplu okumanin (deriveBordroFieldsBatch) ince sarmalayicisidir - iki fetch yolu YOK, tek yol
// toplu surumdur (perf dilimi).
export async function deriveBordroFields(itemId: string): Promise<BordroDerivedFields> {
  const map = await deriveBordroFieldsBatch([itemId])
  const result = map.get(itemId)
  if (!result || !result.ok) throw new Error(result ? result.reason : 'unknown')
  return result.data
}
