-- TD-36c: kullaniciya gorunen exception metinleri Turkce karakterli yazilir.
-- Bes fonksiyonun govdesi kaynak migration'lardaki canli tanimin BIREBIR
-- kopyasidir; yalnizca 22 raise exception metni degismistir. Bes metin
-- zaten dogruydu ve DEGISTIRILMEDI. TD-36'nin son dilimi.

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

      update budgets set item_code_seq = item_code_seq + 1
       where id = v_budget returning item_code_seq into v_item_code;

      insert into budget_items
        (budget_id, group_id, item_code, name, name_en, unit_net,
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

create or replace function public.fn_add_budget_item(
  p_group_id       uuid,
  p_catalog_code   text default null,
  p_name           text default null,
  p_payment_status text default null,
  p_unit_code      text default null,
  p_existing_code  text default null
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
  v_name_en      text;
  v_library_id   uuid;
  v_code         text;
  v_heading      text;
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
    raise exception 'Kart bulunamadı';
  end if;
  if v_card_code is null then
    raise exception 'Kart kodu tanımsız';
  end if;

  select b.project_id into v_project from budgets b where b.id = v_budget;
  if not fn_is_project_muhasebe(v_project) then
    raise exception 'Kalem ekleme yetkisi yok';
  end if;

  if p_catalog_code is not null then
    -- kutuphane modu
    if p_existing_code is not null then
      raise exception 'Katalog kodu ile mevcut-kod aynı anda verilmez';
    end if;
    if p_name is not null or p_payment_status is not null or p_unit_code is not null then
      raise exception 'Kütüphane modunda isim/statü/birim parametresi verilmez (varsayılan kütüphaneden gelir)';
    end if;
    select * into v_lib from item_library where catalog_code = p_catalog_code;
    if v_lib.id is null then
      raise exception 'Katalog kodu kütüphanede yok: %', p_catalog_code;
    end if;
    if v_lib.is_group then
      raise exception 'Başlık satırı kalem olarak eklenemez: %', p_catalog_code;
    end if;
    if substr(p_catalog_code, 1, 2) <> substr(v_card_code, 1, 2) then
      raise exception 'Katalog kodu bu kartın aralığından değil: % (kart %)', p_catalog_code, v_card_code;
    end if;
    v_name       := v_lib.name;
    v_status     := v_lib.default_payment_status;
    v_unit_code  := v_lib.default_unit_code;
    v_name_en    := v_lib.name_en;
    v_library_id := v_lib.id;
    v_code       := p_catalog_code;
    -- AIDIYET-1: aidiyet dogarken yazilir. Doldurma gocuyle AYNI kural: tire oncesi parca
    -- kutuphanede is_group satiri olarak varsa yazilir, yoksa NULL kalir.
    select l.catalog_code into v_heading from item_library l
     where l.catalog_code = split_part(p_catalog_code, '-', 1) and l.is_group;
  else
    -- serbest / mevcut-kod ortak dogrulama (D3c-1'den beri): isim, statu, birim zorunlu.
    if p_name is null or p_payment_status is null or p_unit_code is null then
      raise exception 'Serbest kalemde isim, statü ve birim zorunlu';
    end if;
    if p_existing_code is null then
      -- serbest mod: yeni muhtelif alt-kod, sayac ARTAR
      update expense_groups set misc_code_seq = misc_code_seq + 1
       where id = p_group_id returning misc_code_seq into v_seq;
      v_code := substr(v_card_code, 1, 2) || '98-' || lpad(v_seq::text, greatest(2, length(v_seq::text)), '0');
    else
      -- D3c-2: mevcut serbest kalem - AYNI KOD ile ikinci satir, sayac ARTMAZ
      if p_existing_code !~ ('^' || substr(v_card_code, 1, 2) || '98-[0-9]{2,}$') then
        raise exception 'Mevcut kod bu kartın muhtelif bloğundan değil: % (kart %)', p_existing_code, v_card_code;
      end if;
      perform 1 from budget_items bi
        where bi.group_id = p_group_id and bi.catalog_code = p_existing_code and bi.is_active
        limit 1;
      if not found then
        raise exception 'Mevcut kod bu kartta bulunamadı: %', p_existing_code;
      end if;
      v_code := p_existing_code;
    end if;
    v_name       := p_name;
    v_status     := p_payment_status;
    v_unit_code  := p_unit_code;
    v_name_en    := null;
    v_library_id := null;
    -- AIDIYET-1: serbest kalemde aidiyet kullanicinin secimidir, dilim 2'ye kadar bos.
    v_heading    := null;
  end if;

  select id into v_unit from units where code = v_unit_code;
  if v_unit is null then
    raise exception 'Birim bulunamadı: %', v_unit_code;
  end if;

  update budgets set item_code_seq = item_code_seq + 1
   where id = v_budget returning item_code_seq into v_item_code;

  insert into budget_items
    (budget_id, group_id, item_code, name, name_en, unit_net,
     unit_id, multiplier, payment_status, sort_order,
     catalog_code, library_item_id, heading_code)
  values
    (v_budget, p_group_id, v_item_code, v_name, v_name_en,
     0, v_unit, 1, v_status, 0,
     v_code, v_library_id, v_heading)
  returning id into v_item_id;

  perform public.fn_refill_item_burdens(v_item_id);

  -- D2-e: kartin tum satirlari kod-sirasina yeniden numaralanir (es kodda item_code ayristirir, K-D bitisiklik).
  -- AIDIYET-1 NOTU: siralama bu dilimde DEGISMEZ, hala catalog_code'a gore. heading_code'un
  -- siralamaya girmesi dilim 2'nin isidir.
  update budget_items bi
     set sort_order = t.rn
    from (select id, row_number() over (order by catalog_code, item_code) as rn
            from budget_items where group_id = p_group_id) t
   where t.id = bi.id
     and bi.sort_order is distinct from t.rn;

  return v_item_id;
end;
$addfn$;

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
    raise exception 'Bütçe bulunamadı veya mühürleme yetkisi yok';
  end if;

  select project_id, is_locked into v_project, v_is_locked
    from budgets where id = p_budget_id;

  if v_is_locked then
    raise exception 'Bütçe zaten mühürlü';
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
    raise exception 'Bütçe bulunamadı veya yetki yok';
  end if;

  update budgets set is_locked = false where id = p_budget_id;
end;
$unlockfn$;

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
    raise exception 'Bütçe mühürlü, düzenlenemez (revizyon için önce mührü aç - fn_unlock_budget)';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$guardfn$;

-- SAGLAMA: imza kaymasinda Postgres eskiyi degistirmez, YANINA ikinci bir
-- fonksiyon koyar ve sessizce basarili olur (sandbox turunda uretildi,
-- 30 Agustos 2026). Bu blok o durumu migration'in kendi icinde hataya cevirir.
do $check$
declare r record;
begin
  for r in
    select unnest(array['fn_open_budget','fn_add_budget_item','fn_lock_budget','fn_unlock_budget','fn_guard_budget_lock']) as fname
  loop
    if (select count(*) from pg_proc where proname = r.fname) <> 1 then
      raise exception 'TD-36c saglama: % sayisi % (1 olmali) — imza kaymis',
        r.fname, (select count(*) from pg_proc where proname = r.fname);
    end if;
  end loop;
end $check$;
