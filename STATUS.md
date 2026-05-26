# KAAPA — STATUS.md

## Aktif Milestone
Temel altyapı (ARCHITECTURE.md 2.5 — Milestone 1)
Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama.

## Son Session (27 Mayıs 2026 — Commit 2b frontend: proje seçimi + üç-hâl App.tsx)

**Yapılan:**
- App.tsx üç-hâl routing eklendi (loading/login/project-select/shell)
  - session var + app_metadata.project_id yok → ProjectSelectionPage
  - refreshSession sonrası onAuthStateChange yeni claim'i yakalar → AuthenticatedShell
- ProjectSelectionPage oluşturuldu (src/app/auth/project-selection-page.tsx)
  - Tek profil: otomatik setClaims, ekran gösterilmez
  - Çoklu profil: kart listesi, tıkla → setClaims → otomatik geçiş
- auth-service.ts oluşturuldu (src/shared/supabase/auth-service.ts)
  - getOwnProfiles: profiles_own_list RLS ile claim gerektirmeden profil listesi
  - setClaims: set-claims Edge Function + refreshSession

**Notlar:**
- Uçtan uca test Engin tarafından yapılacak
- IZLE: set-claims legacy JWT 401 ihtimali — 401 gelirse Edge Function verify_jwt moduna bak

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
- [ ] IZLE: set-claims legacy-secret JWT modu — 2b testinde doğrulanacak
- [ ] README.md minimal — ileride genişletilebilir (düşük öncelik)
- [ ] favicon.svg geçici placeholder — gerçek KAAPA logosu G6'da
- [ ] Proje adı hem projects.name hem company_settings.project_name'de — SSOT kokusu, TECH-DEBT adayı

## Sonraki Session Gündemi
1. Uçtan uca test: login → proje seçimi → set-claims → RLS doğrulama
   - 401 gelirse: set-claims Edge Function "Verify JWT with legacy secret" modunu kontrol et
   - Test senaryoları: tek profilli kullanıcı (auto-select), çoklu profilli kullanıcı (kart seçimi)

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya)
- CLAUDE.md
- ARCHITECTURE.md (routing/auth state deseni — üç-hâl yerleşimi için)
- docs/AUTH-KARARLARI.md (SK-AUTH-4 set-claims, SK-AUTH-7 projects)
- src/App.tsx (mevcut session yönetimi)
- src/app/auth/authenticated-shell.tsx
- src/shared/supabase/client.ts
- src/app/auth/login-page.tsx (proje seçim ekranı stil/form deseni için)
- docs/TASARIM-KARARLARI.md (1.1 proje seçimi = login akışı; G6 placeholder direktifi)

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | guncel | Marka KAAPA, kök klasör kaapa/ |
| ARCHITECTURE.md | guncel | Marka KAAPA |
| AUTH-KARARLARI.md | guncel | SK-AUTH-4 güvenlik modeli + SK-AUTH-7 projects görünürlüğü |
| SUPABASE-RLS.sql | v1.3 | projects RLS + projects_own_list |
| TASARIM-KARARLARI.md | guncel | Marka KAAPA |
| GLOSSARY.md | guncel | Marka KAAPA |
| TECH-DEBT.md | bos | İçerik henüz yok |
| README.md | minimal | KAAPA açıklaması |

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
