-- Proje yasam dongusu: kalici silme.
-- Karar: SK-AUTH-12 (docs/AUTH-KARARLARI.md). Yalniz ARSIVDEKI ve BOS proje silinebilir.
-- fn_archive_project ile ayni kalip: SECURITY DEFINER, tek fonksiyon tek giris kapisi.

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
    raise exception 'Gerekce zorunlu';
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
    raise exception 'Proje bulunamadi';
  end if;

  if v_status <> 'archived' then
    raise exception 'Yalniz arsivdeki proje silinebilir';
  end if;

  if exists (select 1 from receipts where project_id = p_project_id) then
    raise exception 'Projede fis var, silinemez';
  end if;

  if exists (select 1 from advances where project_id = p_project_id) then
    raise exception 'Projede avans var, silinemez';
  end if;

  if exists (
    select 1 from budget_versions bv
      join budgets b on b.id = bv.budget_id
     where b.project_id = p_project_id
  ) then
    raise exception 'Projede muhurlu butce var, silinemez';
  end if;

  if exists (
    select 1 from profiles p
     where p.project_id = p_project_id
       and p.membership_status = 'active'
       and p.user_id <> v_uid
  ) then
    raise exception 'Projede baska uye var, silinemez';
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

revoke execute on function public.fn_delete_project(uuid, text) from public;
revoke execute on function public.fn_delete_project(uuid, text) from anon;
grant  execute on function public.fn_delete_project(uuid, text) to authenticated;
