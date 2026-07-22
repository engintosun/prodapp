-- D2: tek-kalem ekleme (BUTCE-SEMA-KARARLARI L + M/D2-a..f)
-- Icerik: expense_groups.card_code (kart kimligi yapisal, D2-a) + misc_code_seq (serbest sayac, D2-b)
--         backfill: mevcut tum kartlar 1500 (tek sablon donemi) + guard
--         sablon body card'ina acik card_code (turetme sihri yok, D1-b ilkesi)
--         fn_open_budget: card_code okuma + expense_groups INSERT genislemesi
--         fn_add_budget_item: kutuphane/serbest iki mod, x698 alt-kod, kod-sirali renumber
-- Muhur/kilit kontrolu fonksiyonda TEKRARLANMAZ: trg_guard_lock_items/groups tek bekci (D2-f, MUHUR-1 teyitli).
-- payment_status gecerliligi budget_items CHECK kisitina emanet (20260624120000), fonksiyonda liste kopyasi yok.

alter table public.expense_groups
  add column card_code text,
  add column misc_code_seq integer not null default 0 check (misc_code_seq >= 0);

comment on column public.expense_groups.card_code is 'D2-a: kartin kod araligi kimligi (orn. 1500). Aidiyet = kod doktrini (K-B) yapisal karsiligi; muhtelif prefixi buradan turetilir. Sablon body card_code alanindan gelir.';
comment on column public.expense_groups.misc_code_seq is 'D2-b: serbest kalem x698 alt-kod sayaci. MONOTON, silinen kod geri verilmez (K-F: muhur eslesmesi kod uzerinden). budgets.item_code_seq deseni, kart bazli.';

do $d2a$
begin
  if exists (select 1 from public.budget_items where catalog_code not like '15%') then
    raise exception 'D2 backfill: 1500 araligi disinda catalog_code tasiyan kalem var — tek-kart varsayimi bozulmus, elle inceleme gerekli';
  end if;
end $d2a$;

update public.expense_groups set card_code = '1500';

do $d2b$
begin
  if exists (select 1 from public.expense_groups where card_code is null) then
    raise exception 'D2 backfill: kodsuz kart kaldi';
  end if;
end $d2b$;

alter table public.expense_groups alter column card_code set not null;

update public.budget_templates t
   set body = jsonb_set(
     t.body,
     '{cards}',
     (select jsonb_agg(
        c.card || jsonb_build_object('card_code',
          case c.card->>'ref'
            when 'c1500' then '1500'
          end)
        order by c.ord)
      from jsonb_array_elements(t.body->'cards') with ordinality as c(card, ord))
   )
 where t.body ? 'cards';

do $d2c$
begin
  if exists (
    select 1
      from public.budget_templates t,
           jsonb_array_elements(t.body->'cards') as c(card)
     where (c.card->>'card_code') is null
  ) then
    raise exception 'D2 sablon: card_code atanamayan kart var (bilinmeyen ref) — DUR ve raporla';
  end if;
end $d2c$;

-- fn_open_budget: taban 20260723120000 (D1) surumudur. Delta yalniz uc nokta:
--   declare bloguna v_card_code
--   kart dongusunde card_code okuma + exception
--   expense_groups INSERT kolon listesi + values genislemesi
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
  v_uid          uuid := auth.uid();
  v_body         jsonb;
  v_budget       uuid;
  v_today        date := current_date;
  v_stage        jsonb;
  v_card         jsonb;
  v_item         jsonb;
  v_pct          jsonb;
  v_dept         uuid;
  v_group        uuid;
  v_item_id      uuid;
  v_unit         uuid;
  v_item_unit    uuid;
  v_status       text;
  v_comp         uuid;
  v_rate         numeric(7,4);
  v_item_code    int;
  v_catalog_code text;
  v_library_id   uuid;
  v_card_code    text;
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

    v_card_code := v_card->>'card_code';
    if v_card_code is null then
      raise exception 'Sablon kartinda card_code eksik: %', v_card->>'name';
    end if;

    insert into expense_groups (budget_id, department_id, name, sort_order, card_code)
    values (v_budget, v_dept, v_card->>'name',
            coalesce((v_card->>'sort_order')::int, 0), v_card_code)
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

      v_catalog_code := v_item->>'catalog_code';
      if v_catalog_code is null then
        raise exception 'Sablon kaleminde catalog_code eksik: kart % kalem %',
          v_card->>'name', v_item->>'name';
      end if;
      select id into v_library_id from item_library where catalog_code = v_catalog_code;
      if v_library_id is null then
        raise exception 'Katalog kodu kutuphanede yok: %', v_catalog_code;
      end if;

      update budgets set item_code_seq = item_code_seq + 1
       where id = v_budget returning item_code_seq into v_item_code;

      insert into budget_items
        (budget_id, group_id, item_code, name, description_en, unit_net,
         unit_id, multiplier, payment_status, sort_order,
         catalog_code, library_item_id)
      values
        (v_budget, v_group, v_item_code, v_item->>'name', v_item->>'detail',
         0, v_item_unit, coalesce((v_item->>'multiplier')::numeric, 1),
         coalesce(v_item->>'payment_status', 'sirket'),
         coalesce((v_item->>'sort_order')::int, 0),
         v_catalog_code, v_library_id)
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

-- fn_add_budget_item (D2-d): tek kapi, iki mod.
--   Kutuphane modu: p_catalog_code dolu; isim/statu/birim kutuphaneden, digerleri verilirse exception (sessiz ezme yok).
--   Serbest mod: p_catalog_code NULL; isim+statu+birim zorunlu; kod muhtelif kuyrugundan (x698, monoton).
create or replace function public.fn_add_budget_item(
  p_group_id       uuid,
  p_catalog_code   text default null,
  p_name           text default null,
  p_payment_status text default null,
  p_unit_code      text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $addfn$
declare
  v_uid          uuid := auth.uid();
  v_budget       uuid;
  v_project      uuid;
  v_card_code    text;
  v_lib          item_library%rowtype;
  v_name         text;
  v_status       text;
  v_unit_code    text;
  v_desc_en      text;
  v_library_id   uuid;
  v_code         text;
  v_seq          int;
  v_unit         uuid;
  v_item_code    int;
  v_item_id      uuid;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  select eg.budget_id, eg.card_code into v_budget, v_card_code
    from expense_groups eg where eg.id = p_group_id;
  if v_budget is null then
    raise exception 'Kart bulunamadi';
  end if;
  if v_card_code is null then
    raise exception 'Kart kodu tanimsiz';
  end if;

  select b.project_id into v_project from budgets b where b.id = v_budget;
  if not fn_is_project_muhasebe(v_project) then
    raise exception 'Kalem ekleme yetkisi yok';
  end if;

  if p_catalog_code is not null then
    -- kutuphane modu
    if p_name is not null or p_payment_status is not null or p_unit_code is not null then
      raise exception 'Kutuphane modunda isim/statu/birim parametresi verilmez (varsayilan kutuphaneden gelir)';
    end if;
    select * into v_lib from item_library where catalog_code = p_catalog_code;
    if v_lib.id is null then
      raise exception 'Katalog kodu kutuphanede yok: %', p_catalog_code;
    end if;
    if substr(p_catalog_code, 1, 2) <> substr(v_card_code, 1, 2) then
      raise exception 'Katalog kodu bu kartin araligindan degil: % (kart %)', p_catalog_code, v_card_code;
    end if;
    v_name       := v_lib.name;
    v_status     := v_lib.default_payment_status;
    v_unit_code  := v_lib.default_unit_code;
    v_desc_en    := v_lib.description_en;
    v_library_id := v_lib.id;
    v_code       := p_catalog_code;
  else
    -- serbest mod
    if p_name is null or p_payment_status is null or p_unit_code is null then
      raise exception 'Serbest kalemde isim, statu ve birim zorunlu';
    end if;
    update expense_groups set misc_code_seq = misc_code_seq + 1
     where id = p_group_id returning misc_code_seq into v_seq;
    v_code       := substr(v_card_code, 1, 2) || '98-' || lpad(v_seq::text, 2, '0');
    v_name       := p_name;
    v_status     := p_payment_status;
    v_unit_code  := p_unit_code;
    v_desc_en    := null;
    v_library_id := null;
  end if;

  select id into v_unit from units where code = v_unit_code;
  if v_unit is null then
    raise exception 'Birim bulunamadi: %', v_unit_code;
  end if;

  update budgets set item_code_seq = item_code_seq + 1
   where id = v_budget returning item_code_seq into v_item_code;

  insert into budget_items
    (budget_id, group_id, item_code, name, description_en, unit_net,
     unit_id, multiplier, payment_status, sort_order,
     catalog_code, library_item_id)
  values
    (v_budget, p_group_id, v_item_code, v_name, v_desc_en,
     0, v_unit, 1, v_status, 0,
     v_code, v_library_id)
  returning id into v_item_id;

  perform public.fn_refill_item_burdens(v_item_id);

  -- D2-e: kartin tum satirlari kod-sirasina yeniden numaralanir (es kodda item_code ayristirir, K-D bitisiklik).
  update budget_items bi
     set sort_order = t.rn
    from (select id, row_number() over (order by catalog_code, item_code) as rn
            from budget_items where group_id = p_group_id) t
   where t.id = bi.id
     and bi.sort_order is distinct from t.rn;

  return v_item_id;
end;
$addfn$;

revoke execute on function public.fn_add_budget_item(uuid, text, text, text, text) from public;
revoke execute on function public.fn_add_budget_item(uuid, text, text, text, text) from anon;
grant  execute on function public.fn_add_budget_item(uuid, text, text, text, text) to authenticated;
