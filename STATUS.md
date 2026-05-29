# KAAPA — STATUS.md

## Aktif Milestone
**M2 — Çekirdek Döngü** (ARCHITECTURE.md 2.5). M1 kapandı (`v0.1-auth`).
Şu an: **M2.0 karar kapatma** sürüyor. G1 kapandı; kalan kararlar G3, status geçiş yeri, G6.

## Son Session (29 Mayıs 2026 — M2.0 G1 + repo temizliği)
G1 karara bağlandı ve dokümana + şemaya + ekranlara işlendi; bekleyen teknik borçlar ve artıklar temizlendi. Frontend kodu yazılmadı.

**G1 KAPANDI:** İade kaldırıldı. Sahaya geri dönüş tek aksiyon = **reddet** (sebep zorunlu; fiş kanıt olarak donar — düzenlenemez/silinemez/işaretli; reddedilenler listesinde durur). Düzenleme sınırı = submit anı (draft saha elinde serbest; submit sonrası saha dokunamaz). Tekrar giriş yalnız muhasebe izniyle → orijinal donar, düzeltme bağlı yeni fiş olarak doğar (`parent_receipt_id`, M2.2 zemini). Muhasebe küçük hatada uyarı mesajı atıp onaylayabilir; finansal gerçeği sessizce düzeltmez. 'returned' statüsü gereksiz; 9 statü korundu. Detay: IS-KURALLARI §3.

**Commit'ler (6, hepsi origin'den doğrulandı):**
- `91053a7` — fix(functions): clear-claims debug detayı çıkarıldı (TD-4); canlı redeploy yapıldı
- `14fa027` — docs(rules): G1 dokümana (iade→reddet, red sebepleri, tekrar giriş muhasebe-only)
- `46a4b8e` — chore(schema): approval_log.action'dan ölü 'returned' kaldırıldı
- `16aece9` — fix(repo): BOOTSTRAP profil şablonu id→user_id, full-rebuild v2.2, ARCHITECTURE router kalıntısı
- `79af028` — docs: borç senkronu (TD-6) + CLAUDE.md push doğrulama kuralı
- `6e634a4` — docs(screens): ekran dosyaları G1 'iade' temizliği (reddet'e çevrildi, iade-fark → hesaplaşma)

**Diğer:** 3 orphan branch (claude/*) silindi — denetimle kayıp iş olmadığı doğrulandı (içerik main'de eşit/daha yeni). Teknik borç tek kaynağa indirildi (docs/TECH-DEBT.md, 4/5). Push doğrulama artık kalıcı kural: fetch + hash karşılaştırma; Opus origin'den bağımsız doğrular.

## M1 Özeti (KAPANDI — 27 Mayıs 2026, tag v0.1-auth)
Auth + RLS + DB şeması + çoklu-üyelik (multi-project) login akışı uçtan uca çalışıyor. profiles çoklu-üyelik remodel v2.0, set-claims/clear-claims Edge Functions canlı, üç-hâl App.tsx routing, Vercel prod (prodapp-navy.vercel.app). Detay: git history.

## Açık Kararlar (M2.0 — kod öncesi netleşmeli)
- **G3** — auto_approved / 7 gün pasif onay Faz 1'de var mı
- **Status geçiş yeri** — submitted→dept_pending/acc_pending trigger mı frontend mı (Opus önerisi: trigger)
- **G6 başlangıcı** — tokens.css için renk yaklaşımı (değerler sonra, yapı şimdi)
- (Sonraya: G2 dijital imza, G10 split child receipt, kategori/ulaşım limit değerleri, kiralama dönem-kapanış istisnası)
- Karara bağlandı (UI M3): muhasebe-izinli tekrar giriş + işaretli müdahale → `parent_receipt_id` (split ile aynı yapı)

## Faz 2'ye Taşınanlar
- Denetçi modu (G11) · Dil seçimi ekranı · Onboarding tutorial · Mesai hesaplama · Yapımcı rolü hot cost tam görünümü

## Açık Borçlar / Bekleyen İşler
- Teknik borç tek kaynak: **docs/TECH-DEBT.md** (TD-2, TD-3, TD-5, TD-6 = 4/5)
- README + favicon → G6/M2.1 todo'su (borç değil)

## Sonraki Session Gündemi
1. **M2.0 — kalan kararlar:** G3, status geçiş yeri, G6 renk yaklaşımı
2. **M2.1 — Görsel+yapısal temel:** tokens.css iskeleti + shell/nav (B4) + paylaşılan bileşenler (B5)
3. **M2.2 — Storage+dönem+zemin:** receipts bucket + RLS + dönem bootstrap + trigger doğrulama + `parent_receipt_id` (split & red-tekrar-giriş için tek yapı)
4. Sonra **M2.3 Saha ekranı** (sıralı inşa başlar)
Detaylı sıra ve bağımlılık: docs/IS-SIRASI.md

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya) + CLAUDE.md
- docs/IS-SIRASI.md (görev sırası — neredeyiz)
- docs/ARCHITECTURE.md (çalışma prensipleri §1.8 + Faz 1 kapsam)
- docs/IS-KURALLARI.md (onay zinciri, reddet §3, status, dönem — M2.0 kararları için)
- docs/EKRAN-SAHA.md + docs/TASARIM-KARARLARI.md (M2.1/M2.3 için)
- supabase/SUPABASE-SCHEMA.sql + SUPABASE-RLS.sql (storage/trigger/parent_receipt_id)
- supabase/BOOTSTRAP-MUSTERI.sql (dönem bootstrap)

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | güncel | modüler docs routing + çalışma prensipleri + push doğrulama kuralı |
| docs/ARCHITECTURE.md | güncel | §1.8 prensipler; router.ts kalıntısı temizlendi |
| docs/AUTH-KARARLARI.md | güncel | SK-AUTH-1..9 |
| docs/TASARIM-KARARLARI.md | güncel | sadece ekranlar-arası ortak ilkeler (48 satır); G1 temiz |
| docs/EKRAN-SAHA.md | güncel | saha ekranları (alan/akış/yerleşim); G1 temiz (reddet, hesaplaşma) |
| docs/EKRAN-DEPT.md | güncel | dept ekranları (onayla/reddet); G1 temiz |
| docs/EKRAN-MUHASEBE.md | güncel | muhasebe ekranları (kart-masa açık slot); G1 temiz |
| docs/IS-KURALLARI.md | güncel | iş mantığı + reddet (G1) + anomali §13 + SK-1..8 |
| docs/IS-SIRASI.md | güncel | görev sırası; G1 ✅; borç tek-kaynak |
| docs/GLOSSARY.md | güncel | domain terimleri |
| docs/TECH-DEBT.md | güncel | 4/5 borç (TD-2,3,5,6) |
| docs/RAKIP-ANALIZI-OCR.md | güncel | referans |
| SUPABASE-SCHEMA.sql | v2.2 | chk_role_dept_id; approval_log.action sade (returned çıktı) |
| SUPABASE-RLS.sql | v2.1 | status='active' |
| SUPABASE-FUNCTIONS.sql | v1.0 | clear_user_claims RPC |
| sql/full-rebuild.sql | v2.2 | başlık güncel |
| set-claims/index.ts | güncel | canlı deployed |
| clear-claims/index.ts | güncel | debug detay çıkarıldı (TD-4), canlı deployed |
| auth-service.ts | v2.0 | signOut wrapper (TD-5 açık) |
| BOOTSTRAP-MUSTERI.sql | güncel | profil şablonu user_id düzeltildi; dönem bootstrap M2.2'de |
| README.md | minimal | KAAPA açıklaması (G6 todo) |
| STATUS.md | güncel | M2.0 G1 kapandı + repo temizliği |

## Tamamlanan İşler
- [x] M1: scaffold, Supabase client, DB/RLS/Bootstrap, auth akışı, proje seçimi, set/clear-claims, üç-hâl routing, uçtan uca test, v0.1-auth tag
- [x] Doküman yeniden yapılandırma: 5 modüler dosya, çalışma prensipleri, sınır temizliği
- [x] M2.0 G1 kapandı (iade→reddet; doküman + şema + ekranlar) + TD-4 + orphan branch temizliği + BOOTSTRAP düzeltme + borç senkronu + push doğrulama kuralı (29 Mayıs, 6 commit)
