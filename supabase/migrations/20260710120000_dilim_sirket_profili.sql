-- KAAPA SIRKET PROFILI DILIMI (2026-07-10)
-- Kullaniciya 1:1 sirket profili + SGK senaryo turetme kapisi + company_name tek kaynak.
-- Sema -> RLS -> trigger -> fn_resolve_sgk_scenario -> fn_create_project -> goc -> kolon DROP.

-- ============ 1) TABLO ============
create table public.company_profile (
  user_id uuid primary key references auth.users(id),
  company_name text not null,
  legal_type text check (legal_type in ('sahis','adi_ortaklik','kollektif','komandit','ltd','anonim','kooperatif','diger')),
  kultur_girisim_belgeli boolean not null default false,
  kultur_yatirim_belgeli boolean not null default false,
  sgk_borcu_yok boolean not null default true,
  updated_at timestamptz default now(),
  updated_by uuid
);
comment on table public.company_profile is
  'Kullaniciya 1:1 sirket profili (Sirket Tanimi adimi/ekrani). legal_type NULL = henuz secilmedi, diger''e ZORLAMA.';
comment on column public.company_profile.sgk_borcu_yok is
  'Atlama varsayimiyla uyumlu: Q1=Hayir Q2=Hayir Q3=Evet -> false/false/true.';

-- ============ 2) GRANT (yeni tablo = GRANT + RLS, ikisi de gerekir) ============
grant references, trigger, truncate, maintain on table public.company_profile to anon;
grant select, insert, update, references, trigger, truncate, maintain on table public.company_profile to authenticated;
grant all on table public.company_profile to service_role;

-- ============ 3) RLS ============
alter table public.company_profile enable row level security;

-- SELECT: kendi profili VEYA sahibin herhangi bir projesinde aktif uye.
create policy company_profile_select on public.company_profile for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.projects p
    join public.profiles pr on pr.project_id = p.id
    where p.created_by = company_profile.user_id
      and pr.user_id = auth.uid()
      and pr.membership_status = 'active'
  )
);

-- INSERT: yalniz kendi satirini acabilir (davetli muhasebe kendi bos profilini ACAMAZ).
create policy company_profile_insert on public.company_profile for insert with check (
  user_id = auth.uid()
);

-- UPDATE: kendi profili VEYA sahibin herhangi bir projesinde aktif muhasebe uyesi
-- (davetli muhasebe Tanimlar'dan kaydederken SAHIBIN satirini gunceller).
create policy company_profile_update on public.company_profile for update using (
  user_id = auth.uid()
  or exists (
    select 1 from public.projects p
    where p.created_by = company_profile.user_id
      and public.fn_is_project_muhasebe(p.id)
  )
);

-- ============ 4) GOC: her projects.created_by icin EN SON projesinin company_name'i ============
insert into public.company_profile (user_id, company_name, updated_at)
select distinct on (p.created_by)
  p.created_by,
  coalesce(nullif(btrim(cs.company_name), ''), p.name),
  now()
from public.projects p
join auth.users au on au.id = p.created_by
left join public.company_settings cs on cs.project_id = p.id
where p.created_by is not null
order by p.created_by, p.created_at desc
on conflict (user_id) do nothing;

-- ============ 5) fn_resolve_sgk_scenario: 3 olgu + kapi kurali -> component code ============
-- Oran ICERMEZ (B20): yalniz burden_components.code doner, oran rate_catalog'dan okunur.
create or replace function public.fn_resolve_sgk_scenario(p_project_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_owner   uuid;
  v_girisim boolean;
  v_yatirim boolean;
  v_borcsuz boolean;
begin
  select created_by into v_owner from projects where id = p_project_id;
  if v_owner is null then
    return 'sgk_isveren';
  end if;

  select kultur_girisim_belgeli, kultur_yatirim_belgeli, sgk_borcu_yok
    into v_girisim, v_yatirim, v_borcsuz
    from company_profile where user_id = v_owner;

  if not found then
    return 'sgk_isveren';
  end if;

  -- KAPI KURALI: borc yapilandirilmamissa belgeler devre disi.
  if not v_borcsuz then
    return 'sgk_isveren_borclu';
  end if;

  if v_yatirim then
    return 'sgk_isveren_kultur_yatirim';
  end if;

  if v_girisim then
    return 'sgk_isveren_kultur_girisim';
  end if;

  return 'sgk_isveren';
end;
$$;

revoke execute on function public.fn_resolve_sgk_scenario(uuid) from public;
revoke execute on function public.fn_resolve_sgk_scenario(uuid) from anon;
grant execute on function public.fn_resolve_sgk_scenario(uuid) to authenticated;

-- ============ 6) Profil degisince yeniden dolum (mevcut fn_refill_item_burdens'i cagirir) ============
-- YAPILDI (MUHUR-1, 2026-07-11): budgets.is_locked eklendi, fonksiyon "and not b.is_locked"
-- filtresiyle 20260711140000_muhur1_fn_lock_budget.sql'de TAMAMI yeniden tanimlandi (yama yasak).
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
  loop
    perform public.fn_refill_item_burdens(r.id);
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_refill_on_company_profile_change on public.company_profile;
create trigger trg_refill_on_company_profile_change
  after update of kultur_girisim_belgeli, kultur_yatirim_belgeli, sgk_borcu_yok
  on public.company_profile
  for each row
  when (
    new.kultur_girisim_belgeli is distinct from old.kultur_girisim_belgeli
    or new.kultur_yatirim_belgeli is distinct from old.kultur_yatirim_belgeli
    or new.sgk_borcu_yok is distinct from old.sgk_borcu_yok
  )
  execute function public.fn_trg_refill_on_company_profile_change();

-- ============ 7) fn_create_project GUNCELLE (imza ayni; company_profile'a bagli) ============
create or replace function public.fn_create_project(
  p_name         text,
  p_company_name text,
  p_first_name   text,
  p_last_name    text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $createfn$
declare
  v_uid           uuid := auth.uid();
  v_can           boolean;
  v_project       uuid;
  v_existing_name text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  select coalesce((u.raw_app_meta_data ->> 'can_create_projects')::boolean, false)
    into v_can
    from auth.users u
   where u.id = v_uid;

  if not coalesce(v_can, false) then
    raise exception 'Proje acma yetkisi yok';
  end if;

  if btrim(coalesce(p_name, '')) = ''
     or btrim(coalesce(p_company_name, '')) = ''
     or btrim(coalesce(p_first_name, '')) = ''
     or btrim(coalesce(p_last_name, '')) = '' then
    raise exception 'Eksik alan';
  end if;

  insert into projects (name, created_by)
  values (btrim(p_name), v_uid)
  returning id into v_project;

  insert into company_settings (project_id, project_name, updated_by)
  values (v_project, btrim(p_name), v_uid);

  select company_name into v_existing_name from company_profile where user_id = v_uid;
  if not found then
    insert into company_profile (user_id, company_name, updated_by)
    values (v_uid, btrim(p_company_name), v_uid);
  elsif v_existing_name is distinct from btrim(p_company_name) then
    update company_profile
       set company_name = btrim(p_company_name), updated_at = now(), updated_by = v_uid
     where user_id = v_uid;
  end if;

  insert into profiles (user_id, project_id, role, first_name, last_name)
  values (v_uid, v_project, 'muhasebe', btrim(p_first_name), btrim(p_last_name));

  return v_project;
end;
$createfn$;

revoke execute on function public.fn_create_project(text, text, text, text) from public;
revoke execute on function public.fn_create_project(text, text, text, text) from anon;
grant  execute on function public.fn_create_project(text, text, text, text) to authenticated;

-- ============ 8) company_settings.company_name: tek kaynak artik company_profile ============
alter table public.company_settings drop column company_name;
