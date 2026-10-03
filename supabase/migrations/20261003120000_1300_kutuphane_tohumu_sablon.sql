-- KART 1300 Dilim 1 (Engin karari, 3 Ekim 2026): MMB 6.1 kod hizasiyla kutuphane
-- tohumu (15 atom, kart duz), sablona 1300 karti (5 kalem, misc_prefix 13),
-- 1100 kartina 1104-06 Atolye ve Lab Katilimi.
-- Karar evi: docs/butce/KART-KATALOGU.md bolum 7.2 ve 7.1.
-- Emsal: 20260930120000 ve 20261001120000 (sablon govdesi canlidan okunur).
-- Bos numaralar: 1303, 1304, 1305-05, 1311.

-- 1) 1300 kutuphanesi. heading_id bos (kart duz). asks_person, attaches_to,
--    default_derive_rate, is_rights_transfer, name_suffix varsayilanda kalir.
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, card_code, aliases)
values
  ('1301',    'Senaryo Yazarı',         'Writers',                'telif_belgeli', 'flat',    'Koster/MMB-6.1',             false, false, false, null, '1300', array['Writers Room']),
  ('1302',    'Araştırma',              'Research',               'smm',           'flat',    'Koster/MMB-6.1',             false, false, false, null, '1300', '{}'),
  ('1305-01', 'Ulaşım-Uçak',            'Air Travel',             'sirket',        'flat',    'Koster/MMB + KAAPA damitim', false, false, false, null, '1300', '{}'),
  ('1305-02', 'Konaklama',              'Hotels / Accommodation', 'konaklama',     'day',     'Koster/MMB + KAAPA damitim', false, false, false, null, '1300', '{}'),
  ('1305-03', 'Yemek-Ağırlama',         'Catering & Hospitality', 'sirket',        'flat',    'Koster/MMB + KAAPA damitim', false, false, false, null, '1300', '{}'),
  ('1305-04', 'Harcırah',               'Per Diem',               'sirket',        'day',     'Koster/MMB + KAAPA damitim', false, false, false, null, '1300', '{}'),
  ('1305-06', 'Araç Kiralama',          'Car Rentals',            'sirket',        'day',     'Koster/MMB + KAAPA damitim', false, false, false, null, '1300', '{}'),
  ('1306',    'Senaryo Doktoru/Editör', 'Story Editor',           'smm',           'flat',    'Koster/MMB-6.1',             false, false, false, null, '1300', array['Script Polish','Dramaturg']),
  ('1307',    'Uzman Danışmanlar',      'Consultants',            'smm',           'day',     'Koster/MMB-6.1',             false, false, false, null, '1300', '{}'),
  ('1308',    'Yasal Hak Temizleme',    'Legal Clearances',       'sirket',        'flat',    'Koster/MMB-6.1',             false, false, false, null, '1300', '{}'),
  ('1309',    'Sekreterya',             'Secretaries',            'bordro',        'week',    'Koster/MMB-6.1',             false, false, false, null, '1300', '{}'),
  ('1310',    'Ofis Giderleri',         'Office Expenses',        'sirket',        'flat',    'Koster/MMB-6.1',             false, false, false, null, '1300', '{}'),
  ('1312',    'Senaryo Süre Analizi',   'Script Timing',          'smm',           'flat',    'Koster/MMB-6.1',             false, false, false, null, '1300', '{}'),
  ('1313',    'Yazar Asistanı',         'Writer''s Assistant',    'bordro',        'week',    'KAAPA',                      false, false, false, null, '1300', '{}'),
  ('1314',    'Bölüm/Tretman Yazarı',   'Episode Writers',        'telif_belgeli', 'episode', 'KAAPA',                      false, false, false, null, '1300', '{}');

-- 2) 1104-06: 1100 kartinda 1104 basliginin altinda (heading_id canlidaki baslik satirindan).
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, card_code, aliases)
select '1104-06', 'Atölye ve Lab Katılımı', 'Workshop & Lab Fees', 'sirket', 'flat',
       'KAAPA', false, false, false, h.id, '1100', '{}'
  from public.item_library h
 where h.catalog_code = '1104' and h.is_group and h.card_code = '1100';

-- 3) Aktif sablon govdesi (TABAN CANLIDIR). 1300 karti 1100 kartinin hemen arkasina girer;
--    kalemler kutuphaneden (1) kurulur. Diger kartlara dokunulmaz.
do $tpl$
declare
  v_body   jsonb;
  v_cards  jsonb := '[]'::jsonb;
  v_card   jsonb;
  v_items  jsonb := '[]'::jsonb;
  v_codes  text[] := array['1301','1302','1306','1308','1312'];
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
  if exists (select 1 from jsonb_array_elements(v_body->'cards') c where c->>'card_code' = '1300') then
    raise exception 'Sablonda 1300 karti zaten var';
  end if;

  foreach v_code in array v_codes loop
    v_ord := v_ord + 1;
    select * into v_lib from public.item_library where catalog_code = v_code;
    if v_lib.id is null then
      raise exception 'Katalog kodu kutuphanede yok: %', v_code;
    end if;
    if v_lib.is_group or v_lib.card_code <> '1300' then
      raise exception '1300 kalemi degil: %', v_code;
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
    if v_card->>'card_code' = '1100' then
      v_cards := v_cards || jsonb_build_array(jsonb_build_object(
        'ref',             'c1300',
        'department_code', '1300',
        'card_code',       '1300',
        'name',            'Senaryo Yazım ve Yasal Temizlik',
        'default_unit',    'flat',
        'default_package', null::text,
        'sort_order',      1300,
        'misc_prefix',     '13',
        'items',           v_items));
      v_done := true;
    end if;
  end loop;
  if not v_done then
    raise exception 'Sablonda 1100 karti bulunamadi';
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
     'KAAPA Sistem - Film (Tek) - 1100+1300+1500+1600 v5',
     v_body, true);
end;
$tpl$;

-- 4) Dogrulama (NOTICE'e bagli degil; push sonrasi ayrica db query ile de kosulur).
do $check$
begin
  if (select count(*) from public.item_library where card_code = '1300') <> 15 then
    raise exception '1300 kutuphanesi 15 satir olmali';
  end if;
  if exists (select 1 from public.item_library where catalog_code in ('1303','1304','1305-05','1311')) then
    raise exception 'Bos numaralar kutuphanede olmamali';
  end if;
  if exists (select 1 from public.item_library where card_code = '1300' and heading_id is not null) then
    raise exception '1300 karti duz olmali';
  end if;
  if not exists (select 1 from public.item_library l join public.item_library h on h.id = l.heading_id
                  where l.catalog_code = '1104-06' and h.catalog_code = '1104' and l.card_code = '1100') then
    raise exception '1104-06 1104 basliginin altinda olmali';
  end if;
  if (select count(*) from public.budget_templates
       where kind = 'system' and production_type = 'film'
         and scope = 'single' and is_active) <> 1 then
    raise exception 'Aktif sistem sablonu tek olmali';
  end if;
  if (select jsonb_array_length(c->'items')
        from public.budget_templates t, jsonb_array_elements(t.body->'cards') c
       where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
         and t.is_active and c->>'card_code' = '1300' and c->>'misc_prefix' = '13') is distinct from 5 then
    raise exception 'Sablonda 1300 = 5 kalem ve misc_prefix 13 olmali';
  end if;
end $check$;
