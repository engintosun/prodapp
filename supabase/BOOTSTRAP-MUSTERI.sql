-- ============================================================
-- KAAPA — Yeni Musteri Hesabi Acma Proseduru (2026-06-10)
-- Eski model (operator projeyi elle SQL ile acar) GECERSIZ.
-- KAAPA yalniz HESAP acar; projeyi muhasebeci uygulama icinden
-- kendisi acar (fn_create_project). Bkz: docs/AUTH-KARARLARI.md SK-AUTH-1.
-- ============================================================

-- ADIM 1: Auth hesabi ac (SQL DEGIL):
--   Supabase Dashboard -> Authentication -> Users -> Add user
--   email + gecici sifre gir. (Kullanici ilk giriste sifresini degistirir.)

-- ADIM 2: Hesaba "proje acabilir" isaretini koy (SQL Editor):
--   Asagidaki email degerini degistirip calistir.
UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"can_create_projects": true}'::jsonb
WHERE email = 'muhasebe@firma.com';  -- <- degistir

-- ADIM 3: Email + gecici sifreyi musteriye ilet.
--   Musteri girer -> "Yeni proje ac" -> proje adi + yapim sirketi + ad-soyad.
--   fn_create_project tek hamlede: proje + company_settings + muhasebe uyeligi.

-- NOT: set-claims / clear-claims yalniz project_id/role/dept_id anahtarlarini
-- yazar/siler; can_create_projects isareti korunur (dogrulandi 2026-06-10).
