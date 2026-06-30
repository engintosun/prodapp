-- DILIM-2f: donem-bazli geometri + budget_items.repeat muhurleme + kisi birimi seed
-- Mod: idempotent (IF NOT EXISTS / on conflict do nothing); tekrar uygulama guvenli.

-- 1) budget_items.repeat: canliya elle ALTER edildi, muhurleme
alter table budget_items
  add column if not exists repeat numeric(12,4) not null default 1
    check (repeat >= 0);

comment on column budget_items.repeat is
  'B-CARPAN: ana satir Carpan kolonu. Net = Birim_net x Miktar x Carpan. Donem-bazli override icin budget_item_periods.repeat_override.';

-- 2) budget_item_periods.repeat_override: donem-bazli Carpan
alter table budget_item_periods
  add column if not exists repeat_override numeric(12,4)
    check (repeat_override is null or repeat_override >= 0);

comment on column budget_item_periods.repeat_override is
  'B-CARPAN-OVERRIDE: donem-bazli Carpan; null = ana satir mirasi.';

-- 3) budget_item_periods.unit_id_override: donem-bazli Birim
alter table budget_item_periods
  add column if not exists unit_id_override uuid references units(id);

comment on column budget_item_periods.unit_id_override is
  'B-BIRIM-OVERRIDE: donem-bazli Birim; null = ana satir mirasi.';

-- 4) Kisi birimi (units seed; idempotent)
insert into units (code, label, sort_order) values ('person','kisi',7)
  on conflict (code) do nothing;
