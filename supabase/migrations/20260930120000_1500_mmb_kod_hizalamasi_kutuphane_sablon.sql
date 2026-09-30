-- KART 1500 Dilim 1 (Engin karari, 30 Eylul 2026): MMB 6.1 kod hizalamasi,
-- kutuphane 5 -> 14 satir, sablon 1500 = 5 kalem, misc_prefix 1100 ve 1500 govdesinde.
-- Karar evi: docs/butce/KART-KATALOGU.md bolum 7.4.
-- Emsal: 20260912120000 (kilitli butce disarida, kod tasima), 20260912130000 (sablon).
-- Canli olcum (30 Eylul 2026): 5 butce, 0 kilitli; 1502 x5, 1505 x5 (biri pasif).
-- fn_open_budget'taki misc_prefix geri-dusumu BU GOCTE KALDIRILMAZ (TD-39).

-- 2a) item_library kod duzeltmesi. Satir kimligi, ad ve diger haneler korunur.
--     SIRA ONEMLI: catalog_code tekil; once 1502 -> 1509, sonra 1505 -> 1502.
update public.item_library set catalog_code = '1509' where catalog_code = '1502';
update public.item_library set catalog_code = '1502' where catalog_code = '1505';

-- 2b) budget_items: ayni esleme, ayni sira. library_item_id degismez. Kilitli butceler disarida.
update public.budget_items bi
   set catalog_code = '1509'
 where bi.catalog_code = '1502'
   and exists (select 1 from public.budgets b where b.id = bi.budget_id and not b.is_locked);
update public.budget_items bi
   set catalog_code = '1502'
 where bi.catalog_code = '1505'
   and exists (select 1 from public.budgets b where b.id = bi.budget_id and not b.is_locked);

-- 2c) 9 yeni atom. card_code ve heading_id 1100-A tohumundan sonra eklendigi icin
--     liste ACIKCA yazilir; asks_person, default_derive_rate varsayilanda kalir.
--     aliases text[] (not null default '{}'; mevcut tohumlarda hep bos): yalniz 1506 dolu.
--     Statu ve birimler canli 1108 satirlarindan (1508-01 ve 1508-05 birimi flat; 1508-03
--     birimi flat, 2e ile 1108-03 de flat olur).
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, card_code, aliases)
values
  ('1506',    'Storyboard ve Animatic Sanatçısı', 'Storyboard & Animatic Artist', 'smm',       'week', 'Koster/MMB-6.1', false, false, false, null, '1500', array['Previz','Previsualization','Animatic']),
  ('1507',    'Yönetmen Birimi Ofis Giderleri',   'Director''s Office Expenses',  'sirket',    'flat', 'Koster/MMB-6.1', false, false, false, null, '1500', '{}'),
  ('1508-01', 'Ulaşım-Uçak',                      'Air Travel',                   'sirket',    'flat', 'Koster/MMB + KAAPA damitim', false, false, false, null, '1500', '{}'),
  ('1508-02', 'Konaklama',                        'Hotels / Accommodation',       'konaklama', 'day',  'Koster/MMB + KAAPA damitim', false, false, false, null, '1500', '{}'),
  ('1508-03', 'Yemek-Ağırlama',                   'Catering & Hospitality',       'sirket',    'flat', 'Koster/MMB + KAAPA damitim', false, false, false, null, '1500', '{}'),
  ('1508-04', 'Harcırah',                         'Per Diem',                     'sirket',    'day',  'Koster/MMB + KAAPA damitim', false, false, false, null, '1500', '{}'),
  ('1508-05', 'Festival Katılımı',                'Festival Attendance',          'sirket',    'flat', 'Koster/MMB + KAAPA damitim', false, false, false, null, '1500', '{}'),
  ('1508-06', 'Araç Kiralama',                    'Car Rentals',                  'sirket',    'day',  'Koster/MMB + KAAPA damitim', false, false, false, null, '1500', '{}'),
  ('1510',    'Konsept Sanatçısı',                'Concept Artist',               'smm',       'week', 'KAAPA',                      false, false, false, null, '1500', '{}');

-- 2e) 1108-03 birimi flat. budget_items'a dokunulmaz.
update public.item_library set default_unit_code = 'flat' where catalog_code = '1108-03';

-- 2d) Aktif sablon govdesi (TABAN CANLIDIR). 1500 kalemleri ACIKCA yeniden kurulur:
--     1501, 1502, 1503, 1504, 1506; ad/ingilizce/statu/birim kutuphaneden (2a ve 2c'den sonra).
--     1100 ve 1500 kartlarina misc_prefix: olculen geri-dusum degeri ('11' ve '15').
do $tpl$
declare
  v_body   jsonb;
  v_cards  jsonb := '[]'::jsonb;
  v_card   jsonb;
  v_items  jsonb;
  v_codes  text[] := array['1501','1502','1503','1504','1506'];
  v_code   text;
  v_ord    int;
  v_lib    public.item_library%rowtype;
begin
  select t.body into v_body
    from public.budget_templates t
   where t.kind = 'system' and t.production_type = 'film'
     and t.scope = 'single' and t.is_active;
  if v_body is null then
    raise exception 'Aktif sistem sablonu bulunamadi';
  end if;

  for v_card in select * from jsonb_array_elements(v_body->'cards')
  loop
    if v_card->>'card_code' = '1100' then
      v_card := v_card || jsonb_build_object('misc_prefix', '11');
    elsif v_card->>'card_code' = '1500' then
      v_items := '[]'::jsonb;
      v_ord := 0;
      foreach v_code in array v_codes loop
        v_ord := v_ord + 1;
        select * into v_lib from public.item_library where catalog_code = v_code;
        if v_lib.id is null then
          raise exception 'Katalog kodu kutuphanede yok: %', v_code;
        end if;
        if v_lib.is_group or v_lib.card_code <> '1500' then
          raise exception '1500 kalemi degil: %', v_code;
        end if;
        v_items := v_items || jsonb_build_array(jsonb_build_object(
          'ref',            'i' || v_code,
          'name',           v_lib.name,
          'detail',         v_lib.name_en,
          'unit',           v_lib.default_unit_code,
          'payment_status', v_lib.default_payment_status,
          'multiplier',     1,
          'sort_order',     v_ord,
          'catalog_code',   v_code));
      end loop;
      v_card := jsonb_set(v_card, '{items}', v_items) || jsonb_build_object('misc_prefix', '15');
    end if;
    v_cards := v_cards || jsonb_build_array(v_card);
  end loop;

  v_body := jsonb_set(v_body, '{cards}', v_cards);

  update public.budget_templates
     set is_active = false
   where kind = 'system' and production_type = 'film'
     and scope = 'single' and is_active;

  insert into public.budget_templates
    (kind, production_type, scope, label, body, is_active)
  values
    ('system','film','single',
     'KAAPA Sistem - Film (Tek) - 1100+1500+1600 v3',
     v_body, true);
end;
$tpl$;

-- Dogrulama (NOTICE'e bagli degil; ayrica db query ile de kosulur).
do $check$
begin
  if (select count(*) from public.item_library where card_code = '1500') <> 14 then
    raise exception '1500 kutuphanesi 14 satir olmali';
  end if;
  if exists (select 1 from public.item_library where catalog_code = '1505') then
    raise exception '1505 kutuphanede kalmamali';
  end if;
  if (select count(*) from public.budget_templates
       where kind = 'system' and production_type = 'film'
         and scope = 'single' and is_active) <> 1 then
    raise exception 'Aktif sistem sablonu tek olmali';
  end if;
  if (select jsonb_array_length(c->'items')
        from public.budget_templates t, jsonb_array_elements(t.body->'cards') c
       where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
         and t.is_active and c->>'card_code' = '1500') is distinct from 5 then
    raise exception 'Sablonda 1500 = 5 kalem olmali';
  end if;
  if (select count(*) from public.budget_templates t, jsonb_array_elements(t.body->'cards') c
       where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
         and t.is_active and c->>'card_code' in ('1100','1500')
         and c->>'misc_prefix' is not null) <> 2 then
    raise exception '1100 ve 1500 kartlarinda misc_prefix dolu olmali';
  end if;
  if (select default_unit_code from public.item_library where catalog_code = '1108-03') is distinct from 'flat' then
    raise exception '1108-03 birimi flat olmali';
  end if;
end $check$;
