# KAAPA — STATUS.md

## Aktif Milestone
Temel altyapı (ARCHITECTURE.md 2.5 — Milestone 1)
Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama.

## Son Session (27 Mayıs 2026 — Commit 2b frontend + uçtan uca test)

**Yapılan:**
- Commit 6aca75b: feat(auth): project selection + three-state App routing (App.tsx üç-hâl, ProjectSelectionPage, auth-service.ts)
- Commit 9ba382e: fix(auth): auth-service type assertion for Supabase join
- Canlı deploy doğrulandı (Vercel + Supabase)
- Uçtan uca test başarılı: login → tek profil auto-select → set-claims → refreshSession → AuthenticatedShell
- GRANT eksikleri tespit ve çözüldü (profiles, projects tabloları + toplu GRANT ALL ON ALL TABLES)
- Edge Function import satırı eksikti, Code editöründen düzeltildi ve deploy edildi
- Edge Function hata mesajı iyileştirildi (profErr.message eklendi, debug amaçlı, sonra temizlenecek)

**Notlar:**
- Deploy sonrası keşfedilen sorunlar: tablo GRANT'ları şema oluşturulurken verilmemişti, Edge Function Via Editor deploy'unda import satırı düşmüştü
- Sonnet checklist'te tsc --noEmit yazmasına rağmen TypeScript hatası yakalanmadı (type assertion fix gerekti)
- Vercel deployment URL: prodapp-navy.vercel.app
- Edge Function Code sekmesinde debug amaçlı profErr.message eklendi — üretim öncesi temizlenecek

**Önceki session özeti (26 Mayıs 2026 — Commit 2 backend: RLS + set-claims):**
- projects RLS + projects_own_list policy — canlı uygulandı, SK-AUTH-7 eklendi
- set-claims Edge Function — canlı deploy, SK-AUTH-4 eklendi

## Faz 2'ye Taşınanlar
- Denetçi modu (G11)
- Dil seçimi ekranı
- Onboarding tutorial
- Mesai hesaplama (tüm ekip listesi, app dışı üyeler dahil)
- Yapımcı rolü hot cost tam görünümü

## Açık Sorular
- [ ] Login sayfası görsel tasarımı — yeni tasarım session'ı gerekiyor (G6)
- [ ] README.md minimal — ileride genişletilebilir (düşük öncelik)
- [ ] favicon.svg geçici placeholder — gerçek KAAPA logosu G6'da
- [ ] Proje adı hem projects.name hem company_settings.project_name'de — SSOT kokusu, TECH-DEBT adayı
- [ ] Deploy checklist oluşturulacak: GRANT doğrulama, Edge Function kod doğrulama, tsc çalıştırma zorunluluğu
- [ ] Edge Function debug mesajı temizlenecek (profErr.message kaldırılacak)
- [ ] Çoklu profil testi yapılacak (ikinci profil oluştur, kart seçim UI'ı test et)
- [ ] ARCHITECTURE.md 5.3 router.ts satırı geçersiz — güncelleme veya kaldırma adayı

## Sonraki Session Gündemi
1. Deploy checklist oluştur (CLAUDE.md veya ayrı doküman)
2. Çoklu profil testi (ikinci profil + proje oluştur, kart seçim UI test et)
3. Edge Function debug mesajını temizle
4. Milestone 1 kalan işleri değerlendir

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya)
- CLAUDE.md
- docs/AUTH-KARARLARI.md
- src/app/auth/project-selection-page.tsx
- src/shared/supabase/auth-service.ts
- supabase/functions/set-claims/index.ts (repo versiyonu vs canlı versiyonu farkı kontrol)

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | guncel | Marka KAAPA, kök klasör kaapa/ |
| ARCHITECTURE.md | guncel | Marka KAAPA |
| AUTH-KARARLARI.md | guncel | SK-AUTH-4 güvenlik modeli + SK-AUTH-7 projects görünürlüğü |
| SUPABASE-RLS.sql | v1.3 — GRANT eksik | GRANT bilgisi yok, eklenmeli (TECH-DEBT adayı) |
| TASARIM-KARARLARI.md | guncel | Marka KAAPA |
| GLOSSARY.md | guncel | Marka KAAPA |
| TECH-DEBT.md | bos | İçerik henüz yok |
| README.md | minimal | KAAPA açıklaması |
| STATUS.md | güncelleniyor | Bu commit |

## Tamamlanan İşler
- [x] Repo oluşturuldu, scaffold hazır
- [x] Supabase client kuruldu
- [x] DB şeması, RLS, Bootstrap SQL yazıldı
- [x] CLAUDE.md + routing tablosu
- [x] Mimari dokümanlar tamamlandı
- [x] Dev server çalışıyor (tsc, build, dev)
- [x] Login sayfası — commit 1 (email+şifre form, session takibi)
- [x] projects RLS + projects_own_list (commit + canlı apply + doğrulandı)
- [x] set-claims Edge Function (commit + canlı deploy, verify_jwt açık)
- [x] 2b routing kararı: A (App.tsx üç-hâl)
- [x] Proje seçim ekranı + üç-hâl App.tsx routing (commit 2b)
- [x] Uçtan uca test: login → proje seçimi → set-claims → AuthenticatedShell
