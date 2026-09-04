-- KAAPA AIDIYET-3: fn_open_budget dogum yolu heading_code yazmiyordu.
-- 17 Agustos karari (kutuphaneden dogan kalemde aidiyet dogumda yazilir) yalniz
-- fn_add_budget_item'a konmustu; 19 Agustos'taki geriye donuk doldurmadan SONRA
-- acilan her butcede sablon-kaynakli kalemler Basliksiz kaldi. Bu goc dogum
-- yolunu fn_add_budget_item'daki kutuphane kuraliyla ayni hale getirir ve
-- ikinci bir geriye donuk doldurma calistirir.

-- Taban: 20260830140000 icindeki GUNCEL fn_open_budget tanimi, birebir. Imza
-- AYNI kaldigi icin drop/grant yok - create or replace mevcut grant'lari korur.
-- Uc delta: v_heading degiskeni, kalem donguSUnde kutuphane basligi hesabi,
-- insert listesine heading_code eklenmesi. Baska hicbir davranis degismedi.
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
  v_heading      text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if not fn_is_project_muhasebe(p_project) then
    raise exception 'Bütçe açma yetkisi yok';
  end if;

  select body into v_body from budget_templates
   where id = p_template and is_active
     and (kind = 'system' or owner_project_id = p_project);
  if v_body is null then
    raise exception 'Şablon bulunamadı veya bu projeye kapalı';
  end if;

  if exists (select 1 from budgets where project_id = p_project
               and scope = p_scope and episode_no is not distinct from p_episode_no) then
    raise exception 'Bu kapsam için bütçe zaten açık';
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
      raise exception 'Şablon kartında card_code eksik: %', v_card->>'name';
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
        raise exception 'Birim bulunamadı: kart % kalem %',
          v_card->>'name', v_item->>'name';
      end if;

      v_catalog_code := v_item->>'catalog_code';
      if v_catalog_code is null then
        raise exception 'Şablon kaleminde catalog_code eksik: kart % kalem %',
          v_card->>'name', v_item->>'name';
      end if;
      select id into v_library_id from item_library where catalog_code = v_catalog_code;
      if v_library_id is null then
        raise exception 'Katalog kodu kütüphanede yok: %', v_catalog_code;
      end if;

      -- AIDIYET-3: fn_add_budget_item'daki kutuphane kuraliyla BIREBIR ayni.
      -- Tire oncesi parca kutuphanede is_group satiri olarak varsa yazilir,
      -- yoksa NULL kalir. Her tur icin yeniden hesaplanir.
      v_heading := null;
      select l.catalog_code into v_heading from item_library l
       where l.catalog_code = split_part(v_catalog_code, '-', 1) and l.is_group;

      update budgets set item_code_seq = item_code_seq + 1
       where id = v_budget returning item_code_seq into v_item_code;

      insert into budget_items
        (budget_id, group_id, item_code, name, name_en, unit_net,
         unit_id, multiplier, payment_status, sort_order,
         catalog_code, library_item_id, heading_code)
      values
        (v_budget, v_group, v_item_code, v_item->>'name', v_item->>'detail',
         0, v_item_unit, coalesce((v_item->>'multiplier')::numeric, 1),
         coalesce(v_item->>'payment_status', 'sirket'),
         coalesce((v_item->>'sort_order')::int, 0),
         v_catalog_code, v_library_id, v_heading)
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

-- Ikinci geriye donuk doldurma: fn_open_budget bu alani HICBIR taniminda
-- yazmadi, dolayisiyla 19 Agustos doldurmasindan SONRA acilan butceler de
-- kapsamda; sablon-kaynakli kalemler Basliksiz kaldi. 20260819120000'deki UPDATE'in AYNISI tekrar kosuyor -
-- idempotent, zaten dolu satirlari da ayni degerle yeniden yazar, zarar yok.
-- Tetik bu goc suresince kapali: bu bir kullanici islemi degil gocun kendisi,
-- acikken her kaleme imzasiz bir denetim satiri yaziliyor.
alter table public.budget_items disable trigger trg_log_items;

update public.budget_items bi
   set heading_code = split_part(bi.catalog_code, '-', 1)
 where bi.catalog_code is not null
   and exists (
     select 1 from public.item_library l
      where l.catalog_code = split_part(bi.catalog_code, '-', 1)
        and l.is_group
   );

alter table public.budget_items enable trigger trg_log_items;

do $dogrulama$
declare v_dolan int; v_bos int; v_log int;
begin
  select count(*) filter (where heading_code is not null),
         count(*) filter (where heading_code is null)
    into v_dolan, v_bos from public.budget_items;
  select count(*) into v_log from public.budget_change_log
   where table_name = 'budget_items' and changed_by is null;
  raise notice 'AIDIYET-3 SAYIM: dolan=% bos=% imzasiz_log=%', v_dolan, v_bos, v_log;
end $dogrulama$;
