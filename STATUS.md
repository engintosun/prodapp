# KAAPA — STATUS.md

## Aktif Milestone
Temel altyapı (ARCHITECTURE.md 2.5 — Milestone 1)
Auth, RLS, DB şeması, boş ama giriş yapılabilen uygulama.

## Son Session (27 Mayıs 2026 — Milestone 1 KAPANDI)

**Sonuç:** Auth + RLS + DB + multi-membership login akışı uçtan uca çalışıyor. Çıkış-giriş döngüsünde picker kalıcı. Tag: `v0.1-auth`

**[Bu commit] full-rebuild canonical + STATUS/CLAUDE senkron + v0.1-auth tag**

**profiles çoklu-üyelik remodel v2.0:**
- profiles çoklu-üyelik remodel tamamlandı; çoklu profil artık temsil edilebilir.
- SUPABASE-SCHEMA.sql v2.0: profiles surrogate id + user_id + UNIQUE(user_id,project_id), membership_status/access_until/revoked_at, projects.status/closed_at/closed_by, 9 FK profiles(id)→auth.users(id).
- SUPABASE-RLS.sql v2.0: 8 cerrahi düzenleme (projects_own_list, profiles policy'leri user_id=auth.uid(), advances/advance_log profiles join'i user_id+project_id, default_privileges eklendi).
- src/shared/supabase/auth-service.ts: is_active+soft_deleted_at → membership_status='active'.
- supabase/functions/set-claims/index.ts: id=uid → user_id=uid, is_active+soft_deleted_at → membership_status='active'.
- docs/AUTH-KARARLARI.md: SK-AUTH-4 güncellendi, SK-AUTH-5 membership_status ile yeniden yazıldı, SK-AUTH-8 eklendi.
- docs/TECH-DEBT.md: TD-1/2/3 eklendi.
- CLAUDE.md: versiyon etiketleri v2.0 yapıldı.

**Aynı gün ek (27 Mayıs 2026 — clear-claims RPC fix):**
- fix(auth): clear-claims Edge Function'ın `admin.updateUserById` yöntemi Supabase JS merge quirk'i nedeniyle çalışmıyordu (200 dönüyor, raw_app_meta_data değişmiyordu). SECURITY DEFINER RPC + JSONB `-` operatörü ile değiştirildi (bootstrap'ta zaten kanıtlanmış desen).
- Yeni kanonik dosya: `supabase/SUPABASE-FUNCTIONS.sql` — gelecek temiz kurulumlarda SCHEMA + RLS'den sonra çalıştırılır.
- TECH-DEBT: TD-4 (rpcErr.message debug), TD-5 (signOut best-effort sessiz) eklendi. Borç sayısı 5/5 — yeni özellik öncesi en az 1 borç kapatılmalı.

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

## Açık Borçlar / Bekleyen İşler
- TD-1/2/3: remodel şekil borçları (M2)
- TD-4: clear-claims `rpcErr.detail` debug — M1 sonu üretim öncesi temizlik
- TD-5: auth-service.signOut sessiz try/catch — M2 toast/log
- Proje adı SSOT kokusu: `projects.name` vs `company_settings.project_name` (TECH-DEBT adayı)
- README minimal, favicon placeholder (G6)
- ARCHITECTURE.md 5.3 router.ts satırı geçersiz (kozmetik)
- Remote branch `claude/loving-ramanujan-MiRql` temizliği (kozmetik)

## Sonraki Session Gündemi
1. BOOTSTRAP-MUSTERI.sql v2.0 güncellemesi (v2.0 alanlarıyla: user_id, membership_status)
2. M2 başlangıç planı: çekirdek döngü (fiş girişi → onay zinciri → dönem kapatma); CFE timing kararı; TECH-DEBT'ten hangi borç M2 öncesi kapatılacak

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
| CLAUDE.md | guncel | FUNCTIONS + full-rebuild eklendi |
| ARCHITECTURE.md | guncel | Marka KAAPA |
| AUTH-KARARLARI.md | guncel | SK-AUTH-4/5/8 v2.0 üyelik remodel |
| SUPABASE-SCHEMA.sql | v2.0 | profiles çoklu-üyelik remodel |
| SUPABASE-RLS.sql | v2.0 | GRANT + default_privileges tamam |
| SUPABASE-FUNCTIONS.sql | v1.0 (YENİ) | clear_user_claims SECURITY DEFINER RPC |
| sql/full-rebuild.sql | YENİ | canonical temiz kurulum scripti |
| set-claims/index.ts | v2.0 | membership_status — canlı deployed |
| clear-claims/index.ts | v2.0 | RPC yöntemi — canlı deployed |
| auth-service.ts | v2.0 | signOut wrapper eklendi |
| TASARIM-KARARLARI.md | guncel | Marka KAAPA |
| GLOSSARY.md | guncel | Marka KAAPA |
| TECH-DEBT.md | guncel | TD-1/2/3/4/5 (5/5 borç) |
| BOOTSTRAP-MUSTERI.sql | GÜNCELLEME GEREKİYOR | profiles v2.0 kolonlarıyla (user_id, membership_status) uyumlu hale getirilmeli |
| README.md | minimal | KAAPA açıklaması |
| STATUS.md | güncel | M1 KAPANDI |

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
