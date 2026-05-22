# PRODAPP — STATUS.md

## Aktif Milestone
Temel altyapı (ARCHITECTURE.md 2.5 — Milestone 1)
Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama.

## Son Session (22 Mayıs 2026)

**Yapılan:**
- Repo klonlandı, scaffold doğrulandı
- Dev server kontrolü: npm install ✓, tsc ✓, vite build ✓, vite dev ✓
- Login sayfası planı hazırlandı (email+şifre → Supabase auth, iki aşamalı: login + proje seçimi)
- Session protokolü eksikliği tespit edildi ve düzeltildi (STATUS.md + durum raporu mekanizması)
- TASARIM-KARARLARI.md'deki görsel kararların v8 kalıntısı olduğu tespit edildi

**Alınan kararlar:**
- Login akışı iki commit: (1) login formu + auth, (2) proje seçimi + claims
- STATUS.md oluşturuldu, session protokolü CLAUDE.md'ye taşındı
- TASARIM-KARARLARI.md olduğu gibi korunuyor, görsel kararlar yeni epoch'ta yeniden değerlendirilecek

## Açık Sorular
- [ ] Login sayfası görsel tasarımı — yeni tasarım session'ı gerekiyor
- [ ] JWT claims yazma Edge Function tasarımı (commit 2'de ele alınacak)

## Sonraki Session Gündemi
1. Sonnet handoff prompt'u — login sayfası (commit 1: form + auth, stil belirlenmedi, sade gidilecek)
2. Login sonrası proje seçimi planı (commit 2 hazırlığı)

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya)
- CLAUDE.md
- docs/AUTH-KARARLARI.md (login akışı detayları)
- src/shared/supabase/client.ts (mevcut Supabase client)
- src/App.tsx (mevcut uygulama kabuğu)

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | ✓ güncel | Session protokolü eklendi |
| ARCHITECTURE.md | ✓ güncel | 1.1 session ritüeli referansa dönüştürüldü |
| AUTH-KARARLARI.md | ✓ güncel | |
| TASARIM-KARARLARI.md | ⚠ karma | İş akışı kararları geçerli, görsel kararlar sıfırlandı |
| GLOSSARY.md | ✓ güncel | |
| TECH-DEBT.md | boş | Henüz içerik yok |

## Tamamlanan İşler
- [x] Repo oluşturuldu, scaffold hazır
- [x] Supabase client kuruldu
- [x] DB şeması, RLS, Bootstrap SQL yazıldı
- [x] CLAUDE.md + routing tablosu
- [x] Mimari dokümanlar tamamlandı
- [x] Dev server çalışıyor (tsc, build, dev ✓)
