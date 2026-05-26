# KAAPA — STATUS.md

## Aktif Milestone
Temel altyapı (ARCHITECTURE.md 2.5 — Milestone 1)
Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama.

## Son Session (26 Mayıs 2026 — Commit 2 backend: RLS + set-claims)

**Yapılan:**
- projects tablosu RLS açığı kapatıldı:
  - Mikro-commit fix(rls): projects RLS + projects_own_list main'e gitti
  - projects'e RLS açıldı + projects_own_list policy (claim'siz; kullanıcının aktif profili olan aktif projeleri döndürür)
  - Supabase SQL Editor'de canlı uygulandı, relrowsecurity = true ile doğrulandı
  - AUTH-KARARLARI.md SK-AUTH-7 eklendi
  - Önceki durum: RLS kapalıydı, tüm şirketlerin proje adları sızıyordu (KVKK ihlali)
- set-claims Edge Function:
  - Commit feat(auth): set-claims edge function main'e gitti (supabase/functions/set-claims/index.ts, tek dosya, CORS inline)
  - Supabase Dashboard Via Editor ile canlı deploy edildi, verify_jwt açık
  - Güvenlik: uid JWT'den (getUser), role/dept_id profiles'tan service_role ile okunur, body'ye güvenilmez; sahiplik doğrulaması (id+project_id+is_active+soft_deleted_at IS NULL), eşleşme yoksa 403
  - AUTH-KARARLARI.md SK-AUTH-4 güvenlik modeli (6 madde) eklendi
  - Endpoint: https://owadnnmtnfuzobyxtcxf.supabase.co/functions/v1/set-claims

**Notlar:**
- Edge Function deploy MANUEL (git proxy'sinin Supabase yetkisi yok) — RLS canlı apply gibi
- set-claims ilk Edge Function; _shared yok, ikinci fonksiyonda _shared/cors.ts'e refactor
- IZLE: Fonksiyon "Verify JWT with legacy secret" modunda. 2b uçtan uca testte 401 gelirse ilk bakılacak yer burası.

**Temizlik (düşük öncelik):**
- Remote branch claude/projects-rls-security-G44TD silinemedi (proxy'de branch silme izni 403) — GitHub UI'dan elle silinir, kozmetik

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
1. Commit 2b (frontend): proje seçimi ekranı + üç-hâl App.tsx
   - ROUTING KARARI: A — üç hâl App.tsx'te switch edilir, App.tsx ince router kalır (mantık page bileşenlerinde):
     - loading → null/spinner
     - session yok → LoginPage
     - session var + project_id claim yok → ProjectSelectionPage (src/app/auth/ altında)
     - session var + project_id claim var → AuthenticatedShell
   - Claim okuma: session.user.app_metadata?.project_id (manuel jwt parse yok; refreshSession sonrası güncellenir)
   - Akış: login sonrası profiles_own_list ile profiller listelenir, kullanıcı seçer, set-claims çağrılır, refreshSession, onAuthStateChange yeni claim'le App'i render eder, RLS aktif
   - Tek-profilli kullanıcı: seçim ekranı atlanır, set-claims doğrudan çağrılır
   - Proje seçim ekranı proje ADINI projects tablosundan okur (projects_own_list sayesinde)
   - 2b başında ARCHITECTURE.md routing bölümünü teyit et (router dayatıyorsa üç hâl route+guard olur; yerleşim prensibi yine A: gate auth katmanında, shell'de değil)
   - Uçtan uca test: login, seçim, claims, RLS; legacy-secret 401 ihtimaline dikkat

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
