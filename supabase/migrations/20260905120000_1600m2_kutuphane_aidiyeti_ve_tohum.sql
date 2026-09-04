-- KART 1600 M2: kutuphane tarafinda aidiyet VERI olur (heading_id) ve gorev
-- bayragi (is_duty) acilir; KART 1600 kutuphane tohumu (4 baslik + 28 atom)
-- bu gocle gelir. Gerekce: Kast Operasyonu basligi hem 16xx hem 39xx atom
-- tasidigi icin catalog_code'un tire-oncesi parcasindan turetme (mevcut
-- heading_code dogumu) bu kartta calismaz. Karar evi: BUTCE-SEMA-KARARLARI,
-- DEGISMEZLER md.2.

-- 1) SEMA: aidiyet ve gorev bayragi.
alter table public.item_library
  add column heading_id uuid references public.item_library(id),
  add column is_duty boolean not null default false;

comment on column public.item_library.heading_id is
  'Atomun bagli oldugu baslik satiri (is_group=true olan satir). Aidiyet
   veridir, koddan turetilmez. Baslik satirlarinda NULL.';
comment on column public.item_library.is_duty is
  'Kart acilisinda gorev listesine girer mi. Kodda gomulu aralik YOK.';

-- 2) Veri butunlugu: heading_id yalniz is_group=true satira isaret edebilir,
--    baslik satiri baska bir basliga (ya da kendine) baglanamaz. FK tek
--    basina yetmez (item_library kendine bakiyor), tetikle korunur
--    (desen: fn_check_cost_object_kind / trg_check_cost_object_kind).
create or replace function public.fn_item_library_heading_check()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_is_group boolean;
begin
  if new.is_group and new.heading_id is not null then
    raise exception 'Baslik satiri (is_group=true) baska bir basliga baglanamaz';
  end if;

  if new.heading_id is not null then
    if new.heading_id = new.id then
      raise exception 'Bir satir kendi kendinin basligi olamaz';
    end if;
    select is_group into v_target_is_group from public.item_library where id = new.heading_id;
    if v_target_is_group is distinct from true then
      raise exception 'heading_id yalnizca is_group=true bir satira isaret edebilir';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_item_library_heading_check on public.item_library;
create trigger trg_item_library_heading_check
  before insert or update of heading_id, is_group on public.item_library
  for each row execute function public.fn_item_library_heading_check();

-- 2.5) GERIYE DONUK BAGLAMA (regresyon onlemi, spec'te acikca istenmedi ama
--    ADIM 3'un getirdigi zorunlu sonuc): mevcut kutuphane atomlari (1100
--    serisi) heading_code'u bugune kadar split_part(catalog_code,'-',1) +
--    is_group ile TURETIYORDU; bu turetme ADIM 3'te fonksiyonlardan KALKIYOR
--    ve yerini heading_id VERISI aliyor. Bu backfill olmadan yeni acilan
--    butcelerde KART 1100'un basligi kaybolurdu - split_part hala DOGRU
--    cevabi biliyor (1100'de tek aralik, tire-oncesi parca zaten baslik),
--    o yuzden bu tek seferlik veri tasimasi guvenlidir. KART 1600 atomlari
--    heading_id'yi asagida acikca alir, bu backfill'e hic girmez (heading_id
--    zaten NULL degil, "and atom.heading_id is null" kosulu onlari atlar).
update public.item_library atom
   set heading_id = h.id
  from public.item_library h
 where atom.is_group = false
   and atom.heading_id is null
   and h.catalog_code = split_part(atom.catalog_code, '-', 1)
   and h.is_group = true;

-- 3) KART 1600 TOHUMU. Dort baslik once (tireli kod: KAAPA yapisal, Koster
--    kodu degil), sonra 28 atom. Aidiyet heading_id alt sorguyla cozulur;
--    catalog_code'un tire-oncesi parcasi bu kartta ANLAM TASIMAZ (16xx/39xx
--    karisik) - tam da bu yuzden heading_id acildi.
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code, is_group, is_duty, provenance)
values
  ('1600-01', 'Ana Kast',        'Principal Cast',      'sirket', 'flat', true, false, 'KAAPA'),
  ('1600-02', 'Dublör',          'Stunts',               'sirket', 'flat', true, false, 'KAAPA'),
  ('1600-03', 'Arkaplan',        'Background',           'sirket', 'flat', true, false, 'KAAPA'),
  ('1600-04', 'Kast Operasyonu', 'Casting Operations',   'sirket', 'flat', true, false, 'KAAPA');

insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code, is_group, is_duty, provenance, heading_id)
values
  -- Ana Kast (1600-01)
  ('1601', 'Başrol Oyuncu',   'Stars / Principal Roles', 'smm',    'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-01')),
  ('1602', 'Yardımcı Oyuncu', 'Supporting Cast',         'smm',    'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-01')),
  ('1603', 'Günlük Oyuncu',   'Day Players',             'bordro', 'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-01')),
  ('1611', 'Mesai',           'Overtime',       'bordro',        'flat', false, false, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-01')),
  ('1614', 'Tekrar Telifi',   'Residuals',      'telif_belgeli', 'flat', false, false, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-01')),
  ('1616', 'Prova',           'Rehearsal',      'bordro',        'flat', false, false, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-01')),

  -- Dublör (1600-02)
  ('1604', 'Dublör Koordinatörü', 'Stunt Coordinator', 'smm',    'week', false, true, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-02')),
  ('1606', 'Stunt Oyuncusu',      'Stunt Performers',  'bordro', 'day',  false, true, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-02')),
  ('1607', 'Dublör',              'Stunt Doubles',     'bordro', 'day',  false, true, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-02')),
  ('1608', 'Aksiyon Teknisyeni',  'Stunt Utility',     'bordro', 'day',  false, true, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-02')),

  -- Arkaplan (1600-03)
  ('3901', 'Genel Arkaplan Oyuncusu', 'General Extras / Background', 'sirket', 'flat', false, true, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-03')),
  ('3902', 'Stand-In',                'Stand-Ins',                   'sirket', 'flat', false, true, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-03')),
  ('3903', 'Sessiz Rol',              'Silent Bits',                 'sirket', 'flat', false, true, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-03')),
  ('3904', 'Özel Yetenekli Arkaplan', 'Special Ability',             'sirket', 'flat', false, true, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-03')),
  ('3916', 'Dansçı',                  'Dancers',                     'smm',    'flat', false, true, 'KAAPA', (select id from public.item_library where catalog_code = '1600-03')),
  ('3917', 'Özel Tip',                'Specialty Background',        'sirket', 'flat', false, true, 'KAAPA', (select id from public.item_library where catalog_code = '1600-03')),

  -- Kast Operasyonu (1600-04)
  ('1605', 'Cast Direktörü',          'Casting Director',          'smm',           'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04')),
  ('1609', 'Cast Asistanı',           'Casting Assistant',         'bordro',        'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04')),
  ('1610', 'Deneme Çekimi',           'Screen Tests',              'sirket',        'flat', false, false, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04')),
  ('1612', 'Müzisyen',                'Cast Musicians',            'smm',           'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04')),
  ('1613', 'Dublaj',                  'ADR / Looping',             'smm',           'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04')),
  ('1615', 'Set Öğretmeni',           'Set Teacher',               'smm',           'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04')),
  ('1619', 'Cast Gideri',             'Casting Expenses',          'sirket',        'flat', false, false, 'KAAPA', (select id from public.item_library where catalog_code = '1600-04')),
  ('1620', 'ADR Hak Devri',           'ADR Buyout',                'telif_belgeli', 'flat', false, false, 'KAAPA', (select id from public.item_library where catalog_code = '1600-04')),
  ('3910', 'Arkaplan Kostüm Ödeneği',    'Extras Wardrobe Allowance','sirket',        'flat', false, false, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04')),
  ('3913', 'Arkaplan Oyuncusu Castingi', 'Extras Casting',           'sirket',        'flat', false, false, 'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04')),
  ('3914', 'Kast Sorumlusu',             'Crowd Controllers',        'bordro',        'flat', false, true,  'Koster/MMB + KAAPA damitim', (select id from public.item_library where catalog_code = '1600-04'));

-- 4) 1618 Temsilci Komisyonu ZATEN TOHUMLU (20260901130000). Yeniden INSERT
--    edilmez, aidiyet ve gorev bayragina UPDATE ile baglanir.
update public.item_library
   set heading_id = (select id from public.item_library where catalog_code = '1600-01'),
       is_duty = false
 where catalog_code = '1618';

do $seed_check$
begin
  if (select count(*) from public.item_library where catalog_code in ('1600-01','1600-02','1600-03','1600-04')) <> 4 then
    raise exception '1600M2 tohum: dort baslik beklenirdi, sayim uymuyor';
  end if;
  if (select count(*) from public.item_library
       where heading_id in (select id from public.item_library where catalog_code like '1600-%')) <> 28 then
    raise exception '1600M2 tohum: 1600 basliklarina bagli 28 atom beklenirdi, sayim uymuyor';
  end if;
  if (select count(*) from public.item_library where is_duty = true) <> 19 then
    raise exception '1600M2 tohum: is_duty=true 19 atom beklenirdi, sayim uymuyor';
  end if;
  if (select count(*) from public.item_library where catalog_code like '11%-%' and heading_id is not null) <> 38 then
    raise exception '1600M2 geriye donuk baglama: 1100 seri 38 atom heading_id almaliydi, sayim uymuyor';
  end if;
end $seed_check$;
