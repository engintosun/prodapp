-- =========================================================
-- KAAPA Butce Modulu — DB Temeli (Dilim 1)
-- Kaynak kararlar: B1-B19 + 5-katman kilidi (CURRENT.md)
-- Ilkeler: hesaplanan deger SAKLANMAZ (B18, yalniz girilen/belge
-- sayilari durur) · negatif deger kapidan giremez (B3 ENGEL =
-- CHECK) · degisiklik izi kapida tutulur (B19 trigger) · kasa ve
-- raflar koy-ve-bak (B16/B17: UPDATE/DELETE politikasi YOK).
-- =========================================================

-- fn_is_budget_muhasebe asagida budgets tablosundan once tanimlanir (ileri
-- referans); govde dogrulamasini bu migration sirasinda kapatiyoruz.
set check_function_bodies = off;

-- ---------- YARDIMCI FONKSIYONLAR ----------

create or replace function fn_is_project_muhasebe(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles pr
    where pr.user_id = auth.uid()
      and pr.project_id = p_project
      and pr.role = 'muhasebe' and pr.membership_status = 'active'
  );
$$;

create or replace function fn_is_budget_muhasebe(p_budget uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from budgets b
    where b.id = p_budget and fn_is_project_muhasebe(b.project_id)
  );
$$;

create or replace function fn_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

-- ---------- SOZLUK RAFLARI (herkes okur, Faz 1'de kimse yazamaz) ----------

create table units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,            -- day/week/month/episode/piece/flat
  label text not null,                  -- gun/hafta/ay/bolum/adet/sabit (UI etiketi)
  sort_order int not null default 0
);

create table burden_components (        -- B2: adlandirilmis yuk bilesenleri
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  is_active boolean not null default true
);

create table rate_catalog (             -- B2/B15: merkezi oran kaynagi, elle beslenir
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references burden_components(id),
  rate_percent numeric(7,4) not null check (rate_percent >= 0), -- 20.0000 = %20
  valid_from date not null,
  note text,
  created_at timestamptz not null default now(),
  unique (component_id, valid_from)
);

create table burden_packages (          -- B2: hazir paketler (Bordrolu, Ajansli cast)
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  component_ids uuid[] not null,        -- raf elle beslenir; butunluk seed disiplininde
  is_active boolean not null default true
);

-- ---------- PROJE TIPI (B8) ----------

alter table projects add column production_type text
  check (production_type in ('film','dizi','reklam','belgesel'));
comment on column projects.production_type is
  'B8 tip secimi. NULL = eski proje; butce modulu ilk acilista sorar.';

-- ---------- BUTCE GOVDESI ----------

create table budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  scope text not null check (scope in ('single','season','episode')), -- tek/sezon/bolum-n
  episode_no int check (episode_no > 0),
  item_code_seq int not null default 0, -- kalici kalem kodu sayaci (servis arttirir, geri donmez)
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((scope = 'episode') = (episode_no is not null)),
  unique nulls not distinct (project_id, scope, episode_no)
);

create table budget_stages (            -- etaplar (B8)
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete restrict,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, budget_id)               -- alt tablolarin tutarlilik FK'si icin
);

create table expense_groups (           -- kartlar (B13: UI adi kart)
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete restrict,
  stage_id uuid not null,
  department_id uuid references departments(id),  -- B9 oneri anahtari, istege bagli
  name text not null,
  icon text,
  default_unit_id uuid references units(id),       -- B5: birim gruptan miras
  default_package_id uuid references burden_packages(id), -- B5: yuk gruptan miras
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, budget_id),
  foreign key (stage_id, budget_id) references budget_stages(id, budget_id) on delete restrict
);

create table budget_items (             -- harcama kalemleri (B5)
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete restrict,
  group_id uuid not null,
  item_code int not null check (item_code > 0),   -- kalici kod: butce ici sayac, #0001
  name text not null,                   -- UI: Sebep
  detail text,                          -- UI: Ayrinti
  note text,                            -- UI: Aciklama (satir detayinda)
  unit_net numeric(14,2) not null default 0 check (unit_net >= 0),   -- B5: ongorulen NET, KDV'siz
  quantity numeric(12,4) not null default 1 check (quantity >= 0),   -- miktar, kesirli olur
  unit_id uuid not null references units(id),
  multiplier numeric(12,4) not null default 1 check (multiplier >= 0), -- adet
  package_id uuid references burden_packages(id), -- secilen paket (bilesen kopyalari item_burdens'ta)
  variance_note text,                   -- B5: fark aciklamasi
  external_code text,                   -- B14: dis format kod-esleme alani (tek izinli ek)
  is_active boolean not null default true,  -- gerceklesni olan kalem silinmez, pasiflesir (B16 yan kural)
  is_hidden boolean not null default false, -- sablondan gelen 0 kalem gizlenebilir
  sort_order int not null default 0,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (budget_id, item_code),
  unique (id, budget_id),
  foreign key (group_id, budget_id) references expense_groups(id, budget_id) on delete restrict
);

create table item_burdens (             -- B2: satirdaki ORAN KOPYALARI, coklu bilesen
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null,
  item_id uuid not null,
  component_id uuid not null references burden_components(id),
  rate_percent numeric(7,4) not null check (rate_percent >= 0), -- secim anindaki kopya; duzeltilebilir, iz B19'da
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, component_id),
  foreign key (item_id, budget_id) references budget_items(id, budget_id) on delete cascade
);

create table budget_percent_lines (     -- B12: ara toplam ustu yuzdeler
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete restrict,
  code text not null check (code in ('contingency','profit')), -- ongorulmeyen / sirket kari
  label text not null,
  rate_percent numeric(7,4) not null default 0 check (rate_percent >= 0),
  is_hidden boolean not null default false, -- B12: kar icmalde gizlenebilir
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (budget_id, code)
);

create table direct_payments (          -- B6 kaynak (b): muhasebenin fis disi kayitlari
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete restrict,
  budget_item_id uuid,                  -- NULL = eslesmemis havuz (B9 durust gosterim)
  kind text not null check (kind in ('invoice','contract','payroll','hand')), -- fatura/sozlesme/bordro/elden
  description text not null,
  counterparty text,
  gross_amount numeric(14,2) not null check (gross_amount >= 0), -- belge gercegi: ucu de yazilir (B6)
  vat_rate numeric(5,2) not null default 20 check (vat_rate >= 0),
  vat_amount numeric(14,2) not null check (vat_amount >= 0),
  net_amount numeric(14,2) not null check (net_amount >= 0),
  is_documented boolean not null default true, -- belgeli/belgesiz isareti
  attachment_path text,                 -- ek istege bagli
  paid_at date not null,
  is_active boolean not null default true, -- silinmez, iptal = pasif (izli)
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (net_amount + vat_amount = gross_amount),
  foreign key (budget_item_id, budget_id) references budget_items(id, budget_id) on delete restrict
);

-- ---------- KASA (B16) ----------

create table budget_baselines (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete restrict,
  version int not null default 1,
  snapshot jsonb not null,              -- tam fotograf: yapi + oran kopyalari + CFE donmus toplamlar
  locked_by uuid not null default auth.uid(),
  locked_at timestamptz not null default now(),
  unique (budget_id, version)
);

-- ---------- RAF (B17) ----------

create table budget_templates (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('system','company')),
  production_type text not null check (production_type in ('film','dizi','reklam','belgesel')),
  scope text not null check (scope in ('single','season','episode')), -- dizi = cift iskelet (season + episode)
  label text not null,
  body jsonb not null,                  -- rakamsiz iskelet: etap/kart/kalem adlari, birim ve paket secimleri
  version int not null default 1,
  is_active boolean not null default true,
  owner_project_id uuid references projects(id), -- sirket sablonu sahipligi; system'de NULL
  created_at timestamptz not null default now(),
  check ((kind = 'system') = (owner_project_id is null))
);
create unique index uq_templates_system_active
  on budget_templates (production_type, scope) where kind = 'system' and is_active;

-- ---------- TUTANAK DEFTERI (B19) ----------

create table budget_change_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id uuid not null,
  budget_id uuid,                       -- raf/katalog satirlarinda NULL (global)
  action text not null check (action in ('UPDATE','DELETE')), -- olusturma bilgisi satirin kendi created_* alanlarinda
  old_data jsonb,
  new_data jsonb,
  changed_by uuid default auth.uid(),
  changed_at timestamptz not null default now()
);
create index ix_changelog_budget on budget_change_log (budget_id, changed_at desc);
create index ix_changelog_row on budget_change_log (table_name, row_id);

create or replace function fn_log_budget_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_old jsonb; v_new jsonb; v_budget uuid; v_row uuid;
begin
  if tg_op = 'UPDATE' then v_old := to_jsonb(old); v_new := to_jsonb(new);
  else v_old := to_jsonb(old); v_new := null; end if;
  v_row := coalesce((v_new->>'id')::uuid, (v_old->>'id')::uuid);
  v_budget := coalesce((v_new->>'budget_id')::uuid, (v_old->>'budget_id')::uuid,
    case when tg_table_name = 'budgets' then v_row end);
  insert into budget_change_log (table_name, row_id, budget_id, action, old_data, new_data, changed_by)
  values (tg_table_name, v_row, v_budget, tg_op, v_old, v_new, auth.uid());
  return null;
end; $$;

-- B19 + B18 notu: bu tetikleyiciler HESAP YAPMAZ, yalniz tutanak tutar.
create trigger trg_log_budgets        after update or delete on budgets              for each row execute function fn_log_budget_change();
create trigger trg_log_stages         after update or delete on budget_stages        for each row execute function fn_log_budget_change();
create trigger trg_log_groups         after update or delete on expense_groups       for each row execute function fn_log_budget_change();
create trigger trg_log_items          after update or delete on budget_items         for each row execute function fn_log_budget_change();
create trigger trg_log_item_burdens   after update or delete on item_burdens         for each row execute function fn_log_budget_change();
create trigger trg_log_percent_lines  after update or delete on budget_percent_lines for each row execute function fn_log_budget_change();
create trigger trg_log_payments       after update or delete on direct_payments      for each row execute function fn_log_budget_change();
create trigger trg_log_rate_catalog   after update or delete on rate_catalog         for each row execute function fn_log_budget_change();
create trigger trg_log_packages       after update or delete on burden_packages      for each row execute function fn_log_budget_change();

-- updated_at tetikleyicileri
create trigger trg_upd_budgets        before update on budgets              for each row execute function fn_set_updated_at();
create trigger trg_upd_stages         before update on budget_stages        for each row execute function fn_set_updated_at();
create trigger trg_upd_groups         before update on expense_groups       for each row execute function fn_set_updated_at();
create trigger trg_upd_items          before update on budget_items         for each row execute function fn_set_updated_at();
create trigger trg_upd_item_burdens   before update on item_burdens         for each row execute function fn_set_updated_at();
create trigger trg_upd_percent_lines  before update on budget_percent_lines for each row execute function fn_set_updated_at();
create trigger trg_upd_payments       before update on direct_payments      for each row execute function fn_set_updated_at();

-- ---------- FIS ESLESMESI (B9/B15: receipts'e TEK kolon) ----------

alter table receipts add column budget_item_id uuid references budget_items(id) on delete restrict;
comment on column receipts.budget_item_id is
  'B9: muhasebe onayinda kaleme eslesme. NULL = eslesmemis havuz. Ekran dogrudan yazamaz; koruma esleme RPC''siyle Dilim 5''te baglanir.';

create or replace function fn_log_receipt_match()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_budget uuid;
begin
  select budget_id into v_budget from budget_items
    where id = coalesce(new.budget_item_id, old.budget_item_id);
  insert into budget_change_log (table_name, row_id, budget_id, action, old_data, new_data, changed_by)
  values ('receipts', new.id, v_budget, 'UPDATE',
          jsonb_build_object('budget_item_id', old.budget_item_id),
          jsonb_build_object('budget_item_id', new.budget_item_id), auth.uid());
  return null;
end; $$;

create trigger trg_log_receipt_match
  after update of budget_item_id on receipts
  for each row when (old.budget_item_id is distinct from new.budget_item_id)
  execute function fn_log_receipt_match();

-- ---------- GRANT (yeni tablo = GRANT + RLS, ikisi de gerekir) ----------

grant select on units, burden_components, rate_catalog, burden_packages,
  budgets, budget_stages, expense_groups, budget_items, item_burdens,
  budget_percent_lines, direct_payments, budget_baselines, budget_templates,
  budget_change_log to authenticated;

grant insert, update on budgets, budget_percent_lines, direct_payments to authenticated;
grant insert, update, delete on budget_stages, expense_groups, budget_items, item_burdens to authenticated;
grant insert on budget_baselines to authenticated;

grant all on units, burden_components, rate_catalog, burden_packages,
  budgets, budget_stages, expense_groups, budget_items, item_burdens,
  budget_percent_lines, direct_payments, budget_baselines, budget_templates,
  budget_change_log to service_role;

-- ---------- RLS ----------

alter table units enable row level security;
alter table burden_components enable row level security;
alter table rate_catalog enable row level security;
alter table burden_packages enable row level security;
alter table budgets enable row level security;
alter table budget_stages enable row level security;
alter table expense_groups enable row level security;
alter table budget_items enable row level security;
alter table item_burdens enable row level security;
alter table budget_percent_lines enable row level security;
alter table direct_payments enable row level security;
alter table budget_baselines enable row level security;
alter table budget_templates enable row level security;
alter table budget_change_log enable row level security;

-- Raflar: herkes okur, yazma politikasi YOK (Faz 1 elle/SQL beslenir)
create policy sel_units on units for select to authenticated using (true);
create policy sel_components on burden_components for select to authenticated using (true);
create policy sel_rates on rate_catalog for select to authenticated using (true);
create policy sel_packages on burden_packages for select to authenticated using (true);

-- Butce govdesi: her seviyede YALNIZ muhasebe (kilitli ilke). DELETE politikasi
-- yalniz yapi tablolarinda; gerceklesni olan satiri FK RESTRICT zaten korur.
create policy sel_budgets on budgets for select to authenticated using (fn_is_project_muhasebe(project_id));
create policy ins_budgets on budgets for insert to authenticated with check (fn_is_project_muhasebe(project_id));
create policy upd_budgets on budgets for update to authenticated using (fn_is_project_muhasebe(project_id)) with check (fn_is_project_muhasebe(project_id));

create policy sel_stages on budget_stages for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_stages on budget_stages for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));
create policy upd_stages on budget_stages for update to authenticated using (fn_is_budget_muhasebe(budget_id)) with check (fn_is_budget_muhasebe(budget_id));
create policy del_stages on budget_stages for delete to authenticated using (fn_is_budget_muhasebe(budget_id));

create policy sel_groups on expense_groups for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_groups on expense_groups for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));
create policy upd_groups on expense_groups for update to authenticated using (fn_is_budget_muhasebe(budget_id)) with check (fn_is_budget_muhasebe(budget_id));
create policy del_groups on expense_groups for delete to authenticated using (fn_is_budget_muhasebe(budget_id));

create policy sel_items on budget_items for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_items on budget_items for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));
create policy upd_items on budget_items for update to authenticated using (fn_is_budget_muhasebe(budget_id)) with check (fn_is_budget_muhasebe(budget_id));
create policy del_items on budget_items for delete to authenticated using (fn_is_budget_muhasebe(budget_id));

create policy sel_burdens on item_burdens for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_burdens on item_burdens for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));
create policy upd_burdens on item_burdens for update to authenticated using (fn_is_budget_muhasebe(budget_id)) with check (fn_is_budget_muhasebe(budget_id));
create policy del_burdens on item_burdens for delete to authenticated using (fn_is_budget_muhasebe(budget_id));

create policy sel_plines on budget_percent_lines for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_plines on budget_percent_lines for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));
create policy upd_plines on budget_percent_lines for update to authenticated using (fn_is_budget_muhasebe(budget_id)) with check (fn_is_budget_muhasebe(budget_id));

create policy sel_payments on direct_payments for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_payments on direct_payments for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));
create policy upd_payments on direct_payments for update to authenticated using (fn_is_budget_muhasebe(budget_id)) with check (fn_is_budget_muhasebe(budget_id));

-- Kasa (B16): koy ve bak. UPDATE/DELETE politikasi YOK.
create policy sel_baselines on budget_baselines for select to authenticated using (fn_is_budget_muhasebe(budget_id));
create policy ins_baselines on budget_baselines for insert to authenticated with check (fn_is_budget_muhasebe(budget_id));

-- Raf (B17): system'i herkes okur; sirket sablonunu sahibinin muhasebesi.
create policy sel_templates on budget_templates for select to authenticated
  using (kind = 'system' or (owner_project_id is not null and fn_is_project_muhasebe(owner_project_id)));

-- Tutanak (B19): yalniz okuma; yazan tek el security definer tetikleyici.
create policy sel_changelog on budget_change_log for select to authenticated
  using (budget_id is null or fn_is_budget_muhasebe(budget_id));

-- ---------- SEED ----------

insert into units (code, label, sort_order) values
  ('day','gün',1),('week','hafta',2),('month','ay',3),
  ('episode','bölüm',4),('piece','adet',5),('flat','sabit',6)
on conflict (code) do nothing;

insert into burden_components (code, label) values
  ('stopaj','Stopaj'),('sgk_isveren','SGK işveren payı'),
  ('ajans_komisyonu','Ajans komisyonu'),('damga','Damga vergisi')
on conflict (code) do nothing;

insert into rate_catalog (component_id, rate_percent, valid_from, note)
select id, r.rate, date '2026-01-01', 'TASLAK - mevzuat dogrulamasi bekliyor'
from burden_components c
join (values ('stopaj',20.0),('sgk_isveren',22.5),('ajans_komisyonu',10.0),('damga',0.759)) as r(code,rate)
  on r.code = c.code
on conflict (component_id, valid_from) do nothing;

insert into burden_packages (code, label, component_ids) values
  ('bordrolu','Bordrolu',
    (select array_agg(id) from burden_components where code in ('stopaj','sgk_isveren'))),
  ('ajansli_cast','Ajanslı cast',
    (select array_agg(id) from burden_components where code in ('stopaj','ajans_komisyonu')))
on conflict (code) do nothing;
