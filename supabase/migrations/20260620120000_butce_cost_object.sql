-- KAAPA Butce 2026-06-20: cost_object (4. eksen) sema dilimi
-- Karar kaynagi: docs/butce/KART-KATALOGU.md §4.10 + §8.
-- cost_object = transversal is/oge etiketi (Stunt/VFX/per-oyuncu); kart sinirini asan
-- rollup icin. Kontrollu liste (serbest-metin DEGIL), butce-bazli, satir-basina TEK,
-- opsiyonel. Bes katman: bu dosya sema+FK+GRANT+RLS+trigger. Servis/UI/CFE ayri dilim.
-- Baseline snapshot'a cost_object atamalarinin GIRMESI fn_lock_budget/CFE serializer
-- isi (ayri dilim); bu dosya tabloyu kurar, snapshot KODU sonra baglar.
-- ON KOSUL: budget_items bos (yazan UI yok); nullable kolon + bos tablo guvenli.

-- 1) Kontrollu liste: butce-bazli cost_object kayitlari.
--    Composite unique (id, budget_id): budget_items.cost_object_id composite-FK'sinin
--    hedefi (expense_groups/budget_items kalibi). budgets'e on delete restrict
--    (diger tum butce-alt tablolari ile tutarli; budgets zaten kolay silinmez).
create table budget_cost_objects (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete restrict,
  code int not null check (code > 0),     -- butce ici sayac kimligi (#0001), kalici
  name text not null,                     -- anlamli isim ("Cati yangini", "Stunt", "Oyuncu: Ahmet")
  note text,                              -- opsiyonel aciklama
  is_active boolean not null default true, -- kullanimda olan silinmez, pasiflesir
  sort_order int not null default 0,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (budget_id, code),
  unique (id, budget_id)                  -- alt FK tutarlilik hedefi
);

comment on table budget_cost_objects is
  'cost_object (4. eksen, §4.10): transversal is/oge etiketi. Butce-bazli kontrollu liste; kart sinirini asan rollup icin. Satir-basina TEK (Faz 1).';

-- 2) budget_items'a cost_object_id: nullable (cogu satir bos), composite-FK ile
--    ayni-butce garantisi (MATCH SIMPLE: cost_object_id NULL ise FK kontrol edilmez,
--    doluyken her iki kolon eslesir). on delete restrict: kullanimdaki cost_object
--    silinemez (§4.10 "kullanimdaki is silinemez"); once etiket bosaltilir.
alter table budget_items
  add column cost_object_id uuid;

alter table budget_items
  add constraint budget_items_cost_object_fk
  foreign key (cost_object_id, budget_id)
  references budget_cost_objects(id, budget_id) on delete restrict;

comment on column budget_items.cost_object_id is
  'cost_object (§4.10): satirin transversal is etiketi. NULL = etiketsiz (cogu satir). Composite-FK ayni-butce; restrict = kullanimdaki is silinemez.';

-- 3) GRANT (yeni tablo = GRANT + RLS, ikisi de gerekir).
grant select, insert, update, delete on budget_cost_objects to authenticated;
grant all on budget_cost_objects to service_role;

-- 4) RLS — yalniz muhasebe (kilitli ilke; item_burdens/budget_item_periods kalibi).
alter table budget_cost_objects enable row level security;
create policy sel_cost_objects on budget_cost_objects for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_cost_objects on budget_cost_objects for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));
create policy upd_cost_objects on budget_cost_objects for update to authenticated using (fn_is_budget_muhasebe(budget_id)) with check (fn_is_budget_muhasebe(budget_id));
create policy del_cost_objects on budget_cost_objects for delete to authenticated using (fn_is_budget_muhasebe(budget_id));

-- 5) Tetikleyiciler: B19 iz + updated_at. MEVCUT fonksiyonlar (yeni fonksiyon YOK).
--    fn_log_budget_change budget_id'yi satirin kendisinden okur; budget_cost_objects.budget_id
--    dolu (butce-bazli) -> iz sorunsuz. budget_items.cost_object_id zaten trg_log_items /
--    trg_upd_items kapsaminda (to_jsonb tum satir) -> yeni kolon otomatik izlenir, EK trigger YOK.
create trigger trg_log_cost_objects  after update or delete on budget_cost_objects for each row execute function fn_log_budget_change();
create trigger trg_upd_cost_objects  before update on budget_cost_objects            for each row execute function fn_set_updated_at();
