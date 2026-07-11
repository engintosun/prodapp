-- KAAPA MUHUR-1: fn_lock_budget cekirdegi (2026-07-11)
-- Model: canli tablolar = calisma taslagi; muhur aninda taslagin tam kopyasi
-- versiyon olarak donar (V1,V2...), canli butce kilitlenir; revizyon = kilidi
-- ac, taslakta calis, yeniden muhurle = V+1. Muhurlu versiyonlar ASLA degismez.
-- Bes katman: bu dosya SADECE sema+RLS+trigger+RPC cekirdegi. Servis okuma
-- catali (MUHUR-2) ve UI (MUHUR-3) AYRI dilim, bu migration TypeScript'e dokunmaz.
-- (G) kapsami payload'daki TUM mutasyona-acik tablolar - stages/items/item_periods/
-- item_burdens/percent_lines/groups/cost_objects; mimari inceleme buldu, spec revize 2026-07-11.

-- ============================================================
-- 0) budget_baselines DROP (Dilim-1 atil kalintisi, hic baglanmadi;
--    B16/Kasa kavraminin evi artik budget_versions - "ikinci ev acilmaz").
--    Canli dogrulama: select count(*) from budget_baselines = 0 (Engin onayi 2026-07-11).
-- ============================================================
drop policy if exists sel_baselines on public.budget_baselines;
drop policy if exists ins_baselines on public.budget_baselines;
drop table if exists public.budget_baselines;

-- ============================================================
-- (A) budgets.is_locked
-- ============================================================
alter table public.budgets
  add column is_locked boolean not null default false;
comment on column public.budgets.is_locked is
  'true = muhurlu (taslak donuk, kilit guard'' tetikleyicileri devrede). fn_lock_budget/fn_unlock_budget disinda degismez.';

-- ============================================================
-- (B) budget_versions
-- ============================================================
create table public.budget_versions (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete restrict,
  version_no int not null check (version_no > 0),
  sealed_at timestamptz not null default now(),
  sealed_by uuid not null default auth.uid(),
  revision_note text,
  sgk_component_code text not null,
  sgk_q1 boolean not null,
  sgk_q2 boolean not null,
  sgk_q3 boolean not null,
  calendar_assumption boolean not null,
  payload jsonb not null,
  unique (budget_id, version_no)
);
comment on table public.budget_versions is
  'MUHUR-1: B16/Kasa kavraminin TEK evi. Muhur aninda taslagin tam-sadakatli kopyasi (B18: hesaplanan deger YOK). ASLA UPDATE/DELETE edilmez (RLS''te de yok).';
comment on column public.budget_versions.sgk_component_code is
  'Muhur aninda fn_resolve_sgk_scenario ciktisi (component code, oran DEGIL - B20).';
comment on column public.budget_versions.sgk_q1 is 'Muhur aninda company_profile.kultur_girisim_belgeli izi (B19 ruhu, neden-bu-senaryoydu dosyada kalir).';
comment on column public.budget_versions.sgk_q2 is 'Muhur aninda company_profile.kultur_yatirim_belgeli izi.';
comment on column public.budget_versions.sgk_q3 is 'Muhur aninda company_profile.sgk_borcu_yok izi.';
comment on column public.budget_versions.calendar_assumption is
  'true = rezerve "Donemsiz" etabi HARIC en az bir etap tarihsizken muhurlendi (Ocak-varsayimi devrede, PERSONEL-MEVZUATI K7).';
comment on column public.budget_versions.payload is
  'Butceye bagli TUM kalici satirlarin tam-sadakatli kopyasi: budget/stages/groups/cost_objects/items/item_periods/item_burdens/percent_lines. Hesaplanan deger YAZILMAZ (B18); motor deterministik, yeniden uretilir.';

grant references, trigger, truncate, maintain on table public.budget_versions to anon;
grant select, insert, references, trigger, truncate, maintain on table public.budget_versions to authenticated;
grant all on table public.budget_versions to service_role;

alter table public.budget_versions enable row level security;

-- Kasa deseni (B16/B17): koy-ve-bak. UPDATE/DELETE politikasi YOK - muhurlu versiyon ASLA degismez.
create policy sel_budget_versions on public.budget_versions for select to authenticated
  using (fn_is_budget_muhasebe(budget_id));
create policy ins_budget_versions on public.budget_versions for insert to authenticated
  with check (fn_is_budget_muhasebe(budget_id));

-- ============================================================
-- (D) budget_rate_snapshot
-- ============================================================
create table public.budget_rate_snapshot (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.budget_versions(id) on delete cascade,
  component_id uuid not null,
  component_code text not null,
  value_kind text not null check (value_kind in ('oran','tutar','tarife')),
  rate_percent numeric(7,4) check (rate_percent >= 0),
  amount_tl numeric(14,2) check (amount_tl is null or amount_tl >= 0),
  bracket_floor numeric(14,2) check (bracket_floor is null or bracket_floor >= 0),
  bracket_base_tax numeric(14,2) check (bracket_base_tax is null or bracket_base_tax >= 0),
  valid_from date not null,
  note text,
  constraint budget_rate_snapshot_value_kind_shape check (
    (value_kind = 'oran'   and rate_percent is not null and amount_tl is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'tutar'  and amount_tl is not null and rate_percent is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'tarife' and rate_percent is not null and bracket_floor is not null and bracket_base_tax is not null and amount_tl is null)
  )
);
comment on table public.budget_rate_snapshot is
  'MUHUR-1: muhur aninda rate_catalog''un TAMAMININ kopyasi (pencere kirpma YOK, tablo kucuk). component_code join ile doldurulur - snapshot canli burden_components''a muhtac kalmaz.';

create index ix_budget_rate_snapshot_version on public.budget_rate_snapshot(version_id);

grant references, trigger, truncate, maintain on table public.budget_rate_snapshot to anon;
grant select, insert, references, trigger, truncate, maintain on table public.budget_rate_snapshot to authenticated;
grant all on table public.budget_rate_snapshot to service_role;

alter table public.budget_rate_snapshot enable row level security;

create policy sel_budget_rate_snapshot on public.budget_rate_snapshot for select to authenticated
  using (exists (
    select 1 from public.budget_versions v
    where v.id = budget_rate_snapshot.version_id and fn_is_budget_muhasebe(v.budget_id)
  ));
create policy ins_budget_rate_snapshot on public.budget_rate_snapshot for insert to authenticated
  with check (exists (
    select 1 from public.budget_versions v
    where v.id = budget_rate_snapshot.version_id and fn_is_budget_muhasebe(v.budget_id)
  ));

-- ============================================================
-- (E) fn_lock_budget
-- ============================================================
create or replace function public.fn_lock_budget(p_budget_id uuid, p_revision_note text default null)
returns int
language plpgsql
security definer
set search_path = public
as $lockfn$
declare
  v_uid        uuid := auth.uid();
  v_project    uuid;
  v_is_locked  boolean;
  v_version_no int;
  v_version_id uuid;
  v_owner      uuid;
  v_sgk_code   text;
  v_q1         boolean;
  v_q2         boolean;
  v_q3         boolean;
  v_calendar   boolean;
  v_payload    jsonb;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if not fn_is_budget_muhasebe(p_budget_id) then
    raise exception 'Butce bulunamadi veya muhurleme yetkisi yok';
  end if;

  select project_id, is_locked into v_project, v_is_locked
    from budgets where id = p_budget_id;

  if v_is_locked then
    raise exception 'Butce zaten muhurlu';
  end if;

  select coalesce(max(version_no), 0) + 1 into v_version_no
    from budget_versions where budget_id = p_budget_id;

  -- SGK senaryosu: kod (oran DEGIL, B20) + muhur aninin company_profile izi (B19 ruhu).
  v_sgk_code := public.fn_resolve_sgk_scenario(v_project);

  select p.created_by into v_owner from projects p where p.id = v_project;
  select cp.kultur_girisim_belgeli, cp.kultur_yatirim_belgeli, cp.sgk_borcu_yok
    into v_q1, v_q2, v_q3
    from company_profile cp where cp.user_id = v_owner;
  -- Atlama varsayimi (Engin karari 2026-07-11): profil hic acilmadiysa Q1=Hayir Q2=Hayir Q3=Evet.
  v_q1 := coalesce(v_q1, false);
  v_q2 := coalesce(v_q2, false);
  v_q3 := coalesce(v_q3, true);

  -- Takvim varsayimi: rezerve "Donemsiz" etabi HARIC tarihsiz etap var mi (Ocak-varsayimi devrede mi).
  select exists (
    select 1 from budget_stages
     where budget_id = p_budget_id
       and is_undated = true
       and name <> 'Donemsiz'
  ) into v_calendar;

  -- Payload: butceye bagli TUM kalici satirlarin tam-sadakatli kopyasi (B18: hesaplanan deger YOK).
  select jsonb_build_object(
    'budget',        (select to_jsonb(b) from budgets b where b.id = p_budget_id),
    'stages',        (select coalesce(jsonb_agg(to_jsonb(s)),  '[]'::jsonb) from budget_stages s where s.budget_id = p_budget_id),
    'groups',        (select coalesce(jsonb_agg(to_jsonb(g)),  '[]'::jsonb) from expense_groups g where g.budget_id = p_budget_id),
    'cost_objects',  (select coalesce(jsonb_agg(to_jsonb(co)), '[]'::jsonb) from budget_cost_objects co where co.budget_id = p_budget_id),
    'items',         (select coalesce(jsonb_agg(to_jsonb(i)),  '[]'::jsonb) from budget_items i where i.budget_id = p_budget_id),
    'item_periods',  (select coalesce(jsonb_agg(to_jsonb(ip)), '[]'::jsonb) from budget_item_periods ip where ip.budget_id = p_budget_id),
    'item_burdens',  (select coalesce(jsonb_agg(to_jsonb(ib)), '[]'::jsonb) from item_burdens ib where ib.budget_id = p_budget_id),
    'percent_lines', (select coalesce(jsonb_agg(to_jsonb(pl)), '[]'::jsonb) from budget_percent_lines pl where pl.budget_id = p_budget_id)
  ) into v_payload;

  insert into budget_versions (
    budget_id, version_no, sealed_by, revision_note,
    sgk_component_code, sgk_q1, sgk_q2, sgk_q3, calendar_assumption, payload
  ) values (
    p_budget_id, v_version_no, v_uid, p_revision_note,
    v_sgk_code, v_q1, v_q2, v_q3, v_calendar, v_payload
  ) returning id into v_version_id;

  -- rate_catalog TAMAMI kopyalanir (pencere kirpma YOK - tablo kucuk, kirpma hata sinifi sifirlanir).
  insert into budget_rate_snapshot (
    version_id, component_id, component_code, value_kind,
    rate_percent, amount_tl, bracket_floor, bracket_base_tax, valid_from, note
  )
  select v_version_id, rc.component_id, bc.code, rc.value_kind,
         rc.rate_percent, rc.amount_tl, rc.bracket_floor, rc.bracket_base_tax, rc.valid_from, rc.note
    from rate_catalog rc
    join burden_components bc on bc.id = rc.component_id;

  update budgets set is_locked = true where id = p_budget_id;

  return v_version_no;
end;
$lockfn$;

revoke execute on function public.fn_lock_budget(uuid, text) from public;
revoke execute on function public.fn_lock_budget(uuid, text) from anon;
grant  execute on function public.fn_lock_budget(uuid, text) to authenticated;

-- ============================================================
-- (F) fn_unlock_budget ("revizyon baslat")
--     B19 izi: budgets uzerindeki mevcut trg_log_budgets (after update) zaten
--     is_locked degisimini eski/yeni tam-satir olarak budget_change_log'a yazar
--     (fn_log_budget_change, 20260613115009). Yeni mekanizma ICAT EDILMEDI.
-- ============================================================
create or replace function public.fn_unlock_budget(p_budget_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $unlockfn$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if not fn_is_budget_muhasebe(p_budget_id) then
    raise exception 'Butce bulunamadi veya yetki yok';
  end if;

  update budgets set is_locked = false where id = p_budget_id;
end;
$unlockfn$;

revoke execute on function public.fn_unlock_budget(uuid) from public;
revoke execute on function public.fn_unlock_budget(uuid) from anon;
grant  execute on function public.fn_unlock_budget(uuid) to authenticated;

-- ============================================================
-- (G) Kilit guard'i: tek ortak fonksiyon + tablo basina BEFORE trigger.
--     RLS politikasi COGALTILMADI (tek guard, cift bakim yuku olmasin).
--     budgets satirinin kendisi guard DISINDA (is_locked'i yalniz fn_lock_budget/
--     fn_unlock_budget degistirir). Kapsam: payload'daki TUM mutasyona-acik yedi
--     tablo - stages/items/item_periods/item_burdens/percent_lines/groups/cost_objects
--     (mimari inceleme groups+cost_objects'in RLS'te is_locked kontrolu OLMADIGINI
--     buldu - update/delete tam acikti, yalniz fn_is_budget_muhasebe kontrolu vardi;
--     spec revize 2026-07-11).
-- ============================================================
create or replace function public.fn_guard_budget_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $guardfn$
declare
  v_budget_id uuid := coalesce(new.budget_id, old.budget_id);
  v_is_locked boolean;
begin
  select is_locked into v_is_locked from budgets where id = v_budget_id;
  if coalesce(v_is_locked, false) then
    raise exception 'Butce muhurlu, duzenlenemez (revizyon icin once muhru ac - fn_unlock_budget)';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$guardfn$;

drop trigger if exists trg_guard_lock_stages on public.budget_stages;
create trigger trg_guard_lock_stages before insert or update or delete on public.budget_stages
  for each row execute function public.fn_guard_budget_lock();

drop trigger if exists trg_guard_lock_items on public.budget_items;
create trigger trg_guard_lock_items before insert or update or delete on public.budget_items
  for each row execute function public.fn_guard_budget_lock();

drop trigger if exists trg_guard_lock_item_periods on public.budget_item_periods;
create trigger trg_guard_lock_item_periods before insert or update or delete on public.budget_item_periods
  for each row execute function public.fn_guard_budget_lock();

drop trigger if exists trg_guard_lock_item_burdens on public.item_burdens;
create trigger trg_guard_lock_item_burdens before insert or update or delete on public.item_burdens
  for each row execute function public.fn_guard_budget_lock();

drop trigger if exists trg_guard_lock_percent_lines on public.budget_percent_lines;
create trigger trg_guard_lock_percent_lines before insert or update or delete on public.budget_percent_lines
  for each row execute function public.fn_guard_budget_lock();

drop trigger if exists trg_guard_lock_groups on public.expense_groups;
create trigger trg_guard_lock_groups before insert or update or delete on public.expense_groups
  for each row execute function public.fn_guard_budget_lock();

drop trigger if exists trg_guard_lock_cost_objects on public.budget_cost_objects;
create trigger trg_guard_lock_cost_objects before insert or update or delete on public.budget_cost_objects
  for each row execute function public.fn_guard_budget_lock();

-- ============================================================
-- (H) fn_trg_refill_on_company_profile_change: is_locked filtresi eklendi.
--     20260710120000_dilim_sirket_profili.sql'deki NOT yorumunun isaretledigi yer
--     ("o kolon eklendiginde buraya 'and not b.is_locked' eklenmesi gerekir").
--     Yama YASAK ilkesi: govde YAMANMADI, TAMAMI yeniden tanimlandi.
-- ============================================================
create or replace function public.fn_trg_refill_on_company_profile_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select bi.id
    from budget_items bi
    join budgets b on b.id = bi.budget_id
    join projects p on p.id = b.project_id
    where p.created_by = new.user_id
      and bi.payment_status = 'bordro'
      and not b.is_locked
  loop
    perform public.fn_refill_item_burdens(r.id);
  end loop;
  return new;
end;
$$;
