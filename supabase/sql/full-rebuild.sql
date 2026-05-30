-- ============================================================
-- KAAPA Full Rebuild — Canonical Script
-- Tarih: 27 Mayis 2026
-- Versiyon: SCHEMA v2.2 + RLS v2.1 + FUNCTIONS v1.0
--
-- BU SCRIPT public semasindaki TUM tablolari siler ve yeniden kurar.
-- auth.users tablosuna DOKUNULMAZ.
--
-- KULLANIM:
-- 1) Supabase Dashboard > SQL Editor > New query
-- 2) Bu dosyanin TAMAMINI yapistir > Run
-- 3) Sondaki iki SELECT sonuclarini dogrula
-- 4) Ardindan BOOTSTRAP-MUSTERI.sql ile kullanici/proje ekle
--
-- ATOMIK: BEGIN/COMMIT arasinda; hata olursa otomatik geri alinir.
-- ============================================================

BEGIN;

-- ============================================================
-- DROP: public semasindaki tum tablolari kaldir
-- ============================================================
DO $drop$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $drop$;

-- ============================================================
-- PRODAPP Supabase Schema v2.2
-- Guncelleme: 27 Mayis 2026
-- Degisiklik: v2.0 — profiles coklu-uyelik remodel (surrogate id + user_id + UNIQUE(user_id,project_id)),
--   uyelik yasam dongusu (membership_status / access_until / revoked_at),
--   projects yasam dongusu alanlari (status / closed_at / closed_by, sekil; logic M2),
--   person isaret eden 9 FK profiles(id) -> auth.users(id), is_active+soft_deleted_at -> membership_status.
--   v2.1 — TD-1: projects.is_active kaldirildi, status enum tek kaynak.
--   v2.2 — SK-AUTH-9: chk_role_dept_id constraint (role=muhasebe OR dept_id IS NOT NULL).
-- Onceki: v1.1
-- ============================================================

-- 0. PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','closed','archived')),
  closed_at TIMESTAMPTZ,
  closed_by UUID
);

-- 1. PROFILES (uyelik = kisi x proje; bir kisinin birden cok uyeligi olabilir)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  dept_id UUID,
  role TEXT NOT NULL CHECK (role IN ('saha','dept','muhasebe')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  membership_status TEXT NOT NULL DEFAULT 'active'
    CHECK (membership_status IN ('active','archived_readonly','revoked')),
  access_until TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  invited_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, project_id),
  CONSTRAINT chk_readonly_access_until
    CHECK (membership_status <> 'archived_readonly' OR access_until IS NOT NULL)
  ,CONSTRAINT chk_role_dept_id
    CHECK (role = 'muhasebe' OR dept_id IS NOT NULL)
);

-- 1b. INVITATIONS
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('saha','dept','muhasebe')),
  dept_id UUID,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','expired','revoked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ
);

-- 2. DEPARTMENTS
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  chief_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PERIODS
CREATE TABLE periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  period_number INT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open','partially_closed','closing','closed','permanently_closed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  closed_by UUID,
  close_declared_at TIMESTAMPTZ,
  grace_until TIMESTAMPTZ,
  saha_deadline TIMESTAMPTZ,
  dept_deadline TIMESTAMPTZ,
  acc_deadline TIMESTAMPTZ,
  rules_snapshot JSONB
);

-- 4. PERIOD_CLOSINGS
CREATE TABLE period_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES periods(id),
  level TEXT NOT NULL CHECK (level IN ('saha','dept','acc')),
  user_id UUID NOT NULL,
  dept_id UUID,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open','submitted','approved','disputed','closed_by_override','reopened')),
  summary JSONB,
  total_amount NUMERIC(12,2),
  advance_balance NUMERIC(12,2),
  receipt_count INT DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  override_reason TEXT,
  reopen_count INT DEFAULT 0,
  last_reopened_at TIMESTAMPTZ,
  reopen_reason TEXT,
  is_late BOOLEAN DEFAULT false,
  notes TEXT
);

-- 5. EXPENSE_CATEGORIES
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. DEPT_SUBCATEGORIES
CREATE TABLE dept_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_id UUID NOT NULL REFERENCES departments(id),
  category_id UUID REFERENCES expense_categories(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. RECEIPTS
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  period_id UUID NOT NULL REFERENCES periods(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  dept_id UUID REFERENCES departments(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  vat_amount NUMERIC(12,2),
  category_id UUID REFERENCES expense_categories(id),
  dept_subcategory_id UUID REFERENCES dept_subcategories(id),
  description TEXT,
  vendor_name TEXT,
  receipt_date DATE,
  receipt_image_url TEXT,
  invoice_file_url TEXT,
  gib_qr_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted','dept_pending','dept_approved','dept_rejected','acc_pending','acc_approved','acc_rejected','split')),
  is_late_entry BOOLEAN DEFAULT false,
  is_documentless BOOLEAN DEFAULT false,
  parent_receipt_id UUID REFERENCES receipts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_parent_not_self CHECK (parent_receipt_id IS NULL OR parent_receipt_id <> id)
);

-- 8. APPROVAL_LOG
CREATE TABLE approval_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id),
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  approver_role TEXT NOT NULL CHECK (approver_role IN ('dept','muhasebe')),
  action TEXT NOT NULL
    CHECK (action IN ('approved','rejected','split','auto_approved')),
  reason TEXT,
  split_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ADVANCES
CREATE TABLE advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  period_id UUID NOT NULL REFERENCES periods(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','settled','partially_settled')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  settlement_amount NUMERIC(12,2),
  settlement_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. ADVANCE_LOG
CREATE TABLE advance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES advances(id),
  action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. EXCEPTION_PERMITS
CREATE TABLE exception_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  period_id UUID NOT NULL REFERENCES periods(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  granted_by UUID NOT NULL,
  permit_type TEXT DEFAULT 'late_entry'
    CHECK (permit_type IN ('late_entry','reopen','limit_override')),
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. PERIOD_BUDGETS
CREATE TABLE period_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES periods(id),
  total_budget NUMERIC(14,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  set_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. DEPT_BUDGETS
CREATE TABLE dept_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES periods(id),
  dept_id UUID NOT NULL REFERENCES departments(id),
  budget_amount NUMERIC(14,2) NOT NULL,
  set_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  ref_type TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. CHATS + CHAT_PARTICIPANTS + MESSAGES
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  name TEXT,
  is_group BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_participants (
  chat_id UUID REFERENCES chats(id),
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. COMPANY_SETTINGS
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  company_name TEXT,
  company_logo_url TEXT,
  project_logo_url TEXT,
  project_name TEXT,
  settings JSONB DEFAULT '{}',
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. PROJECT_RULES (Faz 2 placeholder)
CREATE TABLE project_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  rule_category TEXT NOT NULL,
  rule_key TEXT NOT NULL,
  rule_value JSONB NOT NULL,
  effective_from TIMESTAMPTZ DEFAULT now(),
  effective_until TIMESTAMPTZ,
  set_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FK: invitations.dept_id -> departments (siralama nedeniyle ayri)
ALTER TABLE invitations ADD CONSTRAINT fk_invitations_dept
  FOREIGN KEY (dept_id) REFERENCES departments(id);

-- ============================================================
-- PRODAPP RLS Policies v2.1
-- Degisiklik: v2.0 — profiles coklu-uyelik remodel; profiles policy'leri user_id=auth.uid(); advances/advance_log profiles join'i user_id+project_id; is_active/soft_deleted -> membership_status; default_privileges eklendi.
--   v2.1 — TD-1: projects_own_list is_active -> status.
-- Guncelleme: 27 Mayis 2026
-- Bagimlilik: SUPABASE-SCHEMA.sql v2.1 (17 tablo + projects + invitations)
-- Yontem: JWT custom claims (raw_app_meta_data)
-- Claims: project_id, role (saha/dept/muhasebe), dept_id
-- ============================================================

-- ============================================================
-- TABLO ERISIM IZINLERI (GRANT)
-- ============================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
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
-- INDEXES (RLS performansi icin)
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


-- ============================================================
-- 1. PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id())
    OR user_id = auth.uid()
  )
);

CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);

CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  project_id = public.project_id()
  AND (
    user_id = auth.uid()
    OR public.user_role() = 'muhasebe'
  )
);

CREATE POLICY profiles_own_list ON profiles
  FOR SELECT USING (user_id = auth.uid());


-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY departments_select ON departments FOR SELECT USING (
  project_id = public.project_id()
);

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

CREATE POLICY invitations_select ON invitations FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id())
  )
);

CREATE POLICY invitations_insert ON invitations FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND invited_by = auth.uid()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id() AND role = 'saha')
  )
);

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
-- 7. RECEIPTS
-- ============================================================
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY receipts_select ON receipts FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR (public.user_role() = 'dept' AND dept_id = public.user_dept_id())
    OR user_id = auth.uid()
  )
);

CREATE POLICY receipts_insert ON receipts FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'saha'
  AND user_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM periods p
      WHERE p.id = receipts.period_id
        AND p.project_id = public.project_id()
        AND p.status IN ('open','closing')
    )
    OR
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

CREATE POLICY receipts_update ON receipts FOR UPDATE USING (
  project_id = public.project_id()
  AND (
    (public.user_role() = 'dept' AND dept_id = public.user_dept_id() AND status = 'dept_pending')
    OR public.user_role() = 'muhasebe'
  )
);

-- receipts DELETE policy yok: fiş girince silinemez (denetim kaydı; düzeltme reddet/split — IS-KURALLARI §3, §20).


-- ============================================================
-- 8. APPROVAL_LOG
-- ============================================================
ALTER TABLE approval_log ENABLE ROW LEVEL SECURITY;

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


-- ============================================================
-- 9. ADVANCES
-- ============================================================
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY advances_insert ON advances FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() = 'saha'
  AND user_id = auth.uid()
);

CREATE POLICY advances_update ON advances FOR UPDATE USING (
  project_id = public.project_id()
  AND public.user_role() = 'muhasebe'
);


-- ============================================================
-- 10. ADVANCE_LOG
-- ============================================================
ALTER TABLE advance_log ENABLE ROW LEVEL SECURITY;

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


-- ============================================================
-- 11. EXCEPTION_PERMITS
-- ============================================================
ALTER TABLE exception_permits ENABLE ROW LEVEL SECURITY;

CREATE POLICY exception_permits_select ON exception_permits FOR SELECT USING (
  project_id = public.project_id()
  AND (
    public.user_role() = 'muhasebe'
    OR user_id = auth.uid()
  )
);

CREATE POLICY exception_permits_insert ON exception_permits FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND public.user_role() IN ('muhasebe', 'dept')
);

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

CREATE POLICY notifications_select ON notifications FOR SELECT USING (
  project_id = public.project_id()
  AND recipient_id = auth.uid()
);

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

CREATE POLICY chats_select ON chats FOR SELECT USING (
  project_id = public.project_id()
  AND EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = chats.id
      AND cp.user_id = auth.uid()
  )
);

CREATE POLICY chats_insert ON chats FOR INSERT WITH CHECK (
  project_id = public.project_id()
  AND created_by = auth.uid()
);

CREATE POLICY chat_participants_select ON chat_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants my_cp
    WHERE my_cp.chat_id = chat_participants.chat_id
      AND my_cp.user_id = auth.uid()
  )
);

CREATE POLICY chat_participants_insert ON chat_participants FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chats c
    WHERE c.id = chat_participants.chat_id
      AND c.project_id = public.project_id()
      AND (c.created_by = auth.uid() OR public.user_role() = 'muhasebe')
  )
);

CREATE POLICY messages_select ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.chat_id = messages.chat_id
      AND cp.user_id = auth.uid()
  )
);

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
-- TRIGGER FUNCTIONS (log tablolari icin)
-- ============================================================

CREATE OR REPLACE FUNCTION fn_log_approval()
RETURNS TRIGGER AS $$
BEGIN
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

-- ============================================================
-- PRODAPP Server-side Admin Functions v1.0
-- Bu dosyadaki fonksiyonlar SECURITY DEFINER ile calisir.
-- Sadece service_role uzerinden cagirilabilir (Edge Functions).
-- ============================================================

CREATE OR REPLACE FUNCTION public.clear_user_claims(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $clearfn$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) - 'project_id' - 'role' - 'dept_id'
  WHERE id = p_user_id;
END;
$clearfn$;

REVOKE EXECUTE ON FUNCTION public.clear_user_claims(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.clear_user_claims(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.clear_user_claims(UUID) FROM anon;
GRANT  EXECUTE ON FUNCTION public.clear_user_claims(UUID) TO service_role;

COMMIT;

-- ============================================================
-- VERIFY (transaction disinda — sadece dogrulama)
-- ============================================================

-- (a) Tablo + RLS durumu (beklenen: tablo_sayisi=21, rls_acik_sayisi=21)
SELECT count(*) AS tablo_sayisi,
       count(*) FILTER (WHERE c.relrowsecurity) AS rls_acik_sayisi
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r';

-- (b) clear_user_claims fonksiyonu var mi?
SELECT proname FROM pg_proc WHERE proname = 'clear_user_claims';
