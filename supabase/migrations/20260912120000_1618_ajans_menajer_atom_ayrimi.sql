-- KART 1600: Temsilci Komisyonu atomu ikiye ayrilir (1618 Ajans, 1618-01 Menajer).
-- Amac: komisyon satirinin CINSI bugune kadar odeme statusunden (sirket/smm) okunuyordu;
-- kullanici statuyu elle degistirince satirin kimligi bozuluyor, ikinci bir satir doguyor,
-- tik kaldirilinca yanlis satir siliniyordu. Cins artik KENDI ATOMUNDA yasar, statu yalniz
-- vergi olgusu olarak kalir. Karar evi: docs/butce/KART-KATALOGU.md,
-- docs/butce/BUTCE-EKRAN-KARARLARI.md bolum 20 KOMISYON SATIRININ DOGUMU madde 6.

-- 1) Yeni atom: 1618-01 Menajer Komisyonu. heading_id, default_derive_rate ve card_code
--    1618'in BUGUNKU degerinden okunur (emsal gocten kopyalanmaz).
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, default_derive_rate, card_code)
select
  '1618-01', 'Menajer Komisyonu', 'Management Commission', 'smm', l.default_unit_code,
  'KAAPA', false, false, true, l.heading_id, l.default_derive_rate, l.card_code
  from public.item_library l
 where l.catalog_code = '1618';

-- 2) 1618 artik yalniz Ajans Komisyonu. Baska hicbir hanesi degismez.
update public.item_library
   set name = 'Ajans Komisyonu', name_en = 'Agency Commission'
 where catalog_code = '1618';

-- 3) Canlidaki komisyon satirlari tek seferlik tasinir. Olcut: catalog_code 1618 VE
--    derive_rate dolu. Bu, statunun son ve tek mesru kullanimidir: dokunulmamis satirlarda
--    bugun hala dogru cinsi gosteriyor.
--    payment_status smm olanlar menajer atomuna gecer (catalog_code + library_item_id + ad);
--    library_item_id de guncellenir ki kod hanesi ile kutuphane bagi tutarli kalsin (Engin
--    onayi, bu goc turu).
update public.budget_items bi
   set catalog_code = '1618-01',
       library_item_id = (select id from public.item_library where catalog_code = '1618-01'),
       name = 'Menajer Komisyonu'
 where bi.catalog_code = '1618'
   and bi.derive_rate is not null
   and bi.payment_status = 'smm';

-- Kalanlar (yukaridaki UPDATE'ten sonra hala catalog_code=1618 olanlar) ajans adini alir;
-- catalog_code ve library_item_id degismez, zaten 1618'e isaret ediyor.
update public.budget_items bi
   set name = 'Ajans Komisyonu'
 where bi.catalog_code = '1618'
   and bi.derive_rate is not null;

-- 4) Dogrulama: 1618 ve 1618-01 kutuphanede var mi, ve 1618 kodunu tasiyan turetilmis
--    hicbir satirin statusu smm degil (hepsi menajer atomuna tasindi).
do $check$
begin
  if (select count(*) from public.item_library where catalog_code in ('1618', '1618-01')) <> 2 then
    raise exception '1618/1618-01 atom ayrimi: iki satir beklenirdi, sayim uymuyor';
  end if;
  if exists (
    select 1 from public.budget_items
     where catalog_code = '1618' and derive_rate is not null and payment_status = 'smm'
  ) then
    raise exception '1618/1618-01 atom ayrimi: 1618 kodunda smm statulu turetilmis satir kaldi';
  end if;
end $check$;
