-- KART 1500 Dilim 2b-2b (1 Ekim 2026, Engin kararlari): kilidi acip kapama.
-- Karar evi: docs/butce/KART-KATALOGU.md bolum 7.4 (Karar 11, 13, KILIT ACILIRKEN).
-- 1) split_rate hassasiyeti: numeric(5,2) kilit kapanirken orani yuvarliyor ve hak devrini
--    ZIPLATIYORDU (612.345 / 387.655 -> %38,7655 -> %38,77 -> hak devri 387.700). 8 basamak
--    hatayi kurusun altina indirir; butce rakamlari tam TL oldugu icin gorunmez.
-- 2) fn_set_split_lock: Hizmet Bedeli birim ve donem rakamlari, hak devri rakami ve oran TEK
--    islemde yazilir; biri yarida kalirsa hicbiri yazilmaz. Rakamlari ekran hesaplar (B18: formul
--    TS'te tek yerde, split-lock.ts); islev yalniz dogrular, yetkiyi denetler ve yazar.

alter table public.budget_items alter column split_rate type numeric(12,8);

create or replace function public.fn_set_split_lock(
  p_split_item_id      uuid,
  p_split_rate         numeric,
  p_split_unit_net     numeric,
  p_anchor_unit_net    numeric,
  p_anchor_period_nets jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $lockfn$
declare
  v_split   budget_items%rowtype;
  v_anchor  budget_items%rowtype;
  v_project uuid;
  v_key     text;
  v_val     numeric;
  v_n       int;
begin
  if auth.uid() is null then
    raise exception 'Oturum yok';
  end if;

  select * into v_split from budget_items where id = p_split_item_id;
  if v_split.id is null or not v_split.is_active then
    raise exception 'Hak devri satırı bulunamadı: %', p_split_item_id;
  end if;
  if v_split.parent_item_id is null then
    raise exception 'Bu satır bir satıra bağlı değil: %', p_split_item_id;
  end if;
  select * into v_anchor from budget_items where id = v_split.parent_item_id;
  if v_anchor.id is null or not v_anchor.is_active then
    raise exception 'Bağlı satır bulunamadı';
  end if;

  select b.project_id into v_project from budgets b where b.id = v_split.budget_id;
  if not fn_is_project_muhasebe(v_project) then
    raise exception 'Kilit değiştirme yetkisi yok';
  end if;

  -- Yalniz bolme yapan atom (kutuphanede default_split_rate dolu).
  if not exists (select 1 from item_library l
                  where l.id = v_split.library_item_id and l.default_split_rate is not null) then
    raise exception 'Bu satır bölme yapan bir kalem değil';
  end if;

  if p_split_rate is not null and (p_split_rate < 0 or p_split_rate >= 100) then
    raise exception 'Oran 0 ile 100 arasında olmalı (100 hariç)';
  end if;
  if p_split_rate is null and p_split_unit_net is null then
    raise exception 'Kilit açılırken hak devri rakamı gerekir';
  end if;
  if p_anchor_unit_net is null or p_anchor_unit_net < 0 then
    raise exception 'Geçersiz Hizmet Bedeli rakamı';
  end if;
  if p_split_unit_net is not null and p_split_unit_net < 0 then
    raise exception 'Geçersiz hak devri rakamı';
  end if;

  update budget_items set unit_net = p_anchor_unit_net where id = v_anchor.id;

  for v_key, v_val in
    select key, value::numeric from jsonb_each_text(coalesce(p_anchor_period_nets, '{}'::jsonb))
  loop
    if v_val < 0 then
      raise exception 'Geçersiz dönem rakamı';
    end if;
    update budget_item_periods set unit_net_override = v_val
     where item_id = v_anchor.id and stage_id = v_key::uuid;
    get diagnostics v_n = row_count;
    if v_n <> 1 then
      raise exception 'Hizmet Bedeli dönemi bulunamadı: %', v_key;
    end if;
  end loop;

  if p_split_unit_net is not null then
    -- ACILIS: hak devri tek rakamdir (Karar 13); miktar ve X 1'e doner ki rakam birim nete esit kalsin.
    update budget_items
       set split_rate = p_split_rate, unit_net = p_split_unit_net, multiplier = 1, repeat = 1
     where id = v_split.id;
  else
    update budget_items set split_rate = p_split_rate where id = v_split.id;
  end if;
end;
$lockfn$;

revoke execute on function public.fn_set_split_lock(uuid, numeric, numeric, numeric, jsonb) from public;
revoke execute on function public.fn_set_split_lock(uuid, numeric, numeric, numeric, jsonb) from anon;
grant  execute on function public.fn_set_split_lock(uuid, numeric, numeric, numeric, jsonb) to authenticated;

do $check$
begin
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'budget_items'
                    and column_name = 'split_rate' and numeric_scale = 8) then
    raise exception 'split_rate hassasiyeti 8 degil';
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public' and p.proname = 'fn_set_split_lock') then
    raise exception 'fn_set_split_lock yok';
  end if;
end $check$;
