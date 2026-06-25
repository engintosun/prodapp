-- KAAPA DILIM-2b: fn_open_budget kovayi STATUYE gore doldurur (paket yolu emekli)
--   + 1500 sistem sablonu kalemleri payment_status tasir. Temiz gecis.
-- smm/kira -> stopaj; telif -> stopaj_telif; sirket/konaklama -> bos kova; bordro -> motor bekliyor (bos).
-- CFE cinse gore brut DILIM-2c; ekran Net+Brut+KDV DILIM-2d.

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
  v_uid      uuid := auth.uid();
  v_body     jsonb;
  v_budget   uuid;
  v_today    date := current_date;
  v_stage    jsonb;
  v_card     jsonb;
  v_item     jsonb;
  v_pct      jsonb;
  v_dept     uuid;
  v_group    uuid;
  v_item_id  uuid;
  v_unit     uuid;
  v_item_unit uuid;
  v_status   text;
  v_comp     uuid;
  v_rate     numeric(7,4);
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

    -- 3b) Kart default birimi (paket yolu emekli; default_package okunmaz).
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

      -- 3e) Statu -> item_burdens: statuye dusen yuk bilesenleri (payment_status_burdens)
      --     icin GUNUN orani (rate_catalog valid_from <= bugun) kovaya snapshot.
      --     Esleme satiri yoksa (sirket/konaklama; bordro motor bekliyor) kova bos.
      v_status := coalesce(v_item->>'payment_status', 'sirket');
      for v_comp in
        select component_id from payment_status_burdens where payment_status = v_status
      loop
        select rate_percent into v_rate from rate_catalog
         where component_id = v_comp and valid_from <= v_today
         order by valid_from desc limit 1;
        if v_rate is not null then
          insert into item_burdens (budget_id, item_id, component_id, rate_percent)
          values (v_budget, v_item_id, v_comp, v_rate);
        end if;
      end loop;
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

-- 1500 sistem sablonu: kalemler paket yerine payment_status tasir.
update public.budget_templates
   set body = $json$
{
  "stages": [
    {"ref":"s1","name":"Yapim Oncesi","sort_order":1},
    {"ref":"s2","name":"Yapim","sort_order":2},
    {"ref":"s3","name":"Yapim Sonrasi","sort_order":3}
  ],
  "cards": [
    {
      "ref":"c1500",
      "department_code":"1500",
      "name":"Yonetmen ve Kreatif Reji Ekibi",
      "default_unit":"week",
      "sort_order":1500,
      "items":[
        {"ref":"i1501","name":"Yonetmen Kasesi","detail":"Director Fee","unit":"flat","payment_status":"telif_belgeli","multiplier":1,"sort_order":1},
        {"ref":"i1502","name":"Ikinci Ekip Yonetmeni","detail":"Second Unit Director","unit":"week","payment_status":"smm","multiplier":1,"sort_order":2},
        {"ref":"i1503","name":"Koreograf","detail":"Choreographer","unit":"week","payment_status":"smm","multiplier":1,"sort_order":3},
        {"ref":"i1504","name":"Oyuncu/Diyalog Kocu","detail":"Dialogue/Acting Coach","unit":"day","payment_status":"smm","multiplier":1,"sort_order":4},
        {"ref":"i1505","name":"Yonetmen Ozel Asistani","detail":"Personal Assistant","unit":"week","payment_status":"bordro","multiplier":1,"sort_order":5}
      ]
    }
  ],
  "percent_lines": [
    {"code":"contingency","label":"Ongorulemeyen","rate_percent":10,"is_hidden":false,"sort_order":1},
    {"code":"profit","label":"Kar","rate_percent":0,"is_hidden":false,"sort_order":2}
  ]
}
$json$::jsonb
 where kind = 'system' and production_type = 'film' and scope = 'single' and is_active;
