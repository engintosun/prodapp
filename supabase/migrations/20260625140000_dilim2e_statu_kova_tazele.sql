-- KAAPA DILIM-2e: statu->kova tek motor
-- fn_refill_item_burdens (tek kalem, statüye göre kova sıfırla+doldur+KDV set)
-- + after-update trigger (payment_status degisince otomatik tazele)
-- + fn_open_budget refactor (inline loop -> fn_refill cagris)
-- + backfill (mevcut kirli kovalar temizlendi)

-- (1) fn_refill_item_burdens
create or replace function public.fn_refill_item_burdens(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_budget_id  uuid;
  v_status     text;
  v_comp       uuid;
  v_rate       numeric(7,4);
  v_vat        numeric(7,4);
begin
  select budget_id, payment_status
    into v_budget_id, v_status
    from budget_items where id = p_item_id;
  if not found then return; end if;

  delete from item_burdens where item_id = p_item_id;

  for v_comp in
    select component_id from payment_status_burdens where payment_status = v_status
  loop
    select rate_percent into v_rate from rate_catalog
     where component_id = v_comp and valid_from <= current_date
     order by valid_from desc limit 1;
    if v_rate is not null then
      insert into item_burdens (budget_id, item_id, component_id, rate_percent)
      values (v_budget_id, p_item_id, v_comp, v_rate);
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

-- (2) fn_open_budget: inline loop -> fn_refill cagris (baska hicbir yer degismez)
create or replace function public.fn_open_budget(
  p_project    uuid,
  p_template   uuid,
  p_scope      text default 'single',
  p_episode_no int  default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $openfn$
declare
  v_uid       uuid := auth.uid();
  v_body      jsonb;
  v_budget    uuid;
  v_today     date := current_date;
  v_stage     jsonb;
  v_card      jsonb;
  v_item      jsonb;
  v_pct       jsonb;
  v_dept      uuid;
  v_group     uuid;
  v_item_id   uuid;
  v_unit      uuid;
  v_item_unit uuid;
  v_status    text;
  v_comp      uuid;
  v_rate      numeric(7,4);
  v_item_code int;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if not fn_is_project_muhasebe(p_project) then
    raise exception 'Butce acma yetkisi yok';
  end if;

  select body into v_body from budget_templates
   where id = p_template and is_active
     and (kind = 'system' or owner_project_id = p_project);
  if v_body is null then
    raise exception 'Sablon bulunamadi veya bu projeye kapali';
  end if;

  if exists (select 1 from budgets where project_id = p_project
               and scope = p_scope and episode_no is not distinct from p_episode_no) then
    raise exception 'Bu kapsam icin butce zaten acik';
  end if;

  insert into budgets (project_id, scope, episode_no)
  values (p_project, p_scope, p_episode_no)
  returning id into v_budget;

  for v_stage in select * from jsonb_array_elements(coalesce(v_body->'stages', '[]'::jsonb))
  loop
    insert into budget_stages (budget_id, name, sort_order, is_undated)
    values (v_budget, v_stage->>'name',
            coalesce((v_stage->>'sort_order')::int, 0), false);
  end loop;
  insert into budget_stages (budget_id, name, sort_order, is_undated)
  values (v_budget, 'Donemsiz', 9999, true);

  for v_card in select * from jsonb_array_elements(coalesce(v_body->'cards', '[]'::jsonb))
  loop
    insert into departments (project_id, name, code)
    values (p_project, coalesce(v_card->>'name', v_card->>'department_code'),
            v_card->>'department_code')
    on conflict (project_id, code) do nothing;
    select id into v_dept from departments
     where project_id = p_project and code = v_card->>'department_code';

    select id into v_unit from units where code = v_card->>'default_unit';

    insert into expense_groups (budget_id, department_id, name, sort_order)
    values (v_budget, v_dept, v_card->>'name',
            coalesce((v_card->>'sort_order')::int, 0))
    returning id into v_group;

    for v_item in select * from jsonb_array_elements(coalesce(v_card->'items', '[]'::jsonb))
    loop
      v_item_unit := coalesce(
        (select id from units where code = v_item->>'unit'),
        v_unit
      );
      if v_item_unit is null then
        raise exception 'Birim bulunamadi: kart % kalem %',
          v_card->>'name', v_item->>'name';
      end if;

      update budgets set item_code_seq = item_code_seq + 1
       where id = v_budget returning item_code_seq into v_item_code;

      insert into budget_items
        (budget_id, group_id, item_code, name, detail, unit_net,
         unit_id, multiplier, payment_status, sort_order)
      values
        (v_budget, v_group, v_item_code, v_item->>'name', v_item->>'detail',
         0, v_item_unit, coalesce((v_item->>'multiplier')::numeric, 1),
         coalesce(v_item->>'payment_status', 'sirket'),
         coalesce((v_item->>'sort_order')::int, 0))
      returning id into v_item_id;

      -- 3e) Statu -> item_burdens + vat_rate: tek motor.
      perform public.fn_refill_item_burdens(v_item_id);
    end loop;
  end loop;

  if v_body ? 'percent_lines' and jsonb_array_length(v_body->'percent_lines') > 0 then
    for v_pct in select * from jsonb_array_elements(v_body->'percent_lines')
    loop
      insert into budget_percent_lines (budget_id, code, label, rate_percent, is_hidden, sort_order)
      values (v_budget, v_pct->>'code', v_pct->>'label',
              coalesce((v_pct->>'rate_percent')::numeric, 0),
              coalesce((v_pct->>'is_hidden')::boolean, false),
              coalesce((v_pct->>'sort_order')::int, 0));
    end loop;
  else
    insert into budget_percent_lines (budget_id, code, label, rate_percent, sort_order)
    values (v_budget, 'contingency', 'Ongorulemeyen', 10, 1),
           (v_budget, 'profit', 'Kar', 0, 2);
  end if;

  return v_budget;
end;
$openfn$;

revoke execute on function public.fn_open_budget(uuid, uuid, text, int) from public;
revoke execute on function public.fn_open_budget(uuid, uuid, text, int) from anon;
grant  execute on function public.fn_open_budget(uuid, uuid, text, int) to authenticated;

-- (3) Trigger: payment_status degisince otomatik tazele.
create or replace function public.fn_trg_refill_burdens()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.fn_refill_item_burdens(new.id);
  return new;
end;
$$;

drop trigger if exists trg_refill_on_status on public.budget_items;
create trigger trg_refill_on_status
  after update of payment_status on public.budget_items
  for each row
  when (new.payment_status is distinct from old.payment_status)
  execute function public.fn_trg_refill_burdens();

-- (4) Backfill: mevcut kirli kovalari bir kez temizle.
do $$ declare r record; begin
  for r in select id from public.budget_items loop
    perform public.fn_refill_item_burdens(r.id);
  end loop;
end $$;
