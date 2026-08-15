-- KAAPA DILIM 1100-A duzeltme: 'piece' birimi 20260701090000'da BILINCLI KALDIRILMISTI
-- (Birim sadece periyot cinsi tasir: gun/hafta/ay/bolum/sabit; adet/kisi Miktar kolonunun
-- konusu). 20260815160000 (kutuphane tohumu) ve 20260815180000 (sablon) bu doktrini
-- gormeden 'piece' kullanmisti - 'piece' units tablosunda hic yoktu, fn_open_budget/
-- fn_add_budget_item'in "Birim bulunamadi" hatasi ancak calisma anida (kart acilirken/
-- kalem eklenirken) ortaya cikardi. Karsiligi: sabit (flat) + Miktar/X.
-- Onceki iki migration TARIHSEL KAYIT olarak AYNEN durur, duzeltme burada.

update public.item_library
   set default_unit_code = 'flat'
 where default_unit_code = 'piece';

update public.budget_templates t
   set body = jsonb_set(
     t.body,
     '{cards}',
     (select jsonb_agg(
        case
          when c.card->>'card_code' = '1100' then jsonb_set(
            c.card,
            '{items}',
            (select jsonb_agg(
               case when i.item->>'unit' = 'piece'
                 then jsonb_set(i.item, '{unit}', '"flat"')
                 else i.item
               end
               order by i.ord)
             from jsonb_array_elements(c.card->'items') with ordinality as i(item, ord))
          )
          else c.card
        end
        order by c.ord)
      from jsonb_array_elements(t.body->'cards') with ordinality as c(card, ord))
   )
 where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single' and t.is_active
   and t.body ? 'cards';

do $piece_check$
begin
  if exists (select 1 from public.item_library where default_unit_code = 'piece') then
    raise exception 'D1100A duzeltme: item_library icinde hala piece birimi var';
  end if;
  if exists (
    select 1
      from public.budget_templates t,
           jsonb_array_elements(t.body->'cards') as c(card),
           jsonb_array_elements(c.card->'items') as i(item)
     where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single' and t.is_active
       and i.item->>'unit' = 'piece'
  ) then
    raise exception 'D1100A duzeltme: aktif sablon govdesinde hala piece birimi var';
  end if;
end $piece_check$;
