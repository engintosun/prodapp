-- KART 1300 ad duzeltmesi (Engin karari, 3 Ekim 2026): kart adi "Senaryo Yazımı",
-- 1308 adi "Hukuki Uygunluk Raporu (Clearance)". Kaynaklar (MMB 6.1 Continuity &
-- Treatment, Koster damitimi) bolum adina hukuki ifade koymaz; "Yasal Hak Temizleme"
-- kaynaksiz kelime kelime ceviriydi. name_en (Legal Clearances) degismez.
-- Karar evi: docs/butce/KART-KATALOGU.md bolum 7.2.
-- Emsal: 20261003120000 (sablon govdesi canlidan okunur, yeni surum olarak yazilir).

update public.item_library
   set name = 'Hukuki Uygunluk Raporu (Clearance)'
 where catalog_code = '1308' and card_code = '1300';

do $tpl$
declare
  v_body   jsonb;
  v_cards  jsonb := '[]'::jsonb;
  v_card   jsonb;
  v_items  jsonb;
  v_name   text;
  v_done   boolean := false;
begin
  select name into v_name from public.item_library where catalog_code = '1308' and card_code = '1300';
  if v_name is null then
    raise exception '1308 kutuphanede yok';
  end if;

  select t.body into v_body
    from public.budget_templates t
   where t.kind = 'system' and t.production_type = 'film'
     and t.scope = 'single' and t.is_active;
  if v_body is null then
    raise exception 'Aktif sistem sablonu bulunamadi';
  end if;

  for v_card in select * from jsonb_array_elements(v_body->'cards')
  loop
    if v_card->>'card_code' = '1300' then
      select jsonb_agg(
               case when x.i->>'catalog_code' = '1308'
                    then jsonb_set(x.i, '{name}', to_jsonb(v_name))
                    else x.i end
               order by x.n)
        into v_items
        from jsonb_array_elements(v_card->'items') with ordinality as x(i, n);
      v_card := jsonb_set(v_card, '{name}', to_jsonb('Senaryo Yazımı'::text));
      v_card := jsonb_set(v_card, '{items}', v_items);
      v_done := true;
    end if;
    v_cards := v_cards || jsonb_build_array(v_card);
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
     'KAAPA Sistem - Film (Tek) - 1100+1300+1500+1600 v6',
     v_body, true);
end;
$tpl$;

do $check$
begin
  if not exists (select 1 from public.item_library
                  where catalog_code = '1308' and card_code = '1300'
                    and name = 'Hukuki Uygunluk Raporu (Clearance)'
                    and name_en = 'Legal Clearances') then
    raise exception '1308 kutuphane adi yanlis';
  end if;
  if (select count(*) from public.budget_templates
       where kind = 'system' and production_type = 'film'
         and scope = 'single' and is_active) <> 1 then
    raise exception 'Aktif sistem sablonu tek olmali';
  end if;
  if not exists (select 1
                   from public.budget_templates t, jsonb_array_elements(t.body->'cards') c
                  where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
                    and t.is_active and c->>'card_code' = '1300'
                    and c->>'name' = 'Senaryo Yazımı'
                    and jsonb_array_length(c->'items') = 5
                    and exists (select 1 from jsonb_array_elements(c->'items') i
                                 where i->>'catalog_code' = '1308'
                                   and i->>'name' = 'Hukuki Uygunluk Raporu (Clearance)')) then
    raise exception 'Sablonda 1300 karti ya da 1308 kalemi yanlis';
  end if;
end $check$;
