-- KAAPA Butce 2026-06-20: fn_open_budget (raftan fotokopi) + sema eki
-- Karar kaynagi: docs/TASARIM-KARARLARI.md body FORMAT + iki kilitli karar
-- (departments.code kanonik anahtar; budget_stages.is_undated "Donemsiz" kovasi).
-- Model A: kopru (budget_item_periods) acilista BOS; unit_net=0 (rakamsiz iskelet).
-- Bes katman: sema(L1) + RPC(L2-L4) + GRANT(L4). UI/CFE/muhur AYRI dilim.
-- Sema adaptasyonlari (mekanik, mimari degil):
--   a) budget_items.quantity kolonu yok (Model A karari: miktar kopruye tasinmis);
--      INSERT quantity satirini icermez.
--   b) budgets.item_code_seq mevcut (20260613115009 temel migration, satir 86:
--      "kalici kalem kodu sayaci, servis arttirir, geri donmez"); max(item_code)+1
--      yerine UPDATE ... RETURNING kullanilir — B-serisi kalici kimlik kararini korur.

-- ============ L1: SEMA EKI ============
-- 1) departments.code: sablon department_code'u projeye eslemek icin kanonik anahtar.
--    name'e gore esleme REDDEDILDI (typo bolunmesi). Mevcut departmanlar icin nullable
--    eklenir; UNIQUE proje-bazli (NULL'lar cakismaz, PostgreSQL UNIQUE NULL'i ayri sayar).
alter table departments add column code text;
alter table departments add constraint departments_project_code_uniq unique (project_id, code);
comment on column departments.code is
  'Kanonik departman kodu (sablon department_code eslemesi). fn_open_budget bul-veya-olustur anahtari. Proje-bazli benzersiz.';

-- 2) budget_stages.is_undated: "Donemsiz" rezerve kovasi (sistem yaratir, tarih beklemez).
--    Muhur (fn_lock_budget, ayri dilim) bu etabi tarih-zorlamasindan muaf tutar.
alter table budget_stages add column is_undated boolean not null default false;
comment on column budget_stages.is_undated is
  '"Donemsiz" rezerve kovasi (fn_open_budget yaratir). true = muhur tarih-zorlamasindan muaf.';

-- ============ L2-L4: fn_open_budget RPC ============
-- Girdi: p_project (hedef proje), p_template (kaynak sablon id), p_scope/p_episode_no
--   (dizi cift-iskelet icin; film/reklam/belgesel'de scope='single', episode_no=null).
-- Cikti: yeni budgets.id.
-- Atomik: tek transaction; herhangi bir adim patlarsa hepsi geri alinir.
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
  v_unit     uuid;   -- kart default birimi (3b'de set, bozulmaz)
  v_pkg      uuid;   -- kart default paketi (3b'de set, bozulmaz)
  v_item_unit uuid;  -- kalem-bazli birim (her kalemde hesaplanir)
  v_item_pkg  uuid;  -- kalem-bazli paket (her kalemde hesaplanir, yuk dongusunde kullanilir)
  v_comp     uuid;
  v_rate     numeric(7,4);
  v_item_code int;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  -- Yetki: hedef projede muhasebe mi? (butce her seviyede yalniz muhasebe)
  if not fn_is_project_muhasebe(p_project) then
    raise exception 'Butce acma yetkisi yok';
  end if;

  -- Sablon govdesini al (system veya bu projenin sirket sablonu).
  select body into v_body from budget_templates
   where id = p_template and is_active
     and (kind = 'system' or owner_project_id = p_project);
  if v_body is null then
    raise exception 'Sablon bulunamadi veya bu projeye kapali';
  end if;

  -- Bu proje+scope+episode icin zaten butce var mi? (budgets unique nulls not distinct)
  if exists (select 1 from budgets where project_id = p_project
               and scope = p_scope and episode_no is not distinct from p_episode_no) then
    raise exception 'Bu kapsam icin butce zaten acik';
  end if;

  -- 1) Butce basligi.
  insert into budgets (project_id, scope, episode_no)
  values (p_project, p_scope, p_episode_no)
  returning id into v_budget;

  -- 2) Etaplar (stages[]). Tarih YOK (acilista null). + rezerve "Donemsiz".
  for v_stage in select * from jsonb_array_elements(coalesce(v_body->'stages', '[]'::jsonb))
  loop
    insert into budget_stages (budget_id, name, sort_order, is_undated)
    values (v_budget, v_stage->>'name',
            coalesce((v_stage->>'sort_order')::int, 0), false);
  end loop;
  -- Rezerve "Donemsiz" kovasi (her butcede bir tane; sort_order yuksek = sona).
  insert into budget_stages (budget_id, name, sort_order, is_undated)
  values (v_budget, 'Donemsiz', 9999, true);

  -- 3) Kartlar (cards[]) -> expense_groups. department_code bul-veya-olustur.
  for v_card in select * from jsonb_array_elements(coalesce(v_body->'cards', '[]'::jsonb))
  loop
    -- 3a) Departman: bul-veya-olustur. ON CONFLICT ile race-safe (iki muhasebeci
    --     ayni anda ayni code'u acabilir; ikincinin INSERT'i sessizce duser, SELECT kazanir).
    insert into departments (project_id, name, code)
    values (p_project, coalesce(v_card->>'name', v_card->>'department_code'),
            v_card->>'department_code')
    on conflict (project_id, code) do nothing;
    select id into v_dept from departments
     where project_id = p_project and code = v_card->>'department_code';

    -- 3b) default_unit/default_package kodlarini raftan coz (yoksa NULL/varsayilan).
    select id into v_unit from units where code = v_card->>'default_unit';
    select id into v_pkg  from burden_packages where code = v_card->>'default_package';

    -- 3c) Kart (expense_group). default_unit_id/default_package_id nullable, 2b'de.
    insert into expense_groups (budget_id, department_id, name, sort_order)
    values (v_budget, v_dept, v_card->>'name',
            coalesce((v_card->>'sort_order')::int, 0))
    returning id into v_group;

    -- 3d) Kalemler (items[]) -> budget_items. unit_net=0 (rakamsiz). cost_object BOS.
    --     quantity yok: Model A kararinca miktar budget_item_periods koprusunde.
    for v_item in select * from jsonb_array_elements(coalesce(v_card->'items', '[]'::jsonb))
    loop
      -- Kalem birimi: kalem kendi unit'ini soyleyebilir; yoksa kartin default (v_unit).
      -- v_item_unit ayri degisken — v_unit (kart default) bozulmaz, sonraki kalemde gerekli.
      v_item_unit := coalesce(
        (select id from units where code = v_item->>'unit'),
        v_unit
      );
      if v_item_unit is null then
        raise exception 'Birim bulunamadi: kart % kalem %',
          v_card->>'name', v_item->>'name';
      end if;

      -- Butce-bazli kalici item_code: item_code_seq monoton artirilir (geri donmez).
      -- max(item_code)+1 KULLANILMAZ — silinen kodu tekrar verir, kalici kimlik ihlali.
      update budgets set item_code_seq = item_code_seq + 1
       where id = v_budget returning item_code_seq into v_item_code;

      insert into budget_items
        (budget_id, group_id, item_code, name, detail, unit_net,
         unit_id, multiplier, package_id, sort_order)
      values
        (v_budget, v_group, v_item_code, v_item->>'name', v_item->>'detail',
         0, v_item_unit, coalesce((v_item->>'multiplier')::numeric, 1),
         coalesce((select id from burden_packages where code = v_item->>'package'), v_pkg),
         coalesce((v_item->>'sort_order')::int, 0))
      returning id into v_item_id;

      -- 3e) Paket -> item_burdens: paketin her bileseni icin GUNUN orani (rate_catalog
      --     en guncel valid_from <= bugun) kopyalanir. Paket yoksa yuk yok.
      -- v_item_pkg ayri degisken — v_pkg (kart default) bozulmaz, sonraki kalemde gerekli.
      v_item_pkg := coalesce(
        (select id from burden_packages where code = v_item->>'package'),
        v_pkg
      );
      if v_item_pkg is not null then
        for v_comp in select unnest(component_ids) from burden_packages where id = v_item_pkg
        loop
          select rate_percent into v_rate from rate_catalog
           where component_id = v_comp and valid_from <= v_today
           order by valid_from desc limit 1;
          if v_rate is not null then
            insert into item_burdens (budget_id, item_id, component_id, rate_percent)
            values (v_budget, v_item_id, v_comp, v_rate);
          end if;
        end loop;
      end if;
    end loop;
  end loop;

  -- 4) Yuzde satirlari (percent_lines[]). Yoksa varsayilan contingency 10 / profit 0.
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
