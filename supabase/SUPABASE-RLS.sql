-- ============================================================
-- PRODAPP RLS Policies v2.1
-- Degisiklik: v2.0 — profiles coklu-uyelik remodel; profiles policy'leri user_id=auth.uid(); advances/advance_log profiles join'i user_id+project_id; is_active/soft_deleted -> membership_status; default_privileges eklendi.
--   v2.1 — TD-1: projects_own_list is_active -> status.
-- Güncelleme: 27 Mayıs 2026
-- Değişiklik: v1.4 — GRANT izinleri eklendi (authenticated SELECT + service_role ALL)
-- Değişiklik: v1.3 — projects RLS + projects_own_list (claim'siz proje listesi)
-- Değişiklik: v1.2 — Helper fonksiyonlar auth → public schema'ya taşındı
-- Bağımlılık: SUPABASE-SCHEMA.sql v2.0 (17 tablo + projects + invitations)
-- Yöntem: JWT custom claims (raw_app_meta_data)
-- Claims: project_id, role (saha/dept/muhasebe), dept_id
-- ============================================================

-- ============================================================
-- TABLO ERİŞİM İZİNLERİ (GRANT)
-- RLS satır filtresi uygular, GRANT tablo erişim izni verir. İkisi farklı.
-- Bu GRANT'lar olmadan RLS policy'ler çalışmaz.
-- Uygulandı: 27 Mayıs 2026, Supabase SQL Editor
-- ============================================================
-- authenticated rolü: tüm tablolarda SELECT
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
-- service_role: tüm tablolarda tam yetki (Edge Functions için)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- ============================================================
-- HELPER: JWT claim shortcuts (public schema, RLS-safe)
-- ============================================================
CREATE OR REPLACE FUNCTION public.project_id()
RETURNS UUID AS $$
  SELECT ((auth.jwt() -> 'app_metadata') ->> 'project_id')::uuid
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT (auth.jwt() -> 'app_metadata') ->> 'role'
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.user_dept_id()
RETURNS UUID AS $$
  SELECT ((auth.jwt() -> 'app_metadata') ->> 'dept_id')::uuid
$$ LANGUAGE sql STABLE;


-- ============================================================
-- INDEXES (RLS performansı için)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_project ON profiles(project_id);
CREATE INDEX IF NOT EXISTS idx_profiles_project_dept ON profiles(project_id, dept_id);
CREATE INDEX IF NOT EXISTS idx_receipts_project_user ON receipts(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_project_dept ON receipts(project_id, dept_id);
CREATE INDEX IF NOT EXISTS idx_receipts_project_status ON receipts(project_id, status);
CREATE INDEX IF NOT EXISTS idx_receipts_period ON receipts(period_id);
CREATE INDEX IF NOT EXISTS idx_receipts_parent ON receipts(parent_receipt_id);
CREATE INDEX IF NOT EXISTS idx_periods_project ON periods(project_id);
CREATE INDEX IF NOT EXISTS idx_period_closings_period ON period_closings(period_id, user_id);
CREATE INDEX IF NOT EXISTS idx_advances_project_user ON advances(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_advances_project_dept ON advances(project_id, user_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_log_receipt ON approval_log(receipt_id);
CREATE INDEX IF NOT EXISTS idx_advance_log_advance ON advance_log(advance_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_exception_permits_user ON exception_permits(project_id, user_id, period_id);
CREATE INDEX IF NOT EXISTS idx_dept_budgets_period ON dept_budgets(period_id, dept_id);
CREATE INDEX IF NOT EXISTS idx_dept_subcategories_dept ON dept_subcategories(dept_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_project_email ON invitations(project_id, email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);


-- ============================================================
-- 0. PROJECTS
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- SELECT: Claim'siz proje listesi — kullanıcının aktif profili olan aktif projeler
-- (Multi-project login akışında proje seçim ekranı için; JWT claims henüz yok)
CREATE POLICY projects_own_list ON projects
  FOR SELECT USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.project_id = projects.id
        AND p.user_id = auth.uid()
        AND p.membership_status = 'active'
    )
  );

-- INSERT: service_role ile (Admin onboarding — BOOTSTRAP-MUSTERI.sql)
-- UPDATE: service_role ile (Admin proje yönetimi)
-- DELETE: Yok (soft delete — status enum ile yonetilir)


-- ============================================================
-- 1. PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Muhasebe tümünü, Dept kendi dept, Saha sadece kendini görür
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id())
    OR user_id = auth.uid()
  )
);

-- INSERT: Sadece Muhasebe (davet)
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);

-- UPDATE: Herkes kendi profilini (ad, tel, avatar). Muhasebe başkasının role/dept'ini.
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  project_id = public.project_id()
  AND (
    user_id = auth.uid()
    OR public.user_role() = 'muhasebe'
  )
);

-- SELECT: Claims'siz proje listesi (multi-project login akışı)
CREATE POLICY profiles_own_list ON profiles
  FOR SELECT USING (user_id = auth.uid());

-- DELETE: Yok (soft delete — UPDATE ile soft_deleted_at set edilir)


-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- SELECT: Proje içi herkes
CREATE POLICY departments_select ON departments FOR SELECT USING (
  project_id = public.project_id()
);

-- INSERT/UPDATE: Sadece Muhasebe
CREATE POLICY departments_insert ON departments FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);

CREATE POLICY departments_update ON departments FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 2b. INVITATIONS
-- ============================================================
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- SELECT: Muhasebe tümü, Dept kendi dept davetleri
CREATE POLICY invitations_select ON invitations FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id())
  )
);

-- INSERT: Muhasebe herkes, Dept kendi dept'ine saha
CREATE POLICY invitations_insert ON invitations FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND invited_by = auth.uid()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id() AND role = 'saha')
  )
);

-- UPDATE: Muhasebe (revoke). Accept işlemi Edge Function (service_role) ile.
CREATE POLICY invitations_update ON invitations FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 3. PERIODS
-- ============================================================
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY periods_select ON periods FOR SELECT USING (
  project_id = public.project_id()
);

CREATE POLICY periods_insert ON periods FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);

CREATE POLICY periods_update ON periods FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 4. PERIOD_CLOSINGS
-- ============================================================
ALTER TABLE period_closings ENABLE ROW LEVEL SECURITY;

-- SELECT: Muhasebe tümü, Dept kendi dept, Saha kendi kaydı
CREATE POLICY period_closings_select ON period_closings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = period_closings.period_id
      AND p.project_id = public.project_id()
  )
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id())
    OR user_id = auth.uid()
  )
);

-- INSERT: service_role (trigger/edge function) — client policy yok
-- UPDATE: Kendi seviyesi submit edebilir, Muhasebe override yapabilir
CREATE POLICY period_closings_update ON period_closings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = period_closings.period_id
      AND p.project_id = public.project_id()
  )
  AND (
    (user_id = auth.uid() AND level = public.user_role())
    OR public.user_role() = 'muhasebe'
  )
);


-- ============================================================
-- 5. EXPENSE_CATEGORIES
-- ============================================================
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY expense_categories_select ON expense_categories FOR SELECT USING (
  project_id = public.project_id()
);

CREATE POLICY expense_categories_insert ON expense_categories FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);

CREATE POLICY expense_categories_update ON expense_categories FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 6. DEPT_SUBCATEGORIES
-- ============================================================
ALTER TABLE dept_subcategories ENABLE ROW LEVEL SECURITY;

-- SELECT: Kendi dept + Muhasebe
CREATE POLICY dept_subcategories_select ON dept_subcategories FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM departments d
    WHERE d.id = dept_subcategories.dept_id
      AND d.project_id = public.project_id()
  )
  AND (
    dept_id = public.user_dept_id()
    OR public.user_role() = 'muhasebe'
  )
);

-- INSERT/UPDATE: Dept kendi dept'ine + Muhasebe
CREATE POLICY dept_subcategories_insert ON dept_subcategories FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM departments d
    WHERE d.id = dept_subcategories.dept_id
      AND d.project_id = public.project_id()
  )
  AND (
    dept_id = public.user_dept_id()
    OR public.user_role() = 'muhasebe'
  )
);

CREATE POLICY dept_subcategories_update ON dept_subcategories FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM departments d
    WHERE d.id = dept_subcategories.dept_id
      AND d.project_id = public.project_id()
  )
  AND (
    dept_id = public.user_dept_id()
    OR public.user_role() = 'muhasebe'
  )
);


-- ============================================================
-- 7. RECEIPTS (en karmaşık tablo)
-- ============================================================
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- SELECT: Saha kendi, Dept kendi dept, Muhasebe tümü
CREATE POLICY receipts_select ON receipts FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id())
    OR user_id = auth.uid()
  )
);

-- INSERT: Saha, kendi adına, açık dönem VEYA exception izni ile
CREATE POLICY receipts_insert ON receipts FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() IN ('saha','dept')
  AND user_id = auth.uid()
  AND status IN ('submitted','dept_pending','acc_pending')
  AND (
    -- Açık dönem
    EXISTS (
      SELECT 1 FROM periods p
      WHERE p.id = receipts.period_id
        AND p.project_id = public.project_id()
        AND p.status IN ('open','closing')
    )
    OR
    -- Exception permit ile kapalı döneme giriş
    EXISTS (
      SELECT 1 FROM exception_permits ep
      WHERE ep.period_id = receipts.period_id
        AND ep.user_id = auth.uid()
        AND ep.project_id = public.project_id()
        AND ep.permit_type = 'late_entry'
        AND ep.is_used = false
        AND (ep.expires_at IS NULL OR ep.expires_at > now())
    )
  )
);

-- UPDATE: Dept dept_pending iken, Muhasebe her statüde (saha giriş sonrası dokunamaz)
CREATE POLICY receipts_update ON receipts FOR UPDATE USING (
  project_id = public.project_id()
  AND (
    -- Dept: kendi dept'indeki dept_pending fişler
    (public.user_role() = 'dept' AND dept_id = public.user_dept_id() AND status = 'dept_pending')
    -- Muhasebe: tüm statüler (her müdahale approval_log'a düşer)
    OR public.user_role() = 'muhasebe'
  )
);

-- DELETE policy yok: fiş girince (submitted) silinemez — denetim kaydı; düzeltme reddet/split (IS-KURALLARI §3, §20).


-- ============================================================
-- 8. APPROVAL_LOG (insert-only, trigger ile yazılır)
-- ============================================================
ALTER TABLE approval_log ENABLE ROW LEVEL SECURITY;

-- SELECT: Saha kendi fişlerine ait, Dept kendi dept, Muhasebe tümü
CREATE POLICY approval_log_select ON approval_log FOR SELECT USING (
  public.user_role() = 'muhasebe'
  OR EXISTS (
    SELECT 1 FROM receipts r
    WHERE r.id = approval_log.receipt_id
      AND r.project_id = public.project_id()
      AND (
        r.user_id = auth.uid()
        OR (public.user_role() = 'dept' AND r.dept_id = public.user_dept_id())
      )
  )
);

-- INSERT: Yok (trigger yazar) — service_role bypass eder RLS'i
-- UPDATE: Yok (immutable)
-- DELETE: Yok


-- ============================================================
-- 9. ADVANCES
-- ============================================================
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;

-- SELECT: Saha kendi, Dept kendi dept, Muhasebe tümü
CREATE POLICY advances_select ON advances FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = advances.user_id
        AND p.project_id = public.project_id()
        AND p.dept_id = public.user_dept_id()
    ))
    OR user_id = auth.uid()
  )
);

-- INSERT: Saha kendi adına
CREATE POLICY advances_insert ON advances FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'saha'
  AND user_id = auth.uid()
);

-- UPDATE: Muhasebe (onay, settlement)
CREATE POLICY advances_update ON advances FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 10. ADVANCE_LOG (insert-only, trigger ile yazılır)
-- ============================================================
ALTER TABLE advance_log ENABLE ROW LEVEL SECURITY;

-- SELECT: advances ile aynı görünürlük
CREATE POLICY advance_log_select ON advance_log FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM advances a
    WHERE a.id = advance_log.advance_id
      AND a.project_id = public.project_id()
      AND (
        public.user_role() = 'muhasebe'
        OR a.user_id = auth.uid()
        OR (public.user_role() = 'dept' AND EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.user_id = a.user_id
            AND p.project_id = public.project_id()
            AND p.dept_id = public.user_dept_id()
        ))
      )
  )
);

-- INSERT/UPDATE/DELETE: Yok (trigger yazar)


-- ============================================================
-- 11. EXCEPTION_PERMITS
-- ============================================================
ALTER TABLE exception_permits ENABLE ROW LEVEL SECURITY;

-- SELECT: Saha kendi, Muhasebe tümü
CREATE POLICY exception_permits_select ON exception_permits FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR user_id = auth.uid()
  )
);

-- INSERT: Muhasebe + Dept
CREATE POLICY exception_permits_insert ON exception_permits FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() IN ('muhasebe', 'dept')
);

-- UPDATE: Muhasebe (is_used flag)
CREATE POLICY exception_permits_update ON exception_permits FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 12. PERIOD_BUDGETS
-- ============================================================
ALTER TABLE period_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY period_budgets_select ON period_budgets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = period_budgets.period_id
      AND p.project_id = public.project_id()
  )
);

CREATE POLICY period_budgets_insert ON period_budgets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = period_budgets.period_id
      AND p.project_id = public.project_id()
  )
  AND public.user_role() = 'muhasebe'
);

CREATE POLICY period_budgets_update ON period_budgets FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = period_budgets.period_id
      AND p.project_id = public.project_id()
  )
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 13. DEPT_BUDGETS
-- ============================================================
ALTER TABLE dept_budgets ENABLE ROW LEVEL SECURITY;

-- SELECT: Dept kendi dept, Muhasebe tümü
CREATE POLICY dept_budgets_select ON dept_budgets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = dept_budgets.period_id
      AND p.project_id = public.project_id()
  )
  AND (
    public.user_role() = 'muhasebe'
    OR dept_id = public.user_dept_id()
  )
);

CREATE POLICY dept_budgets_insert ON dept_budgets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = dept_budgets.period_id
      AND p.project_id = public.project_id()
  )
  AND public.user_role() = 'muhasebe'
);

CREATE POLICY dept_budgets_update ON dept_budgets FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = dept_budgets.period_id
      AND p.project_id = public.project_id()
  )
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Herkes kendi
CREATE POLICY notifications_select ON notifications FOR SELECT USING (
  project_id = public.project_id()
  AND recipient_id = auth.uid()
);

-- INSERT: service_role (sistem üretir) — client policy yok

-- UPDATE: Kendi bildirimi (is_read)
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (
  project_id = public.project_id()
  AND recipient_id = auth.uid()
);


-- ============================================================
-- 15. CHATS + CHAT_PARTICIPANTS + MESSAGES
-- ============================================================
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- CHATS SELECT: Katılımcılar
CREATE POLICY chats_select ON chats FOR SELECT USING (
  project_id = public.project_id()
  AND EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = chats.id
      AND cp.user_id = auth.uid()
  )
);

-- CHATS INSERT: Proje içi herkes chat oluşturabilir
CREATE POLICY chats_insert ON chats FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND created_by = auth.uid()
);

-- CHAT_PARTICIPANTS SELECT: Katılımcılar
CREATE POLICY chat_participants_select ON chat_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants my_cp
    WHERE my_cp.chat_id = chat_participants.chat_id
      AND my_cp.user_id = auth.uid()
  )
);

-- CHAT_PARTICIPANTS INSERT: Chat oluşturucu + Muhasebe
CREATE POLICY chat_participants_insert ON chat_participants FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chats c
    WHERE c.id = chat_participants.chat_id
      AND c.project_id = public.project_id()
      AND (c.created_by = auth.uid() OR public.user_role() = 'muhasebe')
  )
);

-- MESSAGES SELECT: Katılımcılar
CREATE POLICY messages_select ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = messages.chat_id
      AND cp.user_id = auth.uid()
  )
);

-- MESSAGES INSERT: Katılımcılar
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = messages.chat_id
      AND cp.user_id = auth.uid()
  )
);


-- ============================================================
-- 16. COMPANY_SETTINGS
-- ============================================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_settings_select ON company_settings FOR SELECT USING (
  project_id = public.project_id()
);

CREATE POLICY company_settings_insert ON company_settings FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);

CREATE POLICY company_settings_update ON company_settings FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 17. PROJECT_RULES (Faz 2 placeholder)
-- ============================================================
ALTER TABLE project_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_rules_select ON project_rules FOR SELECT USING (
  project_id = public.project_id()
);

CREATE POLICY project_rules_insert ON project_rules FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);

CREATE POLICY project_rules_update ON project_rules FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- TRIGGER FUNCTIONS (log tabloları için)
-- ============================================================

-- Approval log: receipts UPDATE tetikler
CREATE OR REPLACE FUNCTION fn_log_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Sadece status değiştiğinde ve onay/ret aksiyonu ise
  IF OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status IN ('dept_approved','dept_rejected','acc_approved','acc_rejected','split') THEN
    INSERT INTO approval_log (receipt_id, approver_id, approver_role, action)
    VALUES (
      NEW.id,
      auth.uid(),
      CASE
        WHEN NEW.status LIKE 'dept_%' THEN 'dept'
        ELSE 'muhasebe'
      END,
      CASE
        WHEN NEW.status IN ('dept_approved','acc_approved') THEN 'approved'
        WHEN NEW.status IN ('dept_rejected','acc_rejected') THEN 'rejected'
        WHEN NEW.status = 'split' THEN 'split'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_approval_log
  AFTER UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION fn_log_approval();

-- Advance log: advances INSERT/UPDATE tetikler
CREATE OR REPLACE FUNCTION fn_log_advance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO advance_log (advance_id, action, actor_id, note)
  VALUES (
    NEW.id,
    CASE TG_OP
      WHEN 'INSERT' THEN 'created'
      WHEN 'UPDATE' THEN
        CASE
          WHEN NEW.status = 'approved' THEN 'approved'
          WHEN NEW.status = 'rejected' THEN 'rejected'
          WHEN NEW.status = 'settled' THEN 'settled'
          WHEN NEW.status = 'partially_settled' THEN 'partially_settled'
          ELSE 'updated'
        END
    END,
    auth.uid(),
    CASE TG_OP
      WHEN 'UPDATE' THEN NEW.settlement_note
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_advance_log
  AFTER INSERT OR UPDATE ON advances
  FOR EACH ROW
  EXECUTE FUNCTION fn_log_advance();

-- Yönlendirme: fiş submitted girince doğru onay kuyruğuna düşür (SK-AUTH-9, runtime kontrolü)
CREATE OR REPLACE FUNCTION fn_route_receipt()
RETURNS TRIGGER AS $$
DECLARE
  v_role text := public.user_role();
  v_dept uuid := public.user_dept_id();
  v_has_chief boolean;
BEGIN
  IF v_role = 'saha' THEN
    NEW.dept_id := v_dept;
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE project_id = NEW.project_id
        AND dept_id = v_dept
        AND role = 'dept'
        AND membership_status = 'active'
    ) INTO v_has_chief;
    NEW.status := CASE WHEN v_has_chief THEN 'dept_pending' ELSE 'acc_pending' END;
  ELSIF v_role = 'dept' THEN
    NEW.dept_id := v_dept;
    NEW.status := 'acc_pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_route_receipt
  BEFORE INSERT ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION fn_route_receipt();


-- ============================================================
-- VARSAYIMLAR & NOTLAR
-- ============================================================
-- 1. JWT claims auth.users.raw_app_meta_data'da: { project_id, role, dept_id }
-- 2. Helper fonksiyonlar public schema'da tanımlı (public.project_id vb.)
--    auth.jwt() ve auth.uid() Supabase built-in — onlar auth'da kalır.
-- 3. Log tabloları (approval_log, advance_log) client INSERT policy yok —
--    trigger SECURITY DEFINER ile yazıyor, bu sadece log INSERT için.
-- 4. period_closings INSERT service_role ile (Edge Function veya trigger).
-- 5. notifications INSERT service_role ile.
-- 6. DELETE yok: fiş girince silinemez (denetim kaydı; düzeltme reddet/split).
-- 7. Dept exception_permits verebilir (insert policy'de IN ('muhasebe','dept')).
-- 8. Trigger sayısı: 2 (approval + advance). 5'i geçerse Edge Function değerlendirmesi.
-- 9. project_rules Faz 2 — policy hazır, tablo boş.
