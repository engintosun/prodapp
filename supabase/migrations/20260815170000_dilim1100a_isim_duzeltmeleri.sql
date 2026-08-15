-- KAAPA DILIM 1100-A (bolum 5): mevcut adlarin Turkcesi. name_en DEGISMEZ.

update public.item_library set name = 'Yönetmen Kaşesi'        where catalog_code = '1501';
update public.item_library set name = 'İkinci Ekip Yönetmeni'  where catalog_code = '1502';
update public.item_library set name = 'Koreograf'              where catalog_code = '1503';
update public.item_library set name = 'Oyuncu/Diyalog Koçu'    where catalog_code = '1504';
update public.item_library set name = 'Yönetmen Özel Asistanı' where catalog_code = '1505';

do $name_check$
begin
  if (select count(*) from public.item_library where catalog_code in ('1501','1502','1503','1504','1505')) <> 5 then
    raise exception 'D1100A isim duzeltme: 1501-1505 bekleniyordu, sayim uymuyor';
  end if;
end $name_check$;

-- units cetveli: 'person' etiketi ASCII yaziliydi, digerleri (gün/hafta/ay/bölüm/adet/sabit)
-- zaten duzgun Turkce (20260613115009) - dokunulmadi.
update public.units set label = 'kişi' where code = 'person';
