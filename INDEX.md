# KAAPA — INDEX.md

**Son guncelleme:** 16 Agustos 2026

## INDEX STATUS RULE

Bu dosya mevcut repository durumunu tanimlar. Planlanan, tasarlanan veya
henuz uygulanmamis ozellikler mevcut ozellik gibi yazilamaz.

Durumlar:
[ACTIVE]      Kodda mevcut ve kullanilabilir
[PARTIAL]     Kodun bir kismi mevcut
[SCHEMA_ONLY] Veri modeli/sema mevcut, uygulama eksik
[PLANNED]     Tasarlanmis, kodu yok
[ABSENT]      Repo'da karsiligi yok

Celiskide sira: repo > CURRENT.md > INDEX.md. INDEX bir ozettir;
ozet ile kaynak celisirse kaynak kazanir ve repo dogrulanmadan
varsayim yapilmaz.

## 1. REPO ÖZETİ

- KAAPA: sinema/TV prodüksiyon harcama yönetimi SaaS — bütçe modülü (kart/kalem planlama) + harcama/onay akışı (fiş/dönem/onay) iki ayrı doktrin taşır.
- Stack: React 19.2.6 + TypeScript 6.0.2 + Vite 8.0.12 (PWA) · Supabase (PostgreSQL, AWS İstanbul, KVKK) · Vercel deploy.
- Mimari katman ayrımı (ARCHITECTURE 5.2/5.3): veri (`shared/supabase/*-service.ts`, Supabase SDK doğrudan) → iş mantığı (saf fonksiyon, `shared/cfe/`) → UI (rol-bazlı `app/{rol}/` ekranları) → orkestrasyon (`*-screen.tsx`).
- Dizin ilkesi: ekranlar role göre (`saha/dept/muhasebe/reviewer/onboarding/auth/layout`), ortak kod `shared/` altında (özellik-bazlı değil).
- Ölçü: 76 kaynak dosya (`src/**/*.ts,tsx`) · 39 migration (baseline + 38 sonraki göç) · 3 edge function · 10 test dosyası, 299 test.
- Canlı şema tek kaynağı `supabase/migrations/00000000000000_baseline.sql`: 39 tablo · 101 RLS policy · 25 trigger · 17 fonksiyon.

## 2. KOD HARİTASI

### A seviyesi (KRİTİK)

`src/shared/cfe/payroll.ts` (445)
-> Görev: Bordro hesap motoru — net<->brüt ay-bazlı çözüm (kesin parçalı-doğrusal, iterasyon yok), SGK/işsizlik/gelir-vergisi/damga hesabı.
-> Kullanır: decimal.js; dışarıdan çağrılan yok (saf motor).
-> Etkiler: payroll-read.ts (buildPayrollRates/deriveBordroFields) -> use-edit-buffers.ts (refreshBordro) -> item-row.tsx/burden-sheet.tsx (bordro gösterimi).
-> Kritik: EVET — PERSONEL-MEVZUATI doktrinine karşı tek doğrulama noktası; K5 kesin-çözüm algoritması burada.

`src/shared/cfe/cfe.ts` (171)
-> Görev: Genel CFE motoru — net/brüt dönüşüm, KDV ayrıştırma, dönem-bazlı satır toplamı, kova (additive/deduction) matematiği.
-> Kullanır: decimal.js; dışarıdan çağrılan yok (saf).
-> Etkiler: item-row.tsx/period-row.tsx/burden-sheet.tsx (netToplamDonemli/brutToplamDonemli/kisiyeBanka çağırır).
-> Kritik: EVET — bordro-dışı tüm statülerin (smm/telif/şirket/kira/konaklama) net<->brüt hesabı tek buradan geçer.

`src/shared/supabase/budget-service.ts` (566)
-> Görev: Bütçe açılış + kart okuma (getCard/getOrOpenBudget) + kalem alanı yazma (updateItemField, setItemPeriodNet vb.) servis çağrıları.
-> Kullanır: shared/supabase/client.ts (Supabase SDK); fn_open_budget/fn_add_budget_item RPC'lerini çağırır.
-> Etkiler: use-card-rows.ts (okuma) + use-edit-buffers.ts (yazma) + card-table-screen.tsx buna bağlı.
-> Kritik: EVET — 500+ satır, BUTCE-UI-MIMARISI bölüm 8'de bölünme bekliyor (okuma/yazma ekseni), İ5 ilkesine tabi.

`src/shared/supabase/payroll-read.ts` (626)
-> Görev: Bordro türetme bloğu — saf hesap (computeBordroFields) + Supabase-okuyan orkestrasyon (buildPayrollRates/deriveBordroFields), açık/kilitli (mühür) rate_catalog okuma ayrımı.
-> Kullanır: shared/cfe (resolvePayrollItem, deriveMinimumWageExemptionSeries); shared/supabase/client.ts.
-> Etkiler: use-edit-buffers.ts (refreshBordro) + use-card-rows.ts (fetchMinimumWageThresholds) bunu çağırır.
-> Kritik: EVET — 500+ satır, BUTCE-UI-MIMARISI bölüm 8'de bölünme bekliyor; MUHUR-2 disiplini (açık/kilitli okuma) burada.

`src/app/muhasebe/budget/hooks/use-edit-buffers.ts` (728)
-> Görev: Grid hücrelerinin edit buffer'ı + EditApi — tüm alan-bazlı commit handler'larını (onNumChange/commitField/commitPeriod vb.) tek boğazdan geçirir.
-> Kullanır: shared/supabase/budget-service.ts (yazma) + payroll-read.ts (refreshBordro) + shared/components/toast.tsx.
-> Etkiler: card-table-screen.tsx (api) + item-row.tsx/period-row.tsx (EditApi tüketir) + use-grid-navigation.ts buna bağlı.
-> Kritik: EVET — 500+ satır, İ8 sınırını (EditApi yalnız kendi state'ine dokunur) taşır; bölünme BUTCE-UI-MIMARISI bölüm 8'de kayıtlı.

`src/app/muhasebe/budget/hooks/grid-navigation-core.ts` (406)
-> Görev: Klavye navigasyon çekirdeği (İ7 motoru) — hücre odak/tab/enter/arrow state makinesi, DOM'suz saf reducer + resolveKeyAction.
-> Kullanır: hiçbir dışarıdan modül (bilerek saf, DOM'suz).
-> Etkiler: use-grid-navigation.ts (DOM bağlayıcısı) + add-item-panel.tsx (combobox tuş kararı) buradan resolveKeyAction çağırır.
-> Kritik: EVET — K10 Tuş Sözleşmesi tek kaynağı; yeni tuş davranışı ANCAK buraya satır eklenerek doğar.

`src/app/muhasebe/budget/card-desk-screen.tsx` (129)
-> Görev: Kart masası — bütçenin kartlarını ızgarada gösterir, kapakta ad + net toplam, tıklanınca kartı açar.
-> Kullanır: budget-service.ts (fetchBudgetCards, fetchCardNetTotals, getOrOpenBudget) + format.fmt + shared/components/{loading,empty-state,error-message}.
-> Etkiler: authenticated-shell.tsx cardId yokken buradan render eder.
-> Kritik: HAYIR — kararlarin evi KABUK-KARARLARI 12.3; ekran orada yazilani cizer.

`src/app/muhasebe/budget/card-table-screen.tsx` (500)
-> Görev: Kart tablosu ekranının orkestrasyonu — veri hook'ları + ekleme paneli + satır bileşenlerini birbirine bağlar.
-> Kullanır: hooks/* (use-card-rows, use-edit-buffers, use-grid-navigation) + components/* + budget-service.ts.
-> Etkiler: authenticated-shell.tsx (muhasebe "bütçe" sekmesi) buradan render eder.
-> Kritik: EVET — İ4 (Ekran ≠ kabuk) sınırı burada tutulur; budgetId/cardId/viewMode dışarıdan alınabilir kalmalı. 500+ satır (1 Eylül 2026), BUTCE-UI-MIMARISI bölüm 8 kayıtlı.

`src/app/muhasebe/budget/components/item-row.tsx` (328)
-> Görev: Kart tablosunun kalem satırı — 14 haneli (13 veri kolonu + etiketsiz silme hanesi) KİLİTLİ kolon setinin tek satırlık render'ı, bordro/genel ayrımı + dönem-satırı açılımı.
-> Kullanır: shared/cfe (netToplamDonemli/brutToplamDonemli/kisiyeBanka) + format.ts + hooks/use-edit-buffers.ts (EditApi tipi).
-> Etkiler: card-table-screen.tsx satır-başına bunu render eder.
-> Kritik: EVET — İ1 (Tek tablo motoru, SAF SATIR) burada uygulanır: kart-özel dal YASAK, React.memo + inline closure yasağı.

`src/app/reviewer/reviewer-screen.tsx` (330)
-> Görev: Denetmen (dept/muhasebe) ekranı — bekleyen fiş listesi + onayla/reddet/düzeltme-iste akışı, red sebepleri dahil.
-> Kullanır: shared/supabase/receipt-service.ts (getPendingReviewReceipts/approveReceipt/rejectReceipt/requestCorrection).
-> Etkiler: authenticated-shell.tsx (dept "bekleyen" + muhasebe "masa" sekmeleri) buradan render eder.
-> Kritik: EVET — onay/red/düzeltme geçişleri birbirine bağlı tek state akışı, ayrılırsa takip edilemez.

`src/shared/types/domain.ts` (107)
-> Görev: Paylaşılan TypeScript domain tipleri — UserRole/Receipt/Period/ApprovalLog/Department/Invitation.
-> Kullanır: hiçbir modül (yalnız tip tanımları).
-> Etkiler: receipt-service.ts, reviewer-screen.tsx, invitation-service.ts, saha ekranları dahil neredeyse tüm src/ bu tipleri import eder.
-> Kritik: EVET — tek domain tip kaynağı; değişirse tüm rol ekranları derleme hatası verir.

`supabase/migrations/00000000000000_baseline.sql` (4293)
-> Görev: Canlı PostgreSQL şeması tek kaynağı — 39 tablo, 101 RLS policy, 25 trigger, 17 fonksiyon (pg_dump çıktısı).
-> Kullanır: hiçbiri (SQL dump); user_role()/project_id()/user_dept_id() auth.jwt() app_metadata okur.
-> Etkiler: tüm src/shared/supabase/*-service.ts + edge functions bu şemaya sorgu atar; güncel şema = baseline + sonraki 37 göç (kronolojik okunmalı).
-> Kritik: EVET — şema/RLS/grant değişikliği Engin onayı gerektirir (CLAUDE.md); tek başına bayat okunursa güncel şema YANLIŞ çıkar.

### B seviyesi (NORMAL)

`src/App.tsx` (49) — auth durumuna göre login/signup/proje-seçim/kabuk yönlendirmesi
`src/main.tsx` (13) — React kök giriş noktası, StrictMode + index.css import
`src/app/auth/authenticated-shell.tsx` (316) — rol-bazlı kabuk: header+nav+ekran seçimi, kurulum durumu kontrolü
`src/app/auth/create-project-page.tsx` (150) — yeni proje açma formu, fn_create_project çağırır
`src/app/auth/login-page.tsx` (55) — email/şifre giriş formu
`src/app/auth/project-selection-page.tsx` (332) — çoklu proje seçim ekranı + yeni proje açma girişi
`src/app/auth/signup-page.tsx` (107) — davet token'ıyla hesap oluşturma (accept-invitation çağırır)
`src/app/layout/app-header.tsx` (381) — üst şerit: avatar dropdown, proje adı, tema, çıkış, bildirim
`src/app/layout/app-shell.tsx` (190) — kabuk yerleşimi: sol ray + iki şeritli üst bağlam + kendi ekseninde kayan orta masa; ray daraltma düğmesini taşır
`src/app/layout/bottom-nav.tsx` (76) — rol-bazlı alt navigasyon sekmeleri (NAV_ITEMS)
`src/app/layout/nav-rail.tsx` (177) — sol ray: modül duraklarını çizer, açık/kapalı iki genişlik (168/68px), kapalıda ikon + ilk harf düşüşü
`src/app/layout/rail-icons.tsx` (46) — rayın elle yazılmış tek renkli SVG ikonları (currentColor; ikon kütüphanesi kurulmadı)
`src/app/muhasebe/budget/components/add-item-panel.tsx` (283) — kalem ekleme odası: kütüphane arama + serbest kalem
`src/app/muhasebe/budget/components/add-item-row.tsx` (60) — tablo altı "+ kalem ekle" düğme satırı
`src/app/muhasebe/budget/components/bottom-sheet.tsx` (104) — ortak alt-sheet primitivi (backdrop+panel+odak tuzağı)
`src/app/muhasebe/budget/components/burden-sheet.tsx` (108) — Yasal Yük dökümü sheet'i (bordro 6-bacak + basit statü)
`src/app/muhasebe/budget/components/heading-row.tsx` (24) — başlık satırı: ad + üç rakam (Net/Yasal Yük/Brüt), data-grid-cell taşımaz
`src/app/muhasebe/budget/components/heading-sheet.tsx` (71) — başlık seçme tabakası (kartın başlıkları + Başlıksız)
`src/app/muhasebe/budget/components/note-sheet.tsx` (35) — İç Not / Kamu Notu düzenleme sheet'i
`src/app/muhasebe/budget/components/period-row.tsx` (186) — çok-dönemli kalemin dönem alt-satırı render'ı
`src/app/muhasebe/budget/components/status-info-sheet.tsx` (15) — statü rehberi metinleri
`src/app/muhasebe/budget/components/table-styles.ts` (138) — kart tablosu kolon genişlikleri + hücre stilleri
`src/app/muhasebe/budget/format.ts` (311) — fmt/parseNumericDraft + kütüphane arama + başlık grubu saf fonksiyonları
`src/app/muhasebe/budget/hooks/use-card-rows.ts` (213) — kart verisi yükleme (budgetId/cardId), ref senkronizasyonu
`src/app/muhasebe/budget/hooks/use-grid-navigation.ts` (269) — İ7 motorunun DOM bağlayıcısı, tuş olaylarını çekirdeğe delege eder
`src/app/muhasebe/budget/totals.ts` (49) — saf satır ve kart toplamı (rowTotals/cardTotals); item-row kendi hesabını yapmaz, buradan çağırır
`src/app/muhasebe/definitions-screen.tsx` (116) — Tanımlar ekranı: rate_catalog referansı + şirket profili formu
`src/app/muhasebe/invite-screen.tsx` (232) — davet oluşturma formu + davet linki gösterimi
`src/app/saha/receipt-correction-screen.tsx` (164) — düzeltme istenen fişin yeniden düzenlenip gönderilmesi
`src/app/saha/receipt-entry-screen.tsx` (150) — yeni fiş girişi formu (tutar/KDV/tarih/kategori)
`src/app/saha/saha-home-screen.tsx` (179) — saha ana ekranı: FİŞ TARA diski + galeri/belgesiz + düzeltme listesi
`src/app/saha/saha-screen.tsx` (26) — saha alt-nav router (ana/dönem/ara/mesajlar)
`src/shared/cfe/index.ts` (4) — cfe.ts + payroll.ts barrel export
`src/shared/rail-state.ts` (30) — sol rayın açık/kapalı durumu + localStorage kalıcılığı (emsal: theme.ts)
`src/shared/supabase/auth-service.ts` (67) — profil listesi, proje claim seçimi (set-claims), çıkış
`src/shared/supabase/client.ts` (10) — tek Supabase client instance
`src/shared/supabase/company-profile-service.ts` (85) — şirket profili okuma/güncelleme (proje sahibi satırı)
`src/shared/supabase/invitation-service.ts` (52) — departman listesi + davet oluşturma
`src/shared/supabase/library-service.ts` (68) — Kalem Kütüphanesi okuma (kart-bazlı + tüm kütüphane)
`src/shared/supabase/onboarding-service.ts` (177) — departman/dönem/bütçe oluşturma, proje açma sarmalayıcı
`src/shared/supabase/receipt-service.ts` (181) — fiş CRUD + onay/red/düzeltme RPC çağrıları
`src/shared/theme.ts` (24) — dark/light tema state'i + localStorage kalıcılığı

Edge functions (`supabase/functions/`):
`accept-invitation/index.ts` (107) — davet token doğrulama + kullanıcı+profil oluşturma (service role)
`clear-claims/index.ts` (44) — çıkışta app_metadata claim'lerini temizler
`set-claims/index.ts` (65) — proje seçiminde app_metadata'ya project_id/role/dept_id yazar

`supabase/migrations/` — 37 göç (baseline hariç), kronolojik. baseline = BAYAT taban; guncel sema = baseline + sonraki tum gocler. Gocleri okurken kronolojik oku, yalniz baseline'a guvenme. Kararlari: docs/butce/BUTCE-SEMA-KARARLARI.md

### C seviyesi (BASİT)

`src/shared/components/` — 8 dosya, 687 satır: ortak UI primitifleri (dialog/empty-state/error/loading/toast/offline-banner/şirket-profili-formu)
`src/app/onboarding/` — 5 dosya, 551 satır: kurulum sihirbazı adımları (şirket/departman/dönem/bütçe) + akış orkestrasyonu
`src/styles/` + `src/index.css` — 2 dosya, 137 satır: tasarım token'ları (renk/spacing/z-katman) + global reset

## 3. MODUL HARITASI
(dilim 2 — bu dilimde yazilmadi)

## 4. BAGIMLILIKLAR

Kaynak: src altındaki gerçek `import` satırları. (a) ve (b) sayıları 8 Ağustos 2026 türetmesidir, 14 Ağustos'ta YENİDEN TÜRETİLMEDİ; (c) kuralları 14 Ağustos 2026'da yeniden grep'lendi. Kanıtı olmayan bağ yazılmadı.

### (a) Kritik servisler

`shared/supabase/client.ts` <- 15 dosya (kanıt: budget-service.ts, auth-service.ts, App.tsx)
`shared/types/domain.ts` <- 11 dosya (kanıt: reviewer-screen.tsx, receipt-service.ts, authenticated-shell.tsx)
`shared/supabase/budget-service.ts` <- 9 dosya (kanıt: card-table-screen.tsx, use-card-rows.ts, item-row.tsx)
`shared/supabase/onboarding-service.ts` <- 5 dosya (kanıt: department-step.tsx, budget-step.tsx, authenticated-shell.tsx)
`shared/supabase/invitation-service.ts` <- 4 dosya (kanıt: department-step.tsx, invite-screen.tsx, authenticated-shell.tsx)
`shared/supabase/receipt-service.ts` <- 4 dosya (kanıt: reviewer-screen.tsx, receipt-entry-screen.tsx, saha-home-screen.tsx)
`shared/supabase/payroll-read.ts` <- 4 dosya (kanıt: use-edit-buffers.ts, use-card-rows.ts, burden-sheet.tsx)

### (b) Ortak bileşenler

`shared/components/toast.tsx` (useToast) <- 15 dosya (kanıt: card-table-screen.tsx, saha-home-screen.tsx, App.tsx)
`shared/components/empty-state.tsx` <- 4 dosya (kanıt: reviewer-screen.tsx, card-table-screen.tsx, authenticated-shell.tsx)
`shared/components/loading.tsx` <- 3 dosya (kanıt: reviewer-screen.tsx, card-table-screen.tsx, authenticated-shell.tsx)
`shared/cfe` (barrel: cfe.ts + payroll.ts) <- 5 dosya (kanıt: item-row.tsx, format.ts, payroll-read.ts)

### (c) Tek yönlü kurallar

Kaynak: docs/ARCHITECTURE.md bölüm 5.3-5.4 (rol-bazlı `app/{rol}` ekranları `shared/` servislerini çağırır, tersi değil) + CLAUDE.md Teknik kurallar (veri -> iş mantığı -> UI -> orkestrasyon). eslint'te bu katmanlaşmayı zorlayan özel bir rule (örn. import/no-restricted-paths) YOK — disiplin dokümanter.

- `shared/` hiçbir dosyası `app/`dan import ETMEMELİ — grep doğrulandı (14 Ağustos 2026): İHLAL YOK.
- `shared/cfe/` (iş mantığı) `shared/supabase/`dan (veri) import ETMEMELİ — grep doğrulandı (14 Ağustos 2026): İHLAL YOK.

## 5. VERI AKISLARI
(dilim 2 — bu dilimde yazilmadi)

## 6. DOMAIN KURALLARI
(dilim 2 — bu dilimde yazilmadi)

## 7. DOKUMANTASYON HARITASI

### 7.0 Karar tipi -> ev dosyası

KALICILIK KURALI gereği her karar CURRENT.md'ye VE kendi özel ev dosyasına yazılır.

| Karar tipi | Ev |
|---|---|
| Bir ekranın davranışı (ne görünür, ne olur) | o ekranın kararlar dosyası; bütçe için `docs/butce/BUTCE-EKRAN-KARARLARI.md` |
| Ekranlar arası ortak ilke (renk, katman sırası, odak, etkileşim) | `docs/TASARIM-KARARLARI.md` |
| Uygulama kabuğu (dört bölge, sol ray, üst bağlam, modül kapıları, adres şeması) | `docs/KABUK-KARARLARI.md` |
| Veri yapısı (tablo, kolon, fonksiyon) | `docs/butce/BUTCE-SEMA-KARARLARI.md` |
| Kodun nerede duracağı | `docs/butce/BUTCE-UI-MIMARISI.md` |
| Terim ve adlandırma | `docs/GLOSSARY.md` |
| Hesap ve iş kuralı | `docs/IS-KURALLARI.md` |
| Bilerek bırakılan borç | `docs/TECH-DEBT.md` |
| Auth, rol, RLS | `docs/AUTH-KARARLARI.md` |
| Sıradaki iş | `CURRENT.md` (tamamlananlar ve uzun vadeli backlog: `docs/IS-SIRASI.md`) |
| Oturum açılış ve kapanış prosedürü, prompt biçimi | `docs/protokol/ACILIS.md`, `KAPANIS.md`, `PROMPT.md` |
| Tekrar eden kusur sınıfları ve dersleri | `docs/protokol/DERSLER.md` |

Şema araştırılırken: güncel şema = baseline + sonraki TÜM göçler. Baseline bayat tabandır, göçler kronolojik okunur. Eski `supabase/SUPABASE-*.sql` ve `full-rebuild.sql` dosyaları `docs/archive/` altındadır, tarihsel referanstır.

Eşleşme yoksa `docs/ARCHITECTURE.md` okunur, sonra sorulur. Emin olunamayan durumda dosya listesine BAKILIR, tahmin edilmez.

Dokuman etiketleri:
[MUHURLU]  Karara baglanmis, kapanmis dosya — yeni karar girmez
[AKAN]     Yasayan dosya — her turda yeni karar eklenir
[KAYNAK]   Ham malzeme; karar dosyasi degildir
`(dogrulama: TARIH)` — dosyanin EN SON baştan sona doğruluk gözüyle okunduğu tarih. Dosya düzenlendiğinde İLERLEMEZ; yalnız biri oturup okuduğunda ilerler.
Bu tarih burada TEK yerde yaşar; dosyaların kendi içinde "Son güncelleme" başlığı YOKTUR (ARCHITECTURE 4.5, 18 Ağustos 2026).

`docs/butce/KART-KATALOGU.md` [MUHURLU] (dogrulama: 15 Ağustos 2026) — Etap/Kart eksenleri · Kalem davranış motoru · Çoklu çalışma/yetki · Kilitli kartlar (7.1-7.5) · kod: migrations/…seed_sistem_sablon_film_1500.sql · library-service.ts
`docs/butce/VERGI-MEVZUATI.md` [MUHURLU] (dogrulama: 16 Ağustos 2026) — Ödeme statüsü→vergi davranışı (resmi_odeme dahil, yedinci statü) · Stopaj · KDV/KDV tevkifatı · KAAPA'ya bağlanış · kod: shared/cfe/cfe.ts
`docs/butce/PERSONEL-MEVZUATI.md` [MUHURLU] (dogrulama: 11 Temmuz 2026) — Görev sınırı/statü cetveli · Motor doktrini (DILIM-3 mühürleri) · Personelin yasal gideri parametre envanteri · kod: shared/cfe/payroll.ts · shared/supabase/payroll-read.ts
`docs/butce/BUTCE-SEMA-KARARLARI.md` [MUHURLU cekirdek + AKAN ek] (dogrulama: 19 Ağustos 2026) — Bütçe göçü/köprü kararları · Şablon body FORMAT+KDV ayrıştırma · KUR-1 çok para birimi mührü · Satır-ekleme/Kalem Kütüphanesi · RESMİ ÖDEME + GÖRSEL GRUP + TEK İMZA DOKTRİNİ (15 Ağustos 2026) · kod: supabase/migrations/** · shared/supabase/budget-service.ts — B-serisi şema kararları ve kilitli vergi/yük modeli mühürlüdür; kart kataloğu ve şablon bölümleri akandır.
`docs/AUTH-KARARLARI.md` [MUHURLU cekirdek + AKAN ek] (dogrulama: 31 Temmuz 2026) — Onboarding/giriş akışı · Davet zinciri · Multi-project desteği · Üyelik yaşam döngüsü · Proje yaşam döngüsü (SK-AUTH-12) · kod: app/auth/** · auth-service.ts · invitation-service.ts · supabase/functions/**
`docs/butce/KART-GEREKCELERI.md` [MUHURLU] (dogrulama: 16 Ağustos 2026) — Çapraz-doğrulama yöntemi · KART 1100/1300/1400/1500/1600 gerekçeleri · 1100 üç yeni atom gerekçesi + damıtımın açık sorusunun kapanması (15 Ağustos 2026) · Genel eğitim notları · kod: yok
`docs/RAKIP-ANALIZI-URUN.md` [KAYNAK] (dogrulama: 14 Ağustos 2026) — YAMDU · Diğer rakipler · kod: yok
`docs/RAKIP-ANALIZI-OCR.md` [KAYNAK] (dogrulama: 22 Haziran 2026) — Global/Türkiye firmaları · Bağımsız benchmark verileri · Sektör yaklaşım modelleri · KAAPA çıkarımları/kararlar · kod: yok
`docs/butce/BUTCE-ARASTIRMA-DURUM.md` [KAYNAK] (dogrulama: 1 Ağustos 2026) — Yapılan/önerilen kart listesi · Açık kararlar · 2026 yeni-nesil ihtiyaçlar · Faz 1 bekleyen (kod) · kod: yok
`docs/butce/KAAPA_damitim_Koster_TUM-BOLUMLER.md` [KAYNAK] — Koster hesap-bazlı prodüksiyon mantığı damıtımı (1100-6400) · KAAPA'ya bağlanış katmanı · kod: yok
`docs/ORKESTRASYON.md` [AKAN] (dogrulama: 22 Haziran 2026) — Üç platform/GitHub tek kaynak · Deploy akışı (asimetrik) · Edge functions · Secret haritası · kod: supabase/functions/** + deploy zinciri
`docs/butce/BUTCE-UI-MIMARISI.md` [AKAN] (dogrulama: 18 Ağustos 2026) — Eksen zinciri · İlkeler (İ1-İ8) · Hedef dosya haritası · Boy aşımı bölünme bekleyenler · kod: src/app/muhasebe/budget/**
`docs/TECH-DEBT.md` [AKAN] (dogrulama: 14 Ağustos 2026) — Açık borç · Kapatılan borçlar · Bütçe kontrolü · Ödeme merdiveni · kod: yok
`docs/rakip/YONTEM.md` [AKAN] — Kanıt seviyeleri · İki doktrin kuralı · Boyut ızgarası (42 boyut) · Adres haritası · kod: yok
`docs/IS-SIRASI.md` [AKAN] (dogrulama: 18 Ağustos 2026) — Yapıldı (referans) · Sırada · Backlog · Borçlar · kod: yok
`docs/ARCHITECTURE.md` [AKAN] (dogrulama: 18 Ağustos 2026) — Çalışma sözleşmesi · Vizyon kontrolü · Teknik felsefe · Entropi koruması/mimari yeniden yapılanma · kod: dizin yapısının tamamı (5.3)
`docs/butce/BUTCE-EKRAN-KARARLARI.md` [AKAN] (dogrulama: 19 Ağustos 2026) — Kalem satırı yapısı/statü · Net/Brüt/Yasal Yük · Not mimarisi · Satır ekleme+autocomplete+KLV · kod: budget/components/{item-row,period-row,add-item-panel}.tsx · budget/card-table-screen.tsx (§18 kart toplamı şeridi + tablo genişliği) · budget/components/heading-row.tsx (§19 başlık satırı) · budget/components/heading-sheet.tsx (§19 sonradan taşıma)
`docs/EKRAN-MUHASEBE.md` [AKAN] (dogrulama: 14 Ağustos 2026) — Header/tab bar · Dashboard/Bekleyen/Şüpheli/Raporlar · Departman/kategori/kullanıcı yönetimi · Bütçe modülü ekranları (B-serisi) · kod: reviewer-screen.tsx · definitions-screen.tsx · invite-screen.tsx
`docs/KABUK-KARARLARI.md` [AKAN] (dogrulama: 15 Ağustos 2026) — Tasarım tezi · Dört bölge kabuk anatomisi · Sol ray/üst bağlam/sağ referans · Ayrıntı turu kararları · kod: layout/{app-header,bottom-nav,app-shell,nav-rail,rail-icons}.tsx · authenticated-shell.tsx · shared/rail-state.ts [PARTIAL] — sol ray [ACTIVE] (KABUK sprinti, 8-12 Ağustos 2026), sağ referans paneli [ABSENT] (Engin kararı 11 Ağustos 2026: bu sprintte çizilmez, yeri ayrılı kalır), kart masası [PARTIAL] (15 Ağustos 2026, db8d5bd: ızgara + kapak (ad + net) + karta giriş CANLI; işaret, kişiye özel diziliş, icmal seçimi ve ince şerit dönüş yolu henüz çizilmedi)
`docs/GLOSSARY.md` [AKAN] (dogrulama: 17 Ağustos 2026) — Ana terimler (görsel grup/başlık satırı/alt-kod/harç-vergi dahil) · Alan adlandırma doktrini · Tehlikeli Türkçe kökler · Katalog/Şablon/Masa · kod: shared/types/domain.ts
`docs/TASARIM-KARARLARI.md` [AKAN] (dogrulama: 8 Ağustos 2026) — Tasarım felsefesi · Kart-merkezli arayüz · Tema/görsel kimlik · Katman sırası/odak göstergesi · kod: styles/tokens.css · shared/theme.ts
`docs/IS-KURALLARI.md` [AKAN] (dogrulama: 6 Ağustos 2026) — Onay zinciri · Fiş status değerleri · Dönem/kapama · Anomali motoru · kod: receipt-service.ts · reviewer-screen.tsx · app/saha/**
`docs/EKRAN-DEPT.md` [AKAN] (dogrulama: 22 Haziran 2026) — Header/üst yapı · Harcama limiti kartı · Bekleyen tab (onay duvarı) · İstisna izinleri · kod: yok [ABSENT] — dept ekranı yazılmadı
`docs/EKRAN-SAHA.md` [AKAN] (dogrulama: 2 Haziran 2026) — Giriş akışı · Ana ekran/fiş giriş yolları · OCR sonuç formu · Dönem/arama/mesajlar · kod: app/saha/**
`CLAUDE.md` [AKAN] (dogrulama: 18 Ağustos 2026) — Oturum protokolü · Opus/Sonnet iş bölümü · Prompt zorunlulukları · Doğrulama/karar disiplini · kod: .claude/**
`CURRENT.md` [AKAN] (dogrulama: 18 Ağustos 2026) — Milestone özeti · Optimizasyon turu · Durum (HEAD/test/build) · Mühür durumu · Karar evleri işaretçisi · Sıradaki iş · kod: yok

`docs/protokol/ACILIS.md` [AKAN] (dogrulama: 25 Ağustos 2026) — Oturum açılış protokolü · Taze klon zorunluluğu · Okuma sırası · Durum raporunun biçimi · kod: yok
`docs/protokol/KAPANIS.md` [AKAN] (dogrulama: 25 Ağustos 2026) — Oturum kapanış protokolü · Diyet kuralı (Milestone damıtılır, sayılmaz) · KALICILIK KURALI · Doküman doğrulamasının zamanı · kod: yok
`docs/protokol/DERSLER.md` [AKAN] (dogrulama: 25 Ağustos 2026) — Süreç dersleri sınıf olarak · Kapıya bağlanmış sınıflar · Kapısı olmayan sınıflar · kod: .claude/hooks/**
`docs/protokol/PROMPT.md` [AKAN] (dogrulama: 25 Ağustos 2026) — Sonnet prompt şablonu ve zorunlulukları · kod: yok

## 8. KRİTİK DOSYALAR

Kaynak: docs/butce/BUTCE-UI-MIMARISI.md bölüm 2 (İ1-İ8) + bölüm 8, docs/ARCHITECTURE.md 4.2.

- `payroll.ts` — ARCHITECTURE 4.2: 300+ satır (445), kendi BOY gerekçesi var (motor matematiği bölünmez); BUTCE-UI-MIMARISI'de ayrı uyarı kayıtlı değil.
- `cfe.ts` — özel uyarı kayıtlı değil; K5 kesin-çözüm ilkesi (iterasyon yasak) kod içi yorumda.
- `budget-service.ts` — BUTCE-UI-MIMARISI bölüm 8: 500+ satır, bölünme fikri kayıtlı (okuma/yazma ekseni); İ5 (servis eksen bölünmesi) ilkesine tabi.
- `payroll-read.ts` — BUTCE-UI-MIMARISI bölüm 8: 500+ satır, bölünme fikri kayıtlı (saf hesap / Supabase-orkestrasyon ayrımı); İ5.
- `use-edit-buffers.ts` — BUTCE-UI-MIMARISI bölüm 8: 500+ satır, bölünme fikri kayıtlı; İ8 sınırı (EditApi yalnız kendi state'ine dokunur) bölünmeden sonra da geçerli kalmalı.
- `grid-navigation-core.ts` — İ7 + K10 ilke (c): yeni tuş davranışı ANCAK çekirdeğe satır eklenerek doğar, dağınık tuş-özel if YASAK.
- `card-table-screen.tsx` — İ4 (Ekran ≠ kabuk): budgetId/cardId/viewMode dışarıdan alınabilir kalmalı; CARD-DESK kabuğu ayrı iş; 500+ satır, BUTCE-UI-MIMARISI bölüm 8 bölünme fikri kayıtlı.
- `item-row.tsx` — İ1 (Tek tablo motoru, SAF SATIR): kart-özel dal (if kart==1500) YASAK, memo + inline closure yasağı.
- `reviewer-screen.tsx` — özel uyarı kayıtlı değil (bütçe modülü dışı); ARCHITECTURE 4.2: 300+ satır (330), kendi BOY gerekçesi var.
- `domain.ts` — özel uyarı kayıtlı değil.
- `baseline.sql` — özel uyarı kayıtlı değil (BUTCE-UI-MIMARISI/ARCHITECTURE 4.2 kapsamı UI kod yapısı); CLAUDE.md Ortamlar: yeni tablo → GRANT+RLS ikisi de gerekir, şema/RLS/grant değişikliği Engin onayı ister.

## 9. TEST HARİTASI

Test sayıları `npm test` çıktısından okundu (19 Ağustos 2026), toplam 299/299 geçti.

- `src/shared/cfe/cfe.test.ts` — CFE motorunu (net/brüt/KDV/kova) korur — 28 test
- `src/shared/cfe/payroll.test.ts` — Bordro motorunu (payroll.ts) korur — 27 test
- `src/shared/supabase/budget-service.test.ts` — budget-service.ts servis fonksiyonlarını korur (kartNetToplamlari + updateItemField payment_status VALID + addBudgetItem RPC yolları dahil) — 35 test
- `src/shared/supabase/library-service.test.ts` — Kalem Kütüphanesi okumasını korur (fetchCardLibrary kalemleri ve başlıkları AYRI listelerde döndürür, fetchAllLibrary isGroup ile birlikte tam liste döner) — 3 test
- `src/app/muhasebe/budget/hooks/grid-navigation-core.test.ts` — İ7 klavye çekirdeğini (resolveKeyAction/reduceGrid) korur — 108 test
- `src/app/muhasebe/budget/format.test.ts` — format.ts saf fonksiyonlarını korur (findCrossCardMatches'in başlık-satırı istisnası + headingKeyOf/groupRowsByHeading dahil) — 66 test
- `src/app/muhasebe/budget/components/add-item-panel.test.tsx` — kalem ekleme paneli davranışını korur — 4 test
- `src/app/muhasebe/budget/totals.test.ts` — satır/kart toplamı saf fonksiyonlarını (rowTotals/cardTotals) korur — 8 test
- `src/app/auth/shell-routing.test.tsx` — rol/adres eşlemesini ve kabuk-klasik dal ayrımını korur (muhasebe adresinde alt şerit görünmez; /butce cardId'li ve cardId'siz dalları) — 11 test
- `src/app/layout/app-shell.test.tsx` — kabuk yerleşimini ve ray daraltma davranışını korur — 9 test
