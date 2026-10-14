-- KART 1400 Dilim 1 (Engin kararlari, 5 ve 14 Ekim 2026): Yapimci Birimi.
-- Karar evi: docs/butce/KART-KATALOGU.md bolum 7.3; gerekce docs/butce/KART-GEREKCELERI.md.
-- 1) Kutuphane 22 kalem, kart duz (heading_id bos), her kalem cesidiyle:
--    9 tekil kalem; 1406 gezi ailesi 1508'den, 1409 ofis ailesi 1507'den kopyalanir
--    (ad, Ingilizce ad, statu, birim, cesit, kaynak). Bos numaralar: 1406-05, 1409-06, 1411.
-- 2) Film sablonu v9: 1400 karti 1300'un arkasinda, 4 kalem (1401-1404), misc_prefix 14.
--    Emsal: 20261003120000 (sablon govdesi canlidan okunur). Diger kartlara dokunulmaz.
-- 3) Dogrulama (NOTICE'e bagli degil; push sonrasi ayrica db query ile gosterilir).
-- Butce satirlarina ve mevcut butcelere dokunmaz; ekran kodu degismez.

-- 1a) Tekil kalemler. Cesit adla baglanir.
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, card_code, aliases, cost_element_id)
select t.code, t.name, t.name_en, t.status, t.unit, 'Koster/MMB-6.1', false, false, false, null, '1400',
       t.aliases, e.id
  from (values
    ('1401', 'Yürütücü Yapımcı',              'Executive Producer',   'smm',    'flat',  '{}'::text[],                                          'Personel Ücreti'),
    ('1402', 'Yapımcı',                       'Producer',             'smm',    'flat',  '{}'::text[],                                          'Personel Ücreti'),
    ('1403', 'Ortak Yapımcı',                 'Co-Producer',          'smm',    'flat',  '{}'::text[],                                          'Personel Ücreti'),
    ('1404', 'Uygulayıcı Yapımcı',            'Line Producer',        'smm',    'flat',  array['Coordinating Producer','Supervising Producer'], 'Personel Ücreti'),
    ('1405', 'Yardımcı Yapımcı',              'Associate Producer',   'smm',    'week',  '{}'::text[],                                          'Personel Ücreti'),
    ('1407', 'Yapım Yöneticisi',              'Production Executive', 'smm',    'week',  '{}'::text[],                                          'Personel Ücreti'),
    ('1408', 'Yapımcı Asistanı',              'Producers Assistant',  'bordro', 'week',  array['Sekreterya'],                                   'Personel Ücreti'),
    ('1409', 'Yapımcı Birimi Ofis Giderleri', 'Office Expenses',      'sirket', 'month', array['Hazır Ofis','Ortak Çalışma Alanı'],             'Ofis Kirası'),
    ('1410', 'Araştırma',                     'Research',             'smm',    'flat',  '{}'::text[],                                          'Personel Ücreti')
  ) as t(code, name, name_en, status, unit, aliases, element)
  join public.cost_elements e on e.name = t.element and e.parent_id is not null;

-- 1b) Aileler kardes aileden kopyalanir. 1406 = 1508 ailesi (-05 Festival haric), 1409 = 1507 ailesi.
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, card_code, aliases, cost_element_id)
select m.new_prefix || substr(s.catalog_code, 5), s.name, s.name_en, s.default_payment_status,
       s.default_unit_code, s.provenance, false, false, false, null, '1400', '{}', s.cost_element_id
  from (values ('1508', '1406'), ('1507', '1409')) as m(src_prefix, new_prefix)
  join public.item_library s on s.catalog_code like m.src_prefix || '-%'
 where s.catalog_code <> '1508-05';

-- 2) Film sablonu v9 (TABAN CANLIDIR). 1400 karti 1300 kartinin arkasina girer.
do $tpl$
declare
  v_body   jsonb;
  v_cards  jsonb := '[]'::jsonb;
  v_card   jsonb;
  v_items  jsonb := '[]'::jsonb;
  v_codes  text[] := array['1401','1402','1403','1404'];
  v_code   text;
  v_ord    int := 0;
  v_lib    public.item_library%rowtype;
  v_done   boolean := false;
begin
  select t.body into v_body
    from public.budget_templates t
   where t.kind = 'system' and t.production_type = 'film'
     and t.scope = 'single' and t.is_active;
  if v_body is null then
    raise exception 'Aktif sistem sablonu bulunamadi';
  end if;
  if exists (select 1 from jsonb_array_elements(v_body->'cards') c where c->>'card_code' = '1400') then
    raise exception 'Sablonda 1400 karti zaten var';
  end if;

  foreach v_code in array v_codes loop
    v_ord := v_ord + 1;
    select * into v_lib from public.item_library where catalog_code = v_code;
    if v_lib.id is null or v_lib.is_group or v_lib.card_code <> '1400' then
      raise exception '1400 kalemi degil: %', v_code;
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

  for v_card in select * from jsonb_array_elements(v_body->'cards')
  loop
    v_cards := v_cards || jsonb_build_array(v_card);
    if v_card->>'card_code' = '1300' then
      v_cards := v_cards || jsonb_build_array(jsonb_build_object(
        'ref',             'c1400',
        'department_code', '1400',
        'card_code',       '1400',
        'name',            'Yapımcı Birimi',
        'default_unit',    'flat',
        'default_package', null::text,
        'sort_order',      1400,
        'misc_prefix',     '14',
        'items',           v_items));
      v_done := true;
    end if;
  end loop;
  if not v_done then
    raise exception 'Sablonda 1300 karti bulunamadi';
  end if;

  v_body := jsonb_set(v_body, '{cards}', v_cards);

  update public.budget_templates
     set is_active = false
   where kind = 'system' and production_type = 'film'
     and scope = 'single' and is_active;

  insert into public.budget_templates
    (kind, production_type, scope, label, body, is_active)
  values
    ('system','film','single',
     'KAAPA Sistem - Film (Tek) - 1100+1300+1400+1500+1600 v9',
     v_body, true);
end;
$tpl$;

-- 3) Dogrulama.
do $check$
begin
  if (select count(*) from public.item_library where card_code = '1400') <> 22 then
    raise exception '1400 kutuphanesi 22 satir olmali';
  end if;
  if (select string_agg(catalog_code, ',' order by catalog_code) from public.item_library where card_code = '1400')
     is distinct from '1401,1402,1403,1404,1405,1406-01,1406-02,1406-03,1406-04,1406-06,1407,1408,1409,1409-01,1409-02,1409-03,1409-04,1409-05,1409-07,1409-08,1409-09,1410' then
    raise exception '1400 kod listesi beklenen degil';
  end if;
  if exists (select 1 from public.item_library where catalog_code in ('1406-05','1409-06','1411')) then
    raise exception 'Bos numaralar kutuphanede olmamali';
  end if;
  if exists (select 1 from public.item_library where card_code = '1400' and (heading_id is not null or cost_element_id is null)) then
    raise exception '1400 karti duz ve her kalemi cesitli olmali';
  end if;
  if exists (select 1 from public.item_library n
               join public.item_library s on s.catalog_code = '1508' || substr(n.catalog_code, 5)
              where n.catalog_code like '1406-%'
                and (n.name, n.name_en, n.default_payment_status, n.default_unit_code, n.cost_element_id)
                    is distinct from (s.name, s.name_en, s.default_payment_status, s.default_unit_code, s.cost_element_id)) then
    raise exception '1406 ailesi 1508 ailesiyle ayni olmali';
  end if;
  if exists (select 1 from public.item_library n
               join public.item_library s on s.catalog_code = '1507' || substr(n.catalog_code, 5)
              where n.catalog_code like '1409-%'
                and (n.name, n.name_en, n.default_payment_status, n.default_unit_code, n.cost_element_id)
                    is distinct from (s.name, s.name_en, s.default_payment_status, s.default_unit_code, s.cost_element_id)) then
    raise exception '1409 ailesi 1507 ailesiyle ayni olmali';
  end if;
  if (select count(*) from public.budget_templates
       where kind = 'system' and production_type = 'film'
         and scope = 'single' and is_active) <> 1 then
    raise exception 'Aktif sistem sablonu tek olmali';
  end if;
  if (select string_agg(c->>'card_code', ',' order by (c->>'sort_order')::int)
        from public.budget_templates t, jsonb_array_elements(t.body->'cards') c
       where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single' and t.is_active)
     is distinct from '1100,1300,1400,1500,1600' then
    raise exception 'Sablon kart sirasi 1100,1300,1400,1500,1600 olmali';
  end if;
  if (select string_agg(i->>'catalog_code', ',' order by (i->>'sort_order')::int)
        from public.budget_templates t, jsonb_array_elements(t.body->'cards') c, jsonb_array_elements(c->'items') i
       where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
         and t.is_active and c->>'card_code' = '1400' and c->>'misc_prefix' = '14')
     is distinct from '1401,1402,1403,1404' then
    raise exception 'Sablonda 1400 = 1401,1402,1403,1404 ve misc_prefix 14 olmali';
  end if;
end $check$;
