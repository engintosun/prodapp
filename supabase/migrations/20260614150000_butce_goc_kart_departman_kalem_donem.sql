-- KAAPA Butce 2026-06-14: kart=departman + donem tarih + kalem<->donem koprusu
-- Karar kaynagi: TASARIM-KARARLARI.md bolum A + F (kart departmana baglanir,
-- doneme bag kalemde durur, matris turetilir).
-- Bes katman: bu dosya sema+RLS+trigger+GRANT. Servis (okuma/fn_open_budget)
-- ve UI ayri dilimlerde. "En az bir donem" ve "donem tarihli olmali" zorlamasi
-- burada DEGIL; muhurde (fn_lock_budget) — iskelet gevsek, muhur siki.
-- ON KOSUL: ilgili tablolar bos (Dilim 1 yeni, yazan UI yok).

-- 1) Kart = departman (donemden kopar). stage_id kolonu duser; onu iceren
--    (stage_id, budget_id) FK'si bu drop ile otomatik kalkar. department_id zorunlu.
alter table expense_groups drop column stage_id;
alter table expense_groups alter column department_id set not null;

-- 2) Donem = budget_stages, tarih sinirli (nullable; tarih zorlamasi muhurde).
alter table budget_stages add column start_date date;
alter table budget_stages add column end_date date;
alter table budget_stages
  add constraint budget_stages_date_order check (end_date >= start_date);

-- 3) Miktar kalemden donem koprusune tasinir (A karari: her donem kendi miktari).
--    Kalemde birim net / birim / adet / yuk SABIT kalir; "kac gun/adet" donem basina.
alter table budget_items drop column quantity;

-- 4) YENI: kalem<->donem koprusu (ait-donem ekseni). Bir kalem-donem cifti tek satir.
--    budget_id tutarlilik FK'si icin tasinir (item_burdens kalibi); kalem ve donem
--    AYNI butceye ait olmak zorunda.
create table budget_item_periods (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null,
  item_id uuid not null,
  stage_id uuid not null,
  quantity numeric(12,4) not null default 0 check (quantity >= 0), -- bu donemdeki miktar, kesirli olur
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, stage_id),
  foreign key (item_id, budget_id) references budget_items(id, budget_id) on delete cascade,
  foreign key (stage_id, budget_id) references budget_stages(id, budget_id) on delete restrict
);

-- 5) GRANT (yeni tablo = GRANT + RLS, ikisi de gerekir).
grant select, insert, update, delete on budget_item_periods to authenticated;
grant all on budget_item_periods to service_role;

-- 6) RLS — kalem<->donem koprusu yalniz muhasebe (kilitli ilke, item_burdens kalibi).
alter table budget_item_periods enable row level security;
create policy sel_item_periods on budget_item_periods for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_item_periods on budget_item_periods for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));
create policy upd_item_periods on budget_item_periods for update to authenticated using (fn_is_budget_muhasebe(budget_id)) with check (fn_is_budget_muhasebe(budget_id));
create policy del_item_periods on budget_item_periods for delete to authenticated using (fn_is_budget_muhasebe(budget_id));

-- 7) Tetikleyiciler: degisiklik izi (B19) + updated_at. Mevcut fonksiyonlar kullanilir,
--    yeni fonksiyon yok. fn_log_budget_change budget_id'yi satirin kendisinden okur.
create trigger trg_log_item_periods  after update or delete on budget_item_periods for each row execute function fn_log_budget_change();
create trigger trg_upd_item_periods  before update on budget_item_periods            for each row execute function fn_set_updated_at();
