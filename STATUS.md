# KAAPA — STATUS.md

## Aktif Milestone
Temel altyapı (ARCHITECTURE.md 2.5 — Milestone 1)
Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama.

## Son Session (26 Mayıs 2026 — marka + altyapı session'ı)

**Yapılan:**
- Marka adı PRODAPP → KAAPA geçişi tamamlandı
  - Commit A (docs): CLAUDE.md, ARCHITECTURE.md, AUTH-KARARLARI.md, GLOSSARY.md, TASARIM-KARARLARI.md, TECH-DEBT.md
  - Commit B (chore): index.html title, package.json name, README.md, favicon (Vite logosu → geçici placeholder), icons.svg silindi
- SK-AUTH-4'e claims yazma mekanizması eklendi: Edge Function `set-claims` (service_role → raw_app_meta_data → refreshSession)
- Supabase proje adı KAAPA yapıldı (URL/key değişmedi)
- v8 arşivinin yeri netleşti: ayrı repo `engintosun/prodapp-archive` (eski "archive/v8-demo branch" referansı düzeltildi)

**Alınan kararlar:**
- GitHub repo adı `prodapp` olarak KALIYOR (Sonnet ortamının git proxy yetkisi prodapp'e bağlı; kaapa rename'i 502 veriyor). Repo adı kullanıcıya görünmez; marka KAAPA, repo etiketi prodapp. Bu kasıtlı.

## Faz 2'ye Taşınanlar
- Denetçi modu (G11)
- Dil seçimi ekranı
- Onboarding tutorial
- Mesai hesaplama (tüm ekip listesi, app dışı üyeler dahil)
- Yapımcı rolü hot cost tam görünümü

## Açık Sorular
- [ ] Login sayfası görsel tasarımı — yeni tasarım session'ı gerekiyor
- [ ] JWT claims yazma Edge Function tasarımı (commit 2'de ele alınacak)
- [ ] README.md şu an minimal — ileride genişletilebilir (düşük öncelik)
- [ ] favicon.svg geçici placeholder — gerçek KAAPA logosu G6 (görsel tasarım) kararında gelecek

## Sonraki Session Gündemi
1. Commit 2: proje seçimi ekranı + JWT custom claims (Edge Function `set-claims`) — referans: AUTH-KARARLARI.md SK-AUTH-4 (mekanizma artık dokümante)

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya)
- CLAUDE.md
- docs/AUTH-KARARLARI.md (claims ve proje seçimi detayları)
- src/App.tsx (mevcut session yönetimi)
- src/app/auth/authenticated-shell.tsx (commit 2'de genişletilecek)

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | ✓ güncel | Marka KAAPA, kök klasör kaapa/ |
| ARCHITECTURE.md | ✓ güncel | Marka KAAPA, v8 arşiv referansı düzeltildi |
| AUTH-KARARLARI.md | ✓ güncel | SK-AUTH-4 claims mekanizması eklendi |
| TASARIM-KARARLARI.md | ✓ güncel | Marka KAAPA, dosya referansı düzeltildi |
| GLOSSARY.md | ✓ güncel | Marka KAAPA |
| TECH-DEBT.md | boş | Marka KAAPA, içerik henüz yok |
| README.md | ✓ minimal | Vite şablonu → KAAPA açıklaması |

## Tamamlanan İşler
- [x] Repo oluşturuldu, scaffold hazır
- [x] Supabase client kuruldu
- [x] DB şeması, RLS, Bootstrap SQL yazıldı
- [x] CLAUDE.md + routing tablosu
- [x] Mimari dokümanlar tamamlandı
- [x] Dev server çalışıyor (tsc, build, dev ✓)
- [x] Login sayfası — commit 1 (email+şifre form, session takibi)
