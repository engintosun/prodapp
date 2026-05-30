# KAAPA — STATUS.md

## Aktif Milestone
**M2 — Çekirdek Döngü** (ARCHITECTURE.md 2.5). M1 kapandı (`v0.1-auth`).
**M2.0 karar fazı KAPANDI** (G1 ✅ · G3 ✅ · status-geçiş=trigger ✅ · G6 yapı kuruldu). **M2.1 TAMAMLANDI** (görsel+yapısal temel). Şu an: **M2.2 + M2.3** sırada (kod).

## Son Session (30 Mayıs 2026 — M2.0 kalan kararlar + M2.1)
M2.0'ın kalan kararları kapatıldı ve M2.1 (görsel+yapısal temel) uçtan uca yazıldı. Tüm commit'ler origin'den bağımsız doğrulandı (fetch + hash).

**G1 kalıntı temizliği (`09f7a2f`):** Önceki "iade temizliği" üç ekran dokümanında Türkçe büyük "İ" ile başlayan "İade" kalıntılarını kaçırmış. Temizlendi (muhasebe Reddet'e 10 sebep bağlandı; açık-slot İade notları kaldırıldı). **DERS: `grep -i "iade"` Türkçe noktalı "İ"yi yakalamaz — "İade" ile başlayan satırlar kaçar. Türkçe metin taramasında `İ` ayrıca aranmalı.** Kiralama "İade Edildi" (§9 returned) ve TASARIM-KARARLARI:45 haritası dokunulmadan korundu.

**G3 KAPANDI (`15ff3a9`):** Pasif onay (7 gün) Faz 1'de **VAR**. Bekleyen fiş 7 gün işlem görmezse `auto_approved`. Amaç: işini bekleten muhasebenin fişi süresiz kilitlememesi — sorumluluk muhasebede, fiş sahibi cezalanmaz. **Şüpheli/anomali bayrağı auto-approve sonrası fişin üstünde kalır** (sessiz aklama değil). Kiralama istisna. 7 gün varsayılan, Faz 2'de proje bazında yapılandırılır. **Dönem kapanış grace'i:** dönem otomatik kapanmaz; muhasebe kapamayı ilan eder, ilandan **7 gün sonra** kapanır. Detay: IS-KURALLARI §5.

**Status geçiş yeri = TRIGGER (teyit):** submitted→dept_pending/acc_pending geçişi trigger ile. RLS gereği saha `status='draft'` dışını UPDATE edemiyor → geçiş frontend'den yapılamaz; trigger atomik ve güvenli yol. Karar zaten alınmıştı, teyit edildi.

**M2.1 TAMAMLANDI (4 commit):** tasarım token iskeleti + B4 shell/nav/tema + B5 paylaşılan bileşenler + A6 tipleri + provider mount. Token disiplini tam (hardcoded renk YOK; G6'da yalnız değer swap). `npm run build` temiz.

**Commit'ler (6, hepsi origin'den doğrulandı):**
- `09f7a2f` — docs(screens): G1 İade kalıntıları temizlendi (muhasebe Reddet'e 10 sebep, açık-slot İade notları)
- `15ff3a9` — docs(rules): G3 kapandı — pasif onay 7 gün + dönem kapama grace Faz 1'de
- `0c37e3b` — feat(ui): tokens.css + index.css iskelet (placeholder, dark-öncelikli, 100dvh/touch) [+ package-lock sync]
- `5d20b17` — feat(ui): B5 paylaşılan bileşenler (error-boundary, loading, empty, offline, error-message, confirm, toast)
- `bce51d8` — feat(ui): B4 shell/nav/tema + A6 tipleri (domain.ts, şemadan) + ErrorBoundary/ToastProvider mount
- `e36d717` — fix(types): ApprovalLog'a approver_role + split_amount (dept/acc ayrımı şema ile)

## M1 Özeti (KAPANDI — 27 Mayıs 2026, tag v0.1-auth)
Auth + RLS + DB şeması + çoklu-üyelik (multi-project) login akışı uçtan uca çalışıyor. profiles çoklu-üyelik remodel v2.0, set-claims/clear-claims Edge Functions canlı, üç-hâl App.tsx routing, Vercel prod (prodapp-navy.vercel.app). Detay: git history.

## Açık Kararlar
- **G6 görsel değerler** — tokens.css yapısı + placeholder kuruldu (M2.1). Gerçek renk/aksan/tipografi/logo/favicon G6 görsel oturumunda swap edilecek (yapı sabit, bileşenler `var(--...)` okur).
- **Dönem kapama ilanı + grace şema temsili** — "ilan zamanı / grace" periods'ta nasıl tutulacak (`close_declared_at`? ek statü?). periods'ta `closed_at/closed_by` var ama "ilan" ayrı. Dönem-kapama kodundan (M2.2/sonrası) önce kesinleşecek. (IS-KURALLARI §5 not.)
- (Sonraya: G2 dijital imza, G10 split child receipt, kategori/ulaşım limit değerleri, kiralama dönem-kapanış istisnası)
- Karara bağlandı (UI M3): muhasebe-izinli tekrar giriş + işaretli müdahale → `parent_receipt_id` (split ile aynı yapı)
- KAPANDI: G1 (iade→reddet) · G3 (pasif onay 7 gün + grace) · status geçiş yeri (=trigger)

## Faz 2'ye Taşınanlar
- Denetçi modu (G11) · Dil seçimi ekranı · Onboarding tutorial · Mesai hesaplama · Yapımcı rolü hot cost tam görünümü

## Açık Borçlar / Bekleyen İşler
- Teknik borç tek kaynak: **docs/TECH-DEBT.md** (TD-2, TD-3, TD-5, TD-6 = 4/5)
- README + favicon → G6 todo'su (borç değil)

## Sonraki Session Gündemi
1. **M2.2 — Storage + dönem + zemin:** receipts bucket + RLS (saha yükler, muhasebe görür) + dönem bootstrap (BOOTSTRAP-MUSTERI.sql'e ilk açık dönem — dönem yoksa fiş girilemez) + trigger doğrulama (submitted→pending canlıda) + `parent_receipt_id` zemini (split & red-tekrar-giriş tek yapı)
2. **M2.3 — Saha ekranı** (sıralı inşa: ilk rol; M2.1 + M2.2'ye dayanır)
3. Karar: dönem kapama ilanı + grace şema temsili (M2.2 öncesi)
Detaylı sıra ve bağımlılık: docs/IS-SIRASI.md

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya) + CLAUDE.md
- docs/IS-SIRASI.md (görev sırası — neredeyiz)
- docs/ARCHITECTURE.md (çalışma prensipleri §1.8 + Faz 1 kapsam)
- supabase/SUPABASE-SCHEMA.sql + SUPABASE-RLS.sql (M2.2: receipts bucket/RLS, trigger, parent_receipt_id)
- supabase/BOOTSTRAP-MUSTERI.sql (M2.2: dönem bootstrap)
- docs/IS-KURALLARI.md (onay zinciri §1-3, dönem §5, anomali §13)
- docs/EKRAN-SAHA.md + docs/TASARIM-KARARLARI.md (M2.3 saha ekranı + token yapısı)
- **src/ M2.1 iskeleti** (M2.3 bunlara dayanacak): src/shared/types/domain.ts (tipler) · src/styles/tokens.css (token isimleri) · src/app/layout/ (app-header, bottom-nav + NAV_ITEMS) · src/shared/components/ (B5) · src/app/auth/authenticated-shell.tsx (shell yapısı)

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | güncel | modüler docs routing + çalışma prensipleri + push doğrulama kuralı |
| docs/ARCHITECTURE.md | güncel | §1.8 prensipler; router.ts kalıntısı temizlendi |
| docs/AUTH-KARARLARI.md | güncel | SK-AUTH-1..9 |
| docs/TASARIM-KARARLARI.md | güncel | sadece ekranlar-arası ortak ilkeler; G1 temiz; G6 token yapısı M2.1'de kuruldu |
| docs/EKRAN-SAHA.md | güncel | saha ekranları; G1 temiz (İade kalıntıları temizlendi) |
| docs/EKRAN-DEPT.md | güncel | dept ekranları; G1 temiz (İade kalıntıları temizlendi) |
| docs/EKRAN-MUHASEBE.md | güncel | muhasebe ekranları (kart-masa açık slot); G1 temiz (Reddet'e 10 sebep) |
| docs/IS-KURALLARI.md | güncel | iş mantığı + reddet (G1) + pasif onay/grace (G3, §5) + anomali §13 + SK-1..8 |
| docs/IS-SIRASI.md | güncel | görev sırası; G1 ✅ G3 ✅; M2.1 ✅; borç tek-kaynak |
| docs/GLOSSARY.md | güncel | domain terimleri |
| docs/TECH-DEBT.md | güncel | 4/5 borç (TD-2,3,5,6) |
| docs/RAKIP-ANALIZI-OCR.md | güncel | referans |
| SUPABASE-SCHEMA.sql | v2.2 | chk_role_dept_id; approval_log.action sade (approved/rejected/split/auto_approved) |
| SUPABASE-RLS.sql | v2.1 | status='active' |
| SUPABASE-FUNCTIONS.sql | v1.0 | clear_user_claims RPC |
| sql/full-rebuild.sql | v2.2 | başlık güncel |
| set-claims/index.ts | güncel | canlı deployed |
| clear-claims/index.ts | güncel | debug detay çıkarıldı (TD-4), canlı deployed |
| auth-service.ts | v2.0 | signOut wrapper (TD-5 açık) |
| BOOTSTRAP-MUSTERI.sql | güncel | profil şablonu user_id; dönem bootstrap M2.2'de |
| src/ (M2.1) | iskelet | tokens.css + index.css (token yapısı, dark-öncelikli) · B4 shell/nav (app-header, bottom-nav+NAV_ITEMS, tema) · B5 7 bileşen · domain.ts tipleri (şemadan) · App+shell mount (ErrorBoundary/ToastProvider) |
| README.md | minimal | KAAPA açıklaması (G6 todo) |
| STATUS.md | güncel | M2.0 kararları kapandı + M2.1 tamamlandı (30 Mayıs) |

## Tamamlanan İşler
- [x] M1: scaffold, Supabase client, DB/RLS/Bootstrap, auth akışı, proje seçimi, set/clear-claims, üç-hâl routing, uçtan uca test, v0.1-auth tag
- [x] Doküman yeniden yapılandırma: modüler dosyalar, çalışma prensipleri, sınır temizliği
- [x] M2.0 G1 kapandı (iade→reddet; doküman + şema + ekranlar) + TD-4 + orphan temizliği + BOOTSTRAP düzeltme + push doğrulama kuralı (29 Mayıs, 6 commit)
- [x] M2.0 kalan kararlar kapandı: G1 kalıntı temizliği (grep İ dersi) + G3 (pasif onay 7 gün + grace) + status geçiş=trigger (30 Mayıs)
- [x] M2.1 tamamlandı: tokens+index, B5 (7 bileşen), B4 shell/nav/tema, A6 tipleri, ErrorBoundary/ToastProvider mount (30 Mayıs, 6 commit)
