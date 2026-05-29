-- ============================================================
-- PRODAPP — Yeni Müşteri Bootstrap Template
-- Kullanım: Supabase Dashboard → SQL Editor → bu template'i doldur → çalıştır
-- Tarih: 21 Mayıs 2026
-- ============================================================

-- ╔═══════════════════════════════════════════╗
-- ║  BURAYA DOLDUR — sadece bu değerleri değiştir  ║
-- ╚═══════════════════════════════════════════╝

-- Adım 0: Değişkenleri ayarla
DO $$
DECLARE
  v_project_name    TEXT := 'PROJE ADI';          -- ← değiştir
  v_company_name    TEXT := 'ŞİRKET ADI';         -- ← değiştir
  v_muhasebe_email  TEXT := 'muhasebe@firma.com';  -- ← değiştir
  v_muhasebe_first  TEXT := 'Ad';                  -- ← değiştir
  v_muhasebe_last   TEXT := 'Soyad';               -- ← değiştir
  v_muhasebe_pass   TEXT := 'gecici-sifre-123!';   -- ← geçici şifre, kullanıcı değiştirecek

  v_project_id      UUID;
  v_user_id         UUID;
BEGIN
  -- Adım 1: Proje oluştur
  INSERT INTO projects (name)
  VALUES (v_project_name)
  RETURNING id INTO v_project_id;

  -- Adım 2: Şirket ayarları oluştur
  INSERT INTO company_settings (project_id, company_name, project_name)
  VALUES (v_project_id, v_company_name, v_project_name);

  -- Adım 3: Auth user oluştur
  -- NOT: Bu adım Supabase Auth API ile yapılır, SQL ile değil.
  -- Dashboard → Authentication → Users → "Add user" → email + password
  -- VEYA Edge Function / supabase.auth.admin.createUser() kullanılır.
  -- User oluşturulduktan sonra UUID'sini al ve aşağıya yaz:

  -- ⚠️ AUTH USER OLUŞTURDUKTAN SONRA UUID'Yİ BURAYA YAZ:
  -- v_user_id := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

  -- Adım 4: raw_app_meta_data güncelle (Dashboard → Auth → Users → user → Edit)
  -- VEYA:
  -- UPDATE auth.users
  -- SET raw_app_meta_data = jsonb_build_object(
  --   'project_id', v_project_id::text,
  --   'role', 'muhasebe',
  --   'dept_id', null
  -- )
  -- WHERE id = v_user_id;

  -- Adım 5: Profile oluştur
  -- INSERT INTO profiles (user_id, project_id, role, first_name, last_name, invited_by)
  -- VALUES (v_user_id, v_project_id, 'muhasebe', v_muhasebe_first, v_muhasebe_last, NULL);

  RAISE NOTICE '✅ Proje oluşturuldu: % (ID: %)', v_project_name, v_project_id;
  RAISE NOTICE '⚠️ Şimdi Auth user oluştur, UUID al, Adım 4-5 yorum satırlarını aç ve çalıştır';
END $$;

-- ============================================================
-- KULLANIM ADIMLARI:
-- 1. Üstteki değişkenleri doldur (proje adı, şirket adı, email, ad soyad)
-- 2. Çalıştır → proje + company_settings oluşur
-- 3. Dashboard → Auth → Add User → email + geçici şifre
-- 4. Auth user UUID'sini kopyala
-- 5. Adım 4-5 yorum satırlarını aç, UUID'yi yapıştır, tekrar çalıştır
-- 6. Muhasebe'ye "şifreni değiştir" maili gönder (veya ilk girişte zorla)
-- ============================================================
