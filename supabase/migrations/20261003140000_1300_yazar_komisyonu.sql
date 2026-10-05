-- KART 1300 yazar komisyonu (Engin karari, 3 Ekim 2026): 1315 Yazar Temsilci Komisyonu,
-- 1511 duzeninde (%20 varsayilan, attaches_to ile yazarin altina alt satir). 1301 ve 1314
-- blok olusunca "Telif Bedeli" alt adiyla gorunur (1501 "Hizmet Bedeli" karsiligi).
-- Senarist icin hak devri satiri ACILMAZ: CNC, Eurimages ve MMB senaristin hakkini
-- ucretinden ayirmaz; yazarin ajansini ise CNC (1911) ve Eurimages ayri satirda ister.
-- Karar evi: docs/butce/KART-KATALOGU.md bolum 7.2.

insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, card_code, aliases,
   default_derive_rate, attaches_to)
values
  ('1315', 'Yazar Temsilci Komisyonu', 'Literary Agent', 'sirket', 'flat',
   'KAAPA', false, false, false, null, '1300', '{}',
   20, array['1301','1314']);

update public.item_library
   set name_suffix = 'Telif Bedeli'
 where catalog_code in ('1301','1314') and card_code = '1300';

do $check$
begin
  if not exists (select 1 from public.item_library
                  where catalog_code = '1315' and card_code = '1300'
                    and default_derive_rate = 20 and not is_derived
                    and attaches_to = array['1301','1314']
                    and default_payment_status = 'sirket' and default_unit_code = 'flat') then
    raise exception '1315 satiri yanlis';
  end if;
  if (select count(*) from public.item_library
       where catalog_code in ('1301','1314') and name_suffix = 'Telif Bedeli') <> 2 then
    raise exception '1301 ve 1314 alt adi yanlis';
  end if;
  if (select count(*) from public.item_library where card_code = '1300') <> 16 then
    raise exception '1300 kutuphanesi 16 satir olmali';
  end if;
  if exists (select 1 from public.item_library where card_code = '1300' and is_rights_transfer) then
    raise exception '1300 kartinda hak devri satiri olmamali';
  end if;
end $check$;
