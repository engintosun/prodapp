# KAAPA — STATUS.md

## Aktif Milestone
**M2 — Çekirdek Döngü** (ARCHITECTURE 2.5). M1 kapandı (`v0.1-auth`).
M2.0 ✅ (kararlar) · M2.1 ✅ (görsel + yapısal temel) · **M2.2 ✅** — grace şeması + parent_receipt_id zemini + bootstrap dönem + §17 timezone + draft kaldırma + yönlendirme trigger + storage (receipts bucket private + policy) canlıda. 3c kararı kapandı (mekanik M2.3'te). **Sıra: M2.3 saha ekranı.** Bu commit = chrome-hizalama: saha nav→4 (Ana/Dönem/Ara/Mesajlar) + header→spec (avatar-sol/proje-orta/badge-sağ/5-menü) + placeholder-disiplini kuralı. dept/muhasebe nav farklı layout → TODO-SPEC (M2.4/M2.5). NOT: M2.1 nav/header B4 stub'ları spec'e uymuyordu (işaretsizdi); bu commit saha+header'ı hizaladı. C1 gövdesi indi: src/app/saha/ (saha-screen router + saha-home-screen) — FİŞ TARA diski (G6 logo açık slot + oturum-bazlı açılış pulse) + Galeri/Belgesiz görünür butonlar; **uzun-bas çıkarıldı** (görünür buton > gizli submenu; EKRAN-SAHA §2 güncellendi). Disk/Galeri/Belgesiz tıklanır ama akış "yakında" (C2/C3). **Scroll-altı veri kartları (bütçe/kategori/son-3-fiş/avans) C1'de BASILMADI** — sahte placeholder yerine gerçek veriyle gelecek (son-3-fiş C2 sonrası; avans/bütçe kendi feature'ı); eksik değil, kasıt (placeholder-disiplini). Sıra: C2 (fiş giriş: kamera→foto→storage upload→manuel form→submitted INSERT; storage uçtan uca + owner=auth.uid() teyidi burada).

**Çekirdek döngü canlıda çalışıyor:** fiş gir → yönlendirme trigger'ı otomatik doğru kuyruğa düşürür (saha → aktif şef varsa dept_pending, yoksa acc_pending; dept şefi kendi fişi → acc_pending).

## Son Session (30–31 Mayıs 2026 — M2.2 (motor + storage) + doküman-senkronu)
M2.2 motoru yazıldı (6 commit, hepsi origin'den bağımsız doğrulandı: fetch + diff) + doküman-senkronu (2 commit). Canlıya uygulanan (Dashboard, doğrulama sorguları true): grace şeması · parent_receipt_id · draft→submitted geçişi + CHECK · yönlendirme trigger.

**İnşa commit'leri:**
- `5c6ff83` — Grace şeması: periods.status'e closing safhası (open→partially_closed→closing→closed→permanently_closed) + close_declared_at + grace_until. Muhasebe kapamayı ilan eder, fiş-giriş son tarihini (grace) verir; vermezse +3 gün emniyet; grace'te her fiş girilebilir, sonrası late_entry izniyle. Kapanışta temiz bekleyenler auto_approve (pasif 7 günü beklemez), bayraklılar işaretli kapanır. RLS fiş insert/delete `status IN ('open','closing')`. Detay: IS-KURALLARI §5.
- `a7b27e0` — parent_receipt_id zemini: receipts.parent_receipt_id self-FK (nullable) + chk_parent_not_self + idx + domain.ts. Yalnız zemin; split / red-tekrar-giriş AKIŞI M3.
- `934928d` — Bootstrap dönem: BOOTSTRAP-MUSTERI.sql Adım 6 (yorumlu template) — ilk açık dönem (period_number=1, 'Dönem 1', 'open'), 2. onboarding'de açılır.
- `1c53c9e` — §17 Zaman/tarih: saklama UTC (timestamptz / now()); tüm gün hesabı + gösterim Europe/Istanbul (AT TIME ZONE, offset elle gömme yok).
- `fcaa427` — draft KALDIRILDI (9→8 statü): fiş doğrudan submitted girer (kaydet = gönder; taslak yerel, DB'de yok). receipts.status default 'submitted' + CHECK 8 değer; RLS saha update/delete KALDIRILDI (fiş girince değişmez/silinmez = denetim kaydı). Detay: IS-KURALLARI §1/§2/§3.
- `bf45f08` — Yönlendirme trigger (M2 motoru): fn_route_receipt (BEFORE INSERT, SECURITY DEFINER) + trg_route_receipt. R1: saha → departmanında AKTİF şef varsa dept_pending, yoksa acc_pending; dept şefi kendi fişi → acc_pending. dept_id saha profilinden otomatik. receipts_insert dept'e de açıldı + giriş-statüsü guard. Status'u client değil trigger belirler. Detay: IS-KURALLARI §1.

**Doküman-senkronu commit'leri:**
- `edc4e52` — 3c düzeltme katmanı IS-KURALLARI §3'e (başlık "Reddet ve düzeltme iste"; tek tur, ping-pong yok, saha düzeltmesi nihai) + draft model kalıntıları (EKRAN-SAHA aksiyon + fiş detay) + IS-SIRASI M2 milestone ilerlemesi.
- `d964f55` — STATUS bf45f08 + edc4e52'ye senkron + RLS VARSAYIMLAR notu trigger sayısı 2→3.
- `0c31eaa` — doküman-senkron (Karar C+D): IS-KURALLARI §1 Şirket/Merkez faturaları + e-fatura elle kayıt + §3 çapraz ref + STATUS açık kararlar + BOOTSTRAP Adım 7 + EKRAN-MUHASEBE closing + IS-SIRASI borç 4/5.
- (bu commit) — Commit 4 storage: receipts bucket (private, Dashboard'dan) + storage.objects RLS (insert saha/dept · select muhasebe+sahibi+dept · sil/güncelle yok) → SUPABASE-RLS.sql + full-rebuild.sql. Canlı policy doğrulandı (bucket_public=false, insert/select var). M2.2 tamam.

## M1 Özeti (KAPANDI — 27 Mayıs 2026, tag v0.1-auth)
Auth + RLS + DB şeması + çoklu-üyelik login uçtan uca. set/clear-claims Edge canlı, üç-hâl App.tsx routing, Vercel prod (prodapp-navy.vercel.app). Detay: git history.

## 3c — Düzeltme Katmanı (KARARLANDI 31 Mayıs; mekanik M2.3'te)
Gönder-sonrası küçük düzeltme. Gönder = submitted sonrası saha fişe dokunamaz; red yanlış araç (donar, listeden çıkar). Yeni aksiyon **düzeltme iste** — reddet'in hafif kardeşi, aynı arayüz (fiş üstünde dropdown + mesaj). Dept (kendi dept'inin dept_pending fişleri) + muhasebe (her fiş). **Tek tur, ping-pong yok:** talep → saha düzeltir → karşı taraf yalnız kabul/red; saha düzeltmesi nihaidir. Şema hazır (approval_log + receipts_update), yeni tablo yok. Tam spec: IS-KURALLARI §3.
**3c kararı (31 Mayıs):** (a) ayrı statü YOK — fiş dept_pending/acc_pending'de kalır + receipts'e `correction_requested` bool bayrağı (saha-düzenleme penceresini yalnız o fiş + yalnız düzeltme istenmişken açar; RLS: user_id=auth.uid() AND correction_requested=true). (b) finansal/olgusal alan (tutar/tarih/KDV/vendor/açıklama/belgesiz) → saha'ya geri açılır + not; sınıflandırma (kategori/alt-kategori) → dept/muhasebe yerinde tek-tık, sessiz log. (c) elle/OCR alan işareti YOK (gerekirse M3/OCR). Mekanik (kolon + saha-update RLS + kolon-disiplini trigger + UI) M2.3'te uçtan uca iner. Tam spec: IS-KURALLARI §3.

## Açık Kararlar
- **Commit 4 storage — KARAR (B) ✅ BUILT:** bucket `receipts` (private, Dashboard) · path `projectId/receiptId/dosya` (RLS ilk klasörü project_id() ile eşler) · yükle saha+dept · gör muhasebe-hepsi + sahibi + dept-kendi-departmanı (receipts_select aynası) · sil/güncelle YOK (foto=kanıt). storage.objects policy (insert/select) canlı + repo (SUPABASE-RLS.sql + full-rebuild). Doğrulama true. (Gerçek upload testi M2.3'te — owner=auth.uid() davranışı orada teyit edilir.)
- **Şirket/Merkez + e-fatura — KARAR (C+D, çözüldü):** şirket faturaları sıradan "Şirket/Merkez" departmanına elle girilir (özel kod/yeni rol/atlama YOK; bootstrap seeded — Adım 7). Eski "muhasebe-direkt ayrı yol" iptal. GİB otomatik Faz 2. Detay: IS-KURALLARI §1. **Açık:** tek-muhasebeci ergonomisi.
- **G6 görsel değerler** — tokens.css yapısı + placeholder hazır; gerçek renk/aksan/tipografi/logo/favicon swap edilecek (yapı sabit, var(--...) okur).
- **G2** dijital imza (canvas) · **G10** split child receipt mekanizması · kategori/ulaşım limit değerleri · kiralama dönem-kapanış istisnası teyidi.
- (Önceden bağlandı) parent_receipt_id zemini atıldı → split & red-tekrar-giriş AKIŞI M3. Dönem kapama ilanı + grace şema temsili → 5c6ff83 ile çözüldü. Status geçiş yeri → trigger (bf45f08).
- (DÜŞÜNÜLECEK, Faz 1.5+) cross-company dedup (silent/intra-company/consortium) · data processor konumu · yasal harita (KVKK/GİB/TTK) · karışık fiş ("fiş çek gerisi bizde": varsayılan tam iş-ilişkili, opsiyonel kısmi tutar + açıklama, dept/muhasebe düzeltir).

## Faz 2'ye Taşınanlar
Denetçi modu (G11) · Dil seçimi ekranı · Onboarding tutorial · Mesai hesaplama · Yapımcı rolü hot cost tam görünümü · cross-company veri paylaşımı.

## Açık Borçlar / Bekleyen İşler
- Teknik borç tek kaynak: docs/TECH-DEBT.md (TD-2, TD-3, TD-5, TD-6 = 4/5).
- README + favicon → G6 todo (borç değil).
- Offline kuyruk (PWA, client submit-time, zaman-bazlı uygunluk) → M3 (ARCHITECTURE §5.7).

## Sonraki Session Gündemi
1. **M2.3 — Saha ekranı** (ilk rol; domain.ts + shell + B5 + tokens hazır; detay EKRAN-SAHA.md). **3c düzeltme mekaniği bu ekranda iner:** receipts.`correction_requested` kolonu + saha-update RLS penceresi + kolon-disiplini trigger + saha düzeltme UI; uçtan uca test (storage upload C1.6–C1.9 + owner=auth.uid() teyidi de burada). Karar: IS-KURALLARI §3.
Detaylı sıra + bağımlılık: docs/IS-SIRASI.md.

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya) + CLAUDE.md
- docs/IS-SIRASI.md (görev sırası — neredeyiz)
- supabase/SUPABASE-RLS.sql (storage RLS bunun yanına gelir; mevcut receipts policy'leri + trigger örüntüsü) + supabase/SUPABASE-SCHEMA.sql (receipts/periods alanları)
- docs/IS-KURALLARI.md §1 (yönlendirme) + §3 (reddet / düzeltme iste / 3c) + §5 (dönem / grace)
- (M2.3'e geçilirse) docs/EKRAN-SAHA.md + docs/TASARIM-KARARLARI.md + src/ M2.1 iskeleti: src/shared/types/domain.ts · src/styles/tokens.css · src/app/layout/ · src/shared/components/ · src/app/auth/authenticated-shell.tsx

## Doküman Sağlık Tablosu
| Dosya | Durum | Not |
|---|---|---|
| CLAUDE.md | güncel | session protokolü + çalışma kuralları + push doğrulama |
| docs/ARCHITECTURE.md | güncel | §1.8 prensipler; Faz 1 kapsam |
| docs/AUTH-KARARLARI.md | güncel | SK-AUTH-1..9 |
| docs/TASARIM-KARARLARI.md | güncel | ekranlar-arası ortak ilkeler; G6 token yapısı |
| docs/EKRAN-SAHA.md | güncel | §2 uzun-bas çıkarıldı (Galeri/Belgesiz görünür buton); draft kalıntıları temiz; fiş detay düzeltme-iste yolu |
| docs/EKRAN-DEPT.md | güncel | dept ekranları |
| docs/EKRAN-MUHASEBE.md | güncel | muhasebe ekranları (kart-masa açık slot); §11 dönem statüsü closing'li |
| docs/IS-KURALLARI.md | güncel | §1 yönlendirme + Şirket/Merkez faturaları (C+D) · §3 reddet + düzeltme iste (3c KARARLANDI: correction_requested bayrağı + alan-bazlı yön + işaret yok) · §5 grace · §13 anomali · §17 timezone |
| docs/IS-SIRASI.md | güncel | M2.0 ✅ M2.1 ✅ M2.2 ✅; 3c kararı → M2.3 mekaniği; C4 düzeltme istisnası |
| docs/GLOSSARY.md | güncel | domain terimleri + tehlikeli kökler |
| docs/TECH-DEBT.md | güncel | 4/5 borç |
| docs/RAKIP-ANALIZI-OCR.md | güncel | referans |
| SUPABASE-SCHEMA.sql | güncel | grace 5 safha + close_declared_at/grace_until · parent_receipt_id (self-FK + chk_parent_not_self) · receipts.status draft kaldırıldı (8 değer, default submitted) · receipts.receipt_no (Fiş No; aynı satıcı fişlerini ayırır, nullable — belgesizde yok) |
| SUPABASE-RLS.sql | güncel | fiş insert/delete dönem IN('open','closing') · receipts_insert saha+dept + giriş-statüsü guard · saha update/delete YOK · yönlendirme trigger (fn_route_receipt/trg_route_receipt); VARSAYIMLAR trigger sayısı 3 · §18 STORAGE receipts policy (insert saha/dept · select muhasebe+sahibi+dept) |
| SUPABASE-FUNCTIONS.sql | güncel | clear_user_claims RPC (yönlendirme trigger RLS dosyasında yaşıyor) |
| sql/full-rebuild.sql | güncel | grace + parent_receipt_id + draft-kaldırma + yönlendirme trigger + STORAGE receipts policy + receipt_no yansımış |
| set-claims / clear-claims | güncel | canlı deployed |
| BOOTSTRAP-MUSTERI.sql | güncel | profil şablonu + Adım 6 dönem + Adım 7 Şirket/Merkez dept template |
| src/ | M2.3 C1 | chrome + C1 saha home: src/app/saha/ (saha-screen router · saha-home-screen = FİŞ TARA diski + Galeri/Belgesiz, uzun-bas yok, pulse 1×) · shell saha rolünü SahaScreen'e yönlendirir (dept/muhasebe hâlâ generic EmptyState) · disk/buton akışları C2/C3 "yakında" · scroll-altı kartlar C1'de basılmadı (gerçek veri ile gelecek) · dept/muhasebe nav = TODO-SPEC |
| README.md | minimal | G6 todo |
| STATUS.md | güncel | C1 (saha home) + chrome senkron |

## Tamamlanan İşler
- [x] M1: scaffold, Supabase client, DB/RLS/Bootstrap, auth, proje seçimi, set/clear-claims, üç-hâl routing, v0.1-auth
- [x] Doküman yeniden yapılandırma (modüler karar dosyaları)
- [x] M2.0 kararlar (G1 · G3 · status geçiş = trigger · G6 yapı) + M2.1 (tokens · B5 7 bileşen · B4 shell/nav · A6 tipleri)
- [x] M2.2 motoru: grace şeması · parent_receipt_id zemini · bootstrap dönem · §17 timezone · draft kaldırma · yönlendirme trigger (6 commit, 30–31 Mayıs)
- [x] Doküman-senkronu: 3c → IS-KURALLARI §3 · draft model kalıntıları · IS-SIRASI milestone ilerlemesi · STATUS + RLS senkronu (31 Mayıs)
- [x] M2.2 Commit 4 storage + doküman-senkron (Karar C+D): receipts bucket (private) + storage.objects RLS (insert saha/dept · select muhasebe+sahibi+dept · sil/güncelle yok) · Şirket/Merkez dept + e-fatura + BOOTSTRAP Adım 7 (0c31eaa + bu commit, 31 Mayıs). **M2.2 tamam.**
