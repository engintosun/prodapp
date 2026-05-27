# KAAPA — STATUS.md

## Aktif Milestone
Temel altyapı (ARCHITECTURE.md 2.5 — Milestone 1)
Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama.

## Son Session (27 Mayıs 2026 — profiles çoklu-üyelik remodel v2.0)

**Yapılan:**
- profiles çoklu-üyelik remodel tamamlandı; çoklu profil artık temsil edilebilir.
- SUPABASE-SCHEMA.sql v2.0: profiles surrogate id + user_id + UNIQUE(user_id,project_id), membership_status/access_until/revoked_at, projects.status/closed_at/closed_by, 9 FK profiles(id)→auth.users(id).
- SUPABASE-RLS.sql v2.0: 8 cerrahi düzenleme (projects_own_list, profiles policy'leri user_id=auth.uid(), advances/advance_log profiles join'i user_id+project_id, default_privileges eklendi).
- src/shared/supabase/auth-service.ts: is_active+soft_deleted_at → membership_status='active'.
- supabase/functions/set-claims/index.ts: id=uid → user_id=uid, is_active+soft_deleted_at → membership_status='active'.
- docs/AUTH-KARARLARI.md: SK-AUTH-4 güncellendi, SK-AUTH-5 membership_status ile yeniden yazıldı, SK-AUTH-8 eklendi.
- docs/TECH-DEBT.md: TD-1/2/3 eklendi.
- CLAUDE.md: versiyon etiketleri v2.0 yapıldı.

**Önceki session özeti (27 Mayıs 2026 — Commit 2b frontend + uçtan uca test):**
- Commit 6aca75b: feat(auth): project selection + three-state App routing
- Commit 9ba382e: fix(auth): auth-service type assertion for Supabase join
- Canlı deploy doğrulandı, uçtan uca test başarılı
- GRANT eksikleri çözüldü, Edge Function düzeltildi

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
1. Canlı temiz kurulum: DB sıfırla, SUPABASE-SCHEMA.sql v2.0 + SUPABASE-RLS.sql v2.0 uygula
2. Test kullanıcısı bootstrap (BOOTSTRAP-MUSTERI.sql güncelle: profiles v2.0 kolonlarıyla)
3. Çoklu profil testi: aynı kullanıcı iki projede, kart seçim UI test et
4. Edge Function debug mesajını temizle (profErr.message kaldır)
5. Milestone 1 kalan işleri değerlendir

## Sonraki Session — Okunacak Dosyalar
- STATUS.md (bu dosya)
- CLAUDE.md
- docs/AUTH-KARARLARI.md
- supabase/SUPABASE-SCHEMA.sql (v2.0 — yeni profiles yapısı)
- supabase/SUPABASE-RLS.sql (v2.0)
- supabase/BOOTSTRAP-MUSTERI.sql (profiles kolonları güncellenmeli)
- src/shared/supabase/auth-service.ts
- supabase/functions/set-claims/index.ts

## Doküman Sağlık Tablosu

| Dosya | Durum | Not |
|-------|-------|-----|
| CLAUDE.md | guncel | v2.0 versiyon etiketleri güncellendi |
| ARCHITECTURE.md | guncel | Marka KAAPA |
| AUTH-KARARLARI.md | guncel | SK-AUTH-4/5/8 v2.0 üyelik remodel |
| SUPABASE-SCHEMA.sql | v2.0 | profiles çoklu-üyelik remodel |
| SUPABASE-RLS.sql | v2.0 | GRANT + default_privileges tamam |
| TASARIM-KARARLARI.md | guncel | Marka KAAPA |
| GLOSSARY.md | guncel | Marka KAAPA |
| TECH-DEBT.md | guncel | TD-1/2/3 eklendi |
| BOOTSTRAP-MUSTERI.sql | GÜNCELLEME GEREKİYOR | profiles v2.0 kolonlarıyla (user_id, membership_status) uyumlu hale getirilmeli |
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
