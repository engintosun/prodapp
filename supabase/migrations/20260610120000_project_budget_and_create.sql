-- KAAPA 2026-06-10: butce->proje + proje olusturma memuru
-- 1) Yeni tablolar: project_budgets (proje toplami) + project_dept_budgets (departman paylari)
-- 2) GRANT + RLS: her seviyede yalniz muhasebe gorur/yazar
-- 3) Mevcut donem SELECT policy'leri muhasebe-only'ye cekilir
-- 4) fn_create_project: proje + company_settings + acan=muhasebe uyeligi tek hamlede

-- ============ 1) TABLOLAR ============
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  total_budget NUMERIC(14,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  set_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id)
);

CREATE TABLE project_dept_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  dept_id UUID NOT NULL REFERENCES departments(id),
  budget_amount NUMERIC(14,2) NOT NULL,
  set_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, dept_id)
);

-- ============ 2) GRANT (yeni tablo = GRANT + RLS, ikisi de gerekir) ============
GRANT SELECT, INSERT, UPDATE ON project_budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON project_dept_budgets TO authenticated;
GRANT ALL ON project_budgets TO service_role;
GRANT ALL ON project_dept_budgets TO service_role;

-- ============ 3) RLS — yeni tablolar (yalniz muhasebe) ============
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_budgets_select ON project_budgets FOR SELECT USING (
  project_id = public.project_id() AND public.user_role() = 'muhasebe'
);
CREATE POLICY project_budgets_insert ON project_budgets FOR INSERT WITH CHECK (
  project_id = public.project_id() AND public.user_role() = 'muhasebe'
);
CREATE POLICY project_budgets_update ON project_budgets FOR UPDATE USING (
  project_id = public.project_id() AND public.user_role() = 'muhasebe'
);

ALTER TABLE project_dept_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_dept_budgets_select ON project_dept_budgets FOR SELECT USING (
  project_id = public.project_id() AND public.user_role() = 'muhasebe'
);
CREATE POLICY project_dept_budgets_insert ON project_dept_budgets FOR INSERT WITH CHECK (
  project_id = public.project_id() AND public.user_role() = 'muhasebe'
);
CREATE POLICY project_dept_budgets_update ON project_dept_budgets FOR UPDATE USING (
  project_id = public.project_id() AND public.user_role() = 'muhasebe'
);

-- ============ 4) Mevcut donem SELECT'leri muhasebe-only ============
DROP POLICY period_budgets_select ON period_budgets;
CREATE POLICY period_budgets_select ON period_budgets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = period_budgets.period_id
      AND p.project_id = public.project_id()
  )
  AND public.user_role() = 'muhasebe'
);

DROP POLICY dept_budgets_select ON dept_budgets;
CREATE POLICY dept_budgets_select ON dept_budgets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM periods p
    WHERE p.id = dept_budgets.period_id
      AND p.project_id = public.project_id()
  )
  AND public.user_role() = 'muhasebe'
);

-- ============ 5) fn_create_project (memur) ============
CREATE OR REPLACE FUNCTION public.fn_create_project(
  p_name         text,
  p_company_name text,
  p_first_name   text,
  p_last_name    text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $createfn$
DECLARE
  v_uid     uuid := auth.uid();
  v_can     boolean;
  v_project uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Oturum yok';
  END IF;

  SELECT COALESCE((u.raw_app_meta_data ->> 'can_create_projects')::boolean, false)
    INTO v_can
    FROM auth.users u
   WHERE u.id = v_uid;

  IF NOT COALESCE(v_can, false) THEN
    RAISE EXCEPTION 'Proje acma yetkisi yok';
  END IF;

  IF btrim(COALESCE(p_name, '')) = ''
     OR btrim(COALESCE(p_company_name, '')) = ''
     OR btrim(COALESCE(p_first_name, '')) = ''
     OR btrim(COALESCE(p_last_name, '')) = '' THEN
    RAISE EXCEPTION 'Eksik alan';
  END IF;

  INSERT INTO projects (name, created_by)
  VALUES (btrim(p_name), v_uid)
  RETURNING id INTO v_project;

  INSERT INTO company_settings (project_id, company_name, project_name, updated_by)
  VALUES (v_project, btrim(p_company_name), btrim(p_name), v_uid);

  INSERT INTO profiles (user_id, project_id, role, first_name, last_name)
  VALUES (v_uid, v_project, 'muhasebe', btrim(p_first_name), btrim(p_last_name));

  RETURN v_project;
END;
$createfn$;

REVOKE EXECUTE ON FUNCTION public.fn_create_project(text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_create_project(text, text, text, text) FROM anon;
GRANT  EXECUTE ON FUNCTION public.fn_create_project(text, text, text, text) TO authenticated;
