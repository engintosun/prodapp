-- ============================================================
-- PRODAPP Supabase Schema v1.1
-- Güncelleme: 21 Mayıs 2026
-- Değişiklik: projects + invitations tablosu eklendi, FK'lar güncellendi
-- ============================================================

-- 0. PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  dept_id UUID,
  role TEXT NOT NULL CHECK (role IN ('saha','dept','muhasebe')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  soft_deleted_at TIMESTAMPTZ
);

-- 1b. INVITATIONS
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('saha','dept','muhasebe')),
  dept_id UUID REFERENCES departments(id),
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES profiles(id),
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
  chief_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PERIODS
CREATE TABLE periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  period_number INT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open','partially_closed','closed','permanently_closed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  closed_by UUID,
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
  user_id UUID NOT NULL REFERENCES profiles(id),
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
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','dept_pending','dept_approved','dept_rejected','acc_pending','acc_approved','acc_rejected','split')),
  is_late_entry BOOLEAN DEFAULT false,
  is_documentless BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. APPROVAL_LOG
CREATE TABLE approval_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id),
  approver_id UUID NOT NULL REFERENCES profiles(id),
  approver_role TEXT NOT NULL CHECK (approver_role IN ('dept','muhasebe')),
  action TEXT NOT NULL
    CHECK (action IN ('approved','rejected','split','returned','auto_approved')),
  reason TEXT,
  split_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ADVANCES
CREATE TABLE advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  period_id UUID NOT NULL REFERENCES periods(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
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
  user_id UUID NOT NULL REFERENCES profiles(id),
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
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  ref_type TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. CHATS
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
  user_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id),
  sender_id UUID NOT NULL REFERENCES profiles(id),
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
