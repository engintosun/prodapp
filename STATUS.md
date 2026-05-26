# PRODAPP — STATUS.md

## Aktif Milestone
Temel altyapı (ARCHITECTURE.md 2.5 — Milestone 1)
Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama.

## Son Session (26 Mayıs 2026)

**Yapılan:**
- Login (Commit 1) tamamlandı ve canlıda uçtan uca test edildi — KAAPA markası, email+şifre, authenticated-shell açılıyor
- Vercel deploy kuruldu: `prodapp-navy.vercel.app` — main'e her push otomatik deploy
- Env değişkenleri Vercel'de tanımlı: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- Supabase test kullanıcısı `test@kaapa.app` ile login zinciri doğrulandı (Supabase auth → env → Vercel → React → session)

**Alınan kararlar:**
- G8 kesinleşti: Offline → draft statüsü, bağlantıda otomatik sync
- G9 kesinleşti: QR tespit → GİB API; QR yok/hata → OCR fallback; 3 sn hard timeout
- G10 kesinleşti: Split ödenmeyen kısım → child receipt oluşturulur
- G11 kesinleşti: Denetçi modu Faz 2'ye taşındı
- Dil seçimi ve onboarding tutorial Faz 2'ye taşındı
- Marka adı: KAAPA (kesinleşti)
- Avans akışı: kilitleme, itiraz, dekont doğrulama, nakit çift teyit (kesinleşti)
- Hot Cost: wrap+2h tetik, manuel override, içerik, yetki dağılımı (kesinleşti)
- Mesai hesaplama Faz 2'ye taşındı

## Faz 2'ye Taşınanlar
- Denetçi modu (G11)
- Dil seçimi ekranı
- Onboarding tutorial
- Mesai hesaplama (tüm ekip listesi, app dışı üyeler dahil)
- Yapımcı rolü hot cost tam görünümü

## Açık Sorular
- [ ] Login sayfası görsel tasarımı — yeni tasarım session'ı gerekiyor
- [ ] JWT claims yazma Edge Function tasarımı (commit 2'de ele alınacak)

## Sonraki Session Gündemi
1. Commit 2: proje seçimi ekranı + JWT custom claims (Edge Function: `set-claims`)

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya)
- CLAUDE.md
- docs/AUTH-KARARLARI.md (claims ve proje seçimi detayları)
- src/App.tsx (mevcut session yönetimi)
- src/app/auth/authenticated-shell.tsx (commit 2'de genişletilecek)

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | ✓ güncel | Session protokolü eklendi |
| ARCHITECTURE.md | ✓ güncel | 1.1 session ritüeli referansa dönüştürüldü |
| AUTH-KARARLARI.md | ✓ güncel | |
| TASARIM-KARARLARI.md | ✓ güncel | G8-G11 kararları eklendi, Faz 2 maddeleri işaretlendi |
| GLOSSARY.md | ✓ güncel | |
| TECH-DEBT.md | boş | Henüz içerik yok |

## Tamamlanan İşler
- [x] Repo oluşturuldu, scaffold hazır
- [x] Supabase client kuruldu
- [x] DB şeması, RLS, Bootstrap SQL yazıldı
- [x] CLAUDE.md + routing tablosu
- [x] Mimari dokümanlar tamamlandı
- [x] Dev server çalışıyor (tsc, build, dev ✓)
- [x] Login sayfası — commit 1 (email+şifre form, session takibi)
