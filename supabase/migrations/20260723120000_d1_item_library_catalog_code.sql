-- D1: Kalem Kutuphanesi sema paketi (BUTCE-SEMA-KARARLARI H-M)
-- Icerik: item_library tablosu + RLS/GRANT + 1500 mini seed
--         budget_items.catalog_code + library_item_id + backfill (anahtar: sort_order, D1-c)
--         budget_templates body item'larina acik catalog_code (D1-b, ref atil kalir)
--         fn_open_budget: catalog_code okuma + kutuphane lookup + iki loud exception
-- Catal notu (bilincli): catalog_code satira kopyalanir; muhur tutanagi tarihi gercegi korur.

create table public.item_library (
  id uuid default gen_random_uuid() primary key,
  catalog_code text not null unique,
  name text not null,
  description_en text,
  default_payment_status text not null,
  default_unit_code text not null,
  provenance text,
  aliases text[] not null default '{}',
  created_at timestamp with time zone default now() not null
);

comment on table public.item_library is 'Kalem Kutuphanesi (K-C): kuresel salt-okunur referans, rate_catalog deseni. Grup alani YOK (grup = kart, kod araligi belirler). Damitim doldurur.';
comment on column public.item_library.catalog_code is 'K-A: MMB-uyumlu kanonik kod; kart aidiyeti = kod araligi (K-B). Alt-kod tasiyabilir (orn. 1601-03).';
comment on column public.item_library.aliases is 'Autocomplete es adlari (orn. Gaffer / Isik Sefi). Bos dogar, damitim doldurur.';

alter table public.item_library enable row level security;
create policy sel_item_library on public.item_library for select to authenticated using (true);
grant select on table public.item_library to authenticated;
grant all on table public.item_library to service_role;

insert into public.item_library (catalog_code, name, description_en, default_payment_status, default_unit_code, provenance) values
  ('1501', 'Yonetmen Kasesi',        'Director Fee',          'telif_belgeli', 'flat', 'Koster/MMB-6.1'),
  ('1502', 'Ikinci Ekip Yonetmeni',  'Second Unit Director',  'smm',           'week', 'Koster/MMB-6.1'),
  ('1503', 'Koreograf',              'Choreographer',         'smm',           'week', 'Koster/MMB-6.1'),
  ('1504', 'Oyuncu/Diyalog Kocu',    'Dialogue/Acting Coach', 'smm',           'day',  'Koster/MMB-6.1'),
  ('1505', 'Yonetmen Ozel Asistani', 'Personal Assistant',    'bordro',        'week', 'Koster/MMB-6.1');

alter table public.budget_items
  add column catalog_code text,
  add column library_item_id uuid references public.item_library(id);

comment on column public.budget_items.catalog_code is 'K-A iki-kod doktrini: MMB-uyumlu kanonik kod; gorunum sirasi ve UI Kod kolonu bundan okunur (D3). item_code ic kimliktir. Satirdaki kopya BILINCLI: muhur tutanagi tarihi gercegi korur, kutuphanede kod duzeltilse satir eski kodu tasir.';
comment on column public.budget_items.library_item_id is 'K-G: kutuphane kokeni. NULL = serbest kalem (kodu muhtelif kuyrugundan, D2). Koken sonradan turetilemez, damitim geri-beslemesi bu ayrimdan okunur.';

do $d1a$
begin
  if exists (select 1 from public.budget_items where sort_order not between 1 and 5) then
    raise exception 'D1 backfill: beklenmeyen sort_order var — sablon disi satir, elle inceleme gerekli';
  end if;
end $d1a$;

update public.budget_items bi
   set catalog_code    = il.catalog_code,
       library_item_id = il.id
  from public.item_library il
 where il.catalog_code = '150' || bi.sort_order::text;

do $d1b$
begin
  if exists (select 1 from public.budget_items where catalog_code is null) then
    raise exception 'D1 backfill: kodsuz satir kaldi';
  end if;
end $d1b$;

alter table public.budget_items alter column catalog_code set not null;

update public.budget_templates t
   set body = jsonb_set(
     t.body,
     '{cards}',
     (select jsonb_agg(
        case
          when c.card ? 'items' then jsonb_set(
            c.card,
            '{items}',
            (select jsonb_agg(
               i.item || jsonb_build_object('catalog_code',
                 case i.item->>'ref'
                   when 'i1501' then '1501'
                   when 'i1502' then '1502'
                   when 'i1503' then '1503'
                   when 'i1504' then '1504'
                   when 'i1505' then '1505'
                 end)
               order by i.ord)
             from jsonb_array_elements(c.card->'items') with ordinality as i(item, ord)))
          else c.card
        end
        order by c.ord)
      from jsonb_array_elements(t.body->'cards') with ordinality as c(card, ord))
   )
 where t.body ? 'cards';

do $d1c$
begin
  if exists (
    select 1
      from public.budget_templates t,
           jsonb_array_elements(t.body->'cards') as c(card),
           jsonb_array_elements(c.card->'items') as i(item)
     where (i.item->>'catalog_code') is null
  ) then
    raise exception 'D1 sablon: catalog_code atanamayan item var (bilinmeyen ref) — DUR ve raporla';
  end if;
end $d1c$;

-- fn_open_budget: taban 20260701130000 surumudur. Delta yalniz uc nokta:
--   declare bloguna v_catalog_code + v_library_id
--   kalem dongusunde catalog_code okuma + kutuphane lookup + iki exception
--   INSERT kolon listesi + values genislemesi
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
