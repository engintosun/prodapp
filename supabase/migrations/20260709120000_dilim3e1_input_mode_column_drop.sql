-- KAAPA DILIM-3e-1: input_mode/input_value mimarisi tamamen kaldirildi (TASARIM-KARARLARI.md,
-- 2026-07-09 karari). Servis katmani artik tek yoldan calisir: kaynak her zaman unit_net (item veya
-- budget_item_periods.unit_net_override). Drop oncesi veri-sayimi yapildi (read-only, 2026-07-09):
-- select item_code, budget_id, input_mode, input_value from budget_items where input_mode is not null;
-- -> 0 satir. Bos oldugu icin ayni committe DROP.

alter table public.budget_items
  drop column if exists input_mode,
  drop column if exists input_value;
