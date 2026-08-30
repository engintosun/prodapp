-- TD-36b: kullaniciya gorunen exception metinleri Turkce karakterli yazilir.
-- Dort fonksiyonun govdesi kaynak migration'lardaki canli tanimin BIREBIR
-- kopyasidir; yalnizca 13 raise exception metni degismistir. Dokuz metin
-- zaten dogruydu ve DEGISTIRILMEDI.

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
    raise exception 'Proje açma yetkisi yok';
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

create or replace function public.fn_archive_project(
  p_project_id uuid,
  p_reason     text
) returns void
language plpgsql
security definer
set search_path = public
as $archivefn$
declare
  v_uid    uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'Gerekçe zorunlu';
  end if;

  if not exists (
    select 1 from profiles p
     where p.project_id = p_project_id
       and p.user_id = v_uid
       and p.role = 'muhasebe'
       and p.membership_status = 'active'
  ) then
    raise exception 'Bu projede yetkiniz yok';
  end if;

  select status into v_status from projects where id = p_project_id;
  if not found then
    raise exception 'Proje bulunamadı';
  end if;

  if v_status <> 'active' then
    raise exception 'Proje zaten arşivde';
  end if;

  update projects set status = 'archived' where id = p_project_id;

  insert into project_lifecycle_log (project_id, action, reason, acted_by)
  values (p_project_id, 'archive', btrim(p_reason), v_uid);
end; $archivefn$;

create or replace function public.fn_restore_project(
  p_project_id uuid,
  p_reason     text
) returns void
language plpgsql
security definer
set search_path = public
as $restorefn$
declare
  v_uid    uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'Gerekçe zorunlu';
  end if;

  if not exists (
    select 1 from profiles p
     where p.project_id = p_project_id
       and p.user_id = v_uid
       and p.role = 'muhasebe'
       and p.membership_status = 'active'
  ) then
    raise exception 'Bu projede yetkiniz yok';
  end if;

  select status into v_status from projects where id = p_project_id;
  if not found then
    raise exception 'Proje bulunamadı';
  end if;

  if v_status <> 'archived' then
    raise exception 'Proje arşivde değil';
  end if;

  update projects set status = 'active' where id = p_project_id;

  insert into project_lifecycle_log (project_id, action, reason, acted_by)
  values (p_project_id, 'restore', btrim(p_reason), v_uid);
end; $restorefn$;

create or replace function public.fn_delete_project(
  p_project_id uuid,
  p_reason     text
) returns void
language plpgsql
security definer
set search_path = public
as $deletefn$
declare
  v_uid    uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'Gerekçe zorunlu';
  end if;

  if not exists (
    select 1 from profiles p
     where p.project_id = p_project_id
       and p.user_id = v_uid
       and p.role = 'muhasebe'
       and p.membership_status = 'active'
  ) then
    raise exception 'Bu projede yetkiniz yok';
  end if;

  select status into v_status from projects where id = p_project_id;
  if not found then
    raise exception 'Proje bulunamadı';
  end if;

  if v_status <> 'archived' then
    raise exception 'Yalnız arşivdeki proje silinebilir';
  end if;

  if exists (select 1 from receipts where project_id = p_project_id) then
    raise exception 'Projede fiş var, silinemez';
  end if;

  if exists (select 1 from advances where project_id = p_project_id) then
    raise exception 'Projede avans var, silinemez';
  end if;

  if exists (
    select 1 from budget_versions bv
      join budgets b on b.id = bv.budget_id
     where b.project_id = p_project_id
  ) then
    raise exception 'Projede mühürlü bütçe var, silinemez';
  end if;

  if exists (
    select 1 from profiles p
     where p.project_id = p_project_id
       and p.membership_status = 'active'
       and p.user_id <> v_uid
  ) then
    raise exception 'Projede başka üye var, silinemez';
  end if;

  -- Zincir yapraktan koke: eksik birakilan tablo FK tarafindan reddedilir (RESTRICT/NO ACTION),
  -- islem tek transaction icinde oldugu icin butun zincir ya tam biter ya da hic uygulanmaz.

  -- fis/avans denetim defterleri (gecikmeler icin bos olmak zorunda, yine de zincire girer)
  delete from approval_log where receipt_id in (select id from receipts where project_id = p_project_id);
  delete from advance_log where advance_id in (select id from advances where project_id = p_project_id);
  delete from receipts where project_id = p_project_id;

  -- butce alti (yapraktan koke)
  delete from direct_payments where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_item_periods where budget_id in (select id from budgets where project_id = p_project_id);
  delete from item_burdens where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_items where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_cost_objects where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_percent_lines where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_stages where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_versions where budget_id in (select id from budgets where project_id = p_project_id);
  delete from expense_groups where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budgets where project_id = p_project_id;

  -- sablon (proje sahipli)
  delete from budget_templates where owner_project_id = p_project_id;

  -- departman alti
  delete from dept_subcategories where dept_id in (select id from departments where project_id = p_project_id);
  delete from dept_budgets where dept_id in (select id from departments where project_id = p_project_id);
  delete from invitations where project_id = p_project_id;
  delete from project_dept_budgets where project_id = p_project_id;
  delete from departments where project_id = p_project_id;

  -- donem alti
  delete from advances where project_id = p_project_id;
  delete from exception_permits where project_id = p_project_id;
  delete from period_budgets where period_id in (select id from periods where project_id = p_project_id);
  delete from period_closings where period_id in (select id from periods where project_id = p_project_id);
  delete from periods where project_id = p_project_id;

  -- sohbet alti
  delete from chat_participants where chat_id in (select id from chats where project_id = p_project_id);
  delete from messages where chat_id in (select id from chats where project_id = p_project_id);
  delete from chats where project_id = p_project_id;

  -- proje-duzeyi kalan
  delete from company_settings where project_id = p_project_id;
  delete from expense_categories where project_id = p_project_id;
  delete from project_budgets where project_id = p_project_id;
  delete from project_rules where project_id = p_project_id;
  delete from notifications where project_id = p_project_id;
  delete from project_lifecycle_log where project_id = p_project_id;
  delete from profiles where project_id = p_project_id;

  -- en son
  delete from projects where id = p_project_id;
end; $deletefn$;

-- SAGLAMA: imza kaymasinda Postgres eskiyi degistirmez, YANINA ikinci bir
-- fonksiyon koyar ve sessizce basarili olur (sandbox turunda uretildi,
-- 30 Agustos 2026). Bu blok o durumu migration'in kendi icinde hataya cevirir.
do $check$
declare r record;
begin
  for r in
    select unnest(array['fn_create_project','fn_archive_project','fn_restore_project','fn_delete_project']) as fname
  loop
    if (select count(*) from pg_proc where proname = r.fname) <> 1 then
      raise exception 'TD-36b saglama: % sayisi % (1 olmali) — imza kaymis',
        r.fname, (select count(*) from pg_proc where proname = r.fname);
    end if;
  end loop;
end $check$;
