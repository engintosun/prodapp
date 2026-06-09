-- KAAPA onboarding altyapisi
-- Hedef: idempotent butce upsert + DB-otoriter period_number
-- Tarih: 2026-06-09

-- Delta A: butce tablolarinda UNIQUE + dept_budgets.updated_at
ALTER TABLE period_budgets
  ADD CONSTRAINT period_budgets_period_unique UNIQUE (period_id);

ALTER TABLE dept_budgets
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE dept_budgets
  ADD CONSTRAINT dept_budgets_period_dept_unique UNIQUE (period_id, dept_id);

-- Delta B: periods UNIQUE(project_id, period_number)
ALTER TABLE periods
  ADD CONSTRAINT periods_project_number_unique UNIQUE (project_id, period_number);

-- fn_assign_period_number: BEFORE INSERT trigger, period_number=max+1 (proje bazli)
CREATE OR REPLACE FUNCTION public.fn_assign_period_number()
RETURNS TRIGGER AS $fn$
BEGIN
  IF NEW.period_number IS NULL THEN
    SELECT COALESCE(MAX(period_number), 0) + 1
      INTO NEW.period_number
      FROM periods
      WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_assign_period_number ON periods;
CREATE TRIGGER trg_assign_period_number
  BEFORE INSERT ON periods
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_assign_period_number();
