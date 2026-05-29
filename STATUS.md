# KAAPA — STATUS.md

## Aktif Milestone
**M2 — Çekirdek Döngü** (ARCHITECTURE.md 2.5). M1 kapandı (`v0.1-auth`).
Şu an: M2 kod öncesi **doküman yeniden yapılandırma** fazı tamamlandı; sıradaki M2.0 karar kapatma.

## Son Session (29 Mayıs 2026 — Doküman yeniden yapılandırma)
Mayıs reset sonrası dağılan kararlar kurtarıldı, doküman yapısı modülerleştirildi. Kod yazılmadı.

**Yapılanlar (5 commit):**
- `ec0fa4b` — docs: 5 yeni modüler dosya (EKRAN-SAHA/DEPT/MUHASEBE, IS-KURALLARI, IS-SIRASI)
- `bcc0f08` — docs(claude): routing tablosu + dosya yapısı + çalışma prensipleri özeti
- `f7b8c38` — docs(arch): çalışma prensipleri (§1.8) + branch/durum düzeltmeleri
- `ff7705a` — docs(design): TASARIM-KARARLARI sadeleştirildi (356→48, sadece ortak ilkeler)
- `[bu commit]` — docs: STATUS güncelleme

**Kurulan çalışma prensipleri (ARCHITECTURE §1.8 + CLAUDE):**
- Versiyon dili yasak (karar yazılır, kaynağı yazılmaz)
- Modüler karar dosyaları (her ekran/konu tek evde, IS-SIRASI sadece durum)
- Sistem-genel etki analizi (karar izole verilmez, tüm ilgili dosyalar taranır)
- Dayanıklı/kararsız katman ayrımı (yerleşim+akış+mantık yazılır, renk+sunum açık slot)

**Doküman sınırları netleşti (her bilgi tek evde):** ekran detayı → EKRAN-*; iş mantığı+anomali → IS-KURALLARI; auth → AUTH-KARARLARI; ortak görsel ilke → TASARIM-KARARLARI; görev sırası → IS-SIRASI. AUTH kopyası TASARIM'dan silindi (Ç3/Ç4 çözüldü), dil Faz 2'ye (Ç1).

## M1 Özeti (KAPANDI — 27 Mayıs 2026, tag v0.1-auth)
Auth + RLS + DB şeması + çoklu-üyelik (multi-project) login akışı uçtan uca çalışıyor. profiles çoklu-üyelik remodel v2.0, set-claims/clear-claims Edge Functions canlı, üç-hâl App.tsx routing, Vercel prod (prodapp-navy.vercel.app). Detay: git history.

## Açık Kararlar (M2.0 — kod öncesi netleşmeli)
- **G1** — iade edilen fiş status'ü ('returned' mi, draft'a mı döner) — şema kararı
- **G3** — auto_approved / 7 gün pasif onay Faz 1'de var mı
- **Status geçiş yeri** — submitted→dept_pending/acc_pending trigger mı frontend mi
- **G6 başlangıcı** — tokens.css için renk yaklaşımı (değerler sonra)
- (Sonraya: G2 dijital imza tanımı, G10 split child receipt, kategori/ulaşım limit değerleri)

## Faz 2'ye Taşınanlar
- Denetçi modu (G11) · Dil seçimi ekranı · Onboarding tutorial · Mesai hesaplama · Yapımcı rolü hot cost tam görünümü

## Açık Borçlar / Bekleyen İşler
- TD-2/3: remodel şekil borçları (M2)
- TD-4: clear-claims rpcErr debug — üretim öncesi temizlik
- TD-5: auth-service.signOut sessiz try/catch — M2 toast/log
- Proje adı SSOT: projects.name vs company_settings.project_name
- full-rebuild.sql satır 4 versiyon başlığı stale (v2.1 → v2.2)
- README minimal, favicon placeholder (G6)
- ARCHITECTURE.md 5.3 router.ts satırı geçersiz (kozmetik)
- Remote branch temizliği (kozmetik)

## Sonraki Session Gündemi
1. **M2.0 — Karar kapatma:** G1, G3, status geçiş yeri, G6 renk yaklaşımı
2. **M2.1 — Görsel+yapısal temel:** tokens.css iskeleti + shell/nav (B4) + paylaşılan bileşenler (B5)
3. **M2.2 — Storage+dönem:** receipts bucket + RLS + dönem bootstrap + trigger doğrulama
4. Sonra **M2.3 Saha ekranı** (sıralı inşa başlar)
Detaylı sıra ve bağımlılık: docs/IS-SIRASI.md

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya) + CLAUDE.md
- docs/IS-SIRASI.md (görev sırası — neredeyiz)
- docs/ARCHITECTURE.md (çalışma prensipleri §1.8 + Faz 1 kapsam)
- docs/IS-KURALLARI.md (onay zinciri, status, dönem — M2.0 kararları için)
- docs/EKRAN-SAHA.md + docs/TASARIM-KARARLARI.md (M2.1/M2.3 için)
- supabase/SUPABASE-SCHEMA.sql + SUPABASE-RLS.sql (storage/trigger)
- supabase/BOOTSTRAP-MUSTERI.sql (dönem bootstrap)

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | güncel | modüler docs routing + çalışma prensipleri (206 satır) |
| docs/ARCHITECTURE.md | güncel | §1.8 prensipler + branch/durum düzeltme (407 satır) |
| docs/AUTH-KARARLARI.md | güncel | SK-AUTH-1..9 |
| docs/TASARIM-KARARLARI.md | güncel | sadece ekranlar-arası ortak ilkeler (48 satır) |
| docs/EKRAN-SAHA.md | YENİ | saha ekranları (alan/akış/yerleşim) |
| docs/EKRAN-DEPT.md | YENİ | dept ekranları |
| docs/EKRAN-MUHASEBE.md | YENİ | muhasebe ekranları (kart-masa açık slot) |
| docs/IS-KURALLARI.md | YENİ | iş mantığı + anomali §13 + SK-1..8 |
| docs/IS-SIRASI.md | YENİ | görev sırası ve bağımlılıklar |
| docs/GLOSSARY.md | güncel | domain terimleri |
| docs/TECH-DEBT.md | güncel | 4/5 borç |
| docs/RAKIP-ANALIZI-OCR.md | güncel | referans |
| SUPABASE-SCHEMA.sql | v2.2 | chk_role_dept_id |
| SUPABASE-RLS.sql | v2.1 | status='active' |
| SUPABASE-FUNCTIONS.sql | v1.0 | clear_user_claims RPC |
| sql/full-rebuild.sql | v2.1 | satır 4 başlık stale (borç) |
| set-claims/index.ts | v2.0 | canlı deployed |
| clear-claims/index.ts | v2.0 | canlı deployed |
| auth-service.ts | v2.0 | signOut wrapper |
| BOOTSTRAP-MUSTERI.sql | güncel | v2.0 uyumlu; dönem bootstrap M2.2'de eklenecek |
| README.md | minimal | KAAPA açıklaması |
| STATUS.md | güncel | M2 doküman yeniden yapılandırma tamam |

## Tamamlanan İşler (M1 + doküman yapısı)
- [x] M1: scaffold, Supabase client, DB/RLS/Bootstrap, auth akışı, proje seçimi, set/clear-claims, üç-hâl routing, uçtan uca test, v0.1-auth tag
- [x] Doküman yeniden yapılandırma: 5 modüler dosya, çalışma prensipleri, sınır temizliği (5 commit)
