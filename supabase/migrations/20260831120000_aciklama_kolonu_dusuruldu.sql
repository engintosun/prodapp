-- KAAPA 31 Agustos 2026: Aciklama kolonu ekrandan kalkti, alan da semadan dusuyor.
-- Alanin ne indeksi ne kisiti var (20260726120000 gocunde tek add column + comment).
-- fn_open_budget ve fn_add_budget_item bu alana DOKUNMUYOR, govde degisikligi gerekmez.
-- Iz: fn_log_budget_change to_jsonb(old/new) ile calisir, kolon adi saymaz; tetikleyici
-- bozulmaz ve eski budget_change_log fotograflari description alanini icinde tasimaya devam eder.
alter table public.budget_items drop column description;
