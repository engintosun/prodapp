-- KAAPA DILIM-3a: iskelet dunyasi. Sema + davranis; SAYI YOK (degerler 3b seed).
-- item_burdens rate nullable + rate_catalog satir turleri + payroll_profile katmani
-- + fn_refill genisleme (oransiz iskelet + F3 stopaj override okumasi) + F8 profil tetigi.
-- Davranis mevcut smm/kira/telif icin AYNEN; bordro hala bos (motor 3c).

-- 1) item_burdens: iskelet satiri icin rate_percent nullable (K4)
alter table public.item_burdens
  alter column rate_percent drop not null;

-- 2) rate_catalog: TEK ev, satir turleri (K5)
alter table public.rate_catalog
  add column value_kind text not null default 'oran'
    check (value_kind in ('oran','tutar','tarife')),
  add column amount_tl numeric(14,2)
    check (amount_tl is null or amount_tl >= 0),
  add column bracket_floor numeric(14,2)
    check (bracket_floor is null or bracket_floor >= 0),
  add column bracket_base_tax numeric(14,2)
    check (bracket_base_tax is null or bracket_base_tax >= 0);
alter table public.rate_catalog
  alter column rate_percent drop not null;
alter table public.rate_catalog
  add constraint rate_catalog_value_kind_shape check (
    (value_kind = 'oran'   and rate_percent is not null and amount_tl is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'tutar'  and amount_tl is not null and rate_percent is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'tarife' and rate_percent is not null and bracket_floor is not null and bracket_base_tax is not null and amount_tl is null)
  );
alter table public.rate_catalog
  drop constraint rate_catalog_component_id_valid_from_key;
alter table public.rate_catalog
  add constraint rate_catalog_component_from_floor_key
    unique nulls not distinct (component_id, valid_from, bracket_floor);

-- 3) burden_components: doldurma kipi (K3)
alter table public.burden_components
  add column fill_mode text not null default 'rate'
    check (fill_mode in ('rate','skeleton'));

-- 4) payroll_profile katmani (K5/B; payment_status'a DOKUNMAZ)
create table public.payroll_profiles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.payroll_profiles enable row level security;

create table public.payroll_profile_burdens (
  id uuid primary key default gen_random_uuid(),
  profile_code text not null references public.payroll_profiles(code),
  component_id uuid not null references public.burden_components(id),
  action text not null check (action in ('add','remove')),
  created_at timestamptz not null default now(),
  unique (profile_code, component_id, action)
);
alter table public.payroll_profile_burdens enable row level security;

insert into public.payroll_profiles (code, label) values
  ('standart','Standart') on conflict (code) do nothing;

alter table public.budget_items
  add column payroll_profile text not null default 'standart'
    references public.payroll_profiles(code);

create policy sel_payroll_profiles
  on public.payroll_profiles for select to authenticated using (true);
grant references, trigger, truncate, maintain on table public.payroll_profiles to anon;
grant select, references, trigger, truncate, maintain on table public.payroll_profiles to authenticated;
grant all on table public.payroll_profiles to service_role;

create policy sel_payroll_profile_burdens
  on public.payroll_profile_burdens for select to authenticated using (true);
grant references, trigger, truncate, maintain on table public.payroll_profile_burdens to anon;
grant select, references, trigger, truncate, maintain on table public.payroll_profile_burdens to authenticated;
grant all on table public.payroll_profile_burdens to service_role;

-- 5) fn_refill_item_burdens GENISLEME (F2 iskelet + F3 stopaj override okumasi)
create or replace function public.fn_refill_item_burdens(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_budget_id uuid;
  v_status    text;
  v_profile   text;
  v_stopaj    numeric(7,4);
  v_comp      uuid;
  v_code      text;
  v_mode      text;
  v_rate      numeric(7,4);
  v_vat       numeric(7,4);
begin
  select budget_id, payment_status, payroll_profile, stopaj_rate
    into v_budget_id, v_status, v_profile, v_stopaj
    from budget_items where id = p_item_id;
  if not found then return; end if;

  delete from item_burdens where item_id = p_item_id;

  for v_comp in
    with base as (
      select component_id from payment_status_burdens where payment_status = v_status
      union
      select component_id from payroll_profile_burdens
        where profile_code = v_profile and action = 'add'
    ),
    removed as (
      select component_id from payroll_profile_burdens
        where profile_code = v_profile and action = 'remove'
    )
    select component_id from base
    except
    select component_id from removed
  loop
    v_rate := null;
    select code, fill_mode into v_code, v_mode
      from burden_components where id = v_comp;

    if v_mode = 'skeleton' then
      insert into item_burdens (budget_id, item_id, component_id, rate_percent)
      values (v_budget_id, p_item_id, v_comp, null);
    else
      select rate_percent into v_rate from rate_catalog
       where component_id = v_comp and value_kind = 'oran' and valid_from <= current_date
       order by valid_from desc limit 1;
      if v_code in ('stopaj','stopaj_telif') and v_stopaj is not null then
        v_rate := v_stopaj;
      end if;
      if v_rate is not null then
        insert into item_burdens (budget_id, item_id, component_id, rate_percent)
        values (v_budget_id, p_item_id, v_comp, v_rate);
      end if;
    end if;
  end loop;

  select default_vat_rate into v_vat
    from payment_status_defaults where payment_status = v_status
   order by valid_from desc limit 1;
  update budget_items set vat_rate = coalesce(v_vat, 0) where id = p_item_id;
end;
$$;
revoke execute on function public.fn_refill_item_burdens(uuid) from public;
revoke execute on function public.fn_refill_item_burdens(uuid) from anon;
grant execute on function public.fn_refill_item_burdens(uuid) to authenticated;

-- 6) F8: statu + profil degisince otomatik tazele (stopaj_rate tetigi 3d'ye ait)
drop trigger if exists trg_refill_on_status on public.budget_items;
create trigger trg_refill_on_status
  after update of payment_status, payroll_profile on public.budget_items
  for each row
  when (
    new.payment_status is distinct from old.payment_status
    or new.payroll_profile is distinct from old.payroll_profile
  )
  execute function public.fn_trg_refill_burdens();

-- 7) Backfill: mevcut kalemleri yeni motorla bir kez tazele (davranis bit-ayni)
do $$ declare r record; begin
  for r in select id from public.budget_items loop
    perform public.fn_refill_item_burdens(r.id);
  end loop;
end $$;
